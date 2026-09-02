// Preview SOLO mobile (390x844) del hero rediseñado.
// Usa file:/// porque apunta al archivo local, y agregamos --no-default-browser-check
// y --allow-file-access-from-files para que cargue bien los assets.
import { spawn } from "node:child_process";
import { mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const fileUrl = "file:///C:/Workspace/concasaya/blog/precio-casa-prefabricada-colombia-2026.html";
const outDir = "C:/Workspace/concasaya/tmp-test";
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";

async function snap() {
  const out = join(outDir, "hero-mobile-v2.png");
  const args = [
    "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
    "--allow-file-access-from-files",
    "--window-size=390,1500",
    `--screenshot=${out}`,
    "--virtual-time-budget=10000",
    fileUrl
  ];
  return new Promise((resolve, reject) => {
    const p = spawn(chrome, args, { stdio: "inherit" });
    p.on("close", code => code === 0 ? resolve(out) : reject(new Error(`exit ${code}`)));
  });
}

try {
  const out = await snap();
  console.log(`✓ ${out}`);
} catch (e) {
  console.error("Error:", e.message);
  process.exit(1);
}
