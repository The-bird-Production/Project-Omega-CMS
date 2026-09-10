'use client';
import dynamic from 'next/dynamic';
import Dashboard from '../components/admin/Dashboard';

import MainContent from '../components/admin/MainContent';
const AdminLayout = dynamic(() => import('../components/layout/AdminLayout'), {
  ssr: false,
});

export default function Admin() {
  return (
    <>
      <AdminLayout>
        <Dashboard>
          <MainContent></MainContent>
        </Dashboard>
      </AdminLayout>
    </>
  );
}
