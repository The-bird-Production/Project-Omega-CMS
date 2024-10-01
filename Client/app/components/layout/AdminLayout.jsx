"use client";

import Head from "next/head";
import "../../../public/css/admin.css";
import "../../../public/js/chart";

import Link from "next/link";
import Script from "next/script";
import { useEffect } from "react";

function Layout({ children }) {
  useEffect(() => {
    require("../../../public/js/bootstrap.bundle.min.js");
    require("../../../public/js/chart");
  });
  return (
    <>
      
        <div className="bg-primary text-light">
        <div className="container">{children}</div>
        </div>
      
    </>
  );
}

export default Layout;
