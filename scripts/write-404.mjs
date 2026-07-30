import fs from "node:fs";

fs.copyFileSync("dist/index.html", "dist/404.html");
fs.copyFileSync("robots.txt", "dist/robots.txt");
fs.copyFileSync(".nojekyll", "dist/.nojekyll");
console.log("SPA route fallback and publication controls written to dist");
