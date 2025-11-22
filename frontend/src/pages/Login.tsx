import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface LoginProps { onSuccess?: () => void; focusOnMount?: boolean }

const Login: React.FC<LoginProps> = ({ onSuccess, focusOnMount = false }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (focusOnMount) {
      const heading = document.getElementById('login-heading');
      heading?.focus();
    }
  }, [focusOnMount]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true); setError(null);
    const ok = await login(username, password);
    setPending(false);
    if (!ok) {
      setError('Invalid credentials');
    } else if (onSuccess) {
      onSuccess();
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-8 bg-white p-4 rounded shadow" aria-labelledby="login-heading">
      <h2 id="login-heading" tabIndex={-1} className="text-lg font-semibold mb-4">Admin Login</h2>
      <form onSubmit={handleSubmit} className="space-y-3" aria-label="Admin login form">
        <div>
          <label htmlFor="login-username" className="block text-sm font-medium mb-1">Username</label>
          <input id="login-username" value={username} onChange={e => setUsername(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="login-password" className="block text-sm font-medium mb-1">Password</label>
          <input id="login-password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
        <button type="submit" disabled={pending} className="px-4 py-2 rounded bg-indigo-600 text-white text-sm disabled:opacity-50">
          {pending ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export default Login;
