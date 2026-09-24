"use client";
import { useEffect } from "react";
import { getOrCreateVisitorId, getReferrerHostname } from "../../../lib/analytics";

// Reports a page view for the stats dashboard — needs the browser
// (visitorId in localStorage, document.referrer, navigator.userAgent),
// so this stays a client component even though the rest of the layout
// (see MainLayout.js) doesn't need to be one anymore.
export default function PageViewTracker() {
  useEffect(() => {
    const formData = new URLSearchParams();
    // The real URL, not a generic per-template label — every article/page
    // used to report the same handful of hardcoded strings, making it
    // impossible to tell which one was actually viewed.
    formData.append("page", window.location.pathname);
    formData.append("visitorId", getOrCreateVisitorId());
    formData.append("referrer", getReferrerHostname());
    formData.append("userAgent", navigator.userAgent);

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/web_stats/add`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    }).catch((error) => {
      console.error("Erreur lors de l'enregistrement de la page consultée:", error);
    });
    // Runs once per mount — MainLayout renders a new instance of this
    // component on every navigation (it's part of the page tree), so a
    // fixed empty dependency array is correct here, not stale.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
