'use client';

import { useEffect, useState, use } from 'react';
import Breadcrumb from '../../../../components/admin/ui/Breadcrumb';
import LoadingSpinner from '../../../../components/admin/ui/LoadingSpinner';
import FormatedDate from '../../../../components/util/FormatedDate';
import { userSchema } from '../../../../../lib/schema';
import { authClient } from '../../../../../lib/authClient';

export default function Page(props) {
  const params = use(props.params);
  const id = params.id;
  const [userData, setUserData] = useState({});
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/get/${id}`,
          {
            method: 'GET',
            credentials: 'include',
            mode: 'cors',
          }
        );

        if (res.ok) {
          const data = await res.json();
          const jsonData = data;

          setUserData(jsonData);
        } else {
          console.error('Failed to fetch data:', res.statusText);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (userData && Object.keys(userData).length > 0) {
      setFormData({
        username: userData.username || userData.name || '',
        name: userData.name || '',
        email: userData.email || '',
        emailVerified: userData.emailVerified || false,
        role: userData.role || '',
      });
    }
  }, [userData]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const validation = userSchema.safeParse(formData);
      if (!validation.success) {
        console.error('Validation error:', validation.error);
        return;
      }

      const { error } = await authClient.admin.updateUser({
        userId: id,
        data: {
          name: formData.name,
          username: formData.username,
          email: formData.email,
          emailVerified: formData.emailVerified,
          role: formData.role,
        },
      });

      if (error) {
        console.error('Update error:', error);
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const breadcrumb = (
    <Breadcrumb
      items={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Utilisateurs', href: '/admin/user' },
        { label: userData.id || id },
      ]}
    />
  );

  if (Object.keys(userData).length === 0) {
    return (
      <>
        {breadcrumb}
        <LoadingSpinner label="Chargement des données utilisateur..." />
      </>
    );
  }

  return (
    <>
      {breadcrumb}
      <div className="card">
        <div className="card-body bg-secondary rounded border border-secondary">
          <h2 className="card-title text-light">Modification d&apos;utilisateur</h2>
          <form onSubmit={handleSubmit}>
            <div className="row g-3 pt-2">
              <div className="col-md-6">
                <label htmlFor="userName" className="form-label">
                  Nom
                </label>
                <input
                  id="userName"
                  type="text"
                  name="name"
                  onChange={handleChange}
                  value={formData.name || ''}
                  className="form-control"
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="userEmail" className="form-label">
                  Email
                </label>
                <input
                  id="userEmail"
                  className="form-control"
                  type="text"
                  value={formData.email || ''}
                  onChange={handleChange}
                  name="email"
                />
              </div>
              <div className="col-md-6">
                <div className="form-check">
                  <input
                    id="userEmailVerified"
                    type="checkbox"
                    className="form-check-input"
                    checked={formData.emailVerified || false}
                    onChange={(e) => {
                      const { name, checked } = e.target;
                      setFormData({ ...formData, [name]: checked });
                    }}
                    name="emailVerified"
                  />
                  <label htmlFor="userEmailVerified" className="form-check-label">
                    Email vérifié
                  </label>
                </div>
              </div>
              <div className="col-md-6">
                <label htmlFor="userRole" className="form-label">
                  Rôle
                </label>
                <select
                  id="userRole"
                  className="form-select"
                  name="role"
                  value={formData.role || ''}
                  onChange={handleChange}
                >
                  <option value="">Choose a role</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>
              <div className="col-md-6">
                <p className="mb-1">
                  Créé le : <FormatedDate rowDate={userData.createdAt} />
                </p>
                <p className="mb-0">
                  Mis à jour le : <FormatedDate rowDate={userData.updatedAt} />
                </p>
              </div>
              <div className="col-12">
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
