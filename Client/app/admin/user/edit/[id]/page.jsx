'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import AdminLayout from '../../../../components/layout/AdminLayout';
import Dashboard from '../../../../components/admin/Dashboard';
import Link from 'next/link';
import Image from 'next/image';
import FormatedDate from '../../../../components/util/FormatedDate';

export default function Page({ params }) {
  const { data: session, status } = useSession();

  const id = params.id;

  const [userData, setUserData] = useState([]);

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
                <form>
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
                      ></Image>
                    </div>
                    <div className="col-6">
                      <h3>Informations : </h3>
                      <h4>Email : <input className='form-control' type='text' value={userData.email}></input> {userData.email}</h4>
                      <h4>Email verified : {userData.emailVerified}</h4>
                      <h4>Role : {userData.roleId} </h4>
                      <h5>
                        Creation date :{' '}
                        <FormatedDate rowDate={userData.createdAt} />
                      </h5>
                      <h5>
                        Last update :{' '}
                        <FormatedDate rowDate={userData.updatedAt} />
                      </h5>
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
