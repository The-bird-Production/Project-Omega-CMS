'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const pluginsInstallable = () => {
  const { data: session, status } = useSession({
    required: true, // Redirige automatiquement si l'utilisateur n'est pas authentifié
  });

  const [plugins, setPlugins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlugins = async () => {
      if (status === 'authenticated') {
        const token = session.accessToken || session.user.accessToken;

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/plugins/installable`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              mode: 'cors', // Permet les requêtes cross-origin
            }
          );

          if (!response.ok) {
            throw new Error(`Erreur : ${response.statusText}`);
          }

          const data = await response.json();
          setPlugins(data.plugins);
        } catch (err) {
          setError(err.message);
          console.error('Erreur lors de la récupération des plugins :', err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPlugins();
  }, [session, status]);

  if (loading) return <div>Chargement des plugins...</div>;
  if (error) return <div>Erreur : {error}</div>;

  const installPlugin = async (name) => {
    if (status === 'authenticated') {
      const token = session.accessToken || session.user.accessToken;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/plugins/install/${name}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            mode: 'cors', // Permet les requêtes cross-origin
          }
        );

        if (!response.ok) {
          throw new Error(`Erreur : ${response.statusText}`);
        }

        alert('Plugin installé avec succès !');
      } catch (err) {
        setError(err.message);
        console.error("Erreur lors de l'installation du plugin :", err);
      }
    }
  };

  return (
    <div className="container mt-5 bg-secondary p-4 rounded border border-secondary">
      <h1 className="mb-4">Liste des Plugins Disponibles</h1>
      {plugins.length === 0 ? (
        <div className="alert alert-warning" role="alert">
          Aucun plugin disponible.
        </div>
      ) : (
        <ul className="list-group">
          {plugins.map((plugin) => (
            <li
              key={plugin.folder}
              className="list-group-item bg-primary text-light border border-primary"
            >
              <h2 className="h5">{plugin.name}</h2>
              <p>{plugin.description}</p>
              <p>
                <strong>Version :</strong> {plugin.version}
              </p>
              <button
                className="btn btn-secondary"
                onClick={() => installPlugin(plugin.name)}
              >
                Install
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default pluginsInstallable;
