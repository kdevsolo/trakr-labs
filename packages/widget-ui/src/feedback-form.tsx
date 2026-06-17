import { FormEvent, useState } from 'react';
import { MediaUpload } from './media-upload';
import { useMediaUpload } from './use-media-upload';
import { submitFeedback } from './widget-api';

type FeedbackFormProps = {
  projectKey: string;
  widgetSecret: string;
  apiUrl: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
};

export function FeedbackForm({
  projectKey,
  widgetSecret,
  apiUrl,
  onSuccess,
  onError,
}: FeedbackFormProps) {
  const auth = { projectKey, widgetSecret, apiUrl };
  const { items, uploading, error: uploadError, uploadFiles, removeItem, reset } =
    useMediaUpload(auth);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitError(null);

    if (!title.trim()) {
      setSubmitError('Title is required');
      return;
    }

    setSubmitting(true);

    try {
      const pageUrl =
        typeof window !== 'undefined' ? window.location.href : undefined;

      await submitFeedback(auth, {
        title: title.trim(),
        description: description.trim() || undefined,
        email: email.trim() || undefined,
        pageUrl,
        media: items.map(({ url, fileType }) => ({ url, fileType })),
      });

      setSubmitted(true);
      setTitle('');
      setDescription('');
      setEmail('');
      reset();
      onSuccess?.();
    } catch (submitErr) {
      const message =
        submitErr instanceof Error ? submitErr.message : 'Failed to submit feedback';
      setSubmitError(message);
      onError?.(submitErr instanceof Error ? submitErr : new Error(message));
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-trakr-border bg-zinc-50 p-4 text-center">
        <p className="text-sm font-medium text-zinc-900">Thanks for your feedback!</p>
        <button
          type="button"
          className="mt-3 text-sm font-medium text-trakr-primary hover:text-trakr-primary-hover"
          onClick={() => setSubmitted(false)}
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-700" htmlFor="trakr-title">
          Title
        </label>
        <input
          id="trakr-title"
          className="h-10 w-full rounded-md border border-trakr-border bg-white px-3 text-sm outline-none focus:border-trakr-primary focus:ring-2 focus:ring-trakr-primary/20"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Brief summary"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-700" htmlFor="trakr-description">
          Description
        </label>
        <textarea
          id="trakr-description"
          className="min-h-24 w-full rounded-md border border-trakr-border bg-white px-3 py-2 text-sm outline-none focus:border-trakr-primary focus:ring-2 focus:ring-trakr-primary/20"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Tell us more…"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-700" htmlFor="trakr-email">
          Email (optional)
        </label>
        <input
          id="trakr-email"
          type="email"
          className="h-10 w-full rounded-md border border-trakr-border bg-white px-3 text-sm outline-none focus:border-trakr-primary focus:ring-2 focus:ring-trakr-primary/20"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
        />
      </div>

      <MediaUpload
        items={items}
        uploading={uploading}
        error={uploadError}
        onSelectFiles={uploadFiles}
        onRemove={removeItem}
      />

      {submitError ? <p className="text-xs text-trakr-danger">{submitError}</p> : null}

      <button
        type="submit"
        disabled={submitting || uploading}
        className="inline-flex h-10 items-center justify-center rounded-md bg-trakr-primary px-4 text-sm font-medium text-white transition hover:bg-trakr-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Sending…' : 'Send feedback'}
      </button>
    </form>
  );
}
