import { spawnSync } from "node:child_process";

function run(cmd: string, args: string[]) {
  const res = spawnSync(cmd, args, { stdio: "inherit" });
  return res.status ?? 1;
}

const schemaPath = process.env.PRISMA_SCHEMA_PATH ?? "prisma/schema.prisma";
const schemaFlag = ["--schema", schemaPath];

console.log("➡️  Running prisma migrate deploy…");
let status = run("npx", ["prisma", "migrate", "deploy", ...schemaFlag]);

if (status !== 0) {
  console.warn("⚠️  migrate deploy failed. Falling back to `prisma db push --accept-data-loss`…");
  status = run("npx", ["prisma", "db", "push", "--accept-data-loss", ...schemaFlag]);
  if (status !== 0) {
    console.error("❌ Prisma setup failed. Exiting.");
    process.exit(1);
  }
}

console.log("✅ Prisma ready. Starting server…");
require("./index.js");
