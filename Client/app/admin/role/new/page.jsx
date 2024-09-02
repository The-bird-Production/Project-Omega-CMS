'use client';
import dynamic from 'next/dynamic';
import Dashboard from '../../../components/admin/Dashboard';
import Link from 'next/link';
import { useState } from 'react';
import { AddRoleSchema } from '../../../../lib/schema';
import { useSession } from 'next-auth/react';
import CheckPermissions from '../../../../Functions/CheckPermissions';
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
    role_permission: {
      admin: false,
      CanViewDashboard: false,
      CanManageRole: false,
    },
  });
  useEffect(() => {
    const validation = CheckPermissions(status, session, "CanManageRole")
    console.log(validation)
    if (!validation) {
      
      
      
    }

  }, [session,status])

  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log('Données envoyées :', formData);

    try {
      AddRoleSchema.parse(formData);

      if (await CheckPermissions(status, session, 'CanManageRole')) {
        const token = session.accessToken || session.user.accessToken;

        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/role/create/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          method: 'POST',
          mode: 'cors',
          body: formData,
        });
        router.push('/admin/role/');
      } else {
        //return router.push('/');
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
        role_permission: {
          ...formData.role_permission,
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
                          checked={formData.role_permission.admin}
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
                          name="CanViewDashboard"
                          onChange={handleChange}
                          checked={formData.role_permission.CanViewDashboard}
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
                          name="CanManageRole"
                          onChange={handleChange}
                          checked={formData.role_permission.CanManageRole}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="testSwitch"
                        >
                          Gérer les rôles
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
