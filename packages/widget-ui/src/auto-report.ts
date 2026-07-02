import type {
  FailedNetworkRequest,
  SubmitAutoReportInput,
  WidgetRuntimeConfig,
} from '@trakr/schemas';
import { getCapturedContext, setAutoReportHooks } from './context-capture';
import { fetchWidgetRuntimeConfig, submitAutoReport } from './widget-api';

const SESSION_ID_KEY = 'trakr-widget-session-id';
const QUEUE_KEY = 'trakr-widget-report-queue';
const MAX_QUEUE_SIZE = 10;
const CLIENT_DEDUP_MS = 5 * 60 * 1000;
const NETWORK_DEBOUNCE_MS = 3000;

const SENSITIVE_QUERY_PARAMS = new Set([
  'token',
  'access_token',
  'accessToken',
  'password',
  'secret',
  'api_key',
  'apikey',
  'auth',
  'authorization',
]);

type WidgetAuth = {
  projectKey: string;
  widgetSecret: string;
  apiUrl: string;
};

type InstallAutoReportOptions = WidgetAuth & {
  autoCrashReport?: boolean;
  autoNetworkReport?: boolean;
};

type QueuedReport = SubmitAutoReportInput;

let installed = false;
let runtimeConfig: Pick<
  WidgetRuntimeConfig,
  'autoCrashReport' | 'autoNetworkReport'
> = {
  autoCrashReport: true,
  autoNetworkReport: true,
};
let auth: WidgetAuth | null = null;

const sentFingerprints = new Map<string, number>();
const networkDebounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

function getSessionId(): string {
  if (typeof sessionStorage === 'undefined') {
    return `anon-${Date.now()}`;
  }

  const existing = sessionStorage.getItem(SESSION_ID_KEY);
  if (existing) return existing;

  const sessionId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  return sessionId;
}

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url, window.location.origin);
    for (const key of [...parsed.searchParams.keys()]) {
      if (SENSITIVE_QUERY_PARAMS.has(key.toLowerCase())) {
        parsed.searchParams.set(key, '[redacted]');
      }
    }
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return url;
  }
}

function hashString(value: string): string {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function fingerprintCrash(message: string, stack?: string): string {
  const firstFrame = stack?.split('\n').find((line) => line.trim().startsWith('at ')) ?? '';
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  return hashString(`crash:${message}:${firstFrame}:${normalizeUrl(pageUrl)}`);
}

function fingerprintNetwork(entry: FailedNetworkRequest): string {
  const statusPart =
    entry.status !== undefined ? String(entry.status) : (entry.error ?? 'network');
  return hashString(
    `network:${(entry.method ?? 'GET').toUpperCase()}:${normalizeUrl(entry.url)}:${statusPart}`,
  );
}

function shouldSkipFingerprint(fingerprint: string): boolean {
  const lastSent = sentFingerprints.get(fingerprint);
  if (lastSent && Date.now() - lastSent < CLIENT_DEDUP_MS) {
    return true;
  }
  sentFingerprints.set(fingerprint, Date.now());
  return false;
}

function readQueue(): QueuedReport[] {
  if (typeof sessionStorage === 'undefined') return [];

  try {
    const raw = sessionStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as QueuedReport[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: QueuedReport[]) {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-MAX_QUEUE_SIZE)));
}

function enqueueReport(report: QueuedReport) {
  writeQueue([...readQueue(), report]);
}

function getPageUrl(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.location.href;
}

async function sendReport(report: SubmitAutoReportInput): Promise<boolean> {
  if (!auth) return false;

  try {
    await submitAutoReport(auth, report);
    return true;
  } catch {
    enqueueReport(report);
    return false;
  }
}

function buildCrashReport(message: string, stack?: string): SubmitAutoReportInput {
  const fingerprint = fingerprintCrash(message, stack);
  const title = truncate(message.split('\n')[0] ?? 'JavaScript error', 200);

  return {
    type: 'crash',
    fingerprint,
    title: title || 'JavaScript error',
    description: stack ?? message,
    pageUrl: getPageUrl(),
    sessionId: getSessionId(),
    context: getCapturedContext(),
  };
}

function buildNetworkReport(entry: FailedNetworkRequest): SubmitAutoReportInput {
  const fingerprint = fingerprintNetwork(entry);
  const statusLabel =
    entry.status !== undefined
      ? `${entry.status}${entry.statusText ? ` ${entry.statusText}` : ''}`
      : (entry.error ?? 'Network error');
  const method = entry.method ?? 'GET';

  return {
    type: 'network',
    fingerprint,
    title: truncate(`${method} ${statusLabel}: ${entry.url}`, 200),
    description: `Failed request to ${entry.url}`,
    pageUrl: getPageUrl(),
    sessionId: getSessionId(),
    context: getCapturedContext(),
  };
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 3)}...`;
}

function handleCrash(message: string, stack?: string) {
  if (!runtimeConfig.autoCrashReport || !auth) return;

  const report = buildCrashReport(message, stack);
  if (shouldSkipFingerprint(report.fingerprint)) return;

  void sendReport(report);
}

function qualifiesForAutoNetworkReport(entry: FailedNetworkRequest): boolean {
  if (entry.error) return true;
  return entry.status !== undefined && entry.status >= 500;
}

function handleNetworkFailure(entry: FailedNetworkRequest) {
  if (!runtimeConfig.autoNetworkReport || !auth) return;
  if (!qualifiesForAutoNetworkReport(entry)) return;

  const fingerprint = fingerprintNetwork(entry);
  const existingTimer = networkDebounceTimers.get(fingerprint);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  networkDebounceTimers.set(
    fingerprint,
    setTimeout(() => {
      networkDebounceTimers.delete(fingerprint);
      const report = buildNetworkReport(entry);
      if (shouldSkipFingerprint(report.fingerprint)) return;
      void sendReport(report);
    }, NETWORK_DEBOUNCE_MS),
  );
}

function parseScriptBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value !== 'false';
}

function readScriptOverrides(): Partial<
  Pick<WidgetRuntimeConfig, 'autoCrashReport' | 'autoNetworkReport'>
> {
  const script =
    document.currentScript ??
    document.querySelector('script[data-project-key]');

  if (!(script instanceof HTMLScriptElement)) {
    return {};
  }

  return {
    autoCrashReport: parseScriptBoolean(script.dataset.autoCrash, true),
    autoNetworkReport: parseScriptBoolean(script.dataset.autoNetwork, true),
  };
}

export async function flushQueuedReports(): Promise<void> {
  if (!auth) return;

  const queue = readQueue();
  if (queue.length === 0) return;

  const remaining: QueuedReport[] = [];

  for (const report of queue) {
    try {
      await submitAutoReport(auth, report);
    } catch {
      remaining.push(report);
    }
  }

  writeQueue(remaining);
}

export function isAutoReportInstalled(): boolean {
  return installed;
}

export async function installAutoReport(
  options: InstallAutoReportOptions,
): Promise<void> {
  if (installed || typeof window === 'undefined') return;

  auth = {
    projectKey: options.projectKey,
    widgetSecret: options.widgetSecret,
    apiUrl: options.apiUrl,
  };

  const scriptOverrides = readScriptOverrides();

  try {
    const remoteConfig = await fetchWidgetRuntimeConfig(auth);
    runtimeConfig = {
      autoCrashReport:
        scriptOverrides.autoCrashReport ?? remoteConfig.autoCrashReport,
      autoNetworkReport:
        scriptOverrides.autoNetworkReport ?? remoteConfig.autoNetworkReport,
    };
  } catch {
    runtimeConfig = {
      autoCrashReport:
        options.autoCrashReport ??
        scriptOverrides.autoCrashReport ??
        true,
      autoNetworkReport:
        options.autoNetworkReport ??
        scriptOverrides.autoNetworkReport ??
        true,
    };
  }

  setAutoReportHooks({
    onCrash: ({ message, stack }) => handleCrash(message, stack),
    onNetworkFailure: (entry) => handleNetworkFailure(entry),
  });

  installed = true;
  await flushQueuedReports();
}

export function uninstallAutoReport(): void {
  setAutoReportHooks(null);
  for (const timer of networkDebounceTimers.values()) {
    clearTimeout(timer);
  }
  networkDebounceTimers.clear();
  installed = false;
  auth = null;
}
