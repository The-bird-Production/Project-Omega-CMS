'use client';
import { Suspense } from 'react';
import Breadcrumb from '../../components/admin/ui/Breadcrumb';
import LoadingSpinner from '../../components/admin/ui/LoadingSpinner';
import UserList from '../../components/admin/user/UserList';

export default function userAdmin() {
  return (
    <>
      <Breadcrumb items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Utilisateurs' }]} />

      <div className="card">
        <div className="card-body bg-secondary rounded border border-secondary">
          <h2 className="card-title text-light">Utilisateurs</h2>
          <Suspense fallback={<LoadingSpinner />}>
            <UserList />
          </Suspense>
        </div>
      </div>
    </>
  );
}
