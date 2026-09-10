'use client';

import { useState } from 'react';
import { authClient } from '../../../lib/authClient';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authClient.signUp.email({ email, password });
      console.log('SignUp Success:', res);
    } catch (err) {
      console.error('SignUp Error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card card-body mx-auto mt-5 center">
      <center>
        <form onSubmit={handleRegister}>
          <h1>Sign Up</h1>
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
            {loading ? 'Loading...' : 'Register'}
          </button>
        </form>
      </center>
    </div>
  );
}
