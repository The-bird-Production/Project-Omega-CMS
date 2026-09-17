'use client';
import { useEffect, useMemo, useState } from 'react';
import { confirmAction } from '../../../../lib/confirm';

const EMPTY_ITEM = { label: '', url: '', menu: 'main', target: '', order: 0, parentId: '' };

async function fetchJson(path, options) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`, {
    credentials: 'include',
    mode: 'cors',
    headers: options?.body ? { 'Content-Type': 'application/json' } : undefined,
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Erreur : ${res.statusText}`);
  return data;
}

export default function MenuManager() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [activeMenu, setActiveMenu] = useState('main');
  const [newItem, setNewItem] = useState(EMPTY_ITEM);

  const load = async () => {
    try {
      const { data } = await fetchJson('/menu/all');
      setItems(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const menuNames = useMemo(() => {
    const names = new Set(['main', 'footer']);
    (items || []).forEach((i) => names.add(i.menu));
    return Array.from(names);
  }, [items]);

  const itemsForActiveMenu = useMemo(
    () => (items || []).filter((i) => i.menu === activeMenu),
    [items, activeMenu]
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await fetchJson('/menu/add', {
        method: 'POST',
        body: JSON.stringify({ ...newItem, menu: activeMenu, parentId: newItem.parentId || null }),
      });
      setNewItem(EMPTY_ITEM);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFieldChange = async (id, field, value) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const handleSave = async (item) => {
    setError(null);
    try {
      await fetchJson(`/menu/update/${item.id}`, {
        method: 'POST',
        body: JSON.stringify({
          label: item.label,
          url: item.url,
          target: item.target || null,
          order: Number(item.order) || 0,
          parentId: item.parentId || null,
        }),
      });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirmAction('Supprimer cet élément de menu ?')) return;
    setError(null);
    try {
      await fetchJson(`/menu/delete/${id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!items) return <div className="text-muted">Chargement...</div>;

  return (
    <div>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="btn-group mb-3" role="group">
        {menuNames.map((name) => (
          <button
            key={name}
            type="button"
            className={`btn btn-sm ${activeMenu === name ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveMenu(name)}
          >
            {name}
          </button>
        ))}
      </div>

      {itemsForActiveMenu.length === 0 ? (
        <p className="text-muted">Aucun élément dans le menu « {activeMenu} ».</p>
      ) : (
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Libellé</th>
              <th>URL</th>
              <th style={{ width: 90 }}>Ordre</th>
              <th style={{ width: 120 }}>Cible</th>
              <th style={{ width: 140 }}>Parent</th>
              <th style={{ width: 110 }}></th>
            </tr>
          </thead>
          <tbody>
            {itemsForActiveMenu.map((item) => (
              <tr key={item.id}>
                <td>
                  <input
                    className="form-control form-control-sm"
                    value={item.label}
                    onChange={(e) => handleFieldChange(item.id, 'label', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="form-control form-control-sm"
                    value={item.url}
                    onChange={(e) => handleFieldChange(item.id, 'url', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={item.order}
                    onChange={(e) => handleFieldChange(item.id, 'order', e.target.value)}
                  />
                </td>
                <td>
                  <select
                    className="form-select form-select-sm"
                    value={item.target || ''}
                    onChange={(e) => handleFieldChange(item.id, 'target', e.target.value)}
                  >
                    <option value="">Même onglet</option>
                    <option value="_blank">Nouvel onglet</option>
                  </select>
                </td>
                <td>
                  <select
                    className="form-select form-select-sm"
                    value={item.parentId || ''}
                    onChange={(e) => handleFieldChange(item.id, 'parentId', e.target.value)}
                  >
                    <option value="">— aucun —</option>
                    {itemsForActiveMenu
                      .filter((candidate) => candidate.id !== item.id)
                      .map((candidate) => (
                        <option key={candidate.id} value={candidate.id}>
                          {candidate.label}
                        </option>
                      ))}
                  </select>
                </td>
                <td className="text-end">
                  <button type="button" className="btn btn-sm btn-primary me-1" onClick={() => handleSave(item)}>
                    <i className="bi bi-check-lg" />
                  </button>
                  <button type="button" className="btn btn-sm btn-secondary" onClick={() => handleDelete(item.id)}>
                    <i className="bi bi-trash" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <form onSubmit={handleAdd} className="row g-2 align-items-end mt-3 border-top pt-3">
        <div className="col-md-3">
          <label className="form-label mb-1">Libellé</label>
          <input
            className="form-control"
            value={newItem.label}
            onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
            required
          />
        </div>
        <div className="col-md-4">
          <label className="form-label mb-1">URL</label>
          <input
            className="form-control"
            placeholder="/contact ou https://..."
            value={newItem.url}
            onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
            required
          />
        </div>
        <div className="col-md-2">
          <label className="form-label mb-1">Ordre</label>
          <input
            type="number"
            className="form-control"
            value={newItem.order}
            onChange={(e) => setNewItem({ ...newItem, order: e.target.value })}
          />
        </div>
        <div className="col-md-3">
          <button type="submit" className="btn btn-primary w-100">
            <i className="bi bi-plus-circle me-1" />
            Ajouter à « {activeMenu} »
          </button>
        </div>
      </form>
    </div>
  );
}
