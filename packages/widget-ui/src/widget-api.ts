import type {
  RequestUploadUrlInput,
  SubmitFeedbackInput,
  SubmitFeedbackResponse,
  UploadUrlResponse,
} from '@trakr/schemas';

const PROJECT_KEY_HEADER = 'x-project-key';
const WIDGET_SECRET_HEADER = 'x-widget-secret';

type WidgetAuth = {
  projectKey: string;
  widgetSecret: string;
  apiUrl: string;
};

function isApiSuccessResponse(
  value: unknown,
): value is { success: true; data: unknown } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    value.success === true &&
    'data' in value
  );
}

function isApiErrorResponse(
  value: unknown,
): value is { success: false; error: { message: string } } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    value.success === false &&
    'error' in value
  );
}

function unwrapApiResponse<T>(body: unknown): T {
  if (isApiSuccessResponse(body)) {
    return body.data as T;
  }
  return body as T;
}

function parseApiErrorMessage(body: unknown, fallback: string): string {
  if (isApiErrorResponse(body)) {
    return body.error.message;
  }

  if (typeof body === 'object' && body !== null && 'message' in body) {
    const { message } = body;
    if (typeof message === 'string') {
      return message;
    }
    if (Array.isArray(message)) {
      return message.join(', ');
    }
  }

  return fallback;
}

function widgetHeaders(auth: WidgetAuth): HeadersInit {
  return {
    'Content-Type': 'application/json',
    [PROJECT_KEY_HEADER]: auth.projectKey,
    [WIDGET_SECRET_HEADER]: auth.widgetSecret,
  };
}

async function parseError(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    return parseApiErrorMessage(body, `Request failed (${response.status})`);
  } catch {
    // ignore
  }
  return `Request failed (${response.status})`;
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const body: unknown = await response.json();
  return unwrapApiResponse<T>(body);
}

export async function requestUploadUrl(
  auth: WidgetAuth,
  input: RequestUploadUrlInput,
): Promise<UploadUrlResponse> {
  const response = await fetch(`${auth.apiUrl}/widget/upload-url`, {
    method: 'POST',
    headers: widgetHeaders(auth),
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return parseJsonResponse<UploadUrlResponse>(response);
}

export async function uploadFileToStorage(
  uploadUrl: string,
  file: File,
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error('Failed to upload file');
  }
}

export async function submitFeedback(
  auth: WidgetAuth,
  input: SubmitFeedbackInput,
): Promise<SubmitFeedbackResponse> {
  const response = await fetch(`${auth.apiUrl}/widget/feedback`, {
    method: 'POST',
    headers: widgetHeaders(auth),
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return parseJsonResponse<SubmitFeedbackResponse>(response);
}

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const MAX_MEDIA_COUNT = 5;
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
