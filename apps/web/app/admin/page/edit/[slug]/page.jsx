'use client';
import Breadcrumb from '../../../../components/admin/ui/Breadcrumb';
import LoadingSpinner from '../../../../components/admin/ui/LoadingSpinner';
import { useEffect, use } from 'react';
import { useState } from 'react';
import { pageSchema } from '../../../../../lib/schema';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { listPageTemplates } from '../../../../../lib/pageTemplates/discoverClient';

const BlockEditor = dynamic(() => import('../../../../components/admin/editor/BlockEditor'), { ssr: false });

export default function Page(props) {
  const params = use(props.params);
  const slug = params.slug;

  const [formData, setFormData] = useState({ title: '', body: '', slug: '', template: '' });
  const [data, setData] = useState(null);
  const [templates, setTemplates] = useState([]);

  const router = useRouter();

  useEffect(() => {
    listPageTemplates().then(setTemplates);
  }, []);

  useEffect(() => {
    const fetchdata = async (slug) => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/page/get/${slug}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            mode: 'cors',
          }
        );

        if (res.ok) {
          const response = await res.json();
          const jsonData = response.data;
          setData(jsonData);

          setFormData({
            title: jsonData.title,
            body: jsonData.body,
            slug: jsonData.slug,
            template: jsonData.template || '',
          });
        } else {
          console.error('Failed to fetch data:', res.statusText);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    if (!data) {
      fetchdata(slug);
    }
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      pageSchema.parse(formData);

      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/page/update/${data.id}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            method: 'POST',
            mode: 'cors',
            body: JSON.stringify(formData),
          }
        );

        router.refresh();
      } catch (e) {
        console.log(e);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });
  };
  const handleEditorChange = (content) => {
    setFormData({ ...formData, body: content });
  };

  const breadcrumb = (
    <Breadcrumb
      items={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Page', href: '/admin/page' },
        { label: `Edit / ${params.slug}` },
      ]}
    />
  );

  if (!data) {
    return (
      <>
        {breadcrumb}
        <LoadingSpinner />
      </>
    );
  }
  return (
    <>
      {breadcrumb}
      <div className="card card-body bg-secondary">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="pageTitle" className="form-label">
              Titre de la page
            </label>
            <input
              type="text"
              className="form-control"
              id="pageTitle"
              name="title"
              onChange={handleChange}
              value={formData.title}
            />
          </div>
          {templates.length > 0 && (
            <div className="mb-3">
              <label htmlFor="pageTemplate" className="form-label">
                Modèle de page
              </label>
              <select
                id="pageTemplate"
                className="form-select"
                name="template"
                value={formData.template}
                onChange={handleChange}
              >
                <option value="">Rendu par blocs (par défaut)</option>
                {templates.map((tpl) => (
                  <option key={tpl.name} value={tpl.name}>
                    {tpl.label || tpl.name}
                  </option>
                ))}
              </select>
              <div className="form-text">
                Fourni par le thème actif. Le contenu ci-dessous reste disponible au modèle si besoin.
              </div>
            </div>
          )}
          <div className="mb-3">
            <BlockEditor value={data.body} onChange={handleEditorChange} />
          </div>
          <div className="mb-3">
            <label htmlFor="pageSlug" className="form-label">
              Url de la page : http://yoursite.com/
            </label>
            <input
              type="text"
              className="form-control"
              id="pageSlug"
              name="slug"
              onChange={handleChange}
              value={formData.slug}
            />
          </div>
          <div className="mb-3">
            <button className="btn btn-primary">Submit</button>
          </div>
        </form>
      </div>
    </>
  );
}
