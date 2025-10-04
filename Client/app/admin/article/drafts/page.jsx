'use client';
import dynamic from 'next/dynamic';
import Dashboard from '../../../components/admin/Dashboard';
import Link from 'next/link';

const AdminLayout = dynamic(
  () => import('../../../components/layout/AdminLayout'),
  {
    ssr: false,
  }
);
import DraftList from '../../../components/admin/article/draftlist';

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
                
                <Link href="/admin/article/" >Articles</Link>
              </li>
               <li className="breadcrumb-item active" aria-current="page">
               Drafts
              </li>
            </ol>
          </nav>

          <div className="mt-3 pt-3">
            <div className="card card-body bg-secondary">
              <DraftList />
              <div className="mb-3">
                <Link href="/admin/article/" className="btn btn-primary">Return Back</Link>
              </div>
            </div>
          </div>
        </Dashboard>
      </AdminLayout>
    </>
  );
}
