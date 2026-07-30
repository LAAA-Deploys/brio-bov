export type MapPoint = {
  id: string;
  label: string;
  address: string;
  lat?: number;
  lng?: number;
  placeId?: string;
  kind: "subject" | "sale" | "active" | "rent";
};

export type RentComp = {
  address: string;
  unitType: string;
  rent: number;
  squareFeet?: number;
  distance: number;
  image?: string;
  pointId: string;
};

export type SaleComp = {
  id: string;
  address: string;
  status: "Closed" | "Active";
  price: number;
  units: number;
  yearBuilt: number;
  buildingSquareFeet: number;
  lotSquareFeet: number;
  date: string;
  daysOnMarket: number;
  pricePerUnit: number;
  pricePerSquareFoot: number;
  grm?: number;
  capRate?: number;
  image: string;
  pointId: string;
  summary: string;
  relevance: string;
  considerations: string;
};

export type RentRollLine = {
  unit: string;
  configuration: string;
  monthlyRent: number;
};

export type UnderwritingLine = {
  label: string;
  amount: number;
  type: "income" | "expense" | "subtotal" | "total";
};

export type PropertyData = {
  slug: string;
  shortName: string;
  address: string;
  city: string;
  hero: string;
  gallery: { src: string; alt: string }[];
  units: number;
  yearBuilt: number;
  buildingSquareFeet: number;
  lotSquareFeet: number;
  apn: string;
  parking: string;
  centralValue: number;
  valueRange: string;
  noi: number;
  capRate: number;
  grm: number;
  pricePerUnit: number;
  pricePerSquareFoot: number;
  currentGrossRent: number;
  currentMonthlyRent: number;
  locationTitle: string;
  overview: string[];
  highlights: string[];
  locationNarrative: string[];
  physicalNarrative: string[];
  unitMixNote: string;
  rentRoll: RentRollLine[];
  underwriting: UnderwritingLine[];
  rentComps: RentComp[];
  rentNarrative: string[];
  rentSensitivity: string;
  saleComps: SaleComp[];
  activeComps?: SaleComp[];
  marketNarrative: string[];
  positioningNarrative: string[];
  valuationNarrative: string[];
  buyerProfiles: { title: string; copy: string }[];
  strategy: { title: string; copy: string }[];
  disclosures: string[];
  mapPoints: MapPoint[];
};
