import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect, useCallback } from 'react';
import { routing } from '../../../../i18n/routing';

export default function PageList() {
  const [rowData, setRowData] = useState([]);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/page/get/all`,
        {
          credentials: 'include',
          mode: 'cors',
        }
      );

      if (res.ok) {
        const data = await res.json();
        const jsonData = data.data;

        setRowData(jsonData);
      } else {
        console.error('Failed to fetch data:', res.statusText);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const intervalId = setInterval(fetchData, 15000);

    return () => clearInterval(intervalId);
  }, [fetchData]);

  const editPage = (slug, locale) => {
    router.push(`/admin/page/edit/${slug}?locale=${locale}`);
  };

  const delPage = async (id) => {


      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/page/delete/${id}`,
          {
            method: 'DELETE',
            credentials: 'include',
            mode: 'cors',
          }
        );

        if (res.ok) {
          setRowData((prevData) => prevData.filter((item) => item.id !== id));
        } else {
          console.error('Failed to delete image:', res.statusText);
        }
      } catch (error) {
        console.error('Error deleting image:', error);
      }

  };

  // Pre-fills a sensible default (same slug, the other configured locale)
  // since the most common reason to duplicate a page right now is
  // starting a translation — but both prompts are editable, so a plain
  // same-locale copy (new slug, same locale) works too.
  const duplicatePage = async (item) => {
    const otherLocale = routing.locales.find((l) => l !== (item.locale || 'fr')) || item.locale || 'fr';
    const slug = window.prompt('Slug de la nouvelle page :', item.slug);
    if (!slug) return;
    const locale = window.prompt(`Langue (${routing.locales.join(', ')}) :`, otherLocale);
    if (!locale) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/page/duplicate/${item.id}`,
        {
          method: 'POST',
          credentials: 'include',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, locale }),
        }
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        window.alert(body.message || "Erreur lors de la copie de la page.");
        return;
      }
      fetchData();
    } catch (error) {
      console.error('Error duplicating page:', error);
      window.alert('Erreur réseau lors de la copie de la page.');
    }
  };

  return rowData.map((item, index) => (
    <div className="card card-body m-3 bg-primary text-white" key={index}>
      <div className="container row">
        <div className="col-10">
          {item.title}{' '}
          {/* Bootstrap's .badge pairs with a .bg-* utility assuming it's a
              dark color and sets white text accordingly — this admin
              theme redefines --bs-secondary (and .text-bg-secondary) to a
              near-white surface color, so that pairing came out as
              literal white-on-white here. Explicit inline colors instead
              of relying on a theme-dependent utility pairing. */}
          <span
            style={{
              display: 'inline-block',
              padding: '0.25em 0.6em',
              fontSize: '0.75em',
              fontWeight: 700,
              color: '#fff',
              backgroundColor: '#495057',
              borderRadius: '0.375rem',
            }}
          >
            {(item.locale || 'fr').toUpperCase()}
          </span>
        </div>
        <div className="col-2">
          <button
            className="btn btn-secondary m-1"
            onClick={() => editPage(item.slug, item.locale || 'fr')}
          >
            <i className="bi bi-pencil-square"></i>
          </button>
          <button
            className="btn btn-secondary m-1"
            title="Dupliquer (ex. pour démarrer une traduction)"
            onClick={() => duplicatePage(item)}
          >
            <i className="bi bi-copy"></i>
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => delPage(item.id)}
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>
  ));
}
