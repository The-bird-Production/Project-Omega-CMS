'use client';
import Breadcrumb from '../../../../components/admin/ui/Breadcrumb';
import { useEffect, use } from 'react';
import { useState } from 'react';
import { pageSchema } from '../../../../../lib/schema';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const BlockEditor = dynamic(() => import('../../../../components/admin/editor/BlockEditor'), { ssr: false });

export default function Page(props) {
  const params = use(props.params);
  const slug = params.slug;

  const [formData, setFormData] = useState({ title: '', body: '', slug: '', category: '', tags: '' });
  const [data, setData] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const fetchdata = async (slug) => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/article/${slug}`,
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
            category: jsonData.category || '',
            tags: jsonData.tags || '',
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
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/article/update/${data.slug}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            method: 'PUT',
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
          { label: `Edit / ${params.slug}` },
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
                <BlockEditor value={data.body} onChange={handleEditorChange} />
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
                <label htmlFor="articleCategory" className="form-label">
                  Catégorie
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="articleCategory"
                  name="category"
                  onChange={handleChange}
                  value={formData.category}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="articleTags" className="form-label">
                  Tags (séparés par des virgules)
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="articleTags"
                  name="tags"
                  onChange={handleChange}
                  value={formData.tags}
                />
              </div>
              <div className="mb-3">
                <button className="btn btn-primary">Update</button>
              </div>
            </form>
          </div>
    </>
  );
}
