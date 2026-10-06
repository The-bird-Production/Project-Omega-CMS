'use client';
import { useState } from 'react';
import { uploadImage } from './uploadImage';
import { fetchImageLibrary } from './imageLibrary';

// Used by Cover's banner and Gallery's photos — lets an admin either
// upload a new file (as before) or reuse an image that's already on the
// site: a previous upload (GET /image/get/all), or one of the active
// theme's own bundled assets (logo, hero banners — GET /api/theme-images,
// see that route for why it's a Next.js-side route rather than the API's).
// Re-uploading a copy of an image the theme already ships was the actual
// complaint this closes, not just "let me browse images".
//
// `multiple` (Gallery's "add photos" control): the file input accepts
// several files and the library lets several thumbnails be ticked, and
// onSelect then receives an array of urls (called once, when everything's
// ready) instead of a single url.
export default function ImagePicker({ onSelect, multiple = false, uploadLabel = 'Téléverser un fichier' }) {
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState([]);
  const [progress, setProgress] = useState(null);
  const [images, setImages] = useState(null);
  const [loading, setLoading] = useState(false);

  const openLibrary = async () => {
    setOpen(true);
    if (images) return;
    setLoading(true);
    try {
      setImages(await fetchImageLibrary());
    } finally {
      setLoading(false);
    }
  };

  const onFile = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;
    const urls = [];
    try {
      for (let i = 0; i < files.length; i++) {
        if (multiple) setProgress(`Téléversement ${i + 1}/${files.length}...`);
        urls.push(await uploadImage(files[i]));
      }
    } catch (err) {
      window.alert(err.message);
    } finally {
      setProgress(null);
    }
    if (urls.length === 0) return;
    if (multiple) onSelect(urls);
    else onSelect(urls[0]);
  };

  const toggleChosen = (url) =>
    setChosen((prev) => (prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]));

  return (
    <div className="omega-image-picker">
      <div className="omega-image-picker-actions">
        <label className="omega-image-picker-upload">
          {progress || uploadLabel}
          <input type="file" accept="image/*" multiple={multiple} onChange={onFile} onClick={(e) => e.stopPropagation()} hidden />
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
                  className={`omega-image-picker-thumb${chosen.includes(img.url) ? ' is-chosen' : ''}`}
                  onClick={() => {
                    if (multiple) {
                      toggleChosen(img.url);
                      return;
                    }
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
          {multiple && chosen.length > 0 && (
            <button
              type="button"
              className="omega-image-picker-confirm"
              onClick={() => {
                onSelect(chosen);
                setChosen([]);
                setOpen(false);
              }}
            >
              Ajouter {chosen.length} image{chosen.length > 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
