import { mountWidget } from './mount';

declare global {
  interface Window {
    TrakrWidget?: {
      mount: typeof mountWidget;
    };
  }
}

function readScriptAttributes(): {
  projectKey?: string;
  widgetSecret?: string;
  apiUrl?: string;
  mode?: 'floating' | 'inline';
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
  };
}

function autoMount() {
  const { projectKey, widgetSecret, apiUrl, mode } = readScriptAttributes();

  if (!projectKey || !widgetSecret || !apiUrl) {
    console.error(
      '[Trakr Widget] Missing data-project-key, data-widget-secret, or data-api-url',
    );
    return;
  }

  const host = document.createElement('div');
  host.id = 'trakr-widget-root';
  document.body.appendChild(host);

  mountWidget(host, { projectKey, widgetSecret, apiUrl, mode });
}

window.TrakrWidget = { mount: mountWidget };

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoMount);
} else {
  autoMount();
}

export { mountWidget };
