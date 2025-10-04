'use client';
import AdminLayout from '../../../components/layout/AdminLayout';
import Dashboard from '../../../components/admin/Dashboard';
import { useEffect, useState, useRef } from 'react';
import { articleSchema, articleDraftSchema } from '../../../../lib/schema';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Editor } from '@tinymce/tinymce-react';
import { v4 } from 'uuid';
import { authClient } from '../../../../lib/authClient';

export default function Page({ params }) {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    slug: '',
    authorId: '',
    draftId: v4(),
  });

  const formDataRef = useRef(formData);
  const router = useRouter();

  // Met à jour la ref à chaque changement de formData
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // Fonction pour sauvegarder le draft
  const saveDraft = async () => {
    const currentFormData = { ...formDataRef.current };
    try {
      const { data: session } = await authClient.getSession({});
      if (!session?.user) return;

      currentFormData.authorId = session.user.id;

      // Validation
      articleDraftSchema.parse(currentFormData);

      // Envoi
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/article/draft/`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(currentFormData),
      });

      console.log('Draft saved', currentFormData);
    } catch (e) {
      console.error('Draft error:', e);
    }
  };

  // Sauvegarde initiale + intervalle
  useEffect(() => {
    saveDraft();
    const interval = setInterval(saveDraft, 30000);
    return () => clearInterval(interval);
  }, []);

  // Soumission finale
  const handleSubmit = async (event) => {
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

  // Gestion des champs texte
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Gestion de TinyMCE
  const handleEditorChange = (content) => {
    setFormData((prev) => ({ ...prev, body: content }));
  };

  return (
    <AdminLayout>
      <Dashboard>
        <div className="pt-5 mt-5">
          <nav aria-label="breadcrumb" className="text-light">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link href="/admin">Dashboard</Link>
              </li>
              <li className="breadcrumb-item">
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
                value={formData.title}
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
                value={formData.body}
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
                value={formData.slug}
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
  );
}
