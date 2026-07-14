import { describe, expect, it } from "vitest";
import { canTransition, hasScheduleConflict, intervalsOverlap } from "./booking-rules";

describe("booking transitions", () => {
  it("requires the owner to confirm a customer-accepted quote", () => {
    expect(canTransition("CUSTOMER_ACCEPTED", "CONFIRMED", "OWNER")).toBe(true);
    expect(canTransition("CUSTOMER_ACCEPTED", "CONFIRMED", "CUSTOMER")).toBe(false);
  });

  it("allows the driver to advance an active trip", () => {
    expect(canTransition("CONFIRMED", "DRIVER_EN_ROUTE", "DRIVER")).toBe(true);
    expect(canTransition("ARRIVED", "IN_PROGRESS", "DRIVER")).toBe(true);
  });

  it("only allows the owner to cancel an in-progress trip", () => {
    expect(canTransition("IN_PROGRESS", "CANCELLED", "OWNER")).toBe(true);
    expect(canTransition("IN_PROGRESS", "CANCELLED", "DRIVER")).toBe(false);
  });
});

describe("schedule conflicts", () => {
  const time = (value: string) => new Date(`2026-07-18T${value}:00+07:00`);

  it("detects overlapping intervals", () => {
    expect(intervalsOverlap({ start: time("08:00"), end: time("12:00") }, { start: time("11:30"), end: time("14:00") })).toBe(true);
  });

  it("allows adjacent intervals", () => {
    expect(intervalsOverlap({ start: time("08:00"), end: time("12:00") }, { start: time("12:00"), end: time("14:00") })).toBe(false);
  });

  it("only blocks statuses that hold the vehicle", () => {
    const candidate = { start: time("11:30"), end: time("14:00") };
    expect(hasScheduleConflict(candidate, [{ start: time("08:00"), end: time("12:00"), status: "REQUESTED" }])).toBe(false);
    expect(hasScheduleConflict(candidate, [{ start: time("08:00"), end: time("12:00"), status: "CONFIRMED" }])).toBe(true);
  });
});
