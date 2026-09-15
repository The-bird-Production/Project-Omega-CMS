"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const PluginsPage = () => {
  const [plugins, setPlugins] = useState([]);
  const [updates, setUpdates] = useState({}); // { [pluginId]: latestVersion }
  const [checkingUpdates, setCheckingUpdates] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlugins = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/plugins`, {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          mode: "cors",
        });

        if (!response.ok) {
          throw new Error(`Erreur : ${response.statusText}`);
        }

        const data = await response.json();
        setPlugins(data);
      } catch (err) {
        setError(err.message);
        console.error("Erreur lors de la récupération des plugins :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlugins();
  }, []);

  const checkUpdates = async () => {
    setCheckingUpdates(true);
    try {
      const results = await Promise.all(
        plugins.map(async (plugin) => {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/plugins/check-update/${plugin.id}`,
            { credentials: "include", mode: "cors" }
          );
          if (!response.ok) return null;
          const data = await response.json();
          return data.updateAvailable ? { id: plugin.id, latestVersion: data.latestVersion } : null;
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

  const updatePlugin = async (id) => {
    if (!window.confirm(`Mettre à jour le plugin "${id}" maintenant ?`)) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/plugins/update/${id}`, {
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
      console.error("Erreur lors de la mise à jour du plugin :", err);
    }
  };

  if (loading) return <div>Chargement des plugins...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="card card-body bg-secondary">
      <h5 className="card-title">Liste des Plugins Installés</h5>
      <button className="btn btn-primary mb-3" onClick={checkUpdates} disabled={checkingUpdates || plugins.length === 0}>
        {checkingUpdates ? "Vérification..." : "Vérifier les mises à jour"}
      </button>

      {plugins.length === 0 ? (
        <div className="alert alert-warning" role="alert">
          Aucun plugin installé.
        </div>
      ) : (
        <ul className="list-group">
          {plugins.map((plugin) => (
            <li key={plugin.id} className="list-group-item bg-primary text-light border border-primary">
              <h2 className="h5">{plugin.name}</h2>
              <p>{plugin.description}</p>
              <p className="mb-1">
                <strong>Version :</strong> {plugin.version}
              </p>
              {plugin.repo && (
                <p className="mb-2">
                  <small>
                    Source :{" "}
                    <a href={`https://github.com/${plugin.repo}`} target="_blank" rel="noreferrer">
                      {plugin.repo}
                    </a>
                  </small>
                </p>
              )}
              <Link href={`/admin/plugins/${plugin.id}`} className="btn btn-secondary">
                Settings
              </Link>

              {updates[plugin.id] && (
                <div className="mt-2">
                  <p className="text-warning mb-1">Nouvelle version disponible : {updates[plugin.id]}</p>
                  <button className="btn btn-warning" onClick={() => updatePlugin(plugin.id)}>
                    Mettre à jour
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="pt-3">
        <Link href="/admin/plugins/install" className="btn btn-primary">
          Installer un plugin
        </Link>
      </div>
    </div>
  );
};

export default PluginsPage;
