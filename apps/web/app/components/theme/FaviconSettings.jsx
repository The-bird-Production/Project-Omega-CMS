'use client';
import { useEffect, useState } from 'react';

// Site-wide, independent of the active theme (unlike its style.css) — see
// apps/api/Controllers/Favicon/FaviconController.ts, which keeps a single
// favicon<ext> file on disk rather than one per theme.
export default function FaviconSettings() {
  const [currentUrl, setCurrentUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/favicon/current`);
      const data = await res.json();
      setCurrentUrl(data.url || null);
    } catch {
      setCurrentUrl(null);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('favicon', file);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/favicon/upload`, {
        method: 'POST',
        credentials: 'include',
        mode: 'cors',
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || `Erreur : ${res.statusText}`);
      setCurrentUrl(data.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card card-body bg-secondary mb-3">
      <h5 className="card-title">Favicon du site</h5>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="d-flex align-items-center gap-3">
        {currentUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={currentUrl} alt="Favicon actuel" style={{ width: 32, height: 32 }} />
        )}
        <input
          type="file"
          accept=".ico,.png,.svg"
          className="form-control"
          style={{ maxWidth: 320 }}
          onChange={onFile}
          disabled={uploading}
        />
        {uploading && <span>Envoi...</span>}
      </div>
    </div>
  );
}
