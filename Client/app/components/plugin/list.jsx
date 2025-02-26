"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

const PluginsPage = () => {
  const { data: session, status } = useSession({
    required: true, // Redirige automatiquement si l'utilisateur n'est pas authentifié
  });

  const [plugins, setPlugins] = useState([]); // Plugins installés
  const [installablePlugins, setInstallablePlugins] = useState([]); // Plugins disponibles
  const [updates, setUpdates] = useState({}); // Stocke les mises à jour disponibles
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlugins = async () => {
      if (status === "authenticated") {
        const token = session.accessToken || session.user.accessToken;

        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/plugins`, {
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
          
          setPlugins(data);
          
        } catch (err) {
          setError(err.message);
          console.error("Erreur lors de la récupération des plugins :", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPlugins();
  }, [session, status]);

  const checkUpdate = async () => {
    if (status === "authenticated") {
      setLoading(true);
      const token = session.accessToken || session.user.accessToken;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/plugins/all`, {
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
        
        setInstallablePlugins(data.plugins);

        // Comparaison des versions pour détecter les mises à jour disponibles

        const updatesAvailable = {};
          data.availablePlugins.plugins.forEach((installablePlugin) => {
            const installedPlugin = plugins.find((p) => p.id === installablePlugin.id);
            if (installedPlugin && installedPlugin.version !== installablePlugin.version) {
              updatesAvailable[installablePlugin.id] = installablePlugin;
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

  const updatePlugin = async (id) => {
    if (status === "authenticated") {
      const token = session.accessToken || session.user.accessToken;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/plugins/update/${id}`, {
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
        console.error("Erreur lors de la mise à jour du plugin :", err);
      }
    }
  };

  if (loading) return <div>Chargement des plugins...</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <div className="container mt-5 bg-secondary p-4 rounded border border-secondary">
      <h1 className="mb-4">Liste des Plugins Installés</h1>
      <button className="btn btn-primary mb-3" onClick={checkUpdate}>
        Vérifier les mises à jour
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
              <p>
                <strong>Version :</strong> {plugin.version}
              </p>
              <Link href={`/admin/plugins/${plugin.id}`} className="btn btn-secondary">
                Settings
              </Link>

              {/* Affichage du bouton Mettre à jour si une mise à jour est disponible */}
              {updates[plugin.id] && (
                <div className="mt-2">
                  <p className="text-warning">
                    Nouvelle version disponible : {updates[plugin.id].version}
                  </p>
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
