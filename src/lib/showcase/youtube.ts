const YOUTUBE_VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

function parseUrl(input: string | null | undefined) {
  const trimmed = input?.trim();
  if (!trimmed) return null;

  const withProtocol = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url;
  } catch {
    return null;
  }
}

function cleanVideoId(value: string | null | undefined) {
  const id = value?.trim();
  if (!id || !YOUTUBE_VIDEO_ID.test(id)) return null;
  return id;
}

export function getYouTubeVideoId(input: string | null | undefined) {
  const url = parseUrl(input);
  if (!url) return null;

  const host = url.hostname.toLowerCase().replace(/^www\./, "");

  if (host === "youtu.be") {
    return cleanVideoId(url.pathname.split("/").filter(Boolean)[0]);
  }

  if (
    host !== "youtube.com" &&
    host !== "m.youtube.com" &&
    host !== "youtube-nocookie.com"
  ) {
    return null;
  }

  if (url.pathname === "/watch") {
    return cleanVideoId(url.searchParams.get("v"));
  }

  const [kind, id] = url.pathname.split("/").filter(Boolean);
  if (kind === "embed" || kind === "shorts") {
    return cleanVideoId(id);
  }

  return null;
}

export function getYouTubeEmbedUrl(input: string | null | undefined) {
  const videoId = getYouTubeVideoId(input);
  if (!videoId) return null;
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}

export function isValidYouTubeUrl(input: string | null | undefined) {
  return getYouTubeVideoId(input) !== null;
}
