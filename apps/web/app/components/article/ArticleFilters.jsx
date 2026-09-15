'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function ArticleFilters({ categories, tags }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get('q') || '');
  const category = searchParams.get('category') || '';
  const tag = searchParams.get('tag') || '';

  const applyFilters = (next) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    params.delete('page'); // Un changement de filtre repart de la première page
    router.push(`/article?${params.toString()}`);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    applyFilters({ q });
  };

  return (
    <form onSubmit={handleSubmit} className="row g-2 mb-4">
      <div className="col-md-5">
        <input
          type="search"
          className="form-control"
          placeholder="Rechercher un article..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Rechercher un article"
        />
      </div>
      <div className="col-md-3">
        <select
          className="form-select"
          value={category}
          onChange={(e) => applyFilters({ category: e.target.value })}
          aria-label="Filtrer par catégorie"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="col-md-3">
        <select
          className="form-select"
          value={tag}
          onChange={(e) => applyFilters({ tag: e.target.value })}
          aria-label="Filtrer par tag"
        >
          <option value="">Tous les tags</option>
          {tags.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div className="col-md-1">
        <button type="submit" className="btn btn-primary w-100">
          OK
        </button>
      </div>
    </form>
  );
}
