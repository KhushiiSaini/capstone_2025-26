


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
    description: 'Access and manage your registered events.',
    icon: Calendar,
    route: '/events',
  },
  {
    title: 'Notifications',
    description: 'View your alerts and important updates on MES events.',
    icon: Bell,
    route: '/inbox',
  },
];

const ServiceCardItem = ({ card, onClick }: { card: ServiceCard; onClick: () => void }) => (
  <div
    onClick={onClick}
    className="cursor-pointer bg-[#F9E9F0] rounded-2xl p-6 shadow-md hover:shadow-xl transition transform hover:-translate-y-1 border border-[#CA99B1]"
  >
    <card.icon className="w-10 h-10 text-[#953363] mb-4" />
    <h3 className="text-xl font-semibold mb-2 text-[#7A003C]">{card.title}</h3>
    <p className="text-[#AF668A] text-sm">{card.description}</p>
  </div>
);

function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Format the user's name from email
  const userName = user?.email
    ?.split('@')[0]
    .split('.')
    .map(word => word[0].toUpperCase() + word.slice(1))
    .join(' ') || 'User';

  return (
    <main className="min-h-screen bg-[#F8F4F7] text-[#2D142C]">
      {/* Header / Taskbar */}
      <header className="bg-gradient-to-r from-[#620030] to-[#953363] text-white shadow-lg">
        <div className="w-full px-6 py-4 flex justify-between items-center">

          {/* LEFT-ALIGNED LOGO */}
          <div className="flex items-center space-x-3" onClick={() => window.location.href = "/"}>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#7A003C] font-extrabold text-lg shadow-sm">
              MES
            </div>
            <div>
              <h1 className="font-bold text-xl leading-none">MES Events Platform</h1>
            </div>
          </div>

          {/* RIGHT-SIDE NAV BUTTONS */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate({ to: '/events' })}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-semibold transition"
            >
              Events
            </button>

            <button
              onClick={() => navigate({ to: '/profile' })}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-semibold transition"
            >
              Profile
            </button>

            <button
              onClick={() => navigate({ to: '/inbox' })}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-semibold transition"
            >
              Notifications
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-semibold transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

        </div>
      </header>
      {/* <header className="bg-gradient-to-r from-[#620030] to-[#953363] text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3" onClick={() => window.location.href = "/"}>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#7A003C] font-extrabold text-lg shadow-sm">
              MES
            </div>
            <div>
              <h1 className="font-bold text-xl leading-none">MES Events Platform</h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">

            <button
              onClick={() => navigate({ to: '/events' })}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-semibold transition"
            >
              Events
            </button>
            <button
              onClick={() => navigate({ to: '/profile' })}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-semibold transition"
            >
              Profile
            </button>
            <button
              onClick={() => navigate({ to: '/inbox' })}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-semibold transition"
            >
              Notifications
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-semibold transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header> */}

      {/* Main Content */}
      <div className=" bg-[#F9E9F0] p-8">

        <div className="rounded-3xl shadow-md p-10 bg-white mx-auto w-full ">

          <section className="flex-1 max-w-6xl mx-auto px-6 pb-12 space-y-10">
            <div className="bg-white border border-[#F3D3DF] rounded-3xl shadow-md p-6">
              <h2 className="text-3xl font-extrabold text-[#7A003C] mb-2">Welcome, {userName}</h2>
              <p className="text-[#953363]">
                Access your personal dashboard, stay informed on upcoming MES events, and manage your participation.
              </p>
            </div>

            {/* Service Cards */}
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
        </div>
      </div>

      <footer className="bg-[#F3D3DF] text-[#7A003C] text-center py-6 text-sm">
        © 2025 MES Events Platform. Large event support and coordination.
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
