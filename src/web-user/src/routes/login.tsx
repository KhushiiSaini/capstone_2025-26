import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const heroImageUrl = 'https://www.eng.mcmaster.ca/wp-content/uploads/2021/05/JHE-Exterior-scaled.jpg';
const quickLoginEmails = [
  'teamd@local.dev',
  'dev@teamd.local',
  'test@teamd.dev',
  'admin@teamd.local',
  'alice.johnson@mcmaster.ca',
  'bob.smith@mcmaster.ca',
      'charlie.brown@mcmaster.ca',


];

function LoginPageContent() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const searchParams = useSearch({ from: '/login' });

  useEffect(() => {
    const authToken = (searchParams as any)?.auth;
    if (authToken && !user) {
      try {
        const payload = JSON.parse(atob(authToken.split('.')[1]));
        if (payload.user?.email) {
          handleAutoLogin(payload.user.email);
        }
      } catch (err) {
        console.error('Failed to decode auth token:', err);
      }
    }
  }, [searchParams, user]);

  useEffect(() => {
    if (user) {
      navigate({ to: '/' });
    }
  }, [user, navigate]);

  const handleAutoLogin = async (userEmail: string) => {
    setIsLoading(true);
    setError('');

    try {
      const success = await login(userEmail);
      if (success) {
        navigate({ to: '/' });
      } else {
        setError('Auto-login failed. Please try logging in manually.');
      }
    } catch {
      setError('Auto-login failed. Please try logging in manually.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const success = await login(email.trim());
      if (success) {
        navigate({ to: '/' });
      } else {
        setError('Login failed. Please check your email and try again.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f7ecf5 0%, #fdf7fb 40%, #ffffff 70%)',
        padding: '40px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1100px',
          borderRadius: '32px',
          overflow: 'hidden',
          boxShadow: '0 35px 80px rgba(122,0,60,0.25)',
          backgroundColor: '#fff',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '32px' }}>
          <section
            style={{
              flex: '1 1 50%',
              padding: '48px',
              background: 'linear-gradient(135deg, #ffffff 0%, #fff8fb 70%)',
              minHeight: '400px',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <p style={{ textTransform: 'uppercase', letterSpacing: '0.4em', color: '#AF668A' }}>Team D</p>
              <h1 style={{ fontSize: '2rem', color: '#7A003C', margin: '0 0 8px', fontWeight: 800 }}>Local Login</h1>
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
              marginTop: '18px',
              padding: '18px',
              backgroundColor: '#FDF4F8',
              borderRadius: '16px',
              border: '1px dashed #F3D3DF',
            }}
          >
            <p
              style={{
                margin: '0 0 10px 0',
                fontSize: '0.9rem',
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
          </section>

          <section
            style={{
              position: 'relative',
              flex: '1 1 50%',
              minHeight: '320px',
              backgroundImage: `linear-gradient(135deg, rgba(98,0,48,0.8), rgba(149,51,99,0.7)), url(${heroImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div style={{ padding: '48px', color: '#fff' }}>
              <p style={{ textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: '0.8rem', marginBottom: '12px' }}>
                MES Event Portal
              </p>
              <h2 style={{ fontSize: '2.4rem', lineHeight: 1.2, margin: 0, fontWeight: 800 }}>
                Welcome to the McMaster Engineering Society
              </h2>
              <p style={{ marginTop: '18px', maxWidth: '480px', fontSize: '1rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.9)' }}>
                Manage your invitations, stay informed about upcoming events, and connect with the MES community.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/login')({
  component: LoginPageContent,
});
