import { describe, it, expect } from "vitest";
import { ok, fail } from "@/lib/action-result";

describe("ok", () => {
  it("returns success true with data", () => {
    const result = ok({ id: "123" });
    expect(result.success).toBe(true);
  });

  it("contains the provided data", () => {
    const data = { id: "abc", name: "test" };
    const result = ok(data);
    if (result.success) {
      expect(result.data).toEqual(data);
    }
  });

  it("works with void data", () => {
    const result = ok(undefined);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBeUndefined();
    }
  });

  it("works with string data", () => {
    const result = ok("hello");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("hello");
    }
  });

  it("works with array data", () => {
    const result = ok([1, 2, 3]);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual([1, 2, 3]);
    }
  });
});

describe("fail", () => {
  it("returns success false", () => {
    const result = fail("ERROR_CODE", "Something went wrong");
    expect(result.success).toBe(false);
  });

  it("contains the provided code", () => {
    const result = fail("VALIDATION_ERROR", "Invalid data");
    if (!result.success) {
      expect(result.code).toBe("VALIDATION_ERROR");
    }
  });

  it("contains the provided message", () => {
    const result = fail("NOT_FOUND", "Resource not found");
    if (!result.success) {
      expect(result.message).toBe("Resource not found");
    }
  });

  it("handles empty code and message", () => {
    const result = fail("", "");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe("");
      expect(result.message).toBe("");
    }
  });

  it("handles common error codes", () => {
    const codes = ["UNAUTHORIZED", "FORBIDDEN", "NOT_FOUND", "INTERNAL_ERROR", "VALIDATION_ERROR"];
    for (const code of codes) {
      const result = fail(code, `Error: ${code}`);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(code);
      }
    }
  });
});
