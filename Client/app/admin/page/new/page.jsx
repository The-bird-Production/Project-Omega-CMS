'use client';
import AdminLayout from '../../../components/layout/AdminLayout';
import Dashboard from '../../../components/admin/Dashboard';
import { useEffect } from 'react';
import { useState } from 'react';
import { pageSchema } from '../../../../lib/schema';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Editor } from '@tinymce/tinymce-react';

export default function Page({ params }) {
  const [formData, setFormData] = useState({ title: '', body: '', slug: '' });
  const [data, setData] = useState(null);
  const router = useRouter();

  useEffect(() => {});

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
      <AdminLayout>
        <Dashboard>
          <div className="pt-5 mt-5">
            <nav aria-label="breadcrumb" className="text-light">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link href="/admin">Dashboard</Link>
                </li>
                <li className="breadcrumb-item" aria-current="page">
                  <Link href="/admin/page">Page</Link>
                </li>
                <li className="breadcrumb-item active">New</li>
              </ol>
            </nav>
          </div>
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
                <Editor
                  apiKey="75lpz4hm0dsvol63mjrqfdqcbrjsey6zewt4wpoi6eoq160r"
                  init={{
                    plugins:
                      'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks',
                    toolbar:
                      'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
                  }}
                  initialValue="Page Content"
                  onEditorChange={handleEditorChange}
                />
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
        </Dashboard>
      </AdminLayout>
    </>
  );
}
