'use client';
import { Suspense } from 'react';
import Breadcrumb from '../../components/admin/ui/Breadcrumb';
import LoadingSpinner from '../../components/admin/ui/LoadingSpinner';
import LogList from '../../components/admin/log/logList';

export default function Admin() {
  return (
    <>
      <Breadcrumb items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Log' }]} />

      <div className="card">
        <div className="card-body bg-secondary rounded border border-secondary">
          <h2 className="card-title text-light">Log</h2>
          <Suspense fallback={<LoadingSpinner />}>
            <LogList />
          </Suspense>
        </div>
      </div>
    </>
  );
}
