import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const dist = join(process.cwd(), "dist");
await mkdir(dist, { recursive: true });
await copyFile(join(dist, "index.html"), join(dist, "404.html"));
await writeFile(join(dist, ".nojekyll"), "");
console.log("Prepared dist/ for GitHub Pages routing.");
