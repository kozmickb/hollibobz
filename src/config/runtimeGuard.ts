export function assertRuntimeSafety(opts: { env: string; apiBaseUrl?: string; aiProxyUrl?: string }) {
  const { env, apiBaseUrl, aiProxyUrl } = opts;
  const isDev = env === "development";
  const bad =
    (!isDev && apiBaseUrl?.startsWith("http://")) ||
    (!isDev && aiProxyUrl?.startsWith("http://"));
  if (bad) {
    throw new Error(
      "Refusing to start with insecure http endpoints in non development"
    );
  }
}
