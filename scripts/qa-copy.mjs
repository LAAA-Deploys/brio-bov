import fs from "node:fs";
import path from "node:path";

const root = path.resolve("src");
const files = [];
walk(root);

const forbidden = [
  "responsive screen",
  "continuous table",
  "without invented financing",
  "buyers can audit",
  "evidence tool",
  "prototype",
  "development process",
  "internal qa",
  "1538 franklin",
  "laurel canyon",
  "westmoreland bov",
  "eastwind",
  "3607 pacific",
  "garden-style",
  "prime koreatown",
  "walker's paradise"
];

const findings = [];
for (const file of files) {
  const text = fs.readFileSync(file, "utf8").toLowerCase();
  for (const term of forbidden) {
    if (text.includes(term)) findings.push(`${path.relative(process.cwd(), file)}: ${term}`);
  }
}
if (findings.length) throw new Error(`Visible copy or residue findings:\n${findings.join("\n")}`);
console.log(`Copy and prior-deal residue scan passed across ${files.length} source files.`);

function walk(folder) {
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    const full = path.join(folder, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(ts|tsx|css|html)$/.test(entry.name)) files.push(full);
  }
}
