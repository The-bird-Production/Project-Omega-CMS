import Link from 'next/link';

export default function Component() {
  return (
    <div
      className="offcanvas offcanvas-start w-25 show text-light m-lg-5 my-5 rounded-4 shadow bg-secondary"
      tabIndex="-1"
      id="offcanvas"
      data-bs-keyboard="false"
      data-bs-backdrop="false"
    >
      <div className="offcanvas-header">
        <h6 className="offcanvas-title d-none d-sm-block fs-2" id="offcanvas">
          Omega Admin
        </h6>
      </div>
      <div className="offcanvas-body px-0 px-2 bg-secondary rounded-4">
        <div className="nav">
          <ul
            className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-start"
            id="menu"
          >
            <li>Site</li>
            <li className="nav-item">
              <Link href="/admin" className="nav-link text-truncate">
                <i className="fs-5 bi-house"></i>
                <span className="ms-1 d-none d-sm-inline">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link className='nav-link text-truncate' href="/admin/stats">
              
                <i className="fs-5 bi-speedometer2"></i>
                <span className="ms-1 d-none d-sm-inline">Stats</span>
                </Link>
            </li>
            <li>
              <br />
              Content
            </li>
            <li>
              <a href="#" className="nav-link text-truncate">
                <i className="fs-5 bi bi-folder"></i>
                <span className="ms-1 d-none d-sm-inline">
                  Fichiers (indisponible)
                </span>
              </a>
            </li>

            <li>
              <Link href="/admin/image" className="nav-link text-truncate">
                <i className="fs-5 bi bi-image"></i>
                <span className="ms-1 d-none d-sm-inline">Images</span>
              </Link>
            </li>
            <li>
              <Link href="/admin/page" className="nav-link text-truncate">
                <i className="fs-5 bi-file-earmark"></i>
                <span className="ms-1 d-none d-sm-inline">Pages</span>
              </Link>
            </li>
            <li>
              <br />
              Utilisateurs
            </li>
           {/*  <li>
              <Link href="/admin/role" className="nav-link text-truncate">
                <i className="fs-5 bi-person-badge"></i>
                <span className="ms-1 d-none d-sm-inline">Rôle</span>
              </Link>
            </li> */}
            <li>
              <Link href="/admin/user" className="nav-link text-truncate">
                <i className="fs-5 bi-people"></i>
                <span className="ms-1 d-none d-sm-inline">Utilisateurs</span>
              </Link>
            </li>
            <li>Addons</li>
            <li> <Link href="/admin/plugins" className="nav-link text-truncate">
                <i class="bi bi-puzzle-fill"></i>
                <span className="ms-1 d-none d-sm-inline">Plugins</span>
              </Link></li>
              <li> <Link href="/admin/themes" className="nav-link text-truncate">
              <i class="bi bi-palette-fill"></i>
                <span className="ms-1 d-none d-sm-inline">Themes</span>
              </Link></li>
            <li>Autre</li>
            <li>
              <Link href="/admin/redirect" className="nav-link text-truncate">
                {' '}
                <i className="fs-5 bi bi-compass"></i>
                <span className="ms-1 d-none d-sm-inline">Redirect</span>
              </Link>
            </li>
            <li>
              <Link href="/admin/log" className="nav-link text-truncate">
                {' '}
                <i className="fs-5 bi-newspaper"></i>
                <span className="ms-1 d-none d-sm-inline">Logs</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
