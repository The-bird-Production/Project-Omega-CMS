// src/components/ThemeProvider/index.jsx (ou un chemin similaire)
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import dynamic from "next/dynamic";
// import { useRouter } from "next/navigation"; // Décommentez si vous utilisez l'App Router de Next.js et avez besoin de la redirection

// --- 1. Définition du contexte ---
// Nous allons créer un objet dynamique pour stocker les composants du thème.
// Au lieu de stocker directement les composants dans le contexte,
// nous allons exposer un 'theme' object qui contiendra les composants et la méta.
const ThemeContext = createContext({
  theme: null, // contiendra { id, meta, components }
  setThemeById: () => {},
  isLoading: true,
  error: null,
});

// --- 2. Hook personnalisé pour utiliser le thème ---
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme doit être utilisé à l'intérieur d'un ThemeProvider");
  }
  return context;
};

// --- 3. Le ThemeProvider principal ---
export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(null); // { id, meta, components: { Button, Header, ... } }
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdminRoute, setIsAdminRoute] = useState(false);

  // const router = useRouter(); // Initialisation du router si besoin

  // Fonction pour charger et appliquer un thème spécifique
  const loadTheme = useCallback(async (themeIdentifier = "current") => {
    setIsLoading(true);
    setError(null);
    setCurrentTheme(null); // Réinitialiser le thème actuel pendant le chargement

    try {
      console.log(`🔄 Chargement du thème : "${themeIdentifier}"...`);
      const url =
        themeIdentifier === "current"
          ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/themes/current`
          : `${process.env.NEXT_PUBLIC_BACKEND_URL}/themes/${themeIdentifier}`;

      const res = await fetch(url);
      if (res.status === 404) { 
        console.warn(`⚠️ Thème "${themeIdentifier}" non trouvé, bascule vers le thème par défaut.`);
      loadTheme("default") // Si le thème n'est pas trouvé, basculer vers le thème par défaut
        return;
      }
      /* if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(`Erreur lors du chargement du thème ${themeIdentifier}: ${res.status} - ${errorData.message}`);
      } */
      const data = await res.json(); // Données complètes du thème (id, config, etc.)

      // Injecter le CSS
      const linkId = "theme-css";
      let link = document.getElementById(linkId);
      if (!link) {
        link = document.createElement("link");
        link.id = linkId;
        link.rel = "stylesheet";
        document.head.appendChild(link);
      }
      link.href = `/themes/${data.id}/style.css`; // Assurez-vous que ce chemin est public

      // Charger dynamiquement tous les composants listés
      const componentsConfig = data.config?.components || {};
      const loadedComponents = {};

      for (const [name, relativePath] of Object.entries(componentsConfig)) {
        try {
          // IMPORTANT : Le chemin d'importation doit être gérable par Webpack/Next.js.
          // Ici, on suppose que vos thèmes sont dans `src/themes` et configurés avec un alias `@/themes`.
          // Le `relativePath` doit être le chemin du composant DANS le dossier `components` de votre thème.
          // Ex: relativePath = "Button.jsx" pour un composant dans src/themes/my-theme/components/Button.jsx
          const dynamicComponent = dynamic(
            () => import(`../../Themes/${data.id}${relativePath}`).catch((err) => {
              console.error(`❌ Erreur lors de l'importation du composant "${name}" depuis "${relativePath}":`, err);
              return { default: () => <div>Erreur de chargement du composant {name}</div> }; // Retourne un composant d'erreur
            }),
            { ssr: false } // Toujours ssr: false pour les composants client-side dynamiques
          );
          loadedComponents[name] = dynamicComponent;
        } catch (err) {
          console.warn(`⚠️ Échec de la configuration dynamique pour le composant "${name}" :`, err);
        }
      }

      // Mettre à jour l'état du thème avec tous les détails
      setCurrentTheme({
        id: data.id,
        meta: data, // Ou juste `data` si vous voulez toutes les métadonnées
        components: loadedComponents,
      });

      setIsLoading(false);
      console.log(`✅ Thème "${data.id}" chargé avec succès.`);
    } catch (err) {
      console.error("❌ Erreur critique lors du chargement du thème :", err);
      setError(err);
      setIsLoading(false);
      // Optionnel: Gérer les erreurs, par exemple rediriger ou afficher un message persistant.
      // router.push('/error-page');
    }
  }, []); // `loadTheme` ne dépend de rien car `themeIdentifier` est passé en paramètre

  // Effet initial pour charger le thème "current" au montage, sauf si /admin

  // --- Important : on ne charge le thème **que si ce n’est pas /admin** ---
  useEffect(() => {
    if (isAdminRoute === null) return; // on attend la détection
    if (!isAdminRoute) loadTheme();
    else setIsLoading(false); // côté /admin, pas de thème
  }, [isAdminRoute, loadTheme]);


  // Utilisation de useMemo pour optimiser la valeur du contexte
  // La valeur ne sera recalculée que si currentTheme, isLoading ou error changent
  const contextValue = useMemo(() => {
    const themeProxy = {};
    if (currentTheme && currentTheme.components) {
      // Crée un proxy pour accéder directement aux composants comme `theme.Button`
      for (const key in currentTheme.components) {
        Object.defineProperty(themeProxy, key, {
          get: () => currentTheme.components[key],
          enumerable: true,
          configurable: true,
        });
      }
    }

    return {
      theme: {
        id: currentTheme?.id,
        meta: currentTheme?.meta,
        ...themeProxy, // Fusionne les composants directement
      },
      setThemeById: loadTheme,
      isLoading,
      error,
    };
  }, [currentTheme, isLoading, error, loadTheme]);

  // Si on est sur /admin, ne pas charger de thème, juste rendre les enfants
  if (isAdminRoute) {

    return children;

  }

  // Afficher un loader pendant le chargement initial
  if (isLoading && !currentTheme) {
    return <div>Chargement du thème...</div>; // Ou un spinner, une page de chargement complète
  }

  // Afficher un message d'erreur si le chargement initial a échoué
  if (error && !currentTheme) {
    return (
      <div>
        <p>Erreur critique lors du chargement du thème initial: {error.message}</p>
        <button onClick={() => loadTheme()}>Réessayer</button>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

//Merci google Gemini pour la redaction de ce code