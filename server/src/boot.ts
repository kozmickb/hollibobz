import { execSync } from "node:child_process";

function run(cmd: string) {
  execSync(cmd, { stdio: "inherit", env: process.env });
}

async function main() {
  try {
    console.log("[boot] prisma migrate deploy…");
    run("npx prisma migrate deploy");
  } catch (e) {
    console.warn("[boot] migrate deploy failed, attempting db push …");
    run("npx prisma db push --accept-data-loss");
  }

  console.log("[boot] starting API…");
  // Works for both CJS and ESM builds:
  const entry = new URL("../dist/index.js", import.meta.url).pathname;
  await import("node:path").then(({ resolve }) => import("node:url").then(({ pathToFileURL }) =>
    import(pathToFileURL(resolve(entry)).href)
  ));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
