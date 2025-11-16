import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="min-h-screen">
        <main className="pt-8">
          <Outlet />
        </main>
      </div>
      {process.env.NODE_ENV === 'development' && <TanStackRouterDevtools />}
    </>
  ),
});
