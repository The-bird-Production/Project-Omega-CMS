'use client';
import Breadcrumb from '../../../../components/admin/ui/Breadcrumb';
import LoadingSpinner from '../../../../components/admin/ui/LoadingSpinner';
import { useEffect, use } from 'react';
import { useState } from 'react';
import { imageUpdateSchema } from '../../../../../lib/schema';
import { useRouter } from 'next/navigation';
import Notification from '../../../../components/admin/image/ModifNotify';

export default function Page(props) {
  const params = use(props.params);
  const slug = params.slug;

  const [errors, setErrors] = useState({ title: '', alt: '', slug: '' });
  const [formData, setFormData] = useState({ title: '', alt: '', slug: '' });
  const [data, setData] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchdata = async (slug) => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/image/get/${slug}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            mode: 'cors',
          }
        );

        if (res.ok) {
          const data = await res.json();
          const jsonData = data.data;

          setData(jsonData);
          setFormData({
            title: jsonData.title,
            alt: jsonData.alt,
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      imageUpdateSchema.parse(formData);

      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/image/update/${data.id}`,
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

        setShowNotification(true);
        setErrors({ title: '', alt: '', slug: '' });
        router.refresh();
      } catch (e) {
        console.log(e);
      }
    } catch (e) {
      const errorMessages = {};
      e.errors.forEach((error) => {
        errorMessages[error.path[0]] = error.message;
      });
      setErrors(errorMessages);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });
  };

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Image', href: '/admin/image' },
          { label: `Edit / ${params.slug}` },
        ]}
      />
      <div className="row">
        {!data ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="col-12 col-lg-6">
              <img
                className="img-fluid"
                crossOrigin="anonymous"
                src={data.path}
                alt={data.alt}
              ></img>
            </div>
            <div className="col-12 col-lg-6">
              <div className="card card-body bg-secondary rounded">
                <h3>Modification de l&apos;image</h3>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="ImageTitle" className="form-label">
                      Titre de l&apos;image
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.title}
                      id="ImageTitle"
                      name="title"
                      onChange={handleChange}
                    />
                    {errors.title && <p className="text-danger mb-0">{errors.title}</p>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="ImageAlt" className="form-label">
                      Alt
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="ImageAlt"
                      value={formData.alt}
                      name="alt"
                      onChange={handleChange}
                    />
                    {errors.alt && <p className="text-danger mb-0">{errors.alt}</p>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="ImageSlug" className="form-label">
                      Slug
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="ImageSlug"
                      value={formData.slug}
                      onChange={handleChange}
                      name="slug"
                    ></input>
                    {errors.slug && <p className="text-danger mb-0">{errors.slug}</p>}
                  </div>
                  <button className="btn btn-primary" type="submit">
                    Modifier
                  </button>
                  <Notification
                    message="Modification effectuée avec succès"
                    show={showNotification}
                  />
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
