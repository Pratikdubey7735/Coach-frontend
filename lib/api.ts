/**
 * Low-level HTTP client used to talk to the Node.js backend.
 *
 * Every other service (auth, users, etc.) should be built on top of
 * this file rather than calling `fetch` directly, so there is a single
 * place that knows the base URL, default headers, error shape, and
 * token handling.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://coach-backend-6wix.onrender.com/api";

export class ApiError extends Error {
  status: number;
  payload?: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  /** Bearer token to attach, e.g. read from the session cookie server-side. */
  token?: string;
  /** JSON-serializable request body. */
  body?: unknown;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, body, headers, ...rest } = options;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    // Backend data should not be cached by Next.js by default.
    cache: "no-store",
  });

  const contentType = res.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await res.json().catch(() => null)
    : null;

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && "message" in data && String(data.message)) ||
      res.statusText ||
      "Request failed";
    throw new ApiError(message, res.status, data);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
