'use client';
import dynamic from 'next/dynamic';
import Dashboard from '../../components/admin/Dashboard';
import Link from 'next/link';
import { Suspense } from 'react';
import RoleList from "../../components/admin/role/RoleList"

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
                Role
              </li>
            </ol>
          </nav>
          <div className="pt-3 mt-3">
            <div className="card">
              <div className="card-body bg-secondary rounded border border-secondary">
                
                <h2 className="card-title text-light">
                  
                  Rôle
                </h2> 
                <div>
                <Suspense fallback= {
                  <><div className="spinner-border" role="status">
                  <span className="sr-only"></span>
                </div></>
                }>
                    <RoleList></RoleList>
                </Suspense>
                </div>
                <div>
                  
                  <Link href="/admin/role/new" className="btn btn-primary "><i className="bi bi-plus-circle"></i> Ajouter un rôle</Link>
                </div>
              </div>
            </div>
          </div>
        </Dashboard>
      </AdminLayout>
    </>
  );
}
