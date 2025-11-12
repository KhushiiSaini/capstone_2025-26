import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { useState, useEffect } from 'react';
import { User, Calendar, Bell, LogOut } from 'lucide-react';

interface ServiceCard {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
}

const serviceCards: ServiceCard[] = [
  {
    title: 'User Profile',
    description: 'View and manage your personal profile, credentials, and preferences.',
    icon: User,
    route: '/profile',
  },
  {
    title: 'Your Events',
    description: 'Access and manage your assigned or registered events.',
    icon: Calendar,
    route: '/events',
  },
  {
    title: 'Notifications',
    description: 'View your alerts, reminders, and important team updates.',
    icon: Bell,
    route: '/inbox',
  },
];

const ServiceCardItem = ({ card, onClick }: { card: ServiceCard; onClick: () => void }) => (
  <div
    onClick={onClick}
    className="cursor-pointer bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition transform hover:-translate-y-1 border border-gray-200"
  >
    <card.icon className="w-10 h-10 text-[#7A003C] mb-4" />
    <h3 className="text-xl font-semibold mb-2 text-gray-800">{card.title}</h3>
    <p className="text-gray-500 text-sm">{card.description}</p>
  </div>
);

function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLocalAuth, setIsLocalAuth] = useState(false);

  useEffect(() => {
    const authSource = sessionStorage.getItem('teamd-auth-source');
    setIsLocalAuth(authSource === 'local');
  }, [user]);

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      {/* ✅ Top Bar */}
      <header className="bg-[#7C3AED] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Left: Logo + Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#7C3AED] font-bold text-lg shadow-sm">
              D
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">Team D Events</h1>
              <p className="text-sm opacity-80">User Dashboard</p>
            </div>
          </div>

          {/* Right: User Info */}
          <div className="flex items-center space-x-4">
            <span className="text-sm hidden sm:inline">Hi, {user?.email}</span>
            {isLocalAuth && (
              <button
                onClick={logout}
                className="flex items-center space-x-1 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-medium transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ✅ Main Content */}
      <section className="flex-1 max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Welcome, {user?.email}
          </h2>
          <p className="text-gray-600">
            Access your personal dashboard and manage your Team D event experience.
          </p>
        </div>

        {/* ✅ Service Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {serviceCards.map((card) => (
            <ServiceCardItem
              key={card.title}
              card={card}
              onClick={() => navigate({ to: card.route })}
            />
          ))}
        </div>
      </section>

      {/* ✅ Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-6 text-center text-gray-500 text-sm">
        © 2025 Team D Event Services. Large event support and coordination.
      </footer>
    </main>
  );
}

function HomePage() {
  return (
    <ProtectedRoute>
      <UserDashboard />
    </ProtectedRoute>
  );
}

export const Route = createFileRoute('/')({
  component: HomePage,
});
