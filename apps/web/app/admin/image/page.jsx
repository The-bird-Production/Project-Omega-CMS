'use client';

import { Suspense } from 'react';
import Link from 'next/link';

import Breadcrumb from '../../components/admin/ui/Breadcrumb';
import LoadingSpinner from '../../components/admin/ui/LoadingSpinner';
import ImageList from '../../components/admin/image/ImageList';

export default function adminImage() {
  return (
    <>
      <Breadcrumb items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Images' }]} />
      <div className="card card-body bg-secondary">
        <Suspense fallback={<LoadingSpinner />}>
          <ImageList />
        </Suspense>
        <div className="mt-2">
          <Link href="/admin/image/new" className="btn btn-primary">
            <i className="bi bi-plus-circle"></i> New
          </Link>
        </div>
      </div>
    </>
  );
}
