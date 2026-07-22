const CACHE_PREFIX = "sosedi-static";
const CACHE_NAME = `${CACHE_PREFIX}-v1`;
const PRECACHE_URLS = [
  "/pwa-icon.svg",
  "/favicon.ico",
  "/brand/sosedi-logo-v2.svg",
  "/brand/sosedi-symbol-v2.svg",
  "/fonts/NTSomic-Regular.otf",
  "/fonts/NTSomic-Medium.otf",
  "/fonts/NTSomic-Bold.otf",
];
const STATIC_PREFIXES = ["/_next/static/", "/brand/", "/fonts/"];
const STATIC_FILES = new Set(["/pwa-icon.svg", "/favicon.ico"]);

function isStaticRequest(request, url) {
  if (request.method !== "GET" || url.origin !== globalThis.location.origin) {
    return false;
  }

  if (request.mode === "navigate" || request.destination === "document") {
    return false;
  }

  if (request.headers.has("Range") || request.headers.has("Authorization")) {
    return false;
  }

  return (
    STATIC_FILES.has(url.pathname) ||
    STATIC_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))
  );
}

function canCache(response) {
  if (!response || response.status !== 200 || response.type !== "basic") return false;

  const cacheControl = response.headers.get("Cache-Control")?.toLowerCase() ?? "";
  return (
    !cacheControl.includes("no-store") &&
    !cacheControl.includes("private") &&
    !response.headers.has("Set-Cookie") &&
    response.headers.get("Vary") !== "*"
  );
}

globalThis.addEventListener("install", (event) => {
  event.waitUntil(
    globalThis.caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(
        PRECACHE_URLS.map((url) =>
          cache.add(new Request(url, { cache: "reload", credentials: "same-origin" })),
        ),
      ),
    ),
  );
});

globalThis.addEventListener("activate", (event) => {
  event.waitUntil(
    globalThis.caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
            .map((key) => globalThis.caches.delete(key)),
        ),
      )
      .then(() => globalThis.clients.claim()),
  );
});

globalThis.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (!isStaticRequest(request, url)) return;

  event.respondWith(
    globalThis.caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);
      const update = globalThis
        .fetch(request)
        .then(async (response) => {
          if (canCache(response)) {
            await cache.put(request, response.clone()).catch(() => undefined);
          }
          return response;
        })
        .catch(() => null);

      if (cached) {
        event.waitUntil(update);
        return cached;
      }

      return (await update) ?? Response.error();
    }),
  );
});
