import { execSync } from "node:child_process";

function run(cmd: string) {
  execSync(cmd, { stdio: "inherit", env: process.env });
}

(async () => {
  try {
    console.log("[boot] prisma migrate deploy…");
    run("npx prisma migrate deploy --schema=prisma/schema.prisma");
  } catch (e) {
    console.warn("[boot] migrate deploy failed, attempting db push (one-time fallback) …");
    try {
      run("npx prisma db push --schema=prisma/schema.prisma --accept-data-loss");
    } catch (e2) {
      console.error("[boot] prisma failed:", e2);
      process.exit(1);
    }
  }

  console.log("[boot] starting API…");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("./index.js");
})();
