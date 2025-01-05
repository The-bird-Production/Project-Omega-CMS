'use client';
import dynamic from 'next/dynamic';
import Dashboard from '../../components/admin/Dashboard';


const AdminLayout = dynamic(() => import('../../components/layout/AdminLayout'), {
  ssr: false,
});
import PluginPage from "../../components/plugin/list";

export default function Admin() {
  return (
    <>
      <AdminLayout>
        <Dashboard>
          <PluginPage></PluginPage>
        </Dashboard>
      </AdminLayout>
    </>
  );
}
