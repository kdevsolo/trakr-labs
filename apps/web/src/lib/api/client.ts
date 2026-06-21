import { createClient } from "@/utils/supabase/client";
import {
  isApiErrorResponse,
  parseApiErrorMessage,
  unwrapApiResponse,
} from "@trakr/schemas";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type ApiFetchOptions = RequestInit & {
  /** JSON-serializable payload; sets Content-Type and body automatically */
  json?: unknown;
  accessToken?: string;
};

export async function apiFetch<T>(
  path: string,
  options?: ApiFetchOptions,
): Promise<T> {
  const { json, accessToken, headers: initHeaders, body: initBody, ...init } =
    options ?? {};

  let token = accessToken;

  if (!token && typeof window !== "undefined") {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    token = session?.access_token;
  }

  const headers = new Headers(initHeaders);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let body = initBody;
  if (json !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(json);
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: init.method ?? (json !== undefined ? "POST" : "GET"),
    ...init,
    headers,
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  const responseBody: unknown = JSON.parse(text);

  if (isApiErrorResponse(responseBody)) {
    throw new ApiError(response.status, responseBody.error.message);
  }

  return unwrapApiResponse<T>(responseBody);
}

async function parseErrorMessage(response: Response): Promise<string> {
  const fallback = `API request failed: ${response.status}`;

  try {
    const errorBody: unknown = await response.json();
    return parseApiErrorMessage(errorBody, fallback);
  } catch {
    // Response body is not JSON — use fallback.
  }

  return fallback;
}
