'use client';
import Breadcrumb from '../../../../components/admin/ui/Breadcrumb';
import LoadingSpinner from '../../../../components/admin/ui/LoadingSpinner';
import { useEffect, use } from 'react';
import { useState } from 'react';
import { pageSchema } from '../../../../../lib/schema';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const BlockEditor = dynamic(() => import('../../../../components/admin/editor/BlockEditor'), { ssr: false });

export default function Page(props) {
  const params = use(props.params);
  const slug = params.slug;

  const [formData, setFormData] = useState({ title: '', body: '', slug: '' });
  const [data, setData] = useState(null);

  const router = useRouter();

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
