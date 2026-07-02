import {
  installAutoReport,
  installContextCapture,
  isAutoReportInstalled,
  isContextCaptureInstalled,
} from '@trakr/widget-ui';
import { mountWidget } from './mount';

declare global {
  interface Window {
    TrakrWidget?: {
      mount: typeof mountWidget;
      start: typeof startWidget;
    };
  }
}

function readScriptAttributes(): {
  projectKey?: string;
  widgetSecret?: string;
  apiUrl?: string;
  mode?: 'floating' | 'inline';
  uiEnabled?: boolean;
} {
  const script =
    document.currentScript ??
    document.querySelector('script[data-project-key]');

  if (!(script instanceof HTMLScriptElement)) {
    return {};
  }

  const mode = script.dataset.mode;
  return {
    projectKey: script.dataset.projectKey,
    widgetSecret: script.dataset.widgetSecret,
    apiUrl: script.dataset.apiUrl,
    mode: mode === 'inline' ? 'inline' : 'floating',
    uiEnabled: script.dataset.ui !== 'false',
  };
}

async function startWidget(options: {
  projectKey: string;
  widgetSecret: string;
  apiUrl: string;
}) {
  if (!isContextCaptureInstalled()) {
    installContextCapture({ apiUrl: options.apiUrl });
  }

  if (!isAutoReportInstalled()) {
    await installAutoReport(options);
  }
}

function autoMount() {
  const { projectKey, widgetSecret, apiUrl, mode, uiEnabled } =
    readScriptAttributes();

  if (!projectKey || !widgetSecret || !apiUrl) {
    console.error(
      '[Trakr Widget] Missing data-project-key, data-widget-secret, or data-api-url',
    );
    return;
  }

  void startWidget({ projectKey, widgetSecret, apiUrl });

  if (!uiEnabled) {
    return;
  }

  const host = document.createElement('div');
  host.id = 'trakr-widget-root';
  document.body.appendChild(host);

  mountWidget(host, { projectKey, widgetSecret, apiUrl, mode });
}

window.TrakrWidget = { mount: mountWidget, start: startWidget };

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoMount);
} else {
  autoMount();
}

export { mountWidget, startWidget };
