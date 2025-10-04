'use client';
import AdminLayout from '../../../../../components/layout/AdminLayout';
import Dashboard from '../../../../../components/admin/Dashboard';
import { useEffect } from 'react';
import { useState } from 'react';
import { pageSchema } from '../../../../../../lib/schema';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Editor } from '@tinymce/tinymce-react';
import { authClient } from '../../../../../../lib/authClient';
import { articleSchema } from '../../../../../../lib/schema';

export default function Page({ params }) {
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
      <AdminLayout>
        <Dashboard>
          <div className="pt-5 mt-5">
            <nav aria-label="breadcrumb" className="text-light">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link href="/admin">Dashboard</Link>
                </li>
                <li className="breadcrumb-item" aria-current="page">
                  <Link href="/admin/article">Article</Link>
                </li>
                <li className="breadcrumb-item active">
                  Edit / Draft / {params.id}
                </li>
              </ol>
            </nav>
          </div>
          <div className="card card-body bg-secondary">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="pageTitle" className="form-label">
                  Titre de l'article
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
                <Editor
                  apiKey="75lpz4hm0dsvol63mjrqfdqcbrjsey6zewt4wpoi6eoq160r"
                  init={{
                    plugins:
                      'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks',
                    toolbar:
                      'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
                  }}
                  initialValue={data.body}
                  onEditorChange={handleEditorChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="pageSlug" className="form-label">
                  Url de l'article : http://yoursite.com/article/
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
                <button className="btn btn-primary mx-2" onClick={handlePublish}>Publish</button>
              </div>
            </form>
          </div>
        </Dashboard>
      </AdminLayout>
    </>
  );
}
