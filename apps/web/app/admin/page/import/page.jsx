'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Breadcrumb from '../../../components/admin/ui/Breadcrumb';
import LoadingSpinner from '../../../components/admin/ui/LoadingSpinner';
import { confirmAction } from '../../../../lib/confirm';

const API = process.env.NEXT_PUBLIC_BACKEND_URL;
const LOCALES = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
];
const STATUS = {
  created: { text: 'Créée', className: 'bg-success' },
  updated: { text: 'Remplacée', className: 'bg-primary' },
  skipped: { text: 'Déjà présente, ignorée', className: 'bg-secondary' },
  failed: { text: 'Échec', className: 'bg-danger' },
};

async function postJson(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(res.status === 413 ? 'Fichier trop volumineux pour être envoyé.' : json.message || `Erreur ${res.status}`);
  }
  return json;
}

// Imports pages in the theme content format — content/pages/<slug>.json,
// { title, body } with body the editor's block list — either straight from
// the active theme, or from JSON files picked on this computer. See
// apps/api/Functions/PageImport.ts.
export default function ImportPages() {
  const [locale, setLocale] = useState('fr');
  const [overwrite, setOverwrite] = useState(false);
  const [theme, setTheme] = useState({ loading: true, data: null, error: '' });
  const [selected, setSelected] = useState(new Set());
  const [files, setFiles] = useState([]);
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  const loadTheme = useCallback(async () => {
    setTheme((t) => ({ ...t, loading: true, error: '' }));
    try {
      const res = await fetch(`${API}/page/import/theme?locale=${locale}`, { credentials: 'include' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || `Erreur ${res.status}`);
      setTheme({ loading: false, data: json, error: '' });
      // Preselect what's missing: importing those never touches the owner's pages.
      setSelected(new Set(json.pages.filter((p) => !p.exists && !p.error).map((p) => p.slug)));
    } catch (e) {
      setTheme({ loading: false, data: null, error: e.message || String(e) });
    }
  }, [locale]);

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  const toggle = (slug) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });

  const onPickFiles = async (e) => {
    const picked = [...(e.target.files || [])];
    const read = await Promise.all(
      picked.map(async (file) => {
        try {
          const data = JSON.parse(await file.text());
          const slug = (typeof data?.slug === 'string' && data.slug) || file.name.replace(/\.json$/i, '');
          const ok = data && typeof data.title === 'string' && Array.isArray(data.body);
          return { fileName: file.name, slug, title: data?.title, data, error: ok ? '' : 'Format attendu : { "title": "…", "body": [ …blocs… ] }' };
        } catch {
          return { fileName: file.name, slug: file.name, error: 'Ce fichier ne contient pas du JSON valide.' };
        }
      })
    );
    setFiles(read);
    setReport(null);
  };

  const confirmOverwrite = (count) =>
    !overwrite || confirmAction(`Remplacer le titre et le contenu des pages déjà présentes (${count} page(s) concernée(s) au plus) ?`);

  const importFromTheme = async () => {
    if (selected.size === 0 || !confirmOverwrite(selected.size)) return;
    setRunning(true);
    setError('');
    setReport(null);
    try {
      setReport(await postJson('/page/import/theme', { slugs: [...selected], overwrite, locale }));
      await loadTheme();
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setRunning(false);
    }
  };

  const importFiles = async () => {
    const valid = files.filter((f) => !f.error);
    if (valid.length === 0 || !confirmOverwrite(valid.length)) return;
    setRunning(true);
    setError('');
    setReport(null);
    // One request per file: keeps each request well under the API's body size limit.
    const results = files.filter((f) => f.error).map((f) => ({ slug: f.slug, status: 'failed', error: f.error }));
    for (const f of valid) {
      try {
        const json = await postJson('/page/import', { pages: [{ fileName: f.fileName, data: f.data }], overwrite, locale });
        results.push(...json.results);
      } catch (e) {
        results.push({ slug: f.slug, title: f.title, status: 'failed', error: e.message || String(e) });
      }
    }
    const count = (s) => results.filter((r) => r.status === s).length;
    setReport({ results, created: count('created'), updated: count('updated'), skipped: count('skipped'), failed: count('failed') });
    setRunning(false);
    loadTheme();
  };

  const themePages = theme.data?.pages ?? [];

  return (
    <>
      <Breadcrumb
        items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Pages', href: '/admin/page' }, { label: 'Importer' }]}
      />

      <div className="card card-body bg-secondary text-light mb-3">
        <h2 className="card-title mb-2">Importer des pages</h2>
        <p className="mb-3">
          Importe des pages au format des thèmes Omega (<code>content/pages/&lt;adresse&gt;.json</code>, contenant{' '}
          <code>title</code> et <code>body</code>). Par défaut, une page qui existe déjà à la même adresse n&apos;est
          pas modifiée.
        </p>
        <div className="d-flex flex-wrap align-items-center gap-3">
          <label htmlFor="importLocale" className="d-flex align-items-center gap-2 mb-0">
            Langue des pages
            <select id="importLocale" className="form-select form-select-sm" style={{ width: 'auto' }} value={locale}
              onChange={(e) => setLocale(e.target.value)} disabled={running}>
              {LOCALES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </label>
          <div className="form-check mb-0">
            <input id="importOverwrite" type="checkbox" className="form-check-input" checked={overwrite}
              onChange={(e) => setOverwrite(e.target.checked)} disabled={running} />
            <label htmlFor="importOverwrite" className="form-check-label">
              Remplacer les pages déjà présentes (leur titre et leur contenu seront écrasés)
            </label>
          </div>
        </div>
      </div>

      <div className="card card-body bg-secondary text-light mb-3">
        <h3 className="h5 card-title">
          Pages du thème {theme.data?.theme ? `« ${theme.data.theme.name} »` : 'actif'}
        </h3>
        {theme.loading ? (
          <LoadingSpinner label="Lecture des pages du thème…" />
        ) : theme.error ? (
          <div className="alert alert-danger mb-0">{theme.error}</div>
        ) : !theme.data?.theme ? (
          <p className="mb-0">
            Aucun thème installé : seul le thème par défaut est actif. <Link href="/admin/themes">Installer un thème</Link>
          </p>
        ) : themePages.length === 0 ? (
          <p className="mb-0">Ce thème ne fournit aucune page (pas de dossier <code>content/pages</code>).</p>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-3">
                <thead>
                  <tr>
                    <th scope="col"><span className="visually-hidden">Sélection</span></th>
                    <th scope="col">Page</th>
                    <th scope="col">Adresse</th>
                    <th scope="col">Sur le site</th>
                  </tr>
                </thead>
                <tbody>
                  {themePages.map((p) => (
                    <tr key={p.slug}>
                      <td>
                        <input type="checkbox" className="form-check-input" aria-label={`Importer ${p.title || p.slug}`}
                          checked={selected.has(p.slug)} disabled={!!p.error || running} onChange={() => toggle(p.slug)} />
                      </td>
                      <td>{p.title || <em>{p.slug}.json</em>}</td>
                      <td><code>/{p.slug === 'home' ? '' : p.slug}</code></td>
                      <td>
                        {p.error ? (
                          <span className="text-danger small">{p.error}</span>
                        ) : p.exists ? (
                          <span className="badge bg-secondary">Déjà présente</span>
                        ) : (
                          <span className="badge bg-warning text-dark">Absente</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <button type="button" className="btn btn-primary" disabled={running || selected.size === 0} onClick={importFromTheme}>
                <i className="bi bi-box-arrow-in-down me-1" /> Importer la sélection ({selected.size})
              </button>
            </div>
          </>
        )}
      </div>

      <div className="card card-body bg-secondary text-light mb-3">
        <h3 className="h5 card-title">Depuis des fichiers JSON</h3>
        <p className="mb-2">
          Fichiers au même format, par exemple récupérés dans le dossier <code>content/pages</code> d&apos;un thème. Le
          nom du fichier donne l&apos;adresse de la page (<code>faq.json</code> → <code>/faq</code>), sauf si le fichier
          contient un champ <code>slug</code>.
        </p>
        <label htmlFor="importFiles" className="visually-hidden">Fichiers JSON à importer</label>
        <input id="importFiles" type="file" accept=".json,application/json" multiple className="form-control mb-3"
          style={{ maxWidth: 480 }} onChange={onPickFiles} disabled={running} />
        {files.length > 0 && (
          <>
            <ul className="list-unstyled small mb-3">
              {files.map((f) => (
                <li key={f.fileName}>
                  <code>{f.fileName}</code> → {f.error ? <span className="text-danger">{f.error}</span> : <>« {f.title} » sur <code>/{f.slug === 'home' ? '' : f.slug}</code></>}
                </li>
              ))}
            </ul>
            <button type="button" className="btn btn-primary" disabled={running || files.every((f) => f.error)} onClick={importFiles}>
              <i className="bi bi-upload me-1" /> Importer {files.filter((f) => !f.error).length} fichier(s)
            </button>
          </>
        )}
      </div>

      {running && <LoadingSpinner label="Import en cours…" />}
      {error && <div className="alert alert-danger">{error}</div>}
      {report && <ImportReport report={report} />}
    </>
  );
}

function ImportReport({ report }) {
  return (
    <div className="card card-body bg-secondary text-light mb-3" role="status">
      <h3 className="h5 card-title">Résultat</h3>
      <p className="mb-2">
        {report.created} créée(s), {report.updated} remplacée(s), {report.skipped} ignorée(s), {report.failed} échec(s).{' '}
        <Link href="/admin/page">Voir les pages</Link>
      </p>
      <ul className="list-unstyled mb-0">
        {report.results.map((r, i) => (
          <li key={`${r.slug}-${i}`} className="mb-1">
            <span className={`badge ${STATUS[r.status].className} me-2`}>{STATUS[r.status].text}</span>
            {r.title ? `« ${r.title} » ` : ''}<code>/{r.slug === 'home' ? '' : r.slug}</code>
            {r.error && <span className="text-danger small ms-2">{r.error}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
