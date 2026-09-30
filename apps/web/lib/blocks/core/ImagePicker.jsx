'use client';
import { useState } from 'react';
import { uploadImage } from './uploadImage';

// Used by Cover's banner and Gallery's photos — lets an admin either
// upload a new file (as before) or reuse an image that's already on the
// site: a previous upload (GET /image/get/all), or one of the active
// theme's own bundled assets (logo, hero banners — GET /api/theme-images,
// see that route for why it's a Next.js-side route rather than the API's).
// Re-uploading a copy of an image the theme already ships was the actual
// complaint this closes, not just "let me browse images".
export default function ImagePicker({ onSelect }) {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState(null);
  const [loading, setLoading] = useState(false);

  const openLibrary = async () => {
    setOpen(true);
    if (images) return;
    setLoading(true);
    try {
      const [uploadsRes, themeRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/image/get/all`, { credentials: 'include' })
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null),
        fetch('/api/theme-images')
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null),
      ]);
      const uploaded = (uploadsRes?.data?.files || []).map((f) => ({
        name: f.title || f.file,
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/image/${f.file}`,
      }));
      const theme = (themeRes?.images || []).map((img) => ({ ...img, fromTheme: true }));
      setImages([...theme, ...uploaded]);
    } finally {
      setLoading(false);
    }
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImage(file);
      onSelect(url);
    } catch (err) {
      window.alert(err.message);
    }
  };

  return (
    <div className="omega-image-picker">
      <div className="omega-image-picker-actions">
        <label className="omega-image-picker-upload">
          Téléverser un fichier
          <input type="file" accept="image/*" onChange={onFile} onClick={(e) => e.stopPropagation()} hidden />
        </label>
        <button type="button" onClick={openLibrary}>
          Choisir une image existante
        </button>
      </div>
      {open && (
        <div className="omega-image-picker-library">
          <div className="omega-image-picker-library-header">
            <span>Bibliothèque d&apos;images</span>
            <button type="button" className="omega-image-picker-close" onClick={() => setOpen(false)}>
              ×
            </button>
          </div>
          {loading && <p className="omega-image-picker-status">Chargement...</p>}
          {!loading && images?.length === 0 && (
            <p className="omega-image-picker-status">Aucune image disponible.</p>
          )}
          {!loading && images?.length > 0 && (
            <div className="omega-image-picker-grid">
              {images.map((img) => (
                <button
                  key={img.url}
                  type="button"
                  className="omega-image-picker-thumb"
                  onClick={() => {
                    onSelect(img.url);
                    setOpen(false);
                  }}
                  title={img.fromTheme ? `${img.name} (thème actif)` : img.name}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.name} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
