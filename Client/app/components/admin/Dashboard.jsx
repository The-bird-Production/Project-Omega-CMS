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
     
    if (!(session?.permissions?.admin || !session?.permissions?.canViewDashboard)) {
      router.push('/')
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
