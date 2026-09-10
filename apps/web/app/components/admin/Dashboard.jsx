"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { authClient } from "../../../lib/authClient";

const AdminHeader = dynamic(() => import("./AdminHeader"), { ssr: false });
const AdminNavBar = dynamic(() => import("./AdminNavBar"), { ssr: false });
const AdminContentLayout = dynamic(() => import("./AdminContentLayout"), { ssr: false });

export default function Layout({ children }) {
  const router = useRouter();
  const [canViewDashboard, setCanViewDashboard] = useState(null);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const { data, error } = await authClient.admin.hasPermission({
          permissions: {
            administration: ["viewDashboard"],
          },
        });

        if (error || !data) {
          console.log("No permission to view dashboard");
          router.push("/");
          return;
        }

        setCanViewDashboard(true);
      } catch (err) {
        console.error("Error while checking permissions:", err);
        router.push("/");
      }
    };

    checkPermission();
  }, [router]);

  if (canViewDashboard === null) {
    // Loader temporaire pendant la vérification
    return <div>Checking permissions...</div>;
  }

  return (
    <>
      <AdminNavBar />
      <AdminContentLayout>
        <AdminHeader />
        {children}
      </AdminContentLayout>
    </>
  );
}
