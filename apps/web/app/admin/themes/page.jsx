'use client';
import Breadcrumb from '../../components/admin/ui/Breadcrumb';
import ThemePage from '../../components/theme/list';

export default function Admin() {
  return (
    <>
      <Breadcrumb items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Themes' }]} />
      <ThemePage />
    </>
  );
}
