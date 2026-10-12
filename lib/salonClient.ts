export function getSalon(): string {
  if (typeof window === "undefined") return "";
  const m = window.location.pathname.match(/^\/s\/([a-z0-9-]+)/);
  return m ? m[1] : "";
}

export function withSalon(url: string): string {
  const s = getSalon();
  if (!s) return url;
  return url + (url.includes("?") ? "&" : "?") + "salon=" + encodeURIComponent(s);
}

export function salonPath(path: string): string {
  const s = getSalon();
  if (!s) return path;
  return path === "/" ? "/s/" + s : "/s/" + s + path;
}
