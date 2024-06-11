const AdminHeader = dynamic(() => import('./AdminHeader'), { ssr: false });
const AdminNavBar = dynamic(() => import('./AdminNavBar'), { ssr: false });
import { redirect } from 'next/navigation';
const AdminContentLayout = dynamic(() =>
  import('./AdminContentLayout', { ssr: false })
);

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';

export default function Layout({ children }) {
  const { data: session, status } = useSession({
    required: true,
  });
  useEffect(() => {
    if (status === 'authenticated' && session.user.roleId) {
      fetch(`/api/getRole?id=${session.user.roleId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.role) {
            setRole(data.role);
            if (data.role !== 'admin') {
              redirect('/');
            }
          }
        })
        .catch((error) => {
          console.error('Error fetching role:', error);
          redirect('/');
        });
    }
  }, [session, status]);

  if (status === 'loading') {
    return (
      
      <>
        <h1>Loading...</h1>
        <div classNameNameName="spinner-border" role="status">
          <span classNameNameName="sr-only"></span>
        </div>
      </>
    );
  }

  return (
    <>
     
        <AdminNavBar></AdminNavBar>
        <AdminContentLayout>
          <AdminHeader session={session}></AdminHeader>
          {children}
        </AdminContentLayout>
      
    </>
  );
}
