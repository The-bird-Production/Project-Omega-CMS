'use client';
import dynamic from 'next/dynamic';
import Dashboard from '../../components/admin/Dashboard';
import Link from 'next/link';

const AdminLayout = dynamic(() => import('../../components/layout/AdminLayout'), {
  ssr: false,
});
import PageList from '../../components/admin/page/pagelist'

export default function Admin() {
  return (
    <>
      <AdminLayout>
        <Dashboard>

        <nav aria-label="breadcrumb" className="text-light pt-5 mt-5">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link href="/admin">Dashboard</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Pages
              </li>
            </ol>
          </nav>

          <div className='mt-3 pt-3'>
            <div className='card card-body bg-secondary'>
                <PageList></PageList>
            </div>

          </div>
          
        </Dashboard>
      </AdminLayout>
    </>
  );
}
