export function assertRuntimeSafety(env: string, urls: Array<string | undefined>) {
  const isDev = env === "development";
  if (!isDev && urls.some(u => typeof u === "string" && u.startsWith("http://"))) {
    throw new Error("Insecure http URL detected in a non development build");
  }
}
