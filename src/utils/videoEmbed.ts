/**
 * Turns a YouTube or Vimeo URL into its embeddable player URL. Returns null
 * for anything else (or an invalid URL) so callers can fall back to a plain
 * "watch video" link instead of trying to embed an unsupported host.
 */
export function getVideoEmbedUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "");

  if (host === "youtube.com" || host === "m.youtube.com") {
    const v = parsed.searchParams.get("v");
    if (v) return `https://www.youtube.com/embed/${v}`;
    const shortsMatch = parsed.pathname.match(/^\/shorts\/([a-zA-Z0-9_-]+)/);
    if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;
    const embedMatch = parsed.pathname.match(/^\/embed\/([a-zA-Z0-9_-]+)/);
    if (embedMatch) return url;
    return null;
  }

  if (host === "youtu.be") {
    const id = parsed.pathname.slice(1);
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }

  if (host === "vimeo.com") {
    const match = parsed.pathname.match(/(\d+)/);
    return match ? `https://player.vimeo.com/video/${match[1]}` : null;
  }

  return null;
}
