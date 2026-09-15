'use client';
import Breadcrumb from '../../../components/admin/ui/Breadcrumb';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewImage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    alt: '',
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!file) {
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('slug', formData.slug);
    data.append('alt', formData.alt);
    data.append('image', file);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/image/create`,
        {
          method: 'POST',
          credentials: 'include',
          mode: 'cors',
          body: data,
        }
      );

      if (response.ok) {
        router.push('/admin/image');
      } else {
        setError("Une erreur est survenue lors de l'upload de l'image.");
      }
    } catch (err) {
      console.error('Erreur réseau :', err);
      setError('Erreur réseau — impossible de contacter le serveur.');
    }
  };

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Image', href: '/admin/image' },
          { label: 'New' },
        ]}
      />
      <div className="card card-body bg-secondary">
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="mb-3">
            <label htmlFor="pageTitle" className="form-label">
              Titre de l&apos;image
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
            <label htmlFor="pageSlug" className="form-label">
              Slug : http://yoursite.com/image/
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
            <label htmlFor="imageAlt" className="form-label">
              Alt : Short description of the image
            </label>
            <input
              type="text"
              className="form-control"
              id="imageAlt"
              name="alt"
              onChange={handleChange}
              value={formData.alt}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="imageFile" className="form-label">
              File
            </label>
            <input
              type="file"
              id="imageFile"
              name="image"
              className="form-control"
              onChange={handleFileChange}
            />
          </div>
          <div className="mb-3">
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
