import type { UploadedMediaItem } from './use-media-upload';

type MediaUploadProps = {
  items: UploadedMediaItem[];
  uploading: boolean;
  error: string | null;
  onSelectFiles: (files: FileList | File[]) => void;
  onRemove: (id: string) => void;
};

export function MediaUpload({
  items,
  uploading,
  error,
  onSelectFiles,
  onRemove,
}: MediaUploadProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-trakr-border bg-zinc-50 px-4 py-4 text-center transition hover:border-trakr-primary">
        <span className="text-sm font-medium text-zinc-800">
          {uploading ? 'Uploading…' : 'Add screenshots'}
        </span>
        <span className="mt-1 text-xs text-trakr-muted">
          Up to 5 images, 5 MB each
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          disabled={uploading || items.length >= 5}
          onChange={(event) => {
            if (event.target.files?.length) {
              onSelectFiles(event.target.files);
              event.target.value = '';
            }
          }}
        />
      </label>

      {error ? <p className="text-xs text-trakr-danger">{error}</p> : null}

      {items.length > 0 ? (
        <ul className="grid grid-cols-3 gap-2">
          {items.map((item) => (
            <li key={item.id} className="relative overflow-hidden rounded-md border border-trakr-border">
              <img
                src={item.previewUrl}
                alt={item.fileName}
                className="h-20 w-full object-cover"
              />
              <button
                type="button"
                className="absolute right-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white"
                onClick={() => onRemove(item.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
