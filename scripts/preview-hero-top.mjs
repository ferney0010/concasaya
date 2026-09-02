// Preview del hero en mobile SOLO el viewport inicial (390x844).
import { spawn } from "node:child_process";
import { mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const url = "https://www.concasaya.com/blog/precio-casa-prefabricada-colombia-2026.html";
const outDir = "C:/Workspace/concasaya/tmp-test";
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";

const out = join(outDir, "hero-top-mobile.png");
const args = [
  "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
  "--window-size=390,844",
  `--screenshot=${out}`,
  "--virtual-time-budget=10000",
  url
];
const p = spawn(chrome, args, { stdio: "inherit" });
p.on("close", code => console.log(code === 0 ? `✓ ${out}` : `Error: ${code}`));
