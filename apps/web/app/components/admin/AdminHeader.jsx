import Image from "next/image";
import { useTranslations } from "next-intl";
import { useSession, signOut } from "../../../lib/authClient";
import AdminNotifications from "./notifications/AdminNotifications";
export default function Components() {
  const t = useTranslations();
  const {data, isPending} = useSession();
  if (isPending) {
    return <div>{t("Common.loading")}</div>;
  }

  return (
    <>
      <nav className="navbar bg-secondary rounded-4 shadow">
        <div className="container-fluid justify-content-end">
          <div className="d-flex gap-2 justify-content-end align-items-center">
            <AdminNotifications />
            <div className="w-auto">
              <img
                src={data.user?.image}
                alt=""
                className="img-fluid w-25 rounded-circle"
              />
              <div className="btn-group">
                <button
                  className="btn btn-primary btn-sm dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false">
                  
                </button>
                <ul className="dropdown-menu bg-secondary text-light">
                  <li className="dropdown-item">
                    <a onClick={() => signOut()} className="btn btn-primary">
                      {t("Admin.signOut")}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
