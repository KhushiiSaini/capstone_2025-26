import { useState } from 'react';
import { AuthUser } from '../lib/auth';

interface LocalLoginFormProps {
  onLoginSuccess: (user: AuthUser, token: string) => void;
}

export default function LocalLoginForm({ onLoginSuccess }: LocalLoginFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email) {
      setError('Email is required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/local-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store local auth
        sessionStorage.setItem('teamd-auth-user', JSON.stringify(data.user));
        sessionStorage.setItem('teamd-auth-token', data.token);
        sessionStorage.setItem('teamd-auth-source', 'local');

        onLoginSuccess(data.user, data.token);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
      console.error('Local login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (userEmail: string) => {
    setEmail(userEmail);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ color: '#7A003C', marginBottom: '6px', fontSize: '1.6rem' }}>Admin Login</h2>
        <p style={{ color: '#953363', margin: 0 }}>Sign in quickly without portal credentials.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#7A003C',
            color: 'white',
            border: 'none',
            borderRadius: '999px',
            fontSize: '14px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            boxShadow: '0 10px 20px rgba(122,0,60,0.2)',
            fontWeight: 600,
            letterSpacing: '0.02em',
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {error && (
          <div style={{
            color: '#dc3545',
            fontSize: '0.85rem',
            marginTop: '10px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
      </form>

      <div
        style={{
          marginTop: '12px',
          padding: '18px',
          backgroundColor: '#FDF4F8',
          borderRadius: '12px',
          border: '1px dashed #F3D3DF',
        }}
      >
        <p
          style={{
            margin: '0 0 10px 0',
            fontSize: '0.85rem',
            color: '#7A003C',
            fontWeight: 'bold',
          }}
        >
          Quick Login Credentials:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {[
            // 'teamd@local.dev',
            // 'dev@teamd.local',
            // 'test@teamd.dev',
            // 'admin@teamd.local',
            'alice.johnson@mcmaster.ca'
          ].map(userEmail => (
            <button
              key={userEmail}
              onClick={() => quickLogin(userEmail)}
              style={{
                padding: '4px 8px',
                fontSize: '0.7rem',
                backgroundColor: '#e9ecef',
                border: '1px solid #dee2e6',
                borderRadius: '3px',
                cursor: 'pointer',
                color: '#495057'
              }}
            >
              {userEmail}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
