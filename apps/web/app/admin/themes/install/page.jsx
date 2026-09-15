'use client';
import Breadcrumb from '../../../components/admin/ui/Breadcrumb';
import ThemesInstallable from '../../../components/theme/installableTheme';
import CatalogBrowser from '../../../components/catalog/CatalogBrowser';

export default function InstallPlugin() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Thèmes', href: '/admin/themes' },
          { label: 'Install' },
        ]}
      />
      <CatalogBrowser kind="themes" />
      <div className="card card-body bg-secondary">
        <h5 className="card-title">Install thèmes</h5>
        <ThemesInstallable />
      </div>
    </>
  );
}
