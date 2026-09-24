"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { confirmAction } from "../../../lib/confirm";

const ThemePage = () => {
  const [themes, setThemes] = useState([]);
  const [updates, setUpdates] = useState({}); // { [themeId]: latestVersion }
  const [checkingUpdates, setCheckingUpdates] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/themes`, {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
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
    };

    fetchThemes();
  }, []);

  const checkUpdates = async () => {
    setCheckingUpdates(true);
    try {
      const results = await Promise.all(
        themes.map(async (theme) => {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/themes/check-update/${theme.id}`,
            { credentials: "include", mode: "cors" }
          );
          if (!response.ok) return null;
          const data = await response.json();
          return data.updateAvailable ? { id: theme.id, latestVersion: data.latestVersion } : null;
        })
      );

      const updatesAvailable = {};
      for (const result of results) {
        if (result) updatesAvailable[result.id] = result.latestVersion;
      }
      setUpdates(updatesAvailable);
    } catch (err) {
      setError(err.message);
      console.error("Erreur lors de la vérification des mises à jour :", err);
    } finally {
      setCheckingUpdates(false);
    }
  };

  const updateTheme = async (id) => {
    if (!window.confirm(`Mettre à jour le thème "${id}" maintenant ?`)) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/themes/update/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        mode: "cors",
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || `Erreur : ${response.statusText}`);
      }

      setUpdates((prevUpdates) => {
        const newUpdates = { ...prevUpdates };
        delete newUpdates[id];
        return newUpdates;
      });
    } catch (err) {
      setError(err.message);
      console.error("Erreur lors de la mise à jour du thème :", err);
    }
  };

  const deleteTheme = async (id) => {
    if (!confirmAction(`Supprimer le thème "${id}" ? Cette action est irréversible.`)) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/themes/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
        mode: "cors",
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || `Erreur : ${response.statusText}`);
      }

      setThemes((prevThemes) => prevThemes.filter((theme) => theme.id !== id));
      setUpdates((prevUpdates) => {
        const newUpdates = { ...prevUpdates };
        delete newUpdates[id];
        return newUpdates;
      });
    } catch (err) {
      setError(err.message);
      console.error("Erreur lors de la suppression du thème :", err);
    }
  };

  if (loading) return <div>Chargement des thèmes...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="card card-body bg-secondary">
      <h5 className="card-title">Liste des Thèmes Installés</h5>
      <button className="btn btn-primary mb-3" onClick={checkUpdates} disabled={checkingUpdates || themes.length === 0}>
        {checkingUpdates ? "Vérification..." : "Vérifier les mises à jour"}
      </button>

      {themes.length === 0 ? (
        <div className="alert alert-warning" role="alert">
          Aucun thème installé.
        </div>
      ) : (
        <ul className="list-group">
          {themes.map((theme) => (
            <li key={theme.id} className="list-group-item bg-primary text-white border border-primary">
              <h2 className="h5">{theme.name}</h2>
              <p>{theme.description}</p>
              <p className="mb-1">
                <strong>Version :</strong> {theme.version}
              </p>
              {theme.repo && (
                <p className="mb-2">
                  <small>
                    Source :{" "}
                    <a href={`https://github.com/${theme.repo}`} target="_blank" rel="noreferrer">
                      {theme.repo}
                    </a>
                  </small>
                </p>
              )}
              <Link href={`/admin/themes/${theme.id}`} className="btn btn-secondary">
                Settings
              </Link>
              {theme.id !== "default" && (
                <button className="btn btn-danger ms-2" onClick={() => deleteTheme(theme.id)}>
                  Supprimer
                </button>
              )}

              {updates[theme.id] && (
                <div className="mt-2">
                  <p className="text-warning mb-1">Nouvelle version disponible : {updates[theme.id]}</p>
                  <button className="btn btn-warning" onClick={() => updateTheme(theme.id)}>
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
