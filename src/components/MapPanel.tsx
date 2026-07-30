import { useEffect, useMemo, useRef, useState } from "react";
import type { MapPoint } from "../data/types";
import { hasCompleteCoordinates, hydrateMapPoints, mapMarkerLabel } from "./mapUtils";

declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (element: HTMLElement, options: Record<string, unknown>) => {
          fitBounds: (bounds: unknown) => void;
        };
        Marker: new (options: Record<string, unknown>) => unknown;
        LatLngBounds: new () => {
          extend: (position: { lat: number; lng: number }) => void;
        };
      };
    };
    __brioGoogleMapsPromise?: Promise<void>;
    __brioGoogleMapsAuthHandlerInstalled?: boolean;
    gm_authFailure?: () => void;
  }
}

const authFailureListeners = new Set<() => void>();

const markerColors: Record<MapPoint["kind"], string> = {
  subject: "#c5a258",
  sale: "#1b3a5c",
  active: "#9f3a38",
  rent: "#537a63"
};

type ManifestEntry = {
  id: string;
  lat: number;
  lng: number;
  placeId: string;
  formattedAddress: string;
};

let mapManifestPromise: Promise<ManifestEntry[]> | undefined;

function loadMapManifest() {
  if (mapManifestPromise) return mapManifestPromise;
  mapManifestPromise = fetch("/assets/maps/map-manifest.json")
    .then((response) => {
      if (!response.ok) throw new Error("Map manifest could not load");
      return response.json() as Promise<{ entries?: ManifestEntry[] }>;
    })
    .then((manifest) => {
      if (!manifest.entries) throw new Error("Map manifest is incomplete");
      return manifest.entries;
    })
    .catch((error) => {
      mapManifestPromise = undefined;
      throw error;
    });
  return mapManifestPromise;
}

function registerGoogleMapsAuthFailure(listener: () => void) {
  authFailureListeners.add(listener);
  if (!window.__brioGoogleMapsAuthHandlerInstalled) {
    const previousHandler = window.gm_authFailure;
    window.gm_authFailure = () => {
      previousHandler?.();
      authFailureListeners.forEach((callback) => callback());
    };
    window.__brioGoogleMapsAuthHandlerInstalled = true;
  }
  return () => authFailureListeners.delete(listener);
}

function loadGoogleMaps(key: string) {
  if (window.google?.maps) return Promise.resolve();
  if (window.__brioGoogleMapsPromise) return window.__brioGoogleMapsPromise;
  const request = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      reject(new Error("Google Maps could not load"));
    };
    document.head.appendChild(script);
  });
  window.__brioGoogleMapsPromise = request.catch((error) => {
    window.__brioGoogleMapsPromise = undefined;
    throw error;
  });
  return window.__brioGoogleMapsPromise;
}

type Props = {
  id: string;
  title: string;
  points: MapPoint[];
  staticImage?: string;
  compact?: boolean;
};

export function MapPanel({ id, title, points, staticImage, compact = false }: Props) {
  const staticSrc = staticImage ?? `/assets/maps/${id}.png`;
  const hostRef = useRef<HTMLDivElement>(null);
  const [interactive, setInteractive] = useState(false);
  const [staticFailed, setStaticFailed] = useState(false);
  const [shouldLoadInteractive, setShouldLoadInteractive] = useState(false);
  const [verifiedPoints, setVerifiedPoints] = useState<MapPoint[]>([]);
  const resolvedPoints = useMemo(
    () => verifiedPoints.filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng)),
    [verifiedPoints]
  );
  const displayPoints = verifiedPoints.length === points.length ? verifiedPoints : points;
  const linkPoints =
    verifiedPoints.length === points.length && verifiedPoints.every((point) => point.placeId)
      ? verifiedPoints
      : [];

  useEffect(() => {
    let active = true;
    loadMapManifest()
      .then((entries) => {
        if (!active) return;
        setVerifiedPoints(hydrateMapPoints(points, entries));
      })
      .catch(() => {
        if (active) setVerifiedPoints([]);
      });
    return () => {
      active = false;
    };
  }, [points]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadInteractive(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (
      !shouldLoadInteractive ||
      !key ||
      !hostRef.current ||
      resolvedPoints.length !== points.length ||
      !hasCompleteCoordinates(resolvedPoints)
    ) return;
    let active = true;
    let authFailed = false;
    const host = hostRef.current;
    const unregisterAuthFailure = registerGoogleMapsAuthFailure(() => {
      if (!active) return;
      authFailed = true;
      setInteractive(false);
      host.replaceChildren();
    });
    setInteractive(false);
    host.replaceChildren();
    loadGoogleMaps(key)
      .then(() => {
        if (!active || authFailed || !hostRef.current || !window.google?.maps) return;
        const center = {
          lat: resolvedPoints[0].lat as number,
          lng: resolvedPoints[0].lng as number
        };
        const map = new window.google.maps.Map(hostRef.current, {
          center,
          zoom: resolvedPoints.length === 1 ? 17 : 13,
          mapTypeControl: false,
          fullscreenControl: true,
          streetViewControl: false,
          clickableIcons: false,
          gestureHandling: "cooperative",
          styles: [
            { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }
          ]
        });
        const bounds = new window.google.maps.LatLngBounds();
        resolvedPoints.forEach((point, index) => {
          const position = { lat: point.lat as number, lng: point.lng as number };
          bounds.extend(position);
          new window.google!.maps.Marker({
            map,
            position,
            title: point.label,
            label: {
              text: mapMarkerLabel(resolvedPoints, index),
              color: "#ffffff",
              fontWeight: "700"
            },
            icon: {
              path: "M12 2C8.1 2 5 5.1 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.9-3.1-7-7-7z",
              fillColor: markerColors[point.kind],
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
              scale: 1.55,
              anchor: { x: 12, y: 22 },
              labelOrigin: { x: 12, y: 9 }
            }
          });
        });
        if (resolvedPoints.length > 1) map.fitBounds(bounds);
        setInteractive(true);
      })
      .catch(() => setInteractive(false));
    return () => {
      active = false;
      unregisterAuthFailure();
      setInteractive(false);
      host.replaceChildren();
    };
  }, [points.length, resolvedPoints, shouldLoadInteractive]);

  return (
    <figure className={`map-panel ${compact ? "map-panel-compact" : ""}`} data-map-id={id}>
      <div className="map-frame">
        <div ref={hostRef} className={`map-interactive ${interactive ? "is-visible" : ""}`} aria-label={title} />
        <img
          className={`map-static ${interactive ? "is-hidden-screen" : ""}`}
          src={staticSrc}
          alt={`${title} location map`}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          hidden={staticFailed}
          onLoad={() => setStaticFailed(false)}
          onError={() => setStaticFailed(true)}
        />
        {!interactive && staticFailed && linkPoints.length > 0 && (
          <div className="map-address-list">
            <strong>{title}</strong>
            {linkPoints.map((point, index) => (
              <a
                key={point.id}
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(point.address)}${
                  point.placeId ? `&query_place_id=${encodeURIComponent(point.placeId)}` : ""
                }`}
                target="_blank"
                rel="noreferrer"
              >
                <span>{mapMarkerLabel(linkPoints, index)}</span>
                {point.label}
              </a>
            ))}
          </div>
        )}
      </div>
      <figcaption>
        <span>{title}</span>
        <span className="map-legend">
          <i className="legend-subject" /> Subject
          {displayPoints.some((p) => p.kind === "sale") && <><i className="legend-sale" /> Closed sale</>}
          {displayPoints.some((p) => p.kind === "active") && <><i className="legend-active" /> Active</>}
          {displayPoints.some((p) => p.kind === "rent") && <><i className="legend-rent" /> Rent</>}
        </span>
      </figcaption>
      {linkPoints.length > 0 && (
        <details className="map-links">
          <summary>Open locations in Google Maps</summary>
          <div aria-label={`${title} Google Maps links`}>
            {linkPoints.map((point, index) => (
              <a
                key={point.id}
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(point.address)}&query_place_id=${encodeURIComponent(point.placeId as string)}`}
                target="_blank"
                rel="noreferrer"
              >
                {mapMarkerLabel(linkPoints, index)} · {point.label}
              </a>
            ))}
          </div>
        </details>
      )}
    </figure>
  );
}
