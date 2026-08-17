import { describe, expect, it } from "vitest";
import { isDueToday, isOverdue } from "@/lib/format";

describe("isOverdue", () => {
  it("is true for a past date that is not done", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isOverdue(yesterday, false)) .toBe(true);
  });

  it("is false for a past date that is done", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isOverdue(yesterday, true)).toBe(false);
  });

  it("is false for a task due later today", () => {
    const today = new Date();
    today.setHours(23, 0, 0, 0);
    expect(isOverdue(today, false)).toBe(false);
  });

  it("is false for a future date", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(isOverdue(tomorrow, false)).toBe(false);
  });

  it("is false when there is no due date", () => {
    expect(isOverdue(null, false)).toBe(false);
  });
});

describe("isDueToday", () => {
  it("is true for a date earlier today", () => {
    const today = new Date();
    today.setHours(0, 1, 0, 0);
    expect(isDueToday(today)).toBe(true);
  });

  it("is false for yesterday", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isDueToday(yesterday)).toBe(false);
  });

  it("is false for tomorrow", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(isDueToday(tomorrow)).toBe(false);
  });
});
