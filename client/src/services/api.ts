
const API_URL = import.meta.env.VITE_API_URL;

export const SESSION_EXPIRED_EVENT = "paytrack:session-expired";
export const TOKEN_KEY = "paytrack_token";

type ApiOptions = RequestInit & {
  token?: string;
};

export async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  if (!API_URL) {
    throw new Error(
      "API URL is missing. Check VITE_API_URL in your .env file."
    );
  }

  const { token, headers, ...requestOptions } = options;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...requestOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // Expire the session only when an authenticated request
    // returns 401. Don't log out users for failed login attempts.
    if (
      response.status === 401 &&
      token &&
      token === sessionStorage.getItem(TOKEN_KEY)
    ) {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }

    const message =
      data?.message || "Something went wrong. Please try again.";

    throw new Error(message);
  }

  return data as T;
}
