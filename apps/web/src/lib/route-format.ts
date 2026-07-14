const distanceFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 1,
});

export function formatRouteDistance(distanceMeters: number): string {
  if (!Number.isFinite(distanceMeters) || distanceMeters < 0) {
    return "—";
  }

  if (distanceMeters < 1_000) {
    return `${Math.round(distanceMeters)} m`;
  }

  return `${distanceFormatter.format(distanceMeters / 1_000)} km`;
}

export function formatRouteDuration(durationMillis: number): string {
  if (!Number.isFinite(durationMillis) || durationMillis < 0) {
    return "—";
  }

  const totalMinutes = Math.max(1, Math.round(durationMillis / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} phút`;
  }

  return minutes === 0 ? `${hours} giờ` : `${hours} giờ ${minutes} phút`;
}
