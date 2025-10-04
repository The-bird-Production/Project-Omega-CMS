'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../../../../components/layout/AdminLayout';
import Dashboard from '../../../../components/admin/Dashboard';
import Link from 'next/link';
import FormatedDate from '../../../../components/util/FormatedDate';
import { userSchema } from '../../../../../lib/schema';
import { authClient } from '../../../../../lib/authClient';

export default function Page({ params }) {
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
          console.log(jsonData);
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
        emailVerified: userData.emailVerified || false, // Assure boolean false par défaut
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

      const { isUpdated, error } = await authClient.admin.updateUser ({
        userId: id,
        data: {
          name: formData.name,
          username: formData.username,
          email: formData.email,
          emailVerified: formData.emailVerified, // Boolean true/false
          role: formData.role,
        },
      });

      if (error) {
        console.error('Update error:', error);
      } else {
        console.log('User  updated successfully');
        // Optionnel : rediriger ou afficher un message de succès
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === 'select-one') { // Correction : type pour <select> est 'select-one'
      setFormData({ ...formData, [name]: value });
    } else if (type === 'checkbox') {
      // Pas besoin, car la checkbox a son propre onChange inline
    } else {
      setFormData({ ...formData, [name]: value });
      console.log(formData);
    }
  };

  // État de chargement basique
  if (Object.keys(userData).length === 0) {
    return (
      <AdminLayout>
        <Dashboard>
          <div>Chargement des données utilisateur...</div>
        </Dashboard>
      </AdminLayout>
    );
  }

  return (
    <>
      <AdminLayout>
        <Dashboard>
          <nav aria-label="breadcrumb" className="text-light pt-5 mt-5">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link href="/admin">Dashboard</Link>
              </li>
              <li className="breadcrumb-item" aria-current="page">
                <Link href="/admin/user">Utilisateurs</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {userData.id}
              </li>
            </ol>
          </nav>
          <div className="pt-3 mt-3">
            <div className="card">
              <div className="card-body bg-secondary rounded border border-secondary">
                <h2 className="card-title text-light">
                  Modification d'utilisateur :{' '}
                </h2>
                <form onSubmit={handleSubmit}>
                  <div className="text-white container row pt-3 ">
                    <div className="col-6">
                      <h2>
                        {' '}
                        <input
                          type="text"
                          name="name"
                          onChange={handleChange}
                          value={formData.name  || ''} // Contrôlé par formData
                          className="form-control m-2"
                        />
                      </h2>
                    </div>

                    <div className="col-6">
                      <h4>Profil picture : </h4>
                      {/* <Image
                        src={userData.image}
                        width="125"
                        height="125"
                        className="img-fluid"
                        alt="Profile Picture"
                      /> */}
                    </div>
                    <div className="col-6">
                      <h3 className="mb-3">Informations : </h3>
                      <div className="m-3">
                        <h4 className="mb-3">
                          Email :{' '}
                          <input
                            className="form-control m-2"
                            type="text"
                            value={formData.email || ''} // Contrôlé par formData
                            onChange={handleChange}
                            name="email"
                          />{' '}
                        </h4>
                        <h4 className="mb-3">
                          Email verified :{' '}
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={formData.emailVerified} // Corrigé : lié à formData
                            onChange={(e) => {
                              const { name, checked } = e.target;
                              setFormData({ ...formData, [name]: checked });
                            }}
                            name="emailVerified"
                          />
                        </h4>
                        <h4 className="mb-3">
                          Role :{' '}
                          <select
                            className="form-select"
                            aria-label="Default select example"
                            name="role"
                            value={formData.role || ''} // Contrôlé par formData (pré-sélectionne la valeur actuelle)
                            onChange={handleChange}
                          >
                            <option value="">Choose a role</option> {/* value="" pour l'option par défaut */}
                            <option value="admin">Admin</option>
                            <option value="user">User </option>
                          </select>
                        </h4>
                        <h5 className="mb-3">
                          Creation date :{' '}
                          <FormatedDate rowDate={userData.createdAt} />
                        </h5>
                        <h5 className="mb-3">
                          Last update :{' '}
                          <FormatedDate rowDate={userData.updatedAt} />
                        </h5>
                        <input
                          type="submit"
                          value="Save"
                          className="btn btn-primary"
                        />
                      </div>
                    </div>
                  </div>
                </form>{' '}
              </div>
            </div>
          </div>
        </Dashboard>
      </AdminLayout>
    </>
  );
}
