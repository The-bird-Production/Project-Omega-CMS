'use client';
import Dashboard from '../../../components/admin/Dashboard';
import AdminLayout from '../../../components/layout/AdminLayout';
import Link from 'next/link';
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
          body: data, // Envoi des données au serveur
        }
      );

      if (response.ok) {
        const result = await response.json();
        router.push('/admin/image');
      } else {
        alert("Une erreur est survenue lors de l'upload de l'image.");
      }
    } catch (error) {
      console.error('Erreur réseau :', error);
    }
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
                  <Link href="/admin/image">Image</Link>
                </li>
                <li className="breadcrumb-item active">New</li>
              </ol>
            </nav>
          </div>
          <div className="card card-body bg-secondary">
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="mb-3">
                <label htmlFor="pageTitle" className="form-label">
                  Titre de l'image
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
        </Dashboard>
      </AdminLayout>
    </>
  );
}
