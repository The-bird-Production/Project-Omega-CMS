'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import AdminLayout from '../../../../components/layout/AdminLayout';
import Dashboard from '../../../../components/admin/Dashboard';
import Link from 'next/link';
import Image from 'next/image';
import FormatedDate from '../../../../components/util/FormatedDate';
import { userSchema } from '../../../../../lib/schema';
import { useRouter } from 'next/navigation';
export default function Page({ params }) {
  const router = useRouter();
  const { data: session, status } = useSession();

  const id = params.id;

  const [userData, setUserData] = useState({
    username: '',
    email: '',
    emailVerified: false,
    roleId: 0,
    image: '',
    createdAt: null,
    updatedAt: null,
  });
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    emailVerified: false,
    roleId: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (status === 'authenticated') {
        const token = session.accessToken || session.user.accessToken;
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/get/${id}`,
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

            setUserData(jsonData);
            setFormData({
              username: userData.username,
              email: userData.email,
              emailVerified: userData.emailVerified,
              roleId: userData.roleId,
            });
          } else {
            console.error('Failed to fetch data:', res.statusText);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };

    fetchData();
  }, [session, status]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      console.log('Données envoyées :', formData);
      userSchema.parse(formData);
      const data = JSON.stringify(formData);

      if (session.permissions?.admin || session.permissions?.canManageUser) {
        const token = session.accessToken || session.user.accessToken;

        await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/update/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            method: 'POST',
            mode: 'cors',
            body: data,
          }
        );
        router.push('/admin/user/');
      } else {
        return router.push('/');
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData({ ...formData, emailVerified: checked });
      
    } else {
      
      setFormData({ ...formData, [name]: value });
    console.log(formData)

    }

    
  };

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
                      <h2>{userData.name || userData.username}</h2>
                    </div>

                    <div className="col-6">
                      <h4>Profil picture : </h4>
                      <Image
                        src={userData.image}
                        width="125"
                        height="125"
                        className="img-fluid"
                        alt="Profile Picture"
                      ></Image>
                    </div>
                    <div className="col-6">
                      <h3 className="mb-3">Informations : </h3>
                      <div className="m-3">
                        <h4 className="mb-3">
                          Email :{' '}
                          <input
                            className="form-control m-2"
                            type="text"
                            defaultValue={userData.email}
                            onChange={handleChange}
                            name="email"
                          ></input>{' '}
                        </h4>
                        <h4 className="mb-3">
                          Email verified :{' '}
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={userData.emailVerified}
                            onChange={handleChange}
                            name="emailVerified"
                          ></input>
                        </h4>
                        <h4 className="mb-3">
                          Role :{' '}
                          <input
                            type="number"
                            defaultValue={userData.roleId}
                            className="form-control"
                            onChange={handleChange}
                            name="role"
                          ></input>{' '}
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
