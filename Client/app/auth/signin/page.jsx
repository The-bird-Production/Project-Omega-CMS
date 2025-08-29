"use client";

import { useState } from "react";
import { authClient } from "../../../lib/authClient";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authClient.signIn.email({ email, password });
      console.log("SignIn Success:", res);
    } catch (err) {
      console.error("SignIn Error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <h1>Sign In</h1>
      <label>
        Email:
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <br />

      <label>
        Password:
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <br />

      <button type="submit" disabled={loading}>
        {loading ? "Loading..." : "Login"}
      </button>
    </form>
  );
}
