import { isAxiosError } from "axios";

export function getApiErrorMessage(
  error: unknown,
  fallback: string,
  statusMessages: Partial<Record<number, string>> = {},
): string {
  if (!isAxiosError<{ error?: unknown }>(error)) return fallback;

  if (!error.response) {
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return "The request timed out. Please try again.";
    }
    if (error.code === "ERR_NETWORK") {
      return "Could not reach the server. Check your connection and try again.";
    }
    return fallback;
  }

  const { status, data } = error.response;
  const message = data?.error;
  return statusMessages[status] ??
    (status >= 400 && status < 500 && typeof message === "string" && message.trim()
      ? message.trim()
      : fallback);
}
