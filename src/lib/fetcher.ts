import { env } from "@/config/env";

// ---------------------------------------------------------------------------
// Error class
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly statusText: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface FetcherRequestInit extends Omit<RequestInit, "method" | "body"> {
  /**
   * Override the base URL for this request.
   * Defaults to `env.API_BASE_URL`.
   */
  baseUrl?: string;

  /**
   * Bearer token to attach. When `undefined`, the `Authorization`
   * header is omitted entirely.
   */
  token?: string;

  /**
   * Additional headers merged with defaults.
   */
  headers?: Record<string, string>;
}

export interface FetcherOptions<TBody = unknown> extends FetcherRequestInit {
  method?: HttpMethod;
  body?: TBody;
}

// ---------------------------------------------------------------------------
// Core fetcher
// ---------------------------------------------------------------------------

/**
 * Enterprise-grade fetch wrapper.
 *
 * Features:
 * - Automatic `baseUrl` resolution from validated env.
 * - Bearer token injection (when provided).
 * - Typed JSON response via generics.
 * - Structured error handling with `ApiError`.
 *
 * @example
 * ```ts
 * const products = await fetcher<Product[]>("/products");
 *
 * const created = await fetcher<Product>("/products", {
 *   method: "POST",
 *   body: { name: "Widget" },
 *   token: session.accessToken,
 * });
 * ```
 */
export async function fetcher<TResponse>(
  path: string,
  options: FetcherOptions = {},
): Promise<TResponse> {
  const {
    method = "GET",
    body,
    token,
    baseUrl = env.API_BASE_URL,
    headers: customHeaders,
    ...rest
  } = options;

  const url = `${baseUrl}${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...customHeaders,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  if (!response.ok) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch {
      // response body was not JSON — that's fine
    }

    throw new ApiError(
      `API request failed: ${method} ${path} → ${response.status}`,
      response.status,
      response.statusText,
      errorBody,
    );
  }

  // 204 No Content — return undefined as TResponse
  if (response.status === 204) {
    return undefined as TResponse;
  }

  return response.json() as Promise<TResponse>;
}

// ---------------------------------------------------------------------------
// Convenience methods
// ---------------------------------------------------------------------------

fetcher.get = <T>(path: string, options?: FetcherRequestInit) =>
  fetcher<T>(path, { ...options, method: "GET" });

fetcher.post = <T, TBody = unknown>(
  path: string,
  body: TBody,
  options?: FetcherRequestInit,
) => fetcher<T>(path, { ...options, method: "POST", body });

fetcher.put = <T, TBody = unknown>(
  path: string,
  body: TBody,
  options?: FetcherRequestInit,
) => fetcher<T>(path, { ...options, method: "PUT", body });

fetcher.patch = <T, TBody = unknown>(
  path: string,
  body: TBody,
  options?: FetcherRequestInit,
) => fetcher<T>(path, { ...options, method: "PATCH", body });

fetcher.delete = <T>(path: string, options?: FetcherRequestInit) =>
  fetcher<T>(path, { ...options, method: "DELETE" });
