"use client";

import fetch from "isomorphic-fetch";
import { useEffect } from "react";

function Layout({ children, currentPage }) {
  useEffect(() => {
    // Vérification si l'effet est exécuté côté client
    if (typeof window !== "undefined") {
      const formData = new URLSearchParams();
      formData.append("page", currentPage);
      // Envoi de la requête à votre API externe pour enregistrer que la page a été consultée
      fetch("http://localhost:3001/web_stats/add", {
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

  return <div>{children}</div>;
}

export default Layout;
