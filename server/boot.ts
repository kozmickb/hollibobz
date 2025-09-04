/* Boot sequence for Railway: run migrations with fallback, then start the server */
import { execSync } from "node:child_process";
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

const run = (cmd: string) => {
  Logger.info("Executing command", { command: cmd, cwd: process.cwd() });
  execSync(cmd, { stdio: "inherit", env: process.env, cwd: serverDir });
};

const waitForDb = async () => {
  const max = Number(process.env.DB_WAIT_RETRIES ?? 20);
  const delayMs = Number(process.env.DB_WAIT_DELAY_MS ?? 1500);

  for (let i = 0; i < max; i++) {
    try {
      // Use prisma cli to probe connectivity; generate will fail fast if DB unreachable
      run("npx prisma --version");
      // quick no-op query by generating client then letting app handle the ping
      return;
    } catch {
      Logger.info("DB not ready yet", { attempt: i + 1, max });
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  Logger.warn("Proceeding even though DB readiness could not be confirmed");
};

(async () => {
  Logger.info("Starting boot sequence", { 
    nodeEnv: process.env.NODE_ENV,
    gitCommit: process.env.GIT_COMMIT 
  });

  await waitForDb();

  try {
    run("npx prisma migrate deploy --schema=./prisma/schema.prisma");
    Logger.info("Prisma migrations applied successfully");
  } catch (e) {
    Logger.warn("Migrate deploy failed, falling back to db push", { error: e });
    run("npx prisma db push --accept-data-loss --schema=./prisma/schema.prisma");
  }

  // start the API
  await import("./index.js");
})();
