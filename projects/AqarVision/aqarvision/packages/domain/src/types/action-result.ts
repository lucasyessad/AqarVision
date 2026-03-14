export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

export function ok<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

export function fail<T = never>(code: string, message: string): ActionResult<T> {
  return { success: false, error: { code, message } };
}
