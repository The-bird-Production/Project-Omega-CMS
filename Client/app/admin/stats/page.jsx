'use client';
import AdminLayout from '../../components/layout/AdminLayout';
import Dashboard from '../../components/admin/Dashboard';
import Link from 'next/link';
import { Suspense } from 'react';
import APIResponseTime from '../../components/admin/graph/APIResponseTime';
import ConsultedPages from '../../components/admin/graph/ConsultedPages';
import TotalViewedPages from '../../components/admin/graph/TotalViewedPages';
import NumberOfUser from '../../components/admin/graph/NumberOfUser'
import NumberOfRole from '../../components/admin/graph/NumberOfRole'
import NumberOfPage from '../../components/admin/graph/NumberOfPages'

export default function statsAdmin() {
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
                <div>
                     <Suspense fallback={<h1>Loading</h1>}> 

                     <div className='container row text-light '>

                        <div className='col-6'>
                            <div className='card card-body bg-primary'>
                            <h3>Api stats :</h3>
                            <APIResponseTime/>
                            </div>
                            
                        </div>
                        <div className='col-6'>
                            <div className='card card-body bg-primary'>
                                <h3>Pages stats :</h3>
                                <ConsultedPages/>
                                <TotalViewedPages/>
                            </div>

                        </div>

                        <div className='col-12 pt-3'>
                            <div className='card card-body bg-primary'>
                                <h3>Other stats :</h3>
                                <div className='pt-2'>
                                <NumberOfUser/>
                                </div>
                                <div className='pt-2'>
                                <NumberOfRole/>
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
        </Dashboard>
      </AdminLayout>
    </>
  );
}
