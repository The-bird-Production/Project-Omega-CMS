'use client';
import AdminLayout from '../../../components/layout/AdminLayout';
import Dashboard from '../../../components/admin/Dashboard';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useState, useRef } from 'react';
import { articleSchema, articleDraftSchema } from '../../../../lib/schema';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Editor } from '@tinymce/tinymce-react';
import { v4 } from 'uuid';

export default function Page({ params }) {
  const { data: session, status } = useSession();

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    slug: '',
    authorId: session.user.id,
    draftId: v4(),
  });
  const [data, setData] = useState(null);
  const router = useRouter();

  //Save draft every 30 seconds
  const saveDraft = async () => {
    try {
      articleDraftSchema.parse(formData);

      if (status === 'authenticated') {
        const token = session.accessToken || session.user.accessToken;
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/article/draft/`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            method: 'POST',
            mode: 'cors',
            body: JSON.stringify(formData),
          });
        } catch (e) {
          console.log(e);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  const formDataRef = useRef(formData);
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  useEffect(() => {
    saveDraft(); // sauvegarde initiale
    const interval = setInterval(saveDraft, 30000);
    return () => clearInterval(interval);
  }, [status, session]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setFormData({ ...formData, authorId: session.user.id });
      console.log(formData);
      articleSchema.parse(formData);

      if (status === 'authenticated') {
        const token = session.accessToken || session.user.accessToken;
        try {
          await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/article/create/`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              method: 'POST',
              mode: 'cors',
              body: JSON.stringify(formData),
            }
          );

          router.push('/admin/article');
        } catch (e) {
          console.log(e);
        }
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
                  <Link href="/admin/article">Article</Link>
                </li>
                <li className="breadcrumb-item active">New</li>
              </ol>
            </nav>
          </div>
          <div className="card card-body bg-secondary">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="articleTitle" className="form-label">
                  Titre de l'article
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="articleTitle"
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
                  initialValue="Article content "
                  onEditorChange={handleEditorChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="pageSlug" className="form-label">
                  Url de l'article' : http://yoursite.com/article/
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
