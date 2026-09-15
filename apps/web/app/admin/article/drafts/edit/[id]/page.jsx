'use client';
import Breadcrumb from '../../../../../components/admin/ui/Breadcrumb';
import { useEffect, use } from 'react';
import { useState } from 'react';
import { pageSchema } from '../../../../../../lib/schema';
import { useRouter } from 'next/navigation';
import { authClient } from '../../../../../../lib/authClient';
import { articleSchema } from '../../../../../../lib/schema';
import { confirmAction } from '../../../../../../lib/confirm';
import TinyMCE from '../../../../../components/admin/article/tinyMCE';

export default function Page(props) {
  const params = use(props.params);
  const slug = params.id;

  const [formData, setFormData] = useState({ title: '', body: '', slug: '' });
  const [data, setData] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const fetchdata = async (slug) => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/article/draft/${slug}`,
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
          const jsonData = response;
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
  const handlePublish = async (event) => {
    event.preventDefault();
    if (!confirmAction('Publier cet article maintenant ? Il deviendra visible publiquement.')) {
      return;
    }
    try {
      const { data: session } = await authClient.getSession({});

      const updatedFormData = { ...formData, authorId: session.user.id };

      // Validation
      articleSchema.parse(updatedFormData);

      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/article/create/`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(updatedFormData),
      });

      router.push('/admin/article');
    } catch (e) {
      console.error('Submit error:', e);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      pageSchema.parse(formData);

      try {
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/article/draft/`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          method: 'PUT',
          mode: 'cors',
          body: JSON.stringify(formData),
        });

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
  if (!data) {
    return (
      <div>
        <div className="loader">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Article', href: '/admin/article' },
          { label: `Edit / Draft / ${params.id}` },
        ]}
      />
      <div className="card card-body bg-secondary">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="pageTitle" className="form-label">
                  Titre de l&apos;article
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
                <TinyMCE value={formData.body} onChange={handleEditorChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="pageSlug" className="form-label">
                  Url de l&apos;article : http://yoursite.com/article/
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
                <button className="btn btn-primary">Update</button>
                <button
                  className="btn btn-success mx-2"
                  onClick={handlePublish}
                >
                  <i className="bi bi-send-check me-1" /> Publish
                </button>
              </div>
            </form>
          </div>
    </>
  );
}
