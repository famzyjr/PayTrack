
const API_URL = import.meta.env.VITE_API_URL;

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
console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);
console.log("Final request URL:", `${API_URL}${endpoint}`);
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...requestOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data as T;
}
