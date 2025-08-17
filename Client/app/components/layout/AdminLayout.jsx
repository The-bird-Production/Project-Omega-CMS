'use client';

import Head from 'next/head';
import '../../../public/css/admin.css';
import '../../../public/js/chart';

import Link from 'next/link';
import Script from 'next/script';
import { useEffect } from 'react';
import RootLayout from '../../layout';

function Layout({ children }) {
  useEffect(() => {
    require('../../../public/js/bootstrap.bundle.min.js');
    require('../../../public/js/chart');
  });
  return (
    <>
      <section className="bg-primary min-vh-100">
        <div className="text-light">
          <div className="container">{children}</div>
        </div>
      </section>
    </>
  );
}

export default Layout;
