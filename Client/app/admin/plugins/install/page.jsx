'use client';
import dynamic from 'next/dynamic';
import Dashboard from '../../../components/admin/Dashboard';
import PluginsInstallable from '../../../components/plugin/installablePlugins'
import Link from 'next/link';


const AdminLayout = dynamic(() => import('../../../components/layout/AdminLayout'), {
  ssr: false,
});



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
              <li className="breadcrumb-item" aria-current="page">
                <Link href="/admin/plugins">Plugins</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Install
              </li>
            </ol>
          </nav>
            <div className=''>
                <h1>Install Plugins</h1>
                <PluginsInstallable />

                
                
            

            </div>
          
        </Dashboard>
      </AdminLayout>
    </>
  );
}
