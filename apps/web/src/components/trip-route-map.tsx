"use client";

import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { useEffect, useRef, useState } from "react";

import { formatRouteDistance, formatRouteDuration } from "@/lib/route-format";

type RouteMetrics = {
  distance: string;
  duration: string;
};

type RouteStatus = "idle" | "loading" | "ready" | "error";

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
let googleLibrariesPromise: Promise<[
  google.maps.MapsLibrary,
  google.maps.RoutesLibrary,
]> | null = null;

function loadGoogleLibraries() {
  if (!apiKey) {
    throw new Error("Thiếu Google Maps API key.");
  }

  if (!googleLibrariesPromise) {
    setOptions({
      key: apiKey,
      v: "weekly",
      language: "vi",
      region: "VN",
      authReferrerPolicy: "origin",
    });
    googleLibrariesPromise = Promise.all([
      importLibrary("maps"),
      importLibrary("routes"),
    ]);
  }

  return googleLibrariesPromise;
}

function getRouteErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.includes("ZERO_RESULTS")) {
    return "Không tìm thấy đường đi phù hợp. Hãy nhập địa chỉ cụ thể hơn.";
  }

  return "Không thể tải lộ trình. Kiểm tra API key, kết nối mạng và địa chỉ đã nhập.";
}

export function TripRouteMap({
  origin,
  destination,
}: {
  origin: string;
  destination: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const [status, setStatus] = useState<RouteStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [metrics, setMetrics] = useState<RouteMetrics>({
    distance: "—",
    duration: "—",
  });
  const [retryCount, setRetryCount] = useState(0);
  const hasRouteInput = origin.trim().length >= 3 && destination.trim().length >= 3;

  useEffect(() => {
    if (!apiKey || !hasRouteInput) {
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setStatus("loading");
      setErrorMessage("");

      try {
        const [{ Map }, { Route, RoutingPreference }] = await loadGoogleLibraries();
        if (cancelled || !containerRef.current) return;

        const map = mapRef.current ?? new Map(containerRef.current, {
          center: { lat: 10.7769, lng: 106.7009 },
          zoom: 10,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });
        mapRef.current = map;

        const { routes } = await Route.computeRoutes({
          origin: origin.trim(),
          destination: destination.trim(),
          travelMode: "DRIVING",
          routingPreference: RoutingPreference.TRAFFIC_AWARE,
          language: "vi",
          region: "vn",
          fields: ["path", "distanceMeters", "durationMillis", "viewport"],
        });
        if (cancelled) return;

        const route = routes?.[0];
        if (!route) {
          throw new Error("ZERO_RESULTS");
        }

        polylinesRef.current.forEach((polyline) => polyline.setMap(null));
        const polylines = route.createPolylines({
          polylineOptions: {
            strokeColor: "#1f6b42",
            strokeOpacity: 0.95,
            strokeWeight: 6,
          },
        });
        polylines.forEach((polyline) => polyline.setMap(map));
        polylinesRef.current = polylines;

        if (route.viewport) {
          map.fitBounds(route.viewport, 48);
        }

        setMetrics({
          distance: formatRouteDistance(route.distanceMeters ?? Number.NaN),
          duration: formatRouteDuration(route.durationMillis ?? Number.NaN),
        });
        setStatus("ready");
      } catch (error) {
        if (cancelled) return;
        setStatus("error");
        setMetrics({ distance: "—", duration: "—" });
        setErrorMessage(getRouteErrorMessage(error));
      }
    }, 900);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [destination, hasRouteInput, origin, retryCount]);

  useEffect(() => () => {
    polylinesRef.current.forEach((polyline) => polyline.setMap(null));
  }, []);

  const isMissingKey = !apiKey;
  const displayedMetrics = hasRouteInput ? metrics : { distance: "—", duration: "—" };

  return (
    <aside className="map-card real-map-card" aria-label="Bản đồ lộ trình chuyến đi">
      <div ref={containerRef} className="google-map-canvas" />
      <div className="map-label">GOOGLE MAPS · LỘ TRÌNH THẬT</div>

      {isMissingKey && (
        <div className="map-message" role="status">
          <strong>Chưa cấu hình Google Maps</strong>
          <span>Thêm NEXT_PUBLIC_GOOGLE_MAPS_API_KEY vào apps/web/.env.local rồi khởi động lại web.</span>
        </div>
      )}
      {!isMissingKey && hasRouteInput && status === "loading" && (
        <div className="map-loading" role="status">Đang tính lộ trình theo giao thông hiện tại…</div>
      )}
      {!isMissingKey && hasRouteInput && status === "error" && (
        <div className="map-message map-error" role="alert">
          <strong>Chưa hiển thị được lộ trình</strong>
          <span>{errorMessage}</span>
          <button type="button" onClick={() => setRetryCount((value) => value + 1)}>Thử lại</button>
        </div>
      )}

      <div className="distance-card" aria-live="polite">
        <div>
          <span aria-hidden="true">↝</span>
          <div><small>QUÃNG ĐƯỜNG DỰ KIẾN</small><strong>{displayedMetrics.distance}</strong></div>
        </div>
        <div><small>THỜI GIAN CÓ GIAO THÔNG</small><strong>{displayedMetrics.duration}</strong></div>
      </div>
    </aside>
  );
}
