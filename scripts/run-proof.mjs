import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const port = process.env.BRIO_PROOF_PORT || "4178";
const base = `http://127.0.0.1:${port}`;
const output = path.resolve("proof", "website");
fs.mkdirSync(output, { recursive: true });

const server = spawn(
  process.execPath,
  ["./node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", port, "--strictPort"],
  { cwd: process.cwd(), env: process.env, stdio: ["ignore", "pipe", "pipe"], windowsHide: true }
);

let serverOutput = "";
server.stdout.on("data", (chunk) => { serverOutput += chunk.toString(); });
server.stderr.on("data", (chunk) => { serverOutput += chunk.toString(); });

try {
  await waitForServer();
  const browser = await chromium.launch({ headless: true });
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  for (const [name, route] of [["portfolio", "/"], ["parke", "/359-parke"], ["menlo", "/1623-menlo"]]) {
    await desktop.goto(`${base}${route}`, { waitUntil: "networkidle" });
    await desktop.screenshot({ path: path.join(output, `${name}-desktop-hero.png`) });
    await desktop.screenshot({ path: path.join(output, `${name}-desktop-full.png`), fullPage: true });
  }

  for (const width of [390, 360, 320]) {
    const mobile = await browser.newPage({ viewport: { width, height: 844 }, deviceScaleFactor: 1 });
    for (const [name, route] of [["portfolio", "/"], ["parke", "/359-parke"], ["menlo", "/1623-menlo"]]) {
      await mobile.goto(`${base}${route}`, { waitUntil: "networkidle" });
      await mobile.screenshot({ path: path.join(output, `${name}-${width}-hero.png`) });
      const value = mobile.locator(".property-value, .portfolio-value").first();
      if (await value.count()) {
        await value.scrollIntoViewIfNeeded();
        await value.screenshot({ path: path.join(output, `${name}-${width}-value.png`) });
      }
      const bodyWidth = await mobile.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      }));
      if (bodyWidth.scrollWidth > bodyWidth.clientWidth + 1) {
        throw new Error(`${name} at ${width}px has horizontal overflow: ${JSON.stringify(bodyWidth)}`);
      }
    }
    await mobile.close();
  }
  await browser.close();
  console.log(`Website visual QA generated at ${output}`);
} finally {
  server.kill();
}

async function waitForServer() {
  const deadline = Date.now() + 120000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`Vite exited early:\n${serverOutput}`);
    try {
      const response = await fetch(base);
      if (response.ok) return;
    } catch {
      // Keep waiting.
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`Timed out waiting for ${base}:\n${serverOutput}`);
}
