"use client";

import ConsultedPages from "./graph/ConsultedPages";
import TotalViewedPages from './graph/TotalViewedPages'

import { Suspense } from "react";

export default function Components() {
  return (
    <>
      <div class="main pt-5">
        <div class="container row">
          <div class="col-lg-4 col-12 p-3">
            <div class="card rounded-4 shadow bg-secondary text-light">
              <div class="card-body">
                <i class="bi bi-people fs-3"></i>
                25654 visiteurs Totaux
              </div>
            </div>
          </div>
          <div class="col-lg-4 col-12 p-3">
            <div class="card rounded-4 shadow bg-secondary text-light">
              <div class="card-body">
                <i class="bi bi-hdd-network fs-3"></i>
                32 ms API response time
              </div>
            </div>
          </div>
          <div class="col-lg-4 col-12 p-3">
            <div class="card rounded-4 shadow bg-secondary text-light">
              <div class="card-body">
                <i class="bi bi-file-earmark fs-3"></i>
                <TotalViewedPages/>
              </div>
            </div>
          </div>
          <div class="col-lg-6 col-12 pt-5">
            <div class="card rounded-4 shadow bg-secondary text-light">
              <div class="card-body">
                <h5 class="card-title">Pages consultés :</h5>

                <Suspense
                  fallback={
                    <div className="spinner-border" role="status">
                      <span className="sr-only"></span>
                    </div>
                  }>
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
