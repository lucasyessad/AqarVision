import { describe, it, expect } from "vitest";
import { formatPrice, formatArea, formatRelativeDate, slugify } from "@/lib/format";

describe("formatPrice", () => {
  it("formats DZD price in French locale", () => {
    const result = formatPrice(15000000, "DZD", "fr");
    expect(result).toContain("15");
  });

  it("formats EUR price in English locale", () => {
    const result = formatPrice(150000, "EUR", "en");
    // EUR symbol varies by locale
    expect(result).toMatch(/150/);
  });

  it("formats large DZD amount with no decimals", () => {
    const result = formatPrice(25500000, "DZD", "fr");
    expect(result).toContain("25");
  });

  it("formats zero price", () => {
    const result = formatPrice(0, "DZD", "fr");
    expect(result).toContain("0");
  });

  it("formats price in Arabic locale", () => {
    const result = formatPrice(5000000, "DZD", "ar");
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
  });

  it("formats price in Spanish locale", () => {
    const result = formatPrice(200000, "EUR", "es");
    expect(result).toContain("200");
  });
});

describe("formatArea", () => {
  it("formats area with m² suffix in French", () => {
    const result = formatArea(120, "fr");
    expect(result).toBe("120 m²");
  });

  it("formats large area", () => {
    const result = formatArea(1500, "fr");
    expect(result).toContain("1");
    expect(result).toContain("500");
    expect(result).toContain("m²");
  });

  it("formats zero area", () => {
    const result = formatArea(0, "fr");
    expect(result).toContain("0");
    expect(result).toContain("m²");
  });

  it("formats area in English locale", () => {
    const result = formatArea(250, "en");
    expect(result).toContain("250");
    expect(result).toContain("m²");
  });
});

describe("formatRelativeDate", () => {
  it("returns today for same-day dates", () => {
    const result = formatRelativeDate(new Date(), "fr");
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
  });

  it("returns a relative string for dates in the past", () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const result = formatRelativeDate(threeDaysAgo, "fr");
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("handles dates weeks ago", () => {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const result = formatRelativeDate(twoWeeksAgo, "fr");
    expect(result).toBeDefined();
  });

  it("handles dates months ago", () => {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const result = formatRelativeDate(threeMonthsAgo, "fr");
    expect(result).toBeDefined();
  });
});

describe("slugify", () => {
  it("converts to lowercase kebab-case", () => {
    expect(slugify("Villa F5 à Alger")).toBe("villa-f5-a-alger");
  });

  it("returns empty string for empty input", () => {
    expect(slugify("")).toBe("");
  });

  it("handles accented characters", () => {
    expect(slugify("Résidence Méditerranée")).toBe("residence-mediterranee");
  });

  it("removes special characters", () => {
    expect(slugify("Villa #1 (Luxe)")).toBe("villa-1-luxe");
  });

  it("collapses multiple hyphens", () => {
    expect(slugify("Villa   F5   Alger")).toBe("villa-f5-alger");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify(" -Villa- ")).toBe("villa");
  });

  it("handles numbers", () => {
    expect(slugify("Appartement 3 pièces 120m2")).toBe("appartement-3-pieces-120m2");
  });
});
