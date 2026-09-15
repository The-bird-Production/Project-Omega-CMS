'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '../admin/ui/LoadingSpinner';
import EmptyState from '../admin/ui/EmptyState';

const LABELS = {
  plugins: {
    title: 'Parcourir le catalogue de plugins',
    installedMessage: 'Plugin installé avec succès !',
    emptyMessage: 'Aucun plugin validé dans le catalogue pour le moment.',
    installErrorPrefix: "Erreur lors de l'installation du plugin :",
  },
  themes: {
    title: 'Parcourir le catalogue de thèmes',
    installedMessage: 'Thème installé avec succès !',
    emptyMessage: 'Aucun thème validé dans le catalogue pour le moment.',
    installErrorPrefix: "Erreur lors de l'installation du thème :",
  },
};

export default function CatalogBrowser({ kind }) {
  const router = useRouter();
  const labels = LABELS[kind];
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState(null);
  const [installingRepo, setInstallingRepo] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchCatalog = async () => {
      setError(null);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${kind}/catalog`, {
          credentials: 'include',
          mode: 'cors',
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || `Erreur : ${res.statusText}`);
        setEntries(data);
      } catch (err) {
        console.error('Erreur lors du chargement du catalogue :', err);
        setError(err.message);
        setEntries([]);
      }
    };

    fetchCatalog();
  }, [kind]);

  const handleInstall = async (repo) => {
    setError(null);
    setSuccess(null);
    setInstallingRepo(repo);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${kind}/install-from-github`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({ repo }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Erreur : ${res.statusText}`);

      setSuccess(labels.installedMessage);
      router.refresh();
    } catch (err) {
      console.error(labels.installErrorPrefix, err);
      setError(err.message);
    } finally {
      setInstallingRepo(null);
    }
  };

  return (
    <div className="card card-body bg-secondary mb-3">
      <h5 className="card-title">{labels.title}</h5>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {entries === null && <LoadingSpinner />}

      {entries !== null && entries.length === 0 && (
        <EmptyState icon="bi-collection" message={labels.emptyMessage} />
      )}

      {entries !== null && entries.length > 0 && (
        <div className="list-group">
          {entries.map((entry) => (
            <div
              key={entry.repo}
              className="list-group-item bg-dark text-light d-flex justify-content-between align-items-center gap-3"
            >
              <div>
                <div className="fw-semibold">{entry.name}</div>
                <div className="text-muted small">{entry.description}</div>
                <a
                  href={`https://github.com/${entry.repo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="small"
                >
                  {entry.repo}
                </a>
              </div>
              <button
                type="button"
                className="btn btn-primary flex-shrink-0"
                disabled={installingRepo === entry.repo}
                onClick={() => handleInstall(entry.repo)}
              >
                {installingRepo === entry.repo ? 'Installation...' : 'Installer'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
