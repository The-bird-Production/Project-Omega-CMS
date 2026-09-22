'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const PluginsInstallable = () => {
  const router = useRouter();
  const [repo, setRepo] = useState('');
  const [installing, setInstalling] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setInstalling(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/plugins/install-from-github`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({ repo }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || `Erreur : ${response.statusText}`);
      }

      setSuccess('Plugin installé avec succès !');
      setRepo('');
      router.refresh();
    } catch (err) {
      setError(err.message);
      console.error("Erreur lors de l'installation du plugin :", err);
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div className="card card-body bg-secondary">
      <h5 className="card-title">Installer un plugin depuis GitHub</h5>
      <p className="text-muted">
        Le dépôt doit être public et avoir au moins une release GitHub. Un asset nommé{' '}
        <code>plugin.zip</code> est utilisé s&apos;il existe, sinon l&apos;archive source de la
        release est utilisée.
      </p>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="row g-2">
        <div className="col-md-9">
          <input
            type="text"
            className="form-control"
            placeholder="owner/repo ou https://github.com/owner/repo"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            required
          />
        </div>
        <div className="col-md-3">
          <button type="submit" className="btn btn-primary w-100" disabled={installing}>
            {installing ? 'Installation...' : 'Installer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PluginsInstallable;
