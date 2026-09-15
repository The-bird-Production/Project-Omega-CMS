'use client';
import { useState } from 'react';
import Breadcrumb from '../../components/admin/ui/Breadcrumb';
import RedirectList from '../../components/admin/redirect/RedirectList';
import RedirectForm from '../../components/admin/redirect/RedirectForm';

export default function RedirectAdmin() {
  const [newForm, setNewForm] = useState(false);

  return (
    <>
      <Breadcrumb items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Redirection' }]} />

      <div className="card">
        <div className="card-body bg-secondary rounded border border-secondary">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="card-title text-light mb-0">Redirection</h2>
            <button
              className={`btn btn-sm ${newForm ? 'btn-secondary' : 'btn-primary'}`}
              onClick={() => setNewForm(!newForm)}
            >
              {newForm ? (
                <>
                  <i className="bi bi-list me-1" /> Voir la liste
                </>
              ) : (
                <>
                  <i className="bi bi-plus-circle me-1" /> Ajouter une redirection
                </>
              )}
            </button>
          </div>

          {newForm ? <RedirectForm /> : <RedirectList />}
        </div>
      </div>
    </>
  );
}
