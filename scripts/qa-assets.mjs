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
const relationshipMaps = [
  "359-parke-826-summit.png",
  "359-parke-965-summit.png",
  "359-parke-1757-villa.png",
  "359-parke-696-earlham.png",
  "359-parke-679-earlham.png",
  "359-parke-423-garfield.png",
  "1623-menlo-1038-dewey.png",
  "1623-menlo-843-ardmore.png",
  "1623-menlo-1056-dewey.png",
  "1623-menlo-955-normandie.png"
];
const missingRelationshipMaps = relationshipMaps.filter(
  (filename) => !fs.existsSync(path.join("public", "assets", "maps", filename))
);

const mapManifestSource = fs.readFileSync("public/assets/maps/map-manifest.json", "utf8");
const mapManifest = JSON.parse(mapManifestSource);
if (mapManifest.qa?.entityCount !== 22 || mapManifest.qa?.acceptedEntityCount !== 22) {
  throw new Error("Map manifest does not show 22 accepted rooftop entities.");
}
if (/C:[/\\]Users|gscher/i.test(mapManifestSource)) {
  throw new Error("Public map manifest contains a local user path.");
}
if (missing.length) throw new Error(`Missing local assets:\n${missing.map((item) => item.ref).join("\n")}`);
if (missingRelationshipMaps.length) {
  throw new Error(`Missing comp relationship maps:\n${missingRelationshipMaps.join("\n")}`);
}
console.log(
  `${new Set(refs).size} referenced assets, ${relationshipMaps.length} comp relationship maps, and 22 rooftop map entities verified.`
);
