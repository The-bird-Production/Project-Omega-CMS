"use client"
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const PluginsPage = () => {
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
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/plugins`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            mode: 'cors', // Permet les requêtes cross-origin
          });

          if (!response.ok) {
            throw new Error(`Erreur : ${response.statusText}`);
          }

          const data = await response.json();
          setPlugins(data);
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

  return (
    <div className="container mt-5 bg-secondary p-4 rounded border border-secondary">
      <h1 className="mb-4">Liste des Plugins Installés</h1>
      {plugins.length === 0 ? (
        <div className="alert alert-warning" role="alert">
          Aucun plugin installé.
        </div>
      ) : (
        <ul className="list-group">
          {plugins.map((plugin) => (
            <li key={plugin.folder} className="list-group-item bg-primary text-light border border-primary">
              <h2 className="h5">{plugin.name}</h2>
              <p>{plugin.description}</p>
              <p><strong>Version :</strong> {plugin.version}</p>
              <Link href={`/admin/plugins/${plugin.folder}`} className="btn btn-secondary">Settings</Link>

            
            </li>
          ))}
        </ul>
      )}

      <div className='pt-3'><Link href="/admin/plugins/install" className='btn btn-primary'>Installer un plugin </Link></div>
    </div>
  );
};

export default PluginsPage;
