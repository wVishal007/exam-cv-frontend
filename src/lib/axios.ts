import axios from "axios";

export const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Sign-in itself returns 401 on bad credentials; never treat that as a
      // session expiry. Anything else carrying a Bearer token that 401s means
      // the session is gone.
      const url: string = error.config?.url ?? "";
      const isAuthRequest = url.includes("/login/user") || url.includes("/add/user");

      if (!isAuthRequest) {
        if (localStorage.getItem("access_token")) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }

        // The interceptor can't reach React state, so it pokes the AuthProvider
        // through a window event instead (see context/AuthContext.tsx).
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
    }
    return Promise.reject(error);
  }
);

/** Shape of a FastAPI 422 validation error. */
interface FastApiValidationDetail {
  msg?: string;
}

/** Shape of a FastAPI HTTPException body. */
interface FastApiErrorBody {
  detail?: string | FastApiValidationDetail[];
}

/**
 * Best-effort human-readable message for a failed request.
 *
 * Two wrinkles this absorbs:
 *  1. FastAPI reports errors as `{ detail: "..." }`, or for 422s as
 *     `{ detail: [{ loc, msg, type }, ...] }`. Both are flattened to prose.
 *  2. Blob requests (the generated-resume PDF) receive their error body as a
 *     Blob, so `detail` has to be read asynchronously before it can be used.
 *
 * Never throws — falls back to `fallback` whenever a real message can't be
 * recovered, so callers can render it unconditionally.
 */
export async function getErrorMessage(
  error: unknown,
  fallback: string
): Promise<string> {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error && error.message ? error.message : fallback;
  }

  const status = error.response?.status;
  const suffix = status ? ` (HTTP ${status})` : "";

  let body: unknown = error.response?.data;
  if (body instanceof Blob) {
    try {
      body = JSON.parse(await body.text());
    } catch {
      return `${fallback}${suffix}`;
    }
  }

  const detail = (body as FastApiErrorBody | undefined)?.detail;

  if (typeof detail === "string" && detail.trim()) {
    return `${detail}${suffix}`;
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => (typeof item?.msg === "string" ? item.msg.trim() : ""))
      .filter(Boolean);
    if (messages.length) {
      return `${messages.join("; ")}${suffix}`;
    }
  }

  return `${fallback}${suffix}`;
}
