'use client';
import Breadcrumb from '../../components/admin/ui/Breadcrumb';
import MenuManager from '../../components/admin/menu/MenuManager';

export default function MenuAdmin() {
  return (
    <>
      <Breadcrumb items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Menus' }]} />

      <div className="card">
        <div className="card-body">
          <h2 className="card-title">Menus de navigation</h2>
          <p className="text-muted">
            Ces menus sont mis à disposition des thèmes via <code>GET /menu/:menu</code> — un thème
            choisit d&apos;afficher ou non chaque menu dans son en-tête/pied de page.
          </p>
          <MenuManager />
        </div>
      </div>
    </>
  );
}
