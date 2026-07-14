import { describe, expect, it } from "vitest";

import { formatRouteDistance, formatRouteDuration } from "./route-format";

describe("route formatting", () => {
  it("formats short and long distances for Vietnamese users", () => {
    expect(formatRouteDistance(850)).toBe("850 m");
    expect(formatRouteDistance(112_400)).toBe("112,4 km");
  });

  it("formats durations into hours and minutes", () => {
    expect(formatRouteDuration(25 * 60_000)).toBe("25 phút");
    expect(formatRouteDuration(145 * 60_000)).toBe("2 giờ 25 phút");
    expect(formatRouteDuration(120 * 60_000)).toBe("2 giờ");
  });

  it("does not expose invalid route metrics", () => {
    expect(formatRouteDistance(Number.NaN)).toBe("—");
    expect(formatRouteDuration(-1)).toBe("—");
  });
});
