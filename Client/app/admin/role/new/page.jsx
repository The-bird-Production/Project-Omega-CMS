'use client';
import dynamic from 'next/dynamic';
import Dashboard from '../../../components/admin/Dashboard';
import Link from 'next/link';
import { useState } from 'react';
import { AddRoleSchema } from '../../../../lib/schema';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const AdminLayout = dynamic(
  () => import('../../../components/layout/AdminLayout'),
  {
    ssr: false,
  }
);

export default function Admin() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
  });
  

  const [formData, setFormData] = useState({
    role_name: '',
    role_permissions: {
      admin: false,
      canViewDashboard: false,
      canManageRole: false,
      canManageImage: false,
      canViewStats: false, 
      canGetLogs: false,
      canDeleteLogs: false,


    },
  });
  useEffect(() => {
    

  }, [session,status])

  const handleSubmit = async (event) => {
    event.preventDefault();

    

    try {
      AddRoleSchema.parse(formData);
      const data = JSON.stringify(formData)
      console.log('Données envoyées :', data);

      if (session.permissions?.admin || session.permissions?.CanManageRole) {
        const token = session.accessToken || session.user.accessToken;

        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/role/create/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          method: 'POST',
          mode: 'cors',
          body: data,
        });
        router.push('/admin/role/');
      } else {
        return router.push('/');
      }
    } catch (err) {
      console.error('Erreur de validation', err);
    }
  };

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;

    if (type === 'checkbox') {
      setFormData({
        ...formData,
        role_permissions: {
          ...formData.role_permissions,
          [name]: checked,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  return (
    <>
      <AdminLayout>
        <Dashboard>
          <nav aria-label="breadcrumb" className="text-light pt-5 mt-5">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link href="/admin">Dashboard</Link>
              </li>
              <li className="breadcrumb-item">Role</li>
              <li className="breadcrumb-item active" aria-current="page">
                New
              </li>
            </ol>
          </nav>
          <div className="pt-3 mt-3">
            <div className="card">
              <div className="card-body bg-secondary rounded border border-secondary">
                <h2 className="card-title text-light">Ajouter un role</h2>
                <div className="text-white">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="role_name" className="form-label">
                        Nom du role
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="role_name"
                        name="role_name"
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Permissions</label>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="adminSwitch"
                          name="admin"
                          onChange={handleChange}
                          checked={formData.role_permissions.admin}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="adminSwitch"
                        >
                          Admin
                        </label>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="testSwitch"
                          name="canViewDashboard"
                          onChange={handleChange}
                          checked={formData.role_permissions.canViewDashboard}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="testSwitch"
                        >
                          Voir le Dashboard Admin
                        </label>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="testSwitch"
                          name="canManageRole"
                          onChange={handleChange}
                          checked={formData.role_permissions.canManageRole}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="testSwitch"
                        >
                          Gérer les rôles
                        </label>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="testSwitch"
                          name="canGetLogs"
                          onChange={handleChange}
                          checked={formData.role_permissions.canGetLogs}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="testSwitch"
                        >
                          Récuperer les logs
                        </label>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="testSwitch"
                          name="canDeleteLogs"
                          onChange={handleChange}
                          checked={formData.role_permissions.canDeleteLogs}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="testSwitch"
                        >
                          Supprimer les logs 
                        </label>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="testSwitch"
                          name="canManageImage"
                          onChange={handleChange}
                          checked={formData.role_permissions.canManageImage}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="testSwitch"
                        >
                          Gérer les images
                        </label>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="testSwitch"
                          name="canViewStats"
                          onChange={handleChange}
                          checked={formData.role_permissions.canViewStats}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="testSwitch"
                        >
                          Voir les statistiques
                        </label>
                      </div>
                    </div>

                    <button className="btn btn-primary" type="submit">
                      Ajouter
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </Dashboard>
      </AdminLayout>
    </>
  );
}
