import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

async function fetchUsers(): Promise<User[]> {
  const res = await fetch('/api/auth/users'); // adjust to /api/users if you move the route
  if (!res.ok) throw new Error('Failed to load users');
  return res.json();
}

export const Route = createFileRoute('/users')({
  component: UsersPage,
});

function UsersPage() {
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Failed to load users</div>;

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
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
  );
}
