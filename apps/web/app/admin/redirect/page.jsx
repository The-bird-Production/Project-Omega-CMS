'use client';
import AdminLayout from '../../components/layout/AdminLayout';
import Dashboard from '../../components/admin/Dashboard';
import Link from 'next/link';
import { useState } from 'react';
import RedirectList from '../../components/admin/redirect/RedirectList';
import RedirectForm from '../../components/admin/redirect/RedirectForm';



export default function redirectAdmin() {

  const [newForm , setNewForm] = useState(false);
  return (
    <>
      <AdminLayout>
        <Dashboard>
          <nav aria-label="breadcrumb" className="text-light pt-5 mt-5">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link href="/admin">Dashboard</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Redirection
              </li>
            </ol>
          </nav>
          <div className="pt-3 mt-3">
            <div className="card">
              <div className="card-body bg-secondary rounded border border-secondary">
                <h2 className="card-title text-light">Redirection</h2>

                <div>
                    { newForm ? <RedirectForm/> : <RedirectList/> }

                    <div className='pt-3'>
                      <button className='btn btn-primary' onClick={() => setNewForm(!newForm)}> {!newForm ? <>Ajouter une redirection </> : <> Terminer</>}</button>

                    </div>

                </div>

              </div>
            </div>
          </div>
        </Dashboard>
      </AdminLayout>
    </>
  );
}
