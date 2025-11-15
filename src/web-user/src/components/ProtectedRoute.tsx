import { useState } from 'react';
import { AuthUser } from '../lib/auth';
import LocalLoginForm from './LocalLoginForm';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const heroImageUrl = 'https://www.eng.mcmaster.ca/wp-content/uploads/2021/05/JHE-Exterior-scaled.jpg';

function UnauthorizedAccess({ onLocalLogin }: { onLocalLogin: (user: AuthUser, token: string) => void }) {
  const [showLocalLogin, setShowLocalLogin] = useState(false);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #f7ecf5 0%, #fdf7fb 35%, #ffffff 60%)',
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '40px 24px',
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column-reverse',
            gap: '32px',
            borderRadius: '32px',
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(149, 51, 99, 0.15)',
            backgroundColor: '#fff',
          }}
        >
          <div
            style={{
              position: 'relative',
              flex: '1 1 50%',
              minHeight: '320px',
              backgroundImage: `linear-gradient(135deg, rgba(98,0,48,0.75), rgba(149,51,99,0.75)), url(${heroImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div style={{ padding: '40px', color: '#fff' }}>
              <p style={{ textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: '0.8rem', marginBottom: '12px' }}>
                MES Events Portal
              </p>
              <h1 style={{ fontSize: '2.5rem', margin: 0, lineHeight: 1.2, fontWeight: 800 }}>
                Welcome to the McMaster Engineering Society
              </h1>
              <p style={{ marginTop: '16px', maxWidth: '480px', fontSize: '1rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.85)' }}>
                {/* Sign in to manage invitations, track events, and stay connected with MES. */}
              </p>
            </div>
          </div>

          <div
            style={{
              flex: '1 1 50%',
              padding: '40px',
              background: 'linear-gradient(135deg, #ffffff 0%, #fff8fb 60%)',
            }}
          >
            {showLocalLogin ? (
              <>
                <LocalLoginForm onLoginSuccess={onLocalLogin} />
                <button
                  onClick={() => setShowLocalLogin(false)}
                  style={{
                    marginTop: '16px',
                    background: 'none',
                    border: 'none',
                    color: '#7A003C',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  ← Back to Auth Options
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h2 style={{ margin: 0, color: '#7A003C', fontSize: '1.8rem' }}>Choose your access</h2>
                  <p style={{ color: '#953363', marginTop: '8px' }}>
                    Select the method that matches how you’re accessing Team D services today.
                  </p>
                </div>

                <div
                  style={{
                    border: '1px solid #F3D3DF',
                    borderRadius: '20px',
                    padding: '20px',
                    backgroundColor: '#FDF4F8',
                  }}
                >
                  <h3 style={{ color: '#7A003C', marginTop: 0 }}>🚀 Local Development</h3>
                  <p style={{ color: '#953363', marginBottom: '16px' }}>
                    Ideal for local QA and demos. No main portal credentials required.
                  </p>
                  <button
                    onClick={() => setShowLocalLogin(true)}
                    style={{
                      backgroundColor: '#7A003C',
                      color: 'white',
                      border: 'none',
                      padding: '10px 18px',
                      borderRadius: '999px',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Use Local Login
                  </button>
                </div>
{/* 
                <div
                  style={{
                    border: '1px solid #E1E7EE',
                    borderRadius: '20px',
                    padding: '20px',
                    backgroundColor: '#F9FBFF',
                  }}
                >
                  <h3 style={{ color: '#214F78', marginTop: 0 }}>🌐 Main Portal</h3>
                  <p style={{ color: '#456280', marginBottom: '16px' }}>
                    Redirect to the official MES portal for production access.
                  </p>
                  <a
                    href="http://localhost:4000"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: '#1B69C8',
                      color: 'white',
                      padding: '10px 18px',
                      borderRadius: '999px',
                      textDecoration: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Go to Main Portal →
                  </a>
                  <p style={{ color: '#6C7B8A', fontSize: '0.85rem', marginTop: '8px' }}>
                    After signing in, choose “Team D Portal” to continue.
                  </p>
                </div> */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  const handleLocalLogin = (authUser: AuthUser, token: string) => {
    console.log('Local login successful:', authUser);
    // Reload to update AuthContext
    window.location.reload();
  };

  if (!user) {
    return <UnauthorizedAccess onLocalLogin={handleLocalLogin} />;
  }

  return <>{children}</>;
}
