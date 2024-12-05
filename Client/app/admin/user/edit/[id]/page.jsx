"use client"

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import AdminLayout from '../../../../components/layout/AdminLayout';
import Dashboard from '../../../../components/admin/Dashboard';

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

    
      if (!userData) {
        fetchData()
      }
    

    
  });

  return (
    <>
      <AdminLayout>
        <Dashboard>
            {userData.id}

        </Dashboard>
      </AdminLayout>
    </>
  );
}
