import cors from "cors";

const isDev = (process.env.APP_ENV || process.env.NODE_ENV) === "development";

export function corsMiddleware() {
  if (isDev) return cors(); // allow all in dev

  const allowlist = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  return cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowlist.includes(origin)) return cb(null, true);
      return cb(new Error("CORS_NOT_ALLOWED"), false);
    },
    methods: ["GET","POST","PUT","DELETE","OPTIONS"],
    allowedHeaders: ["Content-Type","Authorization","x-subject-id"],
    credentials: false
  });
}
