'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import AdminNavBar from './AdminNavBar';
import AdminHeader from './AdminHeader';
import { authClient } from '../../../lib/authClient';

// Single shared chrome for every /admin/* page: sidebar + topbar + the
// admin-only permission gate. Every page used to wrap itself individually in
// <AdminLayout><Dashboard>, duplicating this check (and getting a different,
// inconsistent shell) on every single page — this now lives once, in
// app/admin/layout.js, which renders this component.
export default function AdminShell({ children }) {
  const t = useTranslations('Admin');
  const router = useRouter();
  const pathname = usePathname();
  const [canView, setCanView] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Bootstrap's JS bundle (dropdowns, etc.) is a plain global-scope script,
  // not an ES module — load it once the admin shell mounts, same as the
  // AdminLayout component this replaces used to.
  useEffect(() => {
    require('../../../public/js/bootstrap.bundle.min.js');
  }, []);

  useEffect(() => {
    let cancelled = false;
    const checkPermission = async () => {
      try {
        const { data, error } = await authClient.admin.hasPermission({
          permissions: { administration: ['viewDashboard'] },
        });
        if (cancelled) return;
        if (error || !data) {
          router.push('/');
          return;
        }
        setCanView(true);
      } catch (err) {
        console.error('Error while checking permissions:', err);
        if (!cancelled) router.push('/');
      }
    };
    checkPermission();
    return () => {
      cancelled = true;
    };
  }, [router]);

  // Close the mobile sidebar whenever the route changes.
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (canView === null) {
    return (
      <div className="admin-shell align-items-center justify-content-center">
        <div className="d-flex align-items-center gap-2 text-light">
          <div className="spinner-border spinner-border-sm" role="status" />
          <span>{t('checkingPermissions')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`admin-shell${sidebarOpen ? ' sidebar-open' : ''}`}>
      <AdminNavBar />
      <div className="admin-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      <div className="admin-main">
        <AdminHeader onToggleSidebar={() => setSidebarOpen((open) => !open)} />
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
