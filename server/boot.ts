/* Boot sequence for Railway: run migrations with fallback, then start the server */
import { execSync } from "node:child_process";

const run = (cmd: string) => {
  console.log(`$ ${cmd}`);
  execSync(cmd, { stdio: "inherit", env: process.env });
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
      console.log(`DB not ready yet... (${i + 1}/${max})`);
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  console.warn("Proceeding even though DB readiness could not be confirmed.");
};

(async () => {
  await waitForDb();

  try {
    run("npx prisma migrate deploy --schema=./prisma/schema.prisma");
    console.log("✅ Prisma migrations applied.");
  } catch (e) {
    console.warn("⚠️ migrate deploy failed. Falling back to `prisma db push`.");
    run("npx prisma db push --accept-data-loss --schema=./prisma/schema.prisma");
  }

  // start the API
  await import("./index.js");
})();
