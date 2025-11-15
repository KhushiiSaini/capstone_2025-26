import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { getCurrentUser, AuthUser } from '../lib/auth';
import ProtectedTeamPortal from '../components/ProtectedTeamPortal';
import { useNavigate } from '@tanstack/react-router';
import { User, Calendar, ChartBar } from 'lucide-react';

interface DashboardCard {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const dashboardCards: DashboardCard[] = [
  { title: 'Event Manager', description: 'View, edit, and manage all your events', icon: Calendar, path: '/events' },
  { title: 'User Profile', description: 'Manage your account and settings', icon: User, path: '/profile' },
  { title: 'Analytics', description: 'Get insights on events and attendees', icon: ChartBar, path: '/analytics' },
];

const DashboardCardItem = ({ card, onClick }: { card: DashboardCard; onClick: () => void }) => (
  <div
    onClick={onClick}
    className="cursor-pointer bg-[#F9E9F0] rounded-2xl p-6 shadow-md hover:shadow-xl transition transform hover:-translate-y-1 border border-[#CA99B1]"
  >
    <card.icon className="w-10 h-10 text-[#953363] mb-4" />
    <h3 className="text-xl font-semibold mb-2 text-[#7A003C]">{card.title}</h3>
    <p className="text-[#AF668A] text-sm">{card.description}</p>
  </div>
);

function TeamDDashboard() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  return (
    <main className="min-h-screen bg-[#FFFFFF] flex flex-col lg:flex-row transition-colors duration-300">
      {/* Sidebar */}
      
      <aside className="bg-[#620030] text-white w-full lg:w-72 shadow-lg p-8 flex flex-col space-y-8">
        <div className="text-center lg:text-left">
          {/* Main header */}
          <h2 className="text-3xl font-extrabold text-[#FFFFFF] flex items-center space-x-2">
            <span>Admin Dashboard</span>
            <span className="w-6 h-6 bg-gradient-to-tr from-[#953363] to-[#AF668A] rounded-full flex-shrink-0"></span>
          </h2>
          {/* Decorative underline */}
          <div className="mt-2 w-16 h-1 bg-[#AF668A] rounded-full"></div>
        </div>

        <div className="flex flex-col space-y-4">
          {dashboardCards.map((card) => (
            <button
              key={card.title}
              onClick={() => navigate({ to: card.path })}
              className="flex items-center p-4 rounded-xl bg-[#953363] text-white hover:bg-[#AF668A] transition-all shadow-md"
            >
              <card.icon className="w-6 h-6 mr-3" />
              <span className="font-medium">{card.title}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <section className="flex-1 p-8 lg:p-12">
        <div className="text-center lg:text-left mb-12">
          {/* <h1 className="text-4xl lg:text-5xl font-extrabold text-[#7A003C] mb-2">
            Hi {user?.email}
          </h1> */}
          <h1 className="text-4xl lg:text-5xl font-extrabold text-[#7A003C] mb-2">
  Welcome, {user?.email
    ?.split("@")[0]             // get the part before @
    .split(".")                 // split by dot
    .map(name => name.charAt(0).toUpperCase() + name.slice(1)) // capitalize each part
    .join(" ")}                 
</h1>

          <p className="text-[#953363] text-lg">
  Access your admin dashboard to manage event registrations, handle check-ins, and send notifications.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {dashboardCards.map((card) => (
            <DashboardCardItem
              key={card.title}
              card={card}
              onClick={() => navigate({ to: card.path })}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function Home() {
  return (
    <ProtectedTeamPortal>
      <TeamDDashboard />
    </ProtectedTeamPortal>
  );
}

export const Route = createFileRoute('/')({
  component: Home,
});
