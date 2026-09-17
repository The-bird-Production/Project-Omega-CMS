'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '../../../lib/authClient';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // authClient methods resolve with { data, error } rather than
      // throwing — a wrong password or unknown email shows up as `error`,
      // not as a caught exception, so it has to be checked explicitly.
      const { error: signInError } = await authClient.signIn.email({ email, password });
      if (signInError) {
        setError(signInError.message || 'Email ou mot de passe incorrect.');
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push('/admin'), 1200);
    } catch (err) {
      console.error('SignIn Error:', err);
      setError('Une erreur est survenue. Réessayez.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card card-body mx-auto mt-5 center" style={{ maxWidth: 420, position: 'relative' }}>
      {success && (
        <div
          className="alert alert-success d-flex align-items-center gap-2"
          style={{ position: 'absolute', top: -60, left: 0, right: 0 }}
          role="alert"
        >
          <i className="bi bi-check-circle-fill" aria-hidden="true" />
          Connexion réussie ! Redirection...
        </div>
      )}
      <center>
        <form onSubmit={handleLogin}>
          <h1>Sign In</h1>

          {error && (
            <div className="alert alert-danger text-start" role="alert">
              {error}
            </div>
          )}

          <label className="form-label" htmlFor="signinEmail">
            Email:
            <input
              id="signinEmail"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control mb-2"
            />
          </label>
          <br />

          <label className="form-label" htmlFor="signinPassword">
            Password:
            <input
              id="signinPassword"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control mb-2"
            />
          </label>
          <br />

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
      </center>
    </div>
  );
}
