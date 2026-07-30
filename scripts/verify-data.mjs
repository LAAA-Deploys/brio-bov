import fs from "node:fs";

const source = fs.readFileSync(new URL("../src/data/portfolio.ts", import.meta.url), "utf8");
const required = [
  "centralValue: 2450000",
  "centralValue: 2100000",
  "combinedValue: 4550000",
  "noi: 157838.36",
  "noi: 145335.54",
  "currentMonthlyRent: 20291",
  "currentMonthlyRent: 18515"
];

const missing = required.filter((token) => !source.includes(token));
if (missing.length) {
  throw new Error(`Approved data tokens missing: ${missing.join(", ")}`);
}

console.log("Approved valuation tokens verified.");
