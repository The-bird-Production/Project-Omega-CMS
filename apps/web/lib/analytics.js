// Anonymous, first-party page-view analytics — no IP-based tracking.
// visitorId is a random id (crypto.randomUUID()) stored in a first-party
// cookie the browser sets itself; it can't be traced back to a person
// without also having their browser's cookie jar.
const VISITOR_COOKIE = "omega_vid";
const VISITOR_COOKIE_MAX_AGE_DAYS = 400; // Chrome's own cap on cookie lifetime.

export function getOrCreateVisitorId() {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(new RegExp(`(?:^|; )${VISITOR_COOKIE}=([^;]+)`));
  if (match) return match[1];

  const id = crypto.randomUUID();
  const maxAge = VISITOR_COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${VISITOR_COOKIE}=${id}; path=/; max-age=${maxAge}; SameSite=Lax`;
  return id;
}

// Only the hostname, not the full referrer URL — enough to know the
// traffic source (e.g. "google.com") without capturing query strings or
// paths from wherever the visitor came from.
export function getReferrerHostname() {
  if (typeof document === "undefined" || !document.referrer) return "";
  try {
    return new URL(document.referrer).hostname;
  } catch {
    return "";
  }
}
