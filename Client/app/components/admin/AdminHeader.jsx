import Image from "next/image";
import { signOut } from "next-auth/react";
export default function Components({ session }) {
  return (
    <>
      <nav className="navbar bg-secondary rounded-4 shadow">
        <div className="container-fluid justify-content-end">
          <div className="d-flex gap-2 justify-content-end">
            <div className="w-auto">
              <img
                src={session.user.avatar}
                alt=""
                className="img-fluid w-25 rounded-circle"
              />
              <div className="btn-group">
                <button
                  className="btn btn-primary btn-sm dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false">
                  {session.name || session.user.username}
                </button>
                <ul className="dropdown-menu bg-secondary text-light">
                  <li className="dropdown-item">
                    <a onClick={() => signOut()} className="btn btn-primary">
                      Sign out
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
