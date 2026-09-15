'use client';

import ConsultedPages from './graph/ConsultedPages';
import TotalViewedPages from './graph/TotalViewedPages';
import ApiResponseTime from './graph/APIResponseTime';
import NumberOfUser from './graph/NumberOfUser';
import LoadingSpinner from './ui/LoadingSpinner';

import { Suspense } from 'react';

export default function MainContent() {
  return (
    <div className="row g-3">
      <div className="col-lg-4 col-12">
        <div className="panel h-100">
          <div className="panel-body">
            <i className="bi bi-people fs-3" aria-hidden="true" />
            <div className="mt-2">
              <NumberOfUser />
            </div>
          </div>
        </div>
      </div>
      <div className="col-lg-4 col-12">
        <div className="panel h-100">
          <div className="panel-body">
            <i className="bi bi-hdd-network fs-3" aria-hidden="true" />
            <div className="mt-2">
              <Suspense fallback={<LoadingSpinner />}>
                <ApiResponseTime />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
      <div className="col-lg-4 col-12">
        <div className="panel h-100">
          <div className="panel-body">
            <i className="bi bi-file-earmark fs-3" aria-hidden="true" />
            <div className="mt-2">
              <Suspense fallback={<LoadingSpinner />}>
                <TotalViewedPages />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
      <div className="col-lg-6 col-12">
        <div className="panel">
          <div className="panel-body">
            <h5 className="panel-title">Pages consultées</h5>
            <Suspense fallback={<LoadingSpinner />}>
              <ConsultedPages />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
