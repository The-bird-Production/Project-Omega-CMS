'use client';
import Link from 'next/link';
import Breadcrumb from '../../../components/admin/ui/Breadcrumb';
import DraftList from '../../../components/admin/article/draftlist';

export default function Admin() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Articles', href: '/admin/article' },
          { label: 'Drafts' },
        ]}
      />

      <div className="card card-body bg-secondary">
        <DraftList />
        <div className="mb-3">
          <Link href="/admin/article/" className="btn btn-primary">
            Return Back
          </Link>
        </div>
      </div>
    </>
  );
}
