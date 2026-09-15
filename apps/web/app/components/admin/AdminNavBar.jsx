'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

function NavLink({ href, icon, children, exact = false }) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <li>
      <Link href={href} className={`admin-nav-link${isActive ? ' active' : ''}`}>
        <i className={`bi ${icon}`} aria-hidden="true" />
        <span>{children}</span>
      </Link>
    </li>
  );
}

export default function AdminNavBar() {
  const t = useTranslations('Admin.nav');

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <i className="bi bi-hexagon-fill" aria-hidden="true" />
        <span>Omega Admin</span>
      </div>
      <ul className="nav flex-column py-2" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        <li className="admin-nav-section">{t('site')}</li>
        <NavLink href="/admin" icon="bi-house" exact>
          {t('dashboard')}
        </NavLink>
        <NavLink href="/admin/stats" icon="bi-speedometer2">
          {t('stats')}
        </NavLink>

        <li className="admin-nav-section">{t('content')}</li>
        <NavLink href="/admin/article" icon="bi-pen">
          {t('articles')}
        </NavLink>
        <NavLink href="/admin/page" icon="bi-file-earmark">
          {t('pages')}
        </NavLink>
        <NavLink href="/admin/image" icon="bi-image">
          {t('images')}
        </NavLink>

        <li className="admin-nav-section">{t('users')}</li>
        <NavLink href="/admin/user" icon="bi-people">
          {t('users')}
        </NavLink>

        <li className="admin-nav-section">{t('addons')}</li>
        <NavLink href="/admin/plugins" icon="bi-puzzle-fill">
          {t('plugins')}
        </NavLink>
        <NavLink href="/admin/themes" icon="bi-palette-fill">
          {t('themes')}
        </NavLink>

        <li className="admin-nav-section">{t('other')}</li>
        <NavLink href="/admin/redirect" icon="bi-compass">
          {t('redirects')}
        </NavLink>
        <NavLink href="/admin/log" icon="bi-newspaper">
          {t('logs')}
        </NavLink>
      </ul>
    </div>
  );
}
