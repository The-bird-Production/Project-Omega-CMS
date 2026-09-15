'use client';
import Breadcrumb from '../../../components/admin/ui/Breadcrumb';
import { useEffect, useState, useRef } from 'react';
import { articleSchema, articleDraftSchema } from '../../../../lib/schema';
import { useRouter } from 'next/navigation';
import TinyMCE from '../../../components/admin/article/tinyMCE';
import { v4 } from 'uuid';
import { authClient } from '../../../../lib/authClient';

export default function Page() {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    slug: '',
    authorId: '',
    category: '',
    tags: '',
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
    <>
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Article', href: '/admin/article' },
          { label: 'New' },
        ]}
      />

      <div className="card card-body bg-secondary">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="articleTitle" className="form-label">
                Titre de l&apos;article
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
             <TinyMCE value={formData.body} onChange={handleEditorChange}/>
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
                value={formData.slug}
                onChange={handleChange}
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
                value={formData.category}
                onChange={handleChange}
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
                value={formData.tags}
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
