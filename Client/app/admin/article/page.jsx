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
import ArticleList from '../../components/admin/article/articlelist';

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
                Articles
              </li>
            </ol>
          </nav>

          <div className="mt-3 pt-3">
            <div className="card card-body bg-secondary">
              <ArticleList />
              <div className="mb-3">
                <Link href="/admin/article/new" className="btn btn-primary">
                  <i className="bi bi-plus-circle"></i> New
                </Link>
              </div>
            </div>
          </div>
        </Dashboard>
      </AdminLayout>
    </>
  );
}
