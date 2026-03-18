export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; code: string; message: string };

export function ok<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

export function fail(code: string, message: string): ActionResult<never> {
  return { success: false, code, message };
}
