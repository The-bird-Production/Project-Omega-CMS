"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function Admin() {
  const { data: session, status } = useSession({
    required: true,
  });

  const [role, setRole] = useState(null);

  useEffect(() => {
    if (status === "authenticated") {
      console.log(session);
      fetch(`/api/getRole?id=${session.user.roleId}`)
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
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
        <h1>Loading or not authenticated...</h1>
      </>
    );
  }

  return (
    <>
      <h1>Welcome Admin</h1>
      <h2>Role: {role}</h2>
    </>
  );
}
