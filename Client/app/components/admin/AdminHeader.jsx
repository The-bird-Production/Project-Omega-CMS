import Image from "next/image";
import { signOut } from "next-auth/react";
export default function Components({ session }) {
  return (
    <>
      <nav class="navbar bg-secondary rounded-4 shadow">
        <div class="container-fluid justify-content-end">
          <div class="d-flex gap-2 justify-content-end">
            <div class="w-auto">
              <img
                src={session.user.avatar}
                alt=""
                class="img-fluid w-25 rounded-circle"
              />
              <div class="btn-group">
                <button
                  class="btn btn-primary btn-sm dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false">
                  {session.name || session.user.username}
                </button>
                <ul class="dropdown-menu bg-secondary text-light">
                  <li class="dropdown-item">
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
