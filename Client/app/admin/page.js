"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import AdminNavBar from "../components/admin/AdminNavBar";

import AdminLayout from "../components/layout/AdminLayout";
import AdminContentLayout from "../components/admin/AdminContentLayout";
import AdminHeader from "../components/admin/AdminHeader";
import MainContent from "../components/admin/MainContent";

export default function Admin() {
  const { data: session, status } = useSession({
    required: true,
  });

  const [role, setRole] = useState(null);

  useEffect(() => {
    if (status === "authenticated" && session.user.roleId) {
      fetch(`/api/getRole?id=${session.user.roleId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.role) {
            setRole(data.role);
            if (data.role !== "admin") {
              redirect("/");
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching role:", error);
          redirect("/");
        });
    }
  }, [session, status]);

  if (status === "loading") {
    return (
      <>
        <h1>Loading...</h1>
        <div className="spinner-border" role="status">
          <span className="sr-only"></span>
        </div>
      </>
    );
  }
  return (
    <>
      <AdminLayout>
        <AdminNavBar></AdminNavBar>
        <AdminContentLayout>
          <AdminHeader session={session}></AdminHeader>
          <MainContent></MainContent>
        </AdminContentLayout>
      </AdminLayout>
    </>
  );
}
