// Preview del hero desde el archivo local (file:///) para ver los cambios
// antes de hacer commit + push.
import { spawn } from "node:child_process";
import { mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const fileUrl = "file:///C:/Workspace/concasaya/blog/precio-casa-prefabricada-colombia-2026.html";
const outDir = "C:/Workspace/concasaya/tmp-test";
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";

async function snap(viewport, name) {
  const out = join(outDir, `hero-local-${name}.png`);
  const args = [
    "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
    `--window-size=${viewport.width},${viewport.height}`,
    `--screenshot=${out}`,
    "--virtual-time-budget=8000",
    fileUrl
  ];
  return new Promise((resolve, reject) => {
    const p = spawn(chrome, args, { stdio: "inherit" });
    p.on("close", code => code === 0 ? resolve(out) : reject(new Error(`exit ${code}`)));
  });
}

try {
  const desktop = await snap({ width: 1280, height: 800 }, "desktop");
  console.log(`✓ desktop: ${desktop}`);
  const mobile = await snap({ width: 390, height: 844 }, "mobile");
  console.log(`✓ mobile: ${mobile}`);
} catch (e) {
  console.error("Error:", e.message);
  process.exit(1);
}
