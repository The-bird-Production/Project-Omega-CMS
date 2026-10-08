'use client';
import { useState } from 'react';
import Link from 'next/link';
import Breadcrumb from '../../../components/admin/ui/Breadcrumb';
import LoadingSpinner from '../../../components/admin/ui/LoadingSpinner';
import { confirmAction } from '../../../../lib/confirm';

const STATUS_LABEL = {
  imported: { text: 'Importé', className: 'bg-success' },
  skipped: { text: 'Déjà présent', className: 'bg-secondary' },
  failed: { text: 'Échec', className: 'bg-danger' },
};

// Imports the published articles of an older Project Omega site (its
// API) — see apps/api/lib/articleImport.ts. "Simuler" previews what would
// be imported without writing anything; "Importer" does it for real.
export default function ImportArticles() {
  const [source, setSource] = useState('');
  const [running, setRunning] = useState(null); // 'dry' | 'real' | null
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  const run = async (dryRun) => {
    if (!dryRun && !confirmAction(`Importer les articles de ${source} dans ce site ?`)) return;
    setRunning(dryRun ? 'dry' : 'real');
    setError('');
    setReport(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/article/import`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, dryRun }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || `Erreur ${res.status}`);
      setReport(json);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setRunning(null);
    }
  };

  return (
    <>
      <Breadcrumb
        items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Articles', href: '/admin/article' }, { label: 'Importer' }]}
      />

      <div className="card card-body bg-secondary text-light">
        <h2 className="card-title mb-2">Importer des articles</h2>
        <p className="mb-3">
          Récupère les articles publiés d&apos;un ancien site Project Omega : le contenu est converti au nouvel éditeur
          et les images sont copiées dans la bibliothèque. Les articles déjà présents (même adresse ou même titre) sont
          ignorés, vous pouvez donc relancer l&apos;import sans créer de doublons.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(true);
          }}
        >
          <label htmlFor="importSource" className="form-label">
            Adresse de l&apos;API de l&apos;ancien site
          </label>
          <input
            id="importSource"
            type="url"
            className="form-control mb-1"
            placeholder="https://backend-omega.aupieddumorclan.fr"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            required
            disabled={!!running}
          />
          <div className="form-text text-light opacity-75 mb-3">
            L&apos;adresse du serveur (backend) de l&apos;ancien site, pas celle du site public.
          </div>

          <div className="d-flex flex-wrap gap-2">
            <button type="submit" className="btn btn-outline-light" disabled={!source || !!running}>
              <i className="bi bi-eye me-1" /> Simuler
            </button>
            <button type="button" className="btn btn-primary" disabled={!source || !!running} onClick={() => run(false)}>
              <i className="bi bi-cloud-download me-1" /> Importer
            </button>
          </div>
        </form>

        {running && (
          <LoadingSpinner
            label={running === 'dry' ? 'Simulation en cours…' : 'Import en cours (téléchargement des images)… ne fermez pas la page.'}
          />
        )}

        {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}

        {report && <ImportReport report={report} />}
      </div>
    </>
  );
}

function ImportReport({ report }) {
  return (
    <div className="mt-4">
      <div className={`alert ${report.failed > 0 ? 'alert-warning' : 'alert-success'}`}>
        {report.dryRun && <strong>Simulation : rien n&apos;a été enregistré. </strong>}
        {report.imported} article(s) {report.dryRun ? 'à importer' : 'importé(s)'}, {report.skipped} déjà présent(s),{' '}
        {report.failed} échec(s), {report.imageCount} image(s) {report.dryRun ? 'à récupérer' : 'récupérée(s)'}.
        {!report.dryRun && report.imported > 0 && (
          <>
            {' '}
            <Link href="/admin/article" className="alert-link">
              Voir les articles
            </Link>
          </>
        )}
      </div>

      {report.articles.length > 0 && (
        <div className="table-responsive">
          <table className="table table-sm align-middle">
            <thead>
              <tr>
                <th>Article</th>
                <th>Adresse</th>
                <th>Images</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {report.articles.map((a) => (
                <tr key={a.slug}>
                  <td>{a.title}</td>
                  <td>
                    <code>/article/{a.slug}</code>
                  </td>
                  <td>{a.images ?? '–'}</td>
                  <td>
                    <span className={`badge ${STATUS_LABEL[a.status].className}`}>{STATUS_LABEL[a.status].text}</span>
                    {a.error && <div className="small text-danger">{a.error}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {report.imageFailures.length > 0 && (
        <div className="alert alert-warning">
          <strong>{report.imageFailures.length} image(s) n&apos;ont pas pu être récupérées</strong> (elles restent liées
          à l&apos;ancien site) :
          <ul className="mb-0 small">
            {report.imageFailures.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
