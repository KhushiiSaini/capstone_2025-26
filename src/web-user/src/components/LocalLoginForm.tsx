import { useState } from 'react';
import { AuthUser } from '../lib/auth';

const quickLoginEmails = [
  'teamd@local.dev',
  'dev@teamd.local',
  'test@teamd.dev',
  'admin@teamd.local',
  'alice.johnson@mcmaster.ca',
  'bob.smith@mcmaster.ca',
];

interface LocalLoginFormProps {
  onLoginSuccess: (user: AuthUser, token: string) => void;
}

export default function LocalLoginForm({ onLoginSuccess }: LocalLoginFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user && data.token) {
          sessionStorage.setItem('teamd-auth-user', JSON.stringify(data.user));
          sessionStorage.setItem('teamd-auth-token', data.token);
          sessionStorage.setItem('teamd-auth-source', 'local');
          onLoginSuccess(data.user, data.token);
        } else {
          setError('Invalid response from server.');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Login failed');
      }
    } catch {
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ color: '#7A003C', marginBottom: '6px', fontSize: '1.6rem' }}>Local Login</h2>
        <p style={{ color: '#953363', margin: 0 }}>Sign in quickly without portal credentials.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your Team D email"
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '14px',
            border: '1px solid #F3D3DF',
            fontSize: '16px',
            color: '#7A003C',
            outline: 'none',
          }}
        />

        {error && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '12px',
              borderRadius: '12px',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '999px',
            border: 'none',
            backgroundColor: '#7A003C',
            color: 'white',
            fontSize: '16px',
            fontWeight: 600,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            boxShadow: '0 15px 30px rgba(122,0,60,0.25)',
          }}
        >
          {isLoading ? 'Logging in…' : 'Login'}
        </button>
      </form>

      <div
        style={{
          marginTop: '12px',
          padding: '18px',
          backgroundColor: '#FDF4F8',
          borderRadius: '16px',
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
          Quick Login (Development):
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {quickLoginEmails.map((userEmail) => (
            <button
              key={userEmail}
              onClick={() => setEmail(userEmail)}
              type="button"
              style={{
                padding: '6px 10px',
                fontSize: '0.8rem',
                backgroundColor: '#fff',
                border: '1px solid #E6B8D1',
                borderRadius: '999px',
                cursor: 'pointer',
                color: '#7A003C',
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
