'use client';

import ConsultedPages from './graph/ConsultedPages';
import TotalViewedPages from './graph/TotalViewedPages';
import ApiResponseTime from './graph/APIResponseTime';

import { Suspense } from 'react';

export default function Components() {
  return (
    <>
      <div className="main pt-5">
        <div className="container row">
          <div className="col-lg-4 col-12 p-3">
            <div className="card rounded-4 shadow bg-secondary text-light">
              <div className="card-body">
                <i className="bi bi-people fs-3"></i>
                25654 visiteurs Totaux
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-12 p-3">
            <div className="card rounded-4 shadow bg-secondary text-light">
              <div className="card-body">
                <i className="bi bi-hdd-network fs-3"></i>
                <Suspense
                  fallback={
                    <div className="spinner-border" role="status">
                      <span className="sr-only"></span>
                    </div>
                  }
                >
                  <ApiResponseTime />
                </Suspense>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-12 p-3">
            <div className="card rounded-4 shadow bg-secondary text-light">
              <div className="card-body">
                <i className="bi bi-file-earmark fs-3"></i>
                <Suspense
                  fallback={
                    <div className="spinner-border" role="status">
                      <span className="sr-only"></span>
                    </div>
                  }
                >
                  <TotalViewedPages />
                </Suspense>
              </div>
            </div>
          </div>
          <div className="col-lg-6 col-12 pt-5">
            <div className="card rounded-4 shadow bg-secondary text-light">
              <div className="card-body">
                <h5 className="card-title">Pages consultés :</h5>

                <Suspense
                  fallback={
                    <div className="spinner-border" role="status">
                      <span className="sr-only"></span>
                    </div>
                  }
                >
                  <ConsultedPages />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
