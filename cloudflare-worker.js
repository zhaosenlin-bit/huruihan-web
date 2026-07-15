const ASSET_EXTENSIONS = [
  ".js",
  ".css",
  ".png",
  ".jpg",
  ".jpeg",
  ".svg",
  ".webp",
  ".gif",
  ".ico",
  ".json",
  ".txt",
  ".woff",
  ".woff2",
  ".ttf",
  ".mp3",
  ".mp4",
  ".webm",
  ".glb",
];

function shouldFallbackToIndex(pathname) {
  if (pathname === "/" || pathname === "/index.html") return false;
  return !ASSET_EXTENSIONS.some((ext) => pathname.endsWith(ext));
}

export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) return response;

    const url = new URL(request.url);
    if (!shouldFallbackToIndex(url.pathname)) {
      return response;
    }

    url.pathname = "/index.html";
    return env.ASSETS.fetch(new Request(url.toString(), request));
  },
};
