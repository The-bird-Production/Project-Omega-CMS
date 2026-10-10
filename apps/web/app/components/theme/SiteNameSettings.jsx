'use client';
import { useEffect, useState } from 'react';

const MAX_LENGTH = 120;

// The site's public name, shown after every page title in the browser tab
// ("Contact | <nom du site>") and as the Open Graph site name — stored by
// the API (apps/api/Controllers/System/SiteController.ts), read by
// lib/siteName.js. Empty = the default, "Omega CMS".
export default function SiteNameSettings() {
  const [name, setName] = useState('');
  const [saved, setSaved] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/system/site`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const value = data?.siteName || '';
        setName(value);
        setSaved(value);
      })
      .catch(() => {});
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/system/site`, {
        method: 'PATCH',
        credentials: 'include',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteName: name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Erreur : ${res.statusText}`);
      const value = data.siteName || '';
      setName(value);
      setSaved(value);
      setMessage({ type: 'success', text: 'Nom du site enregistré. Il apparaît dans les onglets du site d’ici une minute.' });
    } catch (err) {
      setMessage({ type: 'danger', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card card-body bg-secondary mb-3">
      <h5 className="card-title">Nom du site</h5>
      <p className="mb-2">
        Affiché après le titre de chaque page dans l’onglet du navigateur, par exemple «&nbsp;Contact |{' '}
        {saved || 'Omega CMS'}&nbsp;». Laissez vide pour utiliser «&nbsp;Omega CMS&nbsp;».
      </p>
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
      <form className="d-flex flex-wrap align-items-center gap-2" onSubmit={onSubmit}>
        <label htmlFor="siteName" className="visually-hidden">
          Nom du site
        </label>
        <input
          id="siteName"
          type="text"
          className="form-control"
          style={{ maxWidth: 360 }}
          placeholder="Omega CMS"
          maxLength={MAX_LENGTH}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={saving}
        />
        <button type="submit" className="btn btn-primary" disabled={saving || name.trim() === saved}>
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </form>
    </div>
  );
}
