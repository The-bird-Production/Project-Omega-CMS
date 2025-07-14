"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

const ThemePage = () => {
  const { data: session, status } = useSession({
    required: true, // Redirige automatiquement si l'utilisateur n'est pas authentifié
  });

  const [themes, setThemes] = useState([]); // Plugins installés
  const [installableThemes, setInstallableThemes] = useState([]); // Plugins disponibles
  const [updates, setUpdates] = useState({}); // Stocke les mises à jour disponibles
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchThemes = async () => {
      if (status === "authenticated") {
        const token = session.accessToken || session.user.accessToken;

        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/themes`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            mode: "cors",
          });

          if (!response.ok) {
            throw new Error(`Erreur : ${response.statusText}`);
          }

          const data = await response.json();
          
          setThemes(data);
          
        } catch (err) {
          setError(err.message);
          console.error("Erreur lors de la récupération des thèmes :", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchThemes();
  }, [session, status]);

  const checkUpdate = async () => {
    if (status === "authenticated") {
      setLoading(true);
      const token = session.accessToken || session.user.accessToken;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/themes/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          mode: "cors",
        });

        if (!response.ok) {
          throw new Error(`Erreur : ${response.statusText}`);
        }

        const data = await response.json();
        
        setInstallableThemes(data.themes);

        // Comparaison des versions pour détecter les mises à jour disponibles

        const updatesAvailable = {};
          data.themes.forEach((installableThemes) => {
            const installedThemes = themes.find((t) => t.id === installableThemes.id);
            if (installedThemes && installedThemes.version !== installableThemes.version) {
              updatesAvailable[installableThemes.id] = installableThemes;
            }
          });
        

        setUpdates(updatesAvailable);
        console.log("Mises à jour disponibles :", updates);
      } catch (err) {
        setError(err.message);
        console.error("Erreur lors de la récupération des mises à jour :", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const UpdateTheme = async (id) => {
    if (status === "authenticated") {
      const token = session.accessToken || session.user.accessToken;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/themes/update/${id}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          mode: "cors",
        });

        if (!response.ok) {
          throw new Error(`Erreur : ${response.statusText}`);
        }

        alert("Plugin mis à jour avec succès !");
        setUpdates((prevUpdates) => {
          const newUpdates = { ...prevUpdates };
          delete newUpdates[id];
          return newUpdates;
        });
      } catch (err) {
        setError(err.message);
        console.error("Erreur lors de la mise à jour du thèmes :", err);
      }
    }
  };

  if (loading) return <div>Chargement des thèmes...</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <div className="container mt-5 bg-secondary p-4 rounded border border-secondary">
      <h1 className="mb-4">Liste des Themes Installés</h1>
      <button className="btn btn-primary mb-3" onClick={checkUpdate}>
        Vérifier les mises à jour
      </button>
      
      {themes.length === 0 ? (
        <div className="alert alert-warning" role="alert">
          Aucun Themes installé.
        </div>
      ) : (
        <ul className="list-group">
          {themes.map((theme) => (
            <li key={theme.id} className="list-group-item bg-primary text-light border border-primary">
              <h2 className="h5">{theme.name}</h2>
              <p>{theme.description}</p>
              <p>
                <strong>Version :</strong> {theme.version}
              </p>
              <Link href={`/admin/themes/${theme.id}`} className="btn btn-secondary">
                Settings
              </Link>

              {/* Affichage du bouton Mettre à jour si une mise à jour est disponible */}
              {updates[theme.id] && (
                <div className="mt-2">
                  <p className="text-warning">
                    Nouvelle version disponible : {updates[theme.id].version}
                  </p>
                  <button className="btn btn-warning" onClick={() => UpdateTheme(theme.id)}>
                    Mettre à jour
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="pt-3">
        <Link href="/admin/themes/install" className="btn btn-primary">
          Installer un thème
        </Link>
      </div>
    </div>
  );
};

export default ThemePage;
