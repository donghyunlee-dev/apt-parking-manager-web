import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from '@/routes/ProtectedRoute';
import useAuthStore from '@/features/auth/store';

const Wrapper = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  useAuthStore.setState({ isAuthenticated });
  return (
    <MemoryRouter initialEntries={['/']}
>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<div>Protected</div>} />
        </Route>
        <Route path="/login" element={<div>Login</div>} />
      </Routes>
    </MemoryRouter>
  );
};

it('redirects unauthenticated users to login', () => {
  render(<Wrapper isAuthenticated={false} />);
  expect(screen.getByText('Login')).toBeInTheDocument();
});

it('renders protected route for authenticated users', () => {
  render(<Wrapper isAuthenticated={true} />);
  expect(screen.getByText('Protected')).toBeInTheDocument();
});
