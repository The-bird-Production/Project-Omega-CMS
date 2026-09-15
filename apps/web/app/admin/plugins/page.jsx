'use client';
import Breadcrumb from '../../components/admin/ui/Breadcrumb';
import PluginPage from '../../components/plugin/list';

export default function Admin() {
  return (
    <>
      <Breadcrumb items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Plugins' }]} />
      <PluginPage />
    </>
  );
}
