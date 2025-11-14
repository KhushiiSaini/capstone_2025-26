import './styles.css';

const adminUrl = import.meta.env.VITE_WEB_ADMIN_URL ?? 'http://localhost:3024/';
const userUrl = import.meta.env.VITE_WEB_USER_URL ?? 'http://localhost:3014/';

type PortalTile = {
  label: string;
  description: string;
  url: string;
  accent: string;
  icon: React.ReactNode;
};

const tiles: PortalTile[] = [
  {
    label: 'Event Manager',
    description: 'View, edit, and manage all your events',
    url: adminUrl,
    accent: '#7A003C',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true" fill="none">
        <rect x="5" y="10" width="30" height="23" rx="6" stroke="#7A003C" strokeWidth="2" />
        <path d="M10 16H30" stroke="#7A003C" strokeWidth="2" strokeLinecap="round" />
        <rect x="13" y="6" width="2.5" height="8" rx="1" fill="#7A003C" />
        <rect x="25" y="6" width="2.5" height="8" rx="1" fill="#7A003C" />
      </svg>
    ),
  },
  {
    label: 'User Profile',
    description: 'Manage your account and settings',
    url: userUrl,
    accent: '#953363',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true" fill="none">
        <circle cx="20" cy="15" r="6" stroke="#953363" strokeWidth="2" />
        <path d="M9 31c2-5 6-7.5 11-7.5s9 2.5 11 7.5" stroke="#953363" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function App() {
  const handleClick = (url: string) => {
    window.location.href = url;
  };

  return (
    <div className="portal-root">
      <div className="portal-shell">
        <div className="portal-header">
          <h1 className="portal-title">Welcome to MES Events</h1>
          <p className="portal-lede">Pick the portal that matches your role.</p>
        </div>

        <div className="portal-grid">
          {tiles.map((tile) => (
            <button
              key={tile.label}
              type="button"
              onClick={() => handleClick(tile.url)}
              className="portal-card"
              style={{ borderColor: '#ECC5D4', background: '#FEF3F8' }}
            >
              <div className="portal-icon">{tile.icon}</div>
              <h2 className="portal-card-title">{tile.label}</h2>
              <p className="portal-card-copy">{tile.description}</p>
              <span className="portal-chip" style={{ backgroundColor: tile.accent }}>
                Open →
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
