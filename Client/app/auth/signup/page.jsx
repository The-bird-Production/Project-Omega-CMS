"use client";

import { useState } from "react";
import { authClient } from "../../../lib/authClient";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authClient.signUp.email({ email, password });
      console.log("SignUp Success:", res);
    } catch (err) {
      console.error("SignUp Error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleRegister}>
      <h1>Sign Up</h1>
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
        {loading ? "Loading..." : "Register"}
      </button>
    </form>
  );
}
