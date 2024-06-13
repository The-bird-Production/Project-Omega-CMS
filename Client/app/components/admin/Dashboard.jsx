const AdminHeader = dynamic(() => import('./AdminHeader'), { ssr: false });
const AdminNavBar = dynamic(() => import('./AdminNavBar'), { ssr: false });

const AdminContentLayout = dynamic(() =>
  import('./AdminContentLayout', { ssr: false })
);
import { useRouter } from "next/navigation"
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';


export default function Layout({ children }) {
  const [role, setRole] = useState(null)
  const { data: session, status } = useSession({
    required: true,
  });
  const router = useRouter()
  useEffect(() => {
    
    if (status === 'authenticated' && session.user.roleId) {
      fetch(`/api/getRole?id=${session.user.roleId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.role) {
            setRole(data.role);
            if (data.role !== 'admin') {
              return router.push('/')
            }
          }
        })
        .catch((error) => {
          console.error('Error fetching role:', error);
          return router.push('/')
        });
    }
  }, [session, status]);

  if (status === 'loading') {
    return (
      
      <>
        <h1>Loading...</h1>
        <div className="spinner-border" role="status">
          <span className="sr-only"></span>
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
