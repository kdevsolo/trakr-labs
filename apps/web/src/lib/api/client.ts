import { createClient } from "@/utils/supabase/client";

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

  return JSON.parse(text) as T;
}

async function parseErrorMessage(response: Response): Promise<string> {
  const fallback = `API request failed: ${response.status}`;

  try {
    const errorBody: unknown = await response.json();

    if (typeof errorBody === "object" && errorBody !== null && "message" in errorBody) {
      const { message } = errorBody;

      if (typeof message === "string") {
        return message;
      }

      if (Array.isArray(message)) {
        return message.join(", ");
      }
    }
  } catch {
    // Response body is not JSON — use fallback.
  }

  return fallback;
}
