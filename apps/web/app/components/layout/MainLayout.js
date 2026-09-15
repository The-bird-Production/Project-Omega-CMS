"use client";

import fetch from "isomorphic-fetch";
import { useEffect } from "react";
import { ThemeProvider } from "../theme/themeProvider";
import { getOrCreateVisitorId, getReferrerHostname } from "../../../lib/analytics";

function Layout({ children, currentPage }) {
  useEffect(() => {
    // Vérification si l'effet est exécuté côté client
    if (typeof window !== "undefined") {
      const formData = new URLSearchParams();
      // The real URL, not the generic per-template label (currentPage) —
      // every article/page used to report the same handful of hardcoded
      // strings ("ArticleDetail", "ArticleList", ...), making it impossible
      // to tell which article was actually viewed.
      formData.append("page", window.location.pathname);
      formData.append("visitorId", getOrCreateVisitorId());
      formData.append("referrer", getReferrerHostname());
      formData.append("userAgent", navigator.userAgent);
      // Envoi de la requête à votre API externe pour enregistrer que la page a été consultée
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/web_stats/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(), // Utilisation de la prop currentPage
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              "Erreur lors de l'enregistrement de la page consultée"
            );
          }
        })
        .catch((error) => {
          console.error(
            "Erreur lors de l'enregistrement de la page consultée:",
            error
          );
        });
    }
  }, [currentPage]); // currentPage est la seule dépendance de l'effet

  return <>{children}</>;
}

export default Layout;
