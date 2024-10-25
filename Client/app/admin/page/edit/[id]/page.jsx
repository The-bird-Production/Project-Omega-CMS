'use client';
import AdminLayout from '../../../../components/layout/AdminLayout';
import Dashboard from '../../../../components/admin/Dashboard';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { imageUpdateSchema } from '../../../../../lib/schema';
import { useRouter } from 'next/navigation';
import Notification from '../../../../components/admin/image/ModifNotify';
import Link from 'next/link';

export default function Page({ params }) {
  const slug = params.slug;
  const { data: session, status } = useSession();

  const [errors, setErrors] = useState({ title: '', alt: '', slug: '' });
  const [formData, setFormData] = useState({ title: '', alt: '', slug: '' });
  const [data, setData] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchdata = async (slug) => {
      if (status === 'authenticated') {
        const token = session.accessToken || session.user.accessToken;
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/image/get/${slug}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
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

      if (status === 'authenticated') {
        const token = session.accessToken || session.user.accessToken;
        try {
          await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/image/update/${data.id}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
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
      <AdminLayout>
        <Dashboard>
          <div className="pt-5 mt-5">
            <nav aria-label="breadcrumb" className='text-light'>
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link href="/admin">Dashboard</Link>
                </li>
                <li className="breadcrumb-item" aria-current="page">
                  <Link href="/admin/image">Page</Link>
                </li>
                <li className='breadcrumb-item active'>
                  Edit / {params.slug}

                </li>
              </ol>
            </nav>
            </div>
        </Dashboard>
      </AdminLayout>
    </>
  );
}
