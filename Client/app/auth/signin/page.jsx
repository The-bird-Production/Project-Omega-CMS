'use client';

import { useState } from 'react';
import { authClient } from '../../../lib/authClient';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authClient.signIn.email({ email, password });
      console.log('SignIn Success:', res);
    } catch (err) {
      console.error('SignIn Error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card card-body mx-auto mt-5 center">
      <center>
        <form onSubmit={handleLogin} className="">
          <h1>Sign In</h1>
          <label className='form-label'>
            Email:
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='form-control mb-2'
            />
          </label>
          <br />

          <label className='form-label'>
            Password:
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='form-control mb-2'
            />
          </label>
          <br />

          <button type="submit" disabled={loading} className='btn btn-primary'>
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
      </center>
    </div>
  );
}
