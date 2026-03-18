import { createLogger } from "@/lib/logger";

const log = createLogger("python-api");

const PYTHON_API_URL = process.env.PYTHON_API_URL;
const PYTHON_API_SECRET = process.env.PYTHON_API_SECRET;

interface PythonApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  timeout?: number;
}

export async function pythonApi<T>(
  path: string,
  options: PythonApiOptions = {}
): Promise<T> {
  const { method = "GET", body, timeout = 30000 } = options;

  const url = `${PYTHON_API_URL}${path}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PYTHON_API_SECRET}`,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      log.error({ url, status: response.status, errorText }, "Python API error");
      throw new Error(`Python API error: ${response.status} ${errorText}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}
