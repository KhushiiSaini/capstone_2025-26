import { useEffect, useState } from 'react';
import { getCurrentUser, clearStoredAuth, checkMainPortalAuth, AuthUser } from '../lib/auth';
import LocalLoginForm from './LocalLoginForm';

interface ProtectedTeamPortalProps {
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
                Welcome to <br /> McMaster Engineering Society
              </h1>
              <p style={{ marginTop: '16px', maxWidth: '480px', fontSize: '1rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.85)' }}>
                {/* Sign in to manage registrations, communicate with attendees, and prepare for upcoming MES experiences. */}
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
                  <h2 style={{ margin: 0, color: '#7A003C', fontSize: '1.8rem' }}>Secure Access</h2>
                  <p style={{ color: '#953363', marginTop: '8px' }}>
                    Choose how you’d like to authenticate for the Team D admin experience.
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
                    Ideal when running the portal locally. No main authentication required.
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

                {/* <div
                  style={{
                    border: '1px solid #E1E7EE',
                    borderRadius: '20px',
                    padding: '20px',
                    backgroundColor: '#F9FBFF',
                  }}
                >
                  <h3 style={{ color: '#214F78', marginTop: 0 }}>🌐 Main Portal</h3>
                  <p style={{ color: '#456280', marginBottom: '16px' }}>
                    Redirect to the primary MES admin portal for production access.
                  </p>
                  <a
                    href="http://localhost:4001"
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

export default function ProtectedTeamPortal({ children }: ProtectedTeamPortalProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('Checking auth...'); // Debug log

      // First check local auth
      const currentUser = getCurrentUser();
      console.log('Current user:', currentUser); // Debug log

      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
        return;
      }

      // If no local auth, check main portal
      console.log('No local auth, checking main portal...');
      const mainPortalUser = await checkMainPortalAuth();

      if (mainPortalUser) {
        setUser(mainPortalUser);
      }

      setLoading(false);
    };

    // Check immediately
    checkAuth();

    // Listen for storage changes (if user logs out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'teamd-auth-user' && !e.newValue) {
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (loading) {
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
    setUser(authUser);
  };

  if (!user) {
    return <UnauthorizedAccess onLocalLogin={handleLocalLogin} />;
  }
return (
  <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
    {/* ---------------- Header ---------------- */}
    <header className="fixed top-0 left-0 w-full bg-gradient-to-r from-[#620030] to-[#953363] text-white shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Left: Logo + Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#7A003C] font-extrabold text-lg shadow-sm">
            MES
          </div>
          <h1 className="font-bold text-xl leading-none">MES Events Platform</h1>
        </div>

        {/* Right: Logout button */}
        <div>
          <button
            onClick={() => {
              clearStoredAuth();
              window.location.reload();
            }}
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-semibold transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>

    {/* Main content */}
    <main className="max-w-7xl mx-auto py-6">
      {children}
    </main>
  </div>
);

  // return (
  //   <div>
  //     {/* Auth info header */}
  //     <div style={{
  //       position: 'fixed',      // sticks to the top
  //       top: 0,
  //       left: 0,
  //       width: '100vw',         // full viewport width
  //       backgroundColor: '#d4edda',
  //       borderBottom: '1px solid #c3e6cb',
  //       padding: '10px 20px',
  //       display: 'flex',
  //       justifyContent: 'space-between',
  //       alignItems: 'center',
  //       boxSizing: 'border-box',
  //       zIndex: 1000    
  //     }}>
  //       <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
  //         <span style={{ color: '#155724', fontSize: '0.9rem' }}>
  //           ✅ Authenticated as: <strong>{user.email}</strong>
  //         </span>
  //         <span style={{
  //           color: '#0c5460',
  //           fontSize: '0.8rem',
  //           backgroundColor: '#d1ecf1',
  //           padding: '2px 8px',
  //           borderRadius: '3px',
  //           border: '1px solid #bee5eb'
  //         }}>
  //           {sessionStorage.getItem('teamd-auth-source') === 'local' ? '🚀 Local Dev' : '🌐 Main Portal'}
  //         </span>
  //       </div>
  //       {sessionStorage.getItem('teamd-auth-source') === 'local' && (
  //         <button
  //           onClick={() => {
  //             clearStoredAuth();
  //             window.location.reload();
  //           }}
  //           style={{
  //             backgroundColor: '#dc3545',
  //             color: 'white',
  //             border: 'none',
  //             padding: '5px 10px',
  //             borderRadius: '4px',
  //             fontSize: '0.8rem',
  //             cursor: 'pointer'
  //           }}
  //         >
  //           Logout
  //         </button>
  //       )}
  //     </div>
  //     {children}
  //   </div>
  // );
}
