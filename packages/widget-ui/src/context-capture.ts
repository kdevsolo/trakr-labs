import type {
  ConsoleLogEntry,
  DeviceContext,
  FailedNetworkRequest,
  FeedbackContext,
} from '@trakr/schemas';

const MAX_CONSOLE_LOGS = 100;
const MAX_FAILED_REQUESTS = 30;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_URL_LENGTH = 2000;
const MAX_ERROR_LENGTH = 500;

type ConsoleLevel = ConsoleLogEntry['level'];

type InstallContextCaptureOptions = {
  apiUrl?: string;
};

export type AutoReportHooks = {
  onCrash?: (payload: { message: string; stack?: string }) => void;
  onNetworkFailure?: (entry: FailedNetworkRequest) => void;
};

// Captured data may include PII from console logs or request URLs.
const consoleLogs: ConsoleLogEntry[] = [];
const failedRequests: FailedNetworkRequest[] = [];
let installed = false;
let autoReportHooks: AutoReportHooks | null = null;
let excludedUrlPatterns: string[] = [
  '/widget/upload-url',
  '/widget/feedback',
  '/widget/report',
  '/widget/config',
];

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 3)}...`;
}

function serializeArg(arg: unknown): string {
  if (arg instanceof Error) {
    return arg.stack ?? arg.message;
  }

  if (typeof arg === 'string') return arg;

  try {
    return JSON.stringify(arg);
  } catch {
    return String(arg);
  }
}

function serializeArgs(args: unknown[]): string {
  return truncate(args.map(serializeArg).join(' '), MAX_MESSAGE_LENGTH);
}

function pushConsoleLog(level: ConsoleLevel, message: string) {
  consoleLogs.push({
    level,
    message: truncate(message, MAX_MESSAGE_LENGTH),
    timestamp: new Date().toISOString(),
  });

  if (consoleLogs.length > MAX_CONSOLE_LOGS) {
    consoleLogs.shift();
  }
}

function shouldExcludeUrl(url: string): boolean {
  return excludedUrlPatterns.some((pattern) => url.includes(pattern));
}

function pushFailedRequest(entry: FailedNetworkRequest) {
  if (shouldExcludeUrl(entry.url)) return;

  const normalized: FailedNetworkRequest = {
    ...entry,
    url: truncate(entry.url, MAX_URL_LENGTH),
    statusText: entry.statusText
      ? truncate(entry.statusText, 200)
      : undefined,
    error: entry.error ? truncate(entry.error, MAX_ERROR_LENGTH) : undefined,
  };

  failedRequests.push(normalized);

  if (failedRequests.length > MAX_FAILED_REQUESTS) {
    failedRequests.shift();
  }

  autoReportHooks?.onNetworkFailure?.(normalized);
}

function collectDeviceContext(): DeviceContext {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      userAgent: '',
      language: '',
      screen: { width: 0, height: 0 },
      viewport: { width: 0, height: 0 },
    };
  }

  return {
    userAgent: truncate(navigator.userAgent, 1000),
    language: navigator.language,
    languages: navigator.languages ? [...navigator.languages] : undefined,
    platform: navigator.platform ? truncate(navigator.platform, 100) : undefined,
    screen: {
      width: window.screen.width,
      height: window.screen.height,
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    devicePixelRatio: window.devicePixelRatio,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    online: navigator.onLine,
    referrer: document.referrer
      ? truncate(document.referrer, MAX_URL_LENGTH)
      : undefined,
  };
}

function installConsoleCapture() {
  const levels: ConsoleLevel[] = ['log', 'warn', 'error', 'info', 'debug'];

  for (const level of levels) {
    const original = console[level].bind(console);

    console[level] = (...args: unknown[]) => {
      pushConsoleLog(level, serializeArgs(args));
      original(...args);
    };
  }

  window.addEventListener('error', (event) => {
    const message = event.error
      ? serializeArg(event.error)
      : `${event.message} at ${event.filename}:${event.lineno}:${event.colno}`;
    pushConsoleLog('error', message);
    autoReportHooks?.onCrash?.({
      message: event.error instanceof Error ? event.error.message : event.message,
      stack: event.error instanceof Error ? event.error.stack : message,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const serialized = serializeArg(event.reason);
    pushConsoleLog('error', `Unhandled rejection: ${serialized}`);
    autoReportHooks?.onCrash?.({
      message:
        event.reason instanceof Error
          ? event.reason.message
          : `Unhandled rejection: ${serialized}`,
      stack: event.reason instanceof Error ? event.reason.stack : serialized,
    });
  });
}

function installFetchCapture() {
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const startedAt = performance.now();
    const method =
      init?.method ??
      (input instanceof Request ? input.method : 'GET');
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

    try {
      const response = await originalFetch(input, init);

      if (!response.ok) {
        pushFailedRequest({
          url,
          method: method.toUpperCase(),
          status: response.status,
          statusText: response.statusText,
          durationMs: Math.round(performance.now() - startedAt),
          timestamp: new Date().toISOString(),
        });
      }

      return response;
    } catch (error) {
      pushFailedRequest({
        url,
        method: method.toUpperCase(),
        error: error instanceof Error ? error.message : String(error),
        durationMs: Math.round(performance.now() - startedAt),
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  };
}

function installXhrCapture() {
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function open(
    method: string,
    url: string | URL,
    async?: boolean,
    username?: string | null,
    password?: string | null,
  ) {
    this._trakrCapture = {
      method: method.toUpperCase(),
      url: typeof url === 'string' ? url : url.toString(),
      startedAt: 0,
    };
    return originalOpen.call(this, method, url, async ?? true, username, password);
  };

  XMLHttpRequest.prototype.send = function send(
    body?: Document | XMLHttpRequestBodyInit | null,
  ) {
    const capture = this._trakrCapture;

    if (capture) {
      capture.startedAt = performance.now();

      this.addEventListener('load', () => {
        if (this.status >= 400) {
          pushFailedRequest({
            url: capture.url,
            method: capture.method,
            status: this.status,
            statusText: this.statusText,
            durationMs: Math.round(performance.now() - capture.startedAt),
            timestamp: new Date().toISOString(),
          });
        }
      });

      this.addEventListener('error', () => {
        pushFailedRequest({
          url: capture.url,
          method: capture.method,
          error: 'Network error',
          durationMs: Math.round(performance.now() - capture.startedAt),
          timestamp: new Date().toISOString(),
        });
      });

      this.addEventListener('timeout', () => {
        pushFailedRequest({
          url: capture.url,
          method: capture.method,
          error: 'Request timed out',
          durationMs: Math.round(performance.now() - capture.startedAt),
          timestamp: new Date().toISOString(),
        });
      });
    }

    return originalSend.call(this, body);
  };
}

function installPerformanceObserver() {
  if (typeof PerformanceObserver === 'undefined') return;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType !== 'resource') continue;

        const resource = entry as PerformanceResourceTiming;
        const responseStatus =
          'responseStatus' in resource
            ? (resource as PerformanceResourceTiming & { responseStatus?: number })
                .responseStatus
            : undefined;

        if (!responseStatus || responseStatus < 400) continue;

        pushFailedRequest({
          url: resource.name,
          status: responseStatus,
          durationMs: Math.round(resource.duration),
          timestamp: new Date().toISOString(),
        });
      }
    });

    observer.observe({ type: 'resource', buffered: true });
  } catch {
    // PerformanceObserver resource type not supported in this browser.
  }
}

export function isContextCaptureInstalled(): boolean {
  return installed;
}

export function installContextCapture(
  options: InstallContextCaptureOptions = {},
): void {
  if (installed || typeof window === 'undefined') return;

  if (options.apiUrl) {
    const normalizedApiUrl = options.apiUrl.replace(/\/$/, '');
    excludedUrlPatterns = [
      `${normalizedApiUrl}/widget/upload-url`,
      `${normalizedApiUrl}/widget/feedback`,
      `${normalizedApiUrl}/widget/report`,
      `${normalizedApiUrl}/widget/config`,
      '/widget/upload-url',
      '/widget/feedback',
      '/widget/report',
      '/widget/config',
    ];
  }

  installConsoleCapture();
  installFetchCapture();
  installXhrCapture();
  installPerformanceObserver();

  installed = true;
}

export function getCapturedContext(): FeedbackContext {
  return {
    device: collectDeviceContext(),
    consoleLogs: consoleLogs.length > 0 ? [...consoleLogs] : undefined,
    failedRequests:
      failedRequests.length > 0 ? [...failedRequests] : undefined,
  };
}

export function setAutoReportHooks(hooks: AutoReportHooks | null): void {
  autoReportHooks = hooks;
}

declare global {
  interface XMLHttpRequest {
    _trakrCapture?: {
      method: string;
      url: string;
      startedAt: number;
    };
  }
}
