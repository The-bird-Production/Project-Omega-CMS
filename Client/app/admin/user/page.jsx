'use client';
import AdminLayout from '../../components/layout/AdminLayout';
import Dashboard from '../../components/admin/Dashboard';
import Link from 'next/link';
import { Suspense } from 'react';
import UserList from '../../components/admin/user/UserList'

export default function userAdmin() {
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
                Utilisateurs
              </li>
            </ol>
          </nav>
          <div className="pt-3 mt-3">
            <div className="card">
              <div className="card-body bg-secondary rounded border border-secondary">
                <h2 className="card-title text-light">Utilisateurs</h2>
                <div>
                    <Suspense fallback={<h1>Loading</h1>}>
                    <UserList/>



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
