'use client';
import AdminLayout from '../../components/layout/AdminLayout';
import Dashboard from '../../components/admin/Dashboard';
import Link from 'next/link';
import { Suspense, useState } from 'react';
import APIResponseTime from '../../components/admin/graph/APIResponseTime';
import ConsultedPages from '../../components/admin/graph/ConsultedPages';
import TotalViewedPages from '../../components/admin/graph/TotalViewedPages';
import NumberOfUser from '../../components/admin/graph/NumberOfUser';
import NumberOfPage from '../../components/admin/graph/NumberOfPages';

function toDateInputValue(date) {
  return date.toISOString().slice(0, 10);
}

const THIRTY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

export default function StatsAdmin() {
  const [startDate, setStartDate] = useState(toDateInputValue(THIRTY_DAYS_AGO));
  const [endDate, setEndDate] = useState(toDateInputValue(new Date()));
  // The <input type="date"> value is just a calendar day (midnight) — extend
  // it to the end of that day so the range actually includes everything
  // that happened on the selected end date, not just up to its first instant.
  const endOfEndDate = endDate ? `${endDate}T23:59:59.999` : endDate;

  return (
    <>
      <AdminLayout>
        <Dashboard>
          <nav aria-label="breadcrumb" className="text-light pt-5 mt-5">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link href="/admin">Dashboard</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Stats
              </li>
            </ol>
          </nav>
          <div className="pt-3 mt-3">
            <div className="card border border-0 rounded">
              <div className="card-body bg-secondary rounded ">
                <h2 className="card-title text-light">Stats</h2>

                <div className="row g-2 text-light align-items-end mb-3">
                  <div className="col-auto">
                    <label htmlFor="statsStartDate" className="form-label mb-1">
                      Du
                    </label>
                    <input
                      id="statsStartDate"
                      type="date"
                      className="form-control"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="col-auto">
                    <label htmlFor="statsEndDate" className="form-label mb-1">
                      Au
                    </label>
                    <input
                      id="statsEndDate"
                      type="date"
                      className="form-control"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                     <Suspense fallback={<h1>Loading</h1>}>

                     <div className='container row text-light '>

                        <div className='col-6'>
                            <div className='card card-body bg-primary'>
                            <h3>Api stats :</h3>
                            <APIResponseTime startDate={startDate} endDate={endOfEndDate} />
                            </div>

                        </div>
                        <div className='col-6'>
                            <div className='card card-body bg-primary'>
                                <h3>Pages stats :</h3>
                                <ConsultedPages startDate={startDate} endDate={endOfEndDate} />
                                <TotalViewedPages startDate={startDate} endDate={endOfEndDate} />
                            </div>

                        </div>

                        <div className='col-12 pt-3'>
                            <div className='card card-body bg-primary'>
                                <h3>Other stats :</h3>
                                <div className='pt-2'>
                                <NumberOfUser/>
                                </div>

                                <div className='pt-2'>
                                <NumberOfPage/>
                                </div>



                            </div>

                        </div>

                     </div>


                     </Suspense>


                </div>
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    </>
  );
}
