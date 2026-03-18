import { describe, it, expect } from "vitest";
import { sanitizeInput } from "@/lib/sanitize";

describe("sanitizeInput", () => {
  it("strips HTML tags", () => {
    expect(sanitizeInput("<script>alert('xss')</script>Hello")).toBe(
      "alert('xss')Hello"
    );
  });

  it("strips nested tags", () => {
    expect(sanitizeInput("<div><p>text</p></div>")).toBe("text");
  });

  it("trims whitespace", () => {
    expect(sanitizeInput("  hello  ")).toBe("hello");
  });

  it("handles empty string", () => {
    expect(sanitizeInput("")).toBe("");
  });

  it("preserves safe text", () => {
    expect(sanitizeInput("Appartement F3 à Alger")).toBe(
      "Appartement F3 à Alger"
    );
  });

  it("decodes HTML entities", () => {
    expect(sanitizeInput("&lt;script&gt;")).toBe("<script>");
  });
});
