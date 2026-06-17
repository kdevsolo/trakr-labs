import { useCallback, useState } from 'react';
import type { FeedbackMedia } from '@trakr/schemas';
import {
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE_BYTES,
  MAX_MEDIA_COUNT,
  requestUploadUrl,
  uploadFileToStorage,
} from './widget-api';

type WidgetAuth = {
  projectKey: string;
  widgetSecret: string;
  apiUrl: string;
};

export type UploadedMediaItem = FeedbackMedia & {
  id: string;
  previewUrl: string;
  fileName: string;
};

export function useMediaUpload(auth: WidgetAuth) {
  const [items, setItems] = useState<UploadedMediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeItem = useCallback((id: string) => {
    setItems((current) => {
      const item = current.find((entry) => entry.id === id);
      if (item) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return current.filter((entry) => entry.id !== id);
    });
  }, []);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      const fileArray = Array.from(files);

      if (items.length + fileArray.length > MAX_MEDIA_COUNT) {
        setError(`Maximum ${MAX_MEDIA_COUNT} images allowed`);
        return;
      }

      setUploading(true);

      try {
        for (const file of fileArray) {
          if (
            !ALLOWED_IMAGE_TYPES.includes(
              file.type as (typeof ALLOWED_IMAGE_TYPES)[number],
            )
          ) {
            throw new Error('Only JPEG, PNG, WebP, and GIF images are allowed');
          }

          if (file.size > MAX_FILE_SIZE_BYTES) {
            throw new Error('Each image must be 5 MB or smaller');
          }

          const uploadMeta = await requestUploadUrl(auth, {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          });

          await uploadFileToStorage(uploadMeta.uploadUrl, file);

          setItems((current) => [
            ...current,
            {
              id: crypto.randomUUID(),
              url: uploadMeta.publicUrl,
              fileType: file.type,
              previewUrl: URL.createObjectURL(file),
              fileName: file.name,
            },
          ]);
        }
      } catch (uploadError) {
        setError(
          uploadError instanceof Error
            ? uploadError.message
            : 'Failed to upload image',
        );
      } finally {
        setUploading(false);
      }
    },
    [auth, items.length],
  );

  const reset = useCallback(() => {
    setItems((current) => {
      for (const item of current) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return [];
    });
    setError(null);
  }, []);

  return {
    items,
    uploading,
    error,
    uploadFiles,
    removeItem,
    reset,
  };
}
