'use client';
import { useEffect, useState } from 'react';
import { confirmAction } from '../../../lib/confirm';

// Site-wide, independent of the active theme (like FaviconSettings) — a
// theme's own CSS references a font by whatever family name the admin
// chose here (see apps/api/Controllers/Fonts/FontController.ts's
// generated @font-face CSS, linked from apps/web/app/layout.js).
export default function FontSettings() {
  const [fonts, setFonts] = useState(null);
  const [family, setFamily] = useState('');
  const [weight, setWeight] = useState('400');
  const [style, setStyle] = useState('normal');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/fonts/all`, { credentials: 'include' });
      const data = await res.json();
      setFonts(data.data || []);
    } catch {
      setFonts([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file || !family.trim()) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('font', file);
      formData.append('family', family.trim());
      formData.append('weight', weight);
      formData.append('style', style);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/fonts/upload`, {
        method: 'POST',
        credentials: 'include',
        mode: 'cors',
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || `Erreur : ${res.statusText}`);
      setFamily('');
      setWeight('400');
      setStyle('normal');
      setFile(null);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const onDelete = async (id) => {
    if (!confirmAction('Supprimer cette police ?')) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/fonts/delete/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        mode: 'cors',
      });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!fonts) return null;

  return (
    <div className="card card-body bg-secondary mb-3">
      <h5 className="card-title">Polices personnalisées</h5>
      <p className="text-muted small">
        Importez un fichier de police (.woff2, .woff, .ttf, .otf) pour la rendre disponible au thème actif sous le
        nom de famille choisi ci-dessous — référencez ce nom dans le CSS du thème comme n&apos;importe quelle police.
      </p>
      {error && <div className="alert alert-danger">{error}</div>}

      {fonts.length > 0 && (
        <ul className="list-group mb-3">
          {fonts.map((font) => (
            <li key={font.id} className="list-group-item d-flex justify-content-between align-items-center">
              <span>
                <strong>{font.family}</strong>{' '}
                <span className="text-muted small">
                  ({font.weight}, {font.style}) — {font.file}
                </span>
              </span>
              <button type="button" className="btn btn-sm btn-danger" onClick={() => onDelete(font.id)}>
                <i className="bi bi-trash" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={onSubmit} className="row g-2 align-items-end">
        <div className="col-md-3">
          <label className="form-label mb-1">Nom (font-family)</label>
          <input
            className="form-control"
            value={family}
            onChange={(e) => setFamily(e.target.value)}
            placeholder="Ma Police"
            required
          />
        </div>
        <div className="col-md-2">
          <label className="form-label mb-1">Graisse</label>
          <input className="form-control" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="400" />
        </div>
        <div className="col-md-2">
          <label className="form-label mb-1">Style</label>
          <select className="form-select" value={style} onChange={(e) => setStyle(e.target.value)}>
            <option value="normal">Normal</option>
            <option value="italic">Italique</option>
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label mb-1">Fichier</label>
          <input
            type="file"
            className="form-control"
            accept=".woff2,.woff,.ttf,.otf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
          />
        </div>
        <div className="col-md-2">
          <button type="submit" className="btn btn-primary w-100" disabled={uploading}>
            {uploading ? 'Envoi...' : 'Ajouter'}
          </button>
        </div>
      </form>
    </div>
  );
}
