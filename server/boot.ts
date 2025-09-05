// server/src/boot.ts
import { spawnSync } from "child_process";
import { Logger } from "./src/logger";
import { resolve, join } from "path";
import { existsSync } from "fs";

// Find the server directory - handle both cases where we're in server/ or root/
let serverDir = resolve(__dirname);
if (!existsSync(join(serverDir, "prisma", "schema.prisma"))) {
  // If we're in the root directory, go to server/
  serverDir = resolve(__dirname, "..");
  if (!existsSync(join(serverDir, "prisma", "schema.prisma"))) {
    // If we're in dist/, go up two levels to server/
    serverDir = resolve(__dirname, "..", "..");
  }
}

process.chdir(serverDir);
Logger.info("Working directory set", { cwd: process.cwd(), serverDir });

function run(cmd: string, args: string[]) {
  Logger.info("Executing command", { command: cmd, args, cwd: process.cwd() });
  const res = spawnSync(cmd, args, { stdio: "inherit", shell: true, cwd: serverDir });
  return res.status === 0;
}

const waitForDb = async () => {
  const max = Number(process.env.DB_WAIT_RETRIES ?? 20);
  const delayMs = Number(process.env.DB_WAIT_DELAY_MS ?? 1500);

  for (let i = 0; i < max; i++) {
    try {
      // Use prisma cli to probe connectivity; generate will fail fast if DB unreachable
      if (run("npx", ["prisma", "--version"])) {
        return;
      }
    } catch {
      Logger.info("DB not ready yet", { attempt: i + 1, max });
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  Logger.warn("Proceeding even though DB readiness could not be confirmed");
};

async function main() {
  Logger.info("[boot] Running migrations: prisma migrate deploy");
  const ok = run("npx", ["prisma", "migrate", "deploy", "--schema=./prisma/schema.prisma"]);
  if (!ok) {
    Logger.error("[boot] migrate deploy failed. Attempting fallback: prisma db push --accept-data-loss");
    const pushed = run("npx", ["prisma", "db", "push", "--accept-data-loss", "--schema=./prisma/schema.prisma"]);
    if (!pushed) {
      Logger.error("[boot] Fallback db push failed. Exiting.");
      process.exit(1);
    }
  }

  Logger.info("[boot] Starting API server…");
  // Adjust this import to your actual server entry (compiled to dist/index.js)
  await import("./index.js");
}

main().catch((e) => {
  Logger.error("[boot] Fatal error:", e);
  process.exit(1);
});
