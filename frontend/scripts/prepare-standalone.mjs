import { cpSync, existsSync, mkdirSync } from "node:fs";

const standalone = ".next/standalone";

if (!existsSync(`${standalone}/server.js`)) {
  console.error("ERROR: build standalone manquant. Lancez « npm run build » d'abord.");
  process.exit(1);
}

if (existsSync("public") && !existsSync(`${standalone}/public`)) {
  cpSync("public", `${standalone}/public`, { recursive: true });
}

if (existsSync(".next/static") && !existsSync(`${standalone}/.next/static`)) {
  mkdirSync(`${standalone}/.next`, { recursive: true });
  cpSync(".next/static", `${standalone}/.next/static`, { recursive: true });
}

console.log("Assets standalone Next.js préparés.");
