export const bookingStatuses = [
  "REQUESTED", "QUOTED", "CUSTOMER_ACCEPTED", "CONFIRMED",
  "DRIVER_EN_ROUTE", "ARRIVED", "IN_PROGRESS", "COMPLETED",
  "REJECTED", "CANCELLED",
] as const;

export type BookingStatus = (typeof bookingStatuses)[number];
export type ActorRole = "CUSTOMER" | "OWNER" | "DRIVER";

export const blockingStatuses: ReadonlySet<BookingStatus> = new Set([
  "CONFIRMED", "DRIVER_EN_ROUTE", "ARRIVED", "IN_PROGRESS",
]);

const transitions: Record<BookingStatus, readonly BookingStatus[]> = {
  REQUESTED: ["QUOTED", "REJECTED", "CANCELLED"],
  QUOTED: ["CUSTOMER_ACCEPTED", "REJECTED", "CANCELLED"],
  CUSTOMER_ACCEPTED: ["CONFIRMED", "REJECTED", "CANCELLED"],
  CONFIRMED: ["DRIVER_EN_ROUTE", "CANCELLED"],
  DRIVER_EN_ROUTE: ["ARRIVED", "CANCELLED"],
  ARRIVED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: [],
};

export function canTransition(from: BookingStatus, to: BookingStatus, actor: ActorRole): boolean {
  if (!transitions[from].includes(to)) return false;
  if (to === "CUSTOMER_ACCEPTED") return actor === "CUSTOMER";
  if (["DRIVER_EN_ROUTE", "ARRIVED", "IN_PROGRESS", "COMPLETED"].includes(to)) return actor === "DRIVER" || actor === "OWNER";
  if (to === "CANCELLED" && from === "IN_PROGRESS") return actor === "OWNER";
  return actor === "OWNER";
}

export function intervalsOverlap(
  first: { start: Date; end: Date },
  second: { start: Date; end: Date },
): boolean {
  if (first.end <= first.start || second.end <= second.start) {
    throw new Error("Khoảng thời gian phải có thời điểm kết thúc sau thời điểm bắt đầu.");
  }
  return first.start < second.end && first.end > second.start;
}

export function hasScheduleConflict(
  candidate: { start: Date; end: Date },
  existing: Array<{ start: Date; end: Date; status: BookingStatus }>,
): boolean {
  return existing.some((booking) => blockingStatuses.has(booking.status) && intervalsOverlap(candidate, booking));
}
