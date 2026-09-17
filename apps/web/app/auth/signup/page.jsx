'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '../../../lib/authClient';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleRegister(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // better-auth requires `name` on sign-up — omitting it is what used
      // to fail here with a "name" validation error.
      const { error: signUpError } = await authClient.signUp.email({ name, email, password });
      if (signUpError) {
        setError(signUpError.message || "Erreur lors de l'inscription.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push('/admin'), 1200);
    } catch (err) {
      console.error('SignUp Error:', err);
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
          Compte créé ! Redirection...
        </div>
      )}
      <center>
        <form onSubmit={handleRegister}>
          <h1>Sign Up</h1>

          {error && (
            <div className="alert alert-danger text-start" role="alert">
              {error}
            </div>
          )}

          <label className="form-label" htmlFor="signupName">
            Nom :
            <input
              id="signupName"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-control mb-2"
            />
          </label>
          <br />

          <label className="form-label" htmlFor="signupEmail">
            Email:
            <input
              id="signupEmail"
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

          <label className="form-label" htmlFor="signupPassword">
            Password:
            <input
              id="signupPassword"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control mb-2"
            />
          </label>
          <br />

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Loading...' : 'Register'}
          </button>
        </form>
      </center>
    </div>
  );
}
