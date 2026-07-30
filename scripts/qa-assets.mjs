import fs from "node:fs";
import path from "node:path";

const source = [
  fs.readFileSync("src/data/portfolio.ts", "utf8"),
  fs.readFileSync("src/App.tsx", "utf8")
].join("\n");
const refs = [...source.matchAll(/["'](\/assets\/[^"']+)["']/g)].map((match) => match[1]);
const missing = [...new Set(refs)]
  .map((ref) => ({ ref, file: path.join("public", ref.replace(/^\//, "")) }))
  .filter((item) => !fs.existsSync(item.file));

const mapManifest = JSON.parse(fs.readFileSync("public/assets/maps/map-manifest.json", "utf8"));
if (mapManifest.qa?.entityCount !== 22 || mapManifest.qa?.acceptedEntityCount !== 22) {
  throw new Error("Map manifest does not show 22 accepted rooftop entities.");
}
if (missing.length) throw new Error(`Missing local assets:\n${missing.map((item) => item.ref).join("\n")}`);
console.log(`${new Set(refs).size} referenced assets and 22 rooftop map entities verified.`);
