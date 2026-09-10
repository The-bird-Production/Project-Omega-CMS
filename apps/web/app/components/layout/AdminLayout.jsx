'use client';


import '../../../public/js/chart';


import { useEffect } from 'react';
import RootLayout from '../../layout';

function Layout({ children }) {
  useEffect(() => {
    require('../../../public/js/bootstrap.bundle.min.js');
    require('../../../public/js/chart');
  });
  return (
    <>

      <div className="text-light">
        <div className="container">{children}</div>
      </div>

    </>
  );
}

export default Layout;
