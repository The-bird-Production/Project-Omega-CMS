'use client';
import Breadcrumb from '../../../components/admin/ui/Breadcrumb';
import { useState } from 'react';
import { pageSchema } from '../../../../lib/schema';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const BlockEditor = dynamic(() => import('../../../components/admin/editor/BlockEditor'), { ssr: false });

export default function Page() {
  const [formData, setFormData] = useState({ title: '', body: '', slug: '' });
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      pageSchema.parse(formData);

      try {
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/page/create/`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          method: 'POST',
          mode: 'cors',
          body: JSON.stringify(formData),
        });

        router.push('/admin/page');
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
  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Page', href: '/admin/page' },
          { label: 'New' },
        ]}
      />
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
            />
          </div>
          <div className="mb-3">
            <BlockEditor value={formData.body} onChange={handleEditorChange} />
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
