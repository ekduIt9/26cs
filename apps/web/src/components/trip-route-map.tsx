"use client";

import type { Layer, Map as LeafletMap } from "leaflet";
import { useCallback, useEffect, useRef, useState } from "react";

import { formatRouteDistance, formatRouteDuration } from "@/lib/route-format";

type Coordinates = { latitude: number; longitude: number };
type RouteMetrics = {
  destination: string;
  distance: string;
  duration: string;
  origin: string;
};
type RouteStatus = "idle" | "loading" | "ready" | "error";

const tileUrl = process.env.NEXT_PUBLIC_OSM_TILE_URL?.trim()
  || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const nominatimUrl = process.env.NEXT_PUBLIC_NOMINATIM_URL?.trim()
  || "https://nominatim.openstreetmap.org";
const osrmUrl = process.env.NEXT_PUBLIC_OSRM_URL?.trim()
  || "https://router.project-osrm.org";

const geocodeCache = new Map<string, Coordinates>();
let lastGeocodeRequestAt = 0;
let geocodeQueue: Promise<unknown> = Promise.resolve();
let leafletPromise: Promise<typeof import("leaflet")> | null = null;

function loadLeaflet() {
  leafletPromise ??= import("leaflet");
  return leafletPromise;
}

function runThrottled<T>(task: () => Promise<T>): Promise<T> {
  const run = geocodeQueue.then(async () => {
    const waitTime = Math.max(0, 1_100 - (Date.now() - lastGeocodeRequestAt));
    if (waitTime > 0) {
      await new Promise((resolve) => window.setTimeout(resolve, waitTime));
    }
    lastGeocodeRequestAt = Date.now();
    return task();
  });

  geocodeQueue = run.then(() => undefined, () => undefined);
  return run;
}

async function geocodeAddress(address: string): Promise<Coordinates> {
  const cacheKey = address.trim().toLocaleLowerCase("vi-VN");
  const cached = geocodeCache.get(cacheKey);
  if (cached) return cached;

  return runThrottled(async () => {
    const url = new URL("search", `${nominatimUrl.replace(/\/$/, "")}/`);
    url.search = new URLSearchParams({
      q: `${address.trim()}, Việt Nam`,
      format: "jsonv2",
      limit: "1",
      countrycodes: "vn",
      "accept-language": "vi",
    }).toString();

    const response = await fetch(url);
    if (!response.ok) throw new Error("GEOCODING_UNAVAILABLE");

    const results = await response.json() as Array<{ lat: string; lon: string }>;
    const match = results[0];
    if (!match) throw new Error("ADDRESS_NOT_FOUND");

    const coordinates = {
      latitude: Number(match.lat),
      longitude: Number(match.lon),
    };
    geocodeCache.set(cacheKey, coordinates);
    return coordinates;
  });
}

async function fetchDrivingRoute(origin: Coordinates, destination: Coordinates) {
  const coordinates = [origin, destination]
    .map((point) => `${point.longitude},${point.latitude}`)
    .join(";");
  const url = new URL(
    `route/v1/driving/${coordinates}`,
    `${osrmUrl.replace(/\/$/, "")}/`,
  );
  url.search = new URLSearchParams({
    alternatives: "false",
    geometries: "geojson",
    overview: "full",
    steps: "false",
  }).toString();

  const response = await fetch(url);
  if (!response.ok) throw new Error("ROUTING_UNAVAILABLE");

  const payload = await response.json() as {
    code: string;
    routes?: Array<{
      distance: number;
      duration: number;
      geometry: { coordinates: Array<[number, number]> };
    }>;
  };
  const route = payload.routes?.[0];
  if (payload.code !== "Ok" || !route) throw new Error("ROUTE_NOT_FOUND");
  return route;
}

function getRouteErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message === "ADDRESS_NOT_FOUND") {
    return "Không tìm thấy một trong hai địa chỉ. Hãy nhập thêm số nhà, đường và tỉnh/thành.";
  }
  if (error instanceof Error && error.message === "ROUTE_NOT_FOUND") {
    return "Không tìm thấy tuyến đường ô tô giữa hai địa điểm này.";
  }
  return "Dịch vụ bản đồ miễn phí đang bận hoặc mất kết nối. Vui lòng thử lại sau.";
}

export function TripRouteMap({
  origin,
  destination,
}: {
  origin: string;
  destination: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const routeLayersRef = useRef<Layer[]>([]);
  const requestIdRef = useRef(0);
  const [mapReady, setMapReady] = useState(false);
  const [status, setStatus] = useState<RouteStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [metrics, setMetrics] = useState<RouteMetrics | null>(null);

  const clearRouteLayers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    routeLayersRef.current.forEach((layer) => map.removeLayer(layer));
    routeLayersRef.current = [];
  }, []);

  useEffect(() => {
    let cancelled = false;

    void loadLeaflet().then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView([10.7769, 106.7009], 10);
      L.tileLayer(tileUrl, {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      }).addTo(map);
      mapRef.current = map;
      setMapReady(true);
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      routeLayersRef.current = [];
    };
  }, []);

  useEffect(() => {
    requestIdRef.current += 1;
    clearRouteLayers();
  }, [clearRouteLayers, destination, origin]);

  const normalizedOrigin = origin.trim();
  const normalizedDestination = destination.trim();
  const hasRouteInput = normalizedOrigin.length >= 3 && normalizedDestination.length >= 3;
  const isCurrentRoute = metrics?.origin === normalizedOrigin
    && metrics.destination === normalizedDestination;

  async function calculateRoute() {
    if (!mapReady || !hasRouteInput) return;

    const requestId = ++requestIdRef.current;
    setStatus("loading");
    setErrorMessage("");

    try {
      const [originCoordinates, destinationCoordinates] = await Promise.all([
        geocodeAddress(normalizedOrigin),
        geocodeAddress(normalizedDestination),
      ]);
      const route = await fetchDrivingRoute(originCoordinates, destinationCoordinates);
      if (requestId !== requestIdRef.current) {
        setStatus("idle");
        return;
      }

      const L = await loadLeaflet();
      const map = mapRef.current;
      if (!map) throw new Error("MAP_NOT_READY");

      clearRouteLayers();
      const routeLine = L.polyline(
        route.geometry.coordinates.map(([longitude, latitude]) => [latitude, longitude]),
        { color: "#1f6b42", opacity: 0.95, weight: 6 },
      ).addTo(map);
      const startMarker = L.circleMarker(
        [originCoordinates.latitude, originCoordinates.longitude],
        { color: "#ffffff", fillColor: "#1f6b42", fillOpacity: 1, radius: 8, weight: 3 },
      ).addTo(map);
      const endMarker = L.circleMarker(
        [destinationCoordinates.latitude, destinationCoordinates.longitude],
        { color: "#ffffff", fillColor: "#b0603b", fillOpacity: 1, radius: 8, weight: 3 },
      ).addTo(map);
      routeLayersRef.current = [routeLine, startMarker, endMarker];
      map.fitBounds(routeLine.getBounds(), { padding: [48, 48] });

      setMetrics({
        origin: normalizedOrigin,
        destination: normalizedDestination,
        distance: formatRouteDistance(route.distance),
        duration: formatRouteDuration(route.duration * 1_000),
      });
      setStatus("ready");
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      clearRouteLayers();
      setStatus("error");
      setErrorMessage(getRouteErrorMessage(error));
    }
  }

  return (
    <aside className="map-card real-map-card" aria-label="Bản đồ lộ trình chuyến đi">
      <div ref={containerRef} className="map-canvas" />
      <div className="map-toolbar">
        <span>OPENSTREETMAP · MIỄN PHÍ</span>
        <button
          type="button"
          disabled={!mapReady || !hasRouteInput || status === "loading"}
          onClick={calculateRoute}
        >
          {status === "loading" ? "Đang tính…" : isCurrentRoute ? "Tính lại" : "Tính lộ trình"}
        </button>
      </div>

      {!mapReady && <div className="map-loading" role="status">Đang tải bản đồ…</div>}
      {mapReady && status === "idle" && !isCurrentRoute && (
        <div className="map-hint" role="status">Nhập hai địa chỉ rồi chọn “Tính lộ trình”.</div>
      )}
      {status === "error" && (
        <div className="map-message map-error" role="alert">
          <strong>Chưa hiển thị được lộ trình</strong>
          <span>{errorMessage}</span>
          <button type="button" onClick={calculateRoute}>Thử lại</button>
        </div>
      )}

      <div className="distance-card" aria-live="polite">
        <div>
          <span aria-hidden="true">↝</span>
          <div><small>QUÃNG ĐƯỜNG DỰ KIẾN</small><strong>{isCurrentRoute ? metrics.distance : "—"}</strong></div>
        </div>
        <div><small>THỜI GIAN DỰ KIẾN</small><strong>{isCurrentRoute ? metrics.duration : "—"}</strong></div>
      </div>
    </aside>
  );
}
