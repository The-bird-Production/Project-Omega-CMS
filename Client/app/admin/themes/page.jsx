'use client';
import dynamic from 'next/dynamic';
import Dashboard from '../../components/admin/Dashboard';
import Link from 'next/link';

const AdminLayout = dynamic(
  () => import('../../components/layout/AdminLayout'),
  {
    ssr: false,
  }
);
import ThemePage from '../../components/theme/list';

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
                Themes
              </li>
            </ol>
          </nav>

          <ThemePage></ThemePage>
        </Dashboard>
      </AdminLayout>
    </>
  );
}
