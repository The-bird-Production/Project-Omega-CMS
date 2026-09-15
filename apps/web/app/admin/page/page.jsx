'use client';
import Link from 'next/link';
import Breadcrumb from '../../components/admin/ui/Breadcrumb';
import PageList from '../../components/admin/page/pagelist';

export default function Admin() {
  return (
    <>
      <Breadcrumb items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Pages' }]} />

      <div className="card card-body bg-secondary">
        <PageList />
        <div className="mb-3">
          <Link href="/admin/page/new" className="btn btn-primary">
            <i className="bi bi-plus-circle"></i> New
          </Link>
        </div>
      </div>
    </>
  );
}
