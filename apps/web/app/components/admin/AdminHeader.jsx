import { useTranslations } from "next-intl";
import { useSession, signOut } from "../../../lib/authClient";
import AdminNotifications from "./notifications/AdminNotifications";

export default function AdminHeader({ onToggleSidebar }) {
  const t = useTranslations();
  const { data, isPending } = useSession();

  return (
    <header className="admin-topbar">
      <button
        type="button"
        className="admin-sidebar-toggle"
        onClick={onToggleSidebar}
        aria-label={t("Admin.toggleSidebar")}
      >
        <i className="bi bi-list" aria-hidden="true" />
      </button>

      <div className="d-flex gap-2 align-items-center ms-auto">
        <AdminNotifications />
        {isPending ? (
          <div>{t("Common.loading")}</div>
        ) : (
          <div className="btn-group">
            <button
              type="button"
              className="btn btn-primary btn-sm dropdown-toggle d-flex align-items-center gap-2"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {data.user?.image ? (
                <img
                  src={data.user.image}
                  alt=""
                  className="rounded-circle"
                  style={{ width: 24, height: 24, objectFit: 'cover' }}
                />
              ) : (
                <i className="bi bi-person-circle" aria-hidden="true" />
              )}
              <span className="d-none d-sm-inline">{data.user?.name || data.user?.email}</span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end bg-secondary text-light">
              <li>
                <a onClick={() => signOut()} className="dropdown-item" role="button">
                  <i className="bi bi-box-arrow-right me-2" aria-hidden="true" />
                  {t("Admin.signOut")}
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
