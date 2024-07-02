'use client';

import { Suspense, useEffect, useState } from 'react';

import Dashboard from '../../components/admin/Dashboard';
import ImageList from '../../components/admin/image/ImageList';
import AdminLayout from '../../components/layout/AdminLayout';
import Link from 'next/link';

export default function adminImage() {
  return (
    <>
      <AdminLayout>
        <Dashboard>
        <nav aria-label="breadcrumb" className='text-light pt-5 mt-5'>
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link href="/admin">Dashboard</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Images
                </li>
              </ol>
            </nav>
          <div className='pt-3 mt-3'>
            <Suspense
              fallback={
                <div className="spinner-border" role="status">
                  <span className="sr-only"></span>
                </div>
              }
            >
              <ImageList></ImageList>
            </Suspense>
          </div>
        </Dashboard>
      </AdminLayout>
    </>
  );
}
