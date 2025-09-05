// server/scripts/postinstall.js
const { existsSync } = require("fs");
const { spawnSync } = require("child_process");
const path = require("path");

const skip = process.env.PRISMA_SKIP_POSTINSTALL_GENERATE === "1";
const schemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");

if (skip) {
  console.log("[postinstall] Skipping prisma generate (PRISMA_SKIP_POSTINSTALL_GENERATE=1)");
  process.exit(0);
}

if (!existsSync(schemaPath)) {
  console.log(`[postinstall] Prisma schema not found at ${schemaPath}. Skipping generate.`);
  process.exit(0);
}

console.log("[postinstall] Running: prisma generate --schema=./prisma/schema.prisma");
const res = spawnSync("npx", ["prisma", "generate", "--schema=./prisma/schema.prisma"], {
  stdio: "inherit",
  shell: true,
});
process.exit(res.status ?? 0);
