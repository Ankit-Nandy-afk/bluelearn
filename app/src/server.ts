import {
  createStartHandler,
  defaultStreamHandler,
} from "@tanstack/react-start/server";

const connectSources = () => {
  const sources = new Set(["'self'"]);

  for (const raw of [
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_API_BASE,
  ]) {
    if (!raw) continue;

    try {
      const { origin, protocol, host } = new URL(raw);
      sources.add(origin);
      sources.add(`${protocol === "https:" ? "wss:" : "ws:"}//${host}`);
    } catch {
      continue;
    }
  }

  return [...sources].join(" ");
};

const buildPolicy = (nonce: string) =>
  [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src ${connectSources()}`,
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "upgrade-insecure-requests",
  ].join("; ");

const newNonce = () =>
  btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));

const fetch = createStartHandler((ctx) => {
  if (import.meta.env.DEV) return defaultStreamHandler(ctx);

  const nonce = newNonce();
  ctx.router.options.ssr = { ...ctx.router.options.ssr, nonce };
  ctx.responseHeaders.set("Content-Security-Policy", buildPolicy(nonce));

  return defaultStreamHandler(ctx);
});

export default { fetch };
