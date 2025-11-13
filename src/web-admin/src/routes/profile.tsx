import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';

type User = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
};

async function fetchUsers(): Promise<User[]> {
  const res = await fetch('/api/auth/users'); // adjust if your endpoint is /api/users
  if (!res.ok) throw new Error('Failed to load users');
  return res.json();
}

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: fetchUsers,
  });

  if (isLoading) return <div>Loading users…</div>;
  if (error) return <div>Failed to load users</div>;

  return (
    <section>
      <h1>Users</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Email</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.firstName} {user.lastName}</td>
              <td>{user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
