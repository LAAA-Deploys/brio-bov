import { describe, expect, it } from "vitest";
import { hydrateMapPoints, mapMarkerLabel } from "../src/components/mapUtils";
import { menlo, parke, portfolio } from "../src/data/portfolio";
import manifest from "../public/assets/maps/map-manifest.json";

describe("approved Brio valuation data", () => {
  it("ties the locked portfolio values", () => {
    expect(parke.centralValue).toBe(2450000);
    expect(menlo.centralValue).toBe(2100000);
    expect(portfolio.combinedValue).toBe(4550000);
    expect(parke.centralValue + menlo.centralValue).toBe(portfolio.combinedValue);
  });

  it("ties each current rent roll", () => {
    expect(parke.rentRoll.reduce((sum, line) => sum + line.monthlyRent, 0)).toBe(20291);
    expect(menlo.rentRoll.reduce((sum, line) => sum + line.monthlyRent, 0)).toBe(18515);
    expect(parke.currentGrossRent).toBe(20291 * 12);
    expect(menlo.currentGrossRent).toBe(18515 * 12);
  });

  it("ties normalized NOI", () => {
    const calculatedNoi = (property: typeof parke) =>
      property.underwriting
        .filter((line) => line.type !== "subtotal" && line.type !== "total")
        .reduce((sum, line) => sum + line.amount, 0);
    expect(calculatedNoi(parke)).toBeCloseTo(parke.noi, 2);
    expect(calculatedNoi(menlo)).toBeCloseTo(menlo.noi, 2);
  });

  it("keeps property specific comp sets separate", () => {
    expect(parke.saleComps).toHaveLength(6);
    expect(menlo.saleComps).toHaveLength(2);
    expect(menlo.activeComps).toHaveLength(2);
    expect(parke.saleComps.every((comp) => /Pasadena|Summit|Villa|Earlham|Garfield/.test(comp.address))).toBe(true);
    expect([...menlo.saleComps, ...(menlo.activeComps ?? [])].every((comp) => /Dewey|Ardmore|Normandie/.test(comp.address))).toBe(true);
  });

  it("does not assert a Menlo unit mix", () => {
    expect(menlo.rentRoll.every((line) => line.configuration === "Configuration to be verified")).toBe(true);
  });

  it("hydrates every sanctioned map point from the verified manifest", () => {
    for (const property of [parke, menlo]) {
      const hydrated = hydrateMapPoints(property.mapPoints, manifest.entries);
      expect(hydrated.every((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng))).toBe(true);
      expect(hydrated.every((point) => Boolean(point.placeId))).toBe(true);
    }
  });

  it("numbers comparable markers independently from the subject marker", () => {
    const points = parke.mapPoints.slice(0, 3);
    expect(mapMarkerLabel(points, 0)).toBe("S");
    expect(mapMarkerLabel(points, 1)).toBe("1");
    expect(mapMarkerLabel(points, 2)).toBe("2");
  });

  it("distinguishes both subjects on the portfolio map", () => {
    const points = [parke.mapPoints[0], menlo.mapPoints[0]];
    expect(mapMarkerLabel(points, 0)).toBe("P");
    expect(mapMarkerLabel(points, 1)).toBe("M");
  });
});
