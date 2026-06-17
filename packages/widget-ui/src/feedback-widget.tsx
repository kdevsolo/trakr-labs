import { useState } from 'react';
import { FeedbackForm } from './feedback-form';

export type FeedbackWidgetProps = {
  projectKey: string;
  widgetSecret: string;
  apiUrl: string;
  mode?: 'floating' | 'inline';
  onSuccess?: () => void;
  onError?: (error: Error) => void;
};

export function FeedbackWidget({
  projectKey,
  widgetSecret,
  apiUrl,
  mode = 'floating',
  onSuccess,
  onError,
}: FeedbackWidgetProps) {
  const [open, setOpen] = useState(mode === 'inline');

  if (mode === 'inline') {
    return (
      <div className="trakr-widget w-full max-w-md rounded-xl border border-trakr-border bg-trakr-bg p-4 shadow-sm">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-zinc-900">Send feedback</h2>
          <p className="text-xs text-trakr-muted">
            Share a bug report or suggestion with the team.
          </p>
        </div>
        <FeedbackForm
          projectKey={projectKey}
          widgetSecret={widgetSecret}
          apiUrl={apiUrl}
          onSuccess={onSuccess}
          onError={onError}
        />
      </div>
    );
  }

  return (
    <div className="trakr-widget fixed bottom-5 right-5 z-[999999] font-sans">
      {open ? (
        <div className="mb-3 w-[min(100vw-2rem,22rem)] rounded-xl border border-trakr-border bg-trakr-bg p-4 shadow-xl">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">Send feedback</h2>
              <p className="text-xs text-trakr-muted">
                Share a bug report or suggestion.
              </p>
            </div>
            <button
              type="button"
              aria-label="Close feedback widget"
              className="rounded-md px-2 py-1 text-sm text-trakr-muted hover:bg-zinc-100"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>
          <FeedbackForm
            projectKey={projectKey}
            widgetSecret={widgetSecret}
            apiUrl={apiUrl}
            onSuccess={() => {
              onSuccess?.();
              setOpen(false);
            }}
            onError={onError}
          />
        </div>
      ) : null}

      <button
        type="button"
        className="ml-auto flex h-12 items-center gap-2 rounded-full bg-trakr-primary px-5 text-sm font-medium text-white shadow-lg transition hover:bg-trakr-primary-hover"
        onClick={() => setOpen((current) => !current)}
      >
        Feedback
      </button>
    </div>
  );
}
