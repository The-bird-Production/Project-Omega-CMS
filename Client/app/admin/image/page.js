'use client';

import { Suspense, useEffect, useState } from 'react';

import Dashboard from '../../components/admin/Dashboard';
import ImageList from '../../components/admin/image/ImageList';
import AdminLayout from '../../components/layout/AdminLayout';

export default function adminImage() {
  return (
    <>
      <AdminLayout>
        <Dashboard>
          <div className='pt-5 mt-5'>
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
