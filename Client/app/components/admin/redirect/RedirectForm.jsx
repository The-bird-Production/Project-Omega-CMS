'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { redirectSchema } from '../../../../lib/schema';
import { useRouter } from 'next/navigation';

export default function redirectForm() {
  const { data: session, status } = useSession();

  const [formData, setFormData] = useState({ title: '', from: '', to: '' });
  const router = useRouter();

  useEffect(() => {});

  const handleSubmit = async (event) => {
    event.preventDefault();
   

    try {
      redirectSchema.parse(formData);

      if (status === 'authenticated') {
        const token = session.accessToken || session.user.accessToken;
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/redirect/add/`, {
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
        } finally {
          router.refresh();
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
  return (
    <>
      <div className="card card-body bg-secondary text-light">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="pageSlug" className="form-label">
              Url de la redirection : http://yoursite.com/
            </label>
            
            <input
              type="text"
              className="form-control"
              id="pageTitle"
              name="from"
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
          <label htmlFor="pageTitle" className="form-label">
              To : 
            </label>
            <input
              type="text"
              className="form-control"
              id="pageSlug"
              name="to"
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
