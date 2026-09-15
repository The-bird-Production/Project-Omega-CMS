'use client';
import { Suspense } from 'react';
import Breadcrumb from '../../components/admin/ui/Breadcrumb';
import LoadingSpinner from '../../components/admin/ui/LoadingSpinner';
import APIResponseTime from '../../components/admin/graph/APIResponseTime';
import ConsultedPages from '../../components/admin/graph/ConsultedPages';
import TotalViewedPages from '../../components/admin/graph/TotalViewedPages';
import NumberOfUser from '../../components/admin/graph/NumberOfUser';
import NumberOfPage from '../../components/admin/graph/NumberOfPages';

export default function statsAdmin() {
  return (
    <>
      <Breadcrumb items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Stats' }]} />

      <Suspense fallback={<LoadingSpinner />}>
        <div className="row g-3">
          <div className="col-lg-6 col-12">
            <div className="panel h-100">
              <div className="panel-body">
                <h3 className="panel-title">Api stats</h3>
                <APIResponseTime />
              </div>
            </div>
          </div>
          <div className="col-lg-6 col-12">
            <div className="panel h-100">
              <div className="panel-body">
                <h3 className="panel-title">Pages stats</h3>
                <ConsultedPages />
                <TotalViewedPages />
              </div>
            </div>
          </div>
          <div className="col-12">
            <div className="panel">
              <div className="panel-body">
                <h3 className="panel-title">Other stats</h3>
                <div className="pt-2">
                  <NumberOfUser />
                </div>
                <div className="pt-2">
                  <NumberOfPage />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    </>
  );
}
