'use client';
import dynamic from 'next/dynamic';
import Dashboard from '../../components/admin/Dashboard';
import Link from 'next/link';
import { Suspense } from 'react';
import LogList from '../../components/admin/log/logList'

const AdminLayout = dynamic(
  () => import('../../components/layout/AdminLayout'),
  {
    ssr: false,
  }
);

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
                Log
              </li>
            </ol>
          </nav>
          <div className="pt-3 mt-3">
            <div className="card">
              <div className="card-body bg-secondary rounded border border-secondary">
                <h2 className="card-title text-light">Log</h2>
                <div>
                  <Suspense
                    fallback={
                      <>
                        <div className="spinner-border" role="status">
                          <span className="sr-only"></span>
                        </div>
                      </>
                    }
                  >
                    <LogList></LogList>

                  </Suspense>
                </div>
              </div>
            </div>
          </div>
        </Dashboard>
      </AdminLayout>
    </>
  );
}
