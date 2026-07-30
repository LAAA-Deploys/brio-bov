import fs from "node:fs";
import path from "node:path";

fs.copyFileSync("dist/index.html", "dist/404.html");
for (const route of ["359-parke", "1623-menlo"]) {
  const routeDir = path.join("dist", route);
  fs.mkdirSync(routeDir, { recursive: true });
  fs.copyFileSync("dist/index.html", path.join(routeDir, "index.html"));
}
fs.copyFileSync("robots.txt", "dist/robots.txt");
fs.copyFileSync(".nojekyll", "dist/.nojekyll");
console.log("Static property routes, SPA fallback, and publication controls written to dist");
