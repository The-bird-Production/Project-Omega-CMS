'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const themesInstallable = () => {
  const { data: session, status } = useSession({
    required: true, // Redirige automatiquement si l'utilisateur n'est pas authentifié
  });

  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchThemes = async () => {
      if (status === 'authenticated') {
        const token = session.accessToken || session.user.accessToken;

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/themes/installable`,
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
          setThemes(data);
        } catch (err) {
          setError(err.message);
          console.error('Erreur lors de la récupération des plugins :', err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchThemes();
  }, [session, status]);

  if (loading) return <div>Chargement des thèmes...</div>;
  if (error) return <div>Erreur : {error}</div>;

  const installTheme = async (id) => {
    if (status === 'authenticated') {
      const token = session.accessToken || session.user.accessToken;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/themes/install/${id}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            mode: 'cors', 
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
      <h1 className="mb-4">Liste des thèmesDisponibles</h1>
      {!themes || themes.length === 0 ? (
        <div className="alert alert-warning" role="alert">
          Aucun thème disponible.
        </div>
      ) : (
        <ul className="list-group">
          {themes.map((theme) => (
            <li
              key={theme.folder}
              className="list-group-item bg-primary text-light border border-primary"
            >
              <h2 className="h5">{theme.name}</h2>
              <p>{theme.description}</p>
              <p>
                <strong>Version :</strong> {theme.version}
              </p>
              <button
                className="btn btn-secondary"
                onClick={() => installTheme(theme.id)}
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

export default themesInstallable;
