import { describe, it, expect } from "vitest";
import { calculateHeatScore } from "@/features/leads/services/lead.service";

describe("calculateHeatScore", () => {
  const baseSignals = {
    createdAt: new Date(),
    messagesCount: 0,
    hasVisitRequest: false,
    budgetMeetsPrice: false,
    source: "phone" as const,
    isQualified: false,
  };

  it("scores 30+ for new lead created less than 24 hours ago", () => {
    const score = calculateHeatScore({
      ...baseSignals,
      createdAt: new Date(), // just created
    });
    expect(score).toBeGreaterThanOrEqual(30);
  });

  it("scores 15+ for lead created less than 7 days ago", () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const score = calculateHeatScore({
      ...baseSignals,
      createdAt: threeDaysAgo,
    });
    expect(score).toBeGreaterThanOrEqual(15);
  });

  it("scores 0 for old lead with no signals", () => {
    const oldDate = new Date();
    oldDate.setMonth(oldDate.getMonth() - 2);
    const score = calculateHeatScore({
      ...baseSignals,
      createdAt: oldDate,
    });
    expect(score).toBe(0);
  });

  it("adds 25 points for visit request", () => {
    const oldDate = new Date();
    oldDate.setMonth(oldDate.getMonth() - 2);

    const withoutVisit = calculateHeatScore({
      ...baseSignals,
      createdAt: oldDate,
    });
    const withVisit = calculateHeatScore({
      ...baseSignals,
      createdAt: oldDate,
      hasVisitRequest: true,
    });
    expect(withVisit - withoutVisit).toBe(25);
  });

  it("adds 20 points for 3+ messages", () => {
    const oldDate = new Date();
    oldDate.setMonth(oldDate.getMonth() - 2);

    const withoutMessages = calculateHeatScore({
      ...baseSignals,
      createdAt: oldDate,
    });
    const withMessages = calculateHeatScore({
      ...baseSignals,
      createdAt: oldDate,
      messagesCount: 5,
    });
    expect(withMessages - withoutMessages).toBe(20);
  });

  it("adds 10 points when budget meets price", () => {
    const oldDate = new Date();
    oldDate.setMonth(oldDate.getMonth() - 2);

    const without = calculateHeatScore({
      ...baseSignals,
      createdAt: oldDate,
    });
    const withBudget = calculateHeatScore({
      ...baseSignals,
      createdAt: oldDate,
      budgetMeetsPrice: true,
    });
    expect(withBudget - without).toBe(10);
  });

  it("adds 5 points for platform source", () => {
    const oldDate = new Date();
    oldDate.setMonth(oldDate.getMonth() - 2);

    const phoneSource = calculateHeatScore({
      ...baseSignals,
      createdAt: oldDate,
      source: "phone",
    });
    const platformSource = calculateHeatScore({
      ...baseSignals,
      createdAt: oldDate,
      source: "platform",
    });
    expect(platformSource - phoneSource).toBe(5);
  });

  it("adds 20 points for qualified lead", () => {
    const oldDate = new Date();
    oldDate.setMonth(oldDate.getMonth() - 2);

    const without = calculateHeatScore({
      ...baseSignals,
      createdAt: oldDate,
    });
    const qualified = calculateHeatScore({
      ...baseSignals,
      createdAt: oldDate,
      isQualified: true,
    });
    expect(qualified - without).toBe(20);
  });

  it("caps score at 100", () => {
    const score = calculateHeatScore({
      createdAt: new Date(), // +30
      messagesCount: 5, // +20
      hasVisitRequest: true, // +25
      budgetMeetsPrice: true, // +10
      source: "platform", // +5
      isQualified: true, // +20 = 110 -> capped at 100
    });
    expect(score).toBe(100);
  });

  it("accumulates multiple signals correctly", () => {
    const oldDate = new Date();
    oldDate.setMonth(oldDate.getMonth() - 2);

    const score = calculateHeatScore({
      createdAt: oldDate, // +0
      messagesCount: 3, // +20
      hasVisitRequest: true, // +25
      budgetMeetsPrice: false, // +0
      source: "platform", // +5
      isQualified: false, // +0
    });
    expect(score).toBe(50);
  });

  it("does not add message points for less than 3 messages", () => {
    const oldDate = new Date();
    oldDate.setMonth(oldDate.getMonth() - 2);

    const score = calculateHeatScore({
      ...baseSignals,
      createdAt: oldDate,
      messagesCount: 2,
    });
    expect(score).toBe(0);
  });
});
