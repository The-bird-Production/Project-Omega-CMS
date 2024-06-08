export default function Component() {
  return (
    <div
      class="offcanvas offcanvas-start w-25 show text-light m-lg-5 my-5 rounded-4 shadow bg-secondary"
      tabindex="-1"
      id="offcanvas"
      data-bs-keyboard="false"
      data-bs-backdrop="false">
      <div class="offcanvas-header">
        <h6 class="offcanvas-title d-none d-sm-block" id="offcanvas">
          Omega Admin
        </h6>
      </div>
      <div class="offcanvas-body px-0 px-2 bg-secondary rounded-4">
        <div class="nav">
          <ul
            class="nav nav-pills flex-column mb-sm-auto mb-0 align-items-start"
            id="menu">
            <li>Site</li>
            <li class="nav-item">
              <a href="#" class="nav-link text-truncate">
                <i class="fs-5 bi-house"></i>
                <span class="ms-1 d-none d-sm-inline">Dashboard</span>
              </a>
            </li>
            <li>
              <a
                href="#submenu1"
                data-bs-toggle="collapse"
                class="nav-link text-truncate">
                <i class="fs-5 bi-speedometer2"></i>
                <span class="ms-1 d-none d-sm-inline">Stats</span>
              </a>
            </li>
            <li>
              <br />
              Content
            </li>
            <li>
              <a href="#" class="nav-link text-truncate">
                <i class="fs-5 bi bi-folder"></i>
                <span class="ms-1 d-none d-sm-inline">Fichiers</span>
              </a>
            </li>

            <li>
              <a href="#" class="nav-link text-truncate">
                <i class="fs-5 bi bi-image"></i>
                <span class="ms-1 d-none d-sm-inline">Images</span>
              </a>
            </li>
            <li>
              <a href="#" class="nav-link text-truncate">
                <i class="fs-5 bi-file-earmark"></i>
                <span class="ms-1 d-none d-sm-inline">Pages</span>
              </a>
            </li>
            <li>
              <br />
              Utilisateurs
            </li>
            <li>
              <a href="#" class="nav-link text-truncate">
                <i class="fs-5 bi-person-badge"></i>
                <span class="ms-1 d-none d-sm-inline">Rôle</span>
              </a>
            </li>
            <li>
              <a href="#" class="nav-link text-truncate">
                <i class="fs-5 bi-people"></i>
                <span class="ms-1 d-none d-sm-inline">Utilisateurs</span>
              </a>
            </li>
            <li>Autre</li>
            <li>
              <a href="#" class="nav-link text-truncate">
                <i class="fs-5 bi-newspaper"></i>
                <span class="ms-1 d-none d-sm-inline">Logs</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
