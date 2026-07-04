type ApiErrorBody = {
  error?: string;
};

type RequestConfig = {
  url: string;
  method?: string;
  data?: unknown;
  headers?: HeadersInit;
};

export async function request<T>({
  url,
  method = 'GET',
  data,
  headers,
}: RequestConfig): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: data === undefined ? undefined : JSON.stringify(data),
  });

  if (!response.ok) {
    const detail = (await response.json().catch(() => null)) as ApiErrorBody | null;
    throw new Error(detail?.error || '请求失败');
  }

  return response.json() as Promise<T>;
}
