'use client';
import Breadcrumb from '../../../components/admin/ui/Breadcrumb';
import PluginsInstallable from '../../../components/plugin/installablePlugins';

export default function InstallPlugin() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Plugins', href: '/admin/plugins' },
          { label: 'Install' },
        ]}
      />
      <div className="card card-body bg-secondary">
        <h5 className="card-title">Install Plugins</h5>
        <PluginsInstallable />
      </div>
    </>
  );
}
