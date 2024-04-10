"use client";
import { useSession } from "next-auth/react";

export default function Admin() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      // The user is not authenticated, handle it here.
    },
  });

  if (status === "loading") {
    return (
      <>
        <h1>Loading or not authenticated...</h1>
      </>
    );
  }
  console.log(session);
  return (
    <>
      <h1>User is logged In {session.expires} </h1>
    </>
  );
}
