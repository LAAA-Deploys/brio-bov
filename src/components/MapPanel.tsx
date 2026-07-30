import { useEffect, useMemo, useRef, useState } from "react";
import type { MapPoint } from "../data/types";

const manifestAliases: Record<string, string> = {
  "parke-subject": "parke-subject",
  "parke-s1": "parke-sold-01-826-n-summit",
  "parke-s2": "parke-sold-02-965-n-summit",
  "parke-s3": "parke-sold-03-1757-e-villa",
  "parke-s4": "parke-sold-04-696-earlham",
  "parke-s5": "parke-sold-05-679-earlham",
  "parke-s6": "parke-sold-06-423-n-garfield",
  "parke-r1": "parke-rent-01-380-parke",
  "parke-r2": "parke-rent-02-456-e-orange-grove",
  "parke-r3": "parke-rent-03-570-n-los-robles",
  "parke-r4": "parke-rent-04-853-n-raymond",
  "parke-r5": "parke-rent-05-303-n-oakland",
  "menlo-subject": "menlo-subject",
  "menlo-s1": "menlo-sold-01-1038-dewey",
  "menlo-s2": "menlo-sold-02-843-s-ardmore",
  "menlo-a1": "menlo-active-01-1056-dewey",
  "menlo-a2": "menlo-active-02-955-s-normandie",
  "menlo-r1": "menlo-rent-01-1240-magnolia",
  "menlo-r2": "menlo-rent-02-1029-westmoreland",
  "menlo-r3": "menlo-rent-03-2231-ellendale",
  "menlo-r4": "menlo-rent-04-1037-dewey",
  "menlo-r5": "menlo-rent-05-980-menlo"
};

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
  }
}

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

export function hydrateMapPoints(points: MapPoint[], entries: ManifestEntry[]) {
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  return points.map((point) => {
    const verified = byId.get(manifestAliases[point.id]);
    return verified ? {
      ...point,
      address: verified.formattedAddress,
      lat: verified.lat,
      lng: verified.lng,
      placeId: verified.placeId
    } : point;
  });
}

export function mapMarkerLabel(points: MapPoint[], index: number) {
  if (points[index].kind === "subject") return "S";
  return String(points.slice(0, index + 1).filter((point) => point.kind !== "subject").length);
}

function loadGoogleMaps(key: string) {
  if (window.google?.maps) return Promise.resolve();
  if (window.__brioGoogleMapsPromise) return window.__brioGoogleMapsPromise;
  window.__brioGoogleMapsPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Maps could not load"));
    document.head.appendChild(script);
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
  const hostRef = useRef<HTMLDivElement>(null);
  const [interactive, setInteractive] = useState(false);
  const [verifiedPoints, setVerifiedPoints] = useState(points);
  const resolvedPoints = useMemo(
    () => verifiedPoints.filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng)),
    [verifiedPoints]
  );

  useEffect(() => {
    let active = true;
    fetch("/assets/maps/map-manifest.json")
      .then((response) => response.json())
      .then((manifest: { entries?: ManifestEntry[] }) => {
        if (!active || !manifest.entries) return;
        setVerifiedPoints(hydrateMapPoints(points, manifest.entries));
      })
      .catch(() => setVerifiedPoints(points));
    return () => {
      active = false;
    };
  }, [points]);

  useEffect(() => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!key || !hostRef.current || resolvedPoints.length === 0) return;
    let active = true;
    loadGoogleMaps(key)
      .then(() => {
        if (!active || !hostRef.current || !window.google?.maps) return;
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
    };
  }, [resolvedPoints]);

  const staticSrc = staticImage ?? `/assets/maps/${id}.png`;

  return (
    <figure className={`map-panel ${compact ? "map-panel-compact" : ""}`} data-map-id={id}>
      <div className="map-frame">
        <div ref={hostRef} className={`map-interactive ${interactive ? "is-visible" : ""}`} aria-label={title} />
        <img
          className={`map-static ${interactive ? "is-hidden-screen" : ""}`}
          src={staticSrc}
          alt={`${title} location map`}
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
        />
        {!interactive && (
          <div className="map-address-list">
            <strong>{title}</strong>
            {verifiedPoints.map((point, index) => (
              <a
                key={point.id}
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(point.address)}${
                  point.placeId ? `&query_place_id=${encodeURIComponent(point.placeId)}` : ""
                }`}
                target="_blank"
                rel="noreferrer"
              >
                <span>{mapMarkerLabel(verifiedPoints, index)}</span>
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
          {verifiedPoints.some((p) => p.kind === "sale") && <><i className="legend-sale" /> Closed sale</>}
          {verifiedPoints.some((p) => p.kind === "active") && <><i className="legend-active" /> Active</>}
          {verifiedPoints.some((p) => p.kind === "rent") && <><i className="legend-rent" /> Rent</>}
        </span>
      </figcaption>
    </figure>
  );
}
