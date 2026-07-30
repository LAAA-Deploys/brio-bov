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
  if (points[index].kind === "subject") {
    const subjectCount = points.filter((point) => point.kind === "subject").length;
    if (subjectCount === 1) return "S";
    if (points[index].id === "parke-subject") return "P";
    if (points[index].id === "menlo-subject") return "M";
    return String(points.slice(0, index + 1).filter((point) => point.kind === "subject").length);
  }
  return String(points.slice(0, index + 1).filter((point) => point.kind !== "subject").length);
}
