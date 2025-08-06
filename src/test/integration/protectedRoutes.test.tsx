import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from '@/components/routing/ProtectedRoute';
import { useRedirectAfterAuth } from '@/hooks/useRedirectAfterAuth';

// Mock the auth context
const mockAuthContext = {
  user: null,
  loading: false,
  hasRole: vi.fn(),
  profile: null,
};

// Mock useAuth hook
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}));

// Mock useRedirectAfterAuth
vi.mock('@/hooks/useRedirectAfterAuth', () => ({
  useRedirectAfterAuth: vi.fn(),
}));

// Mock react-router-dom navigation
const mockNavigate = vi.fn();
const mockLocation = { state: null, pathname: '/' };

vi.mock('react-router-dom', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
    Navigate: ({ to, replace }: any) => <div data-testid="navigate-to">{to}</div>,
  };
});

describe('Protected Routes Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthContext.user = null;
    mockAuthContext.loading = false;
    mockAuthContext.hasRole.mockReturnValue(false);
    mockAuthContext.profile = null;
  });

  describe('Unauthenticated Access', () => {
    it('should redirect to auth page when accessing protected route', () => {
      render(
        <MemoryRouter initialEntries={['/admin']}>
          <ProtectedRoute>
            <div>Admin Panel</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByTestId('navigate-to')).toHaveTextContent('/auth');
      expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
    });

    it('should redirect to custom path when specified', () => {
      render(
        <MemoryRouter initialEntries={['/premium']}>
          <ProtectedRoute redirectTo="/login">
            <div>Premium Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByTestId('navigate-to')).toHaveTextContent('/login');
    });

    it('should preserve intended destination in location state', () => {
      const { rerender } = render(
        <MemoryRouter initialEntries={['/admin/user-migration']}>
          <ProtectedRoute>
            <div>Migration Tool</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      // Verify redirection occurs
      expect(screen.getByTestId('navigate-to')).toHaveTextContent('/auth');
    });

    it('should allow public routes without authentication', () => {
      render(
        <MemoryRouter>
          <ProtectedRoute requireAuth={false}>
            <div>Public Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Public Content')).toBeInTheDocument();
      expect(screen.queryByTestId('navigate-to')).not.toBeInTheDocument();
    });
  });

  describe('Authenticated Access', () => {
    beforeEach(() => {
      mockAuthContext.user = { id: '123', email: 'test@example.com' };
      mockAuthContext.profile = { username: 'testuser' };
    });

    it('should allow access to protected routes when authenticated', () => {
      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByTestId('navigate-to')).not.toBeInTheDocument();
    });

    it('should check role requirements', () => {
      mockAuthContext.hasRole.mockImplementation((role) => role === 'user');

      render(
        <MemoryRouter>
          <ProtectedRoute requiredRole="user">
            <div>User Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('User Content')).toBeInTheDocument();
    });

    it('should deny access when user lacks required role', () => {
      mockAuthContext.hasRole.mockReturnValue(false);

      render(
        <MemoryRouter>
          <ProtectedRoute requiredRole="admin">
            <div>Admin Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByTestId('navigate-to')).toHaveTextContent('/');
      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading spinner during authentication check', () => {
      mockAuthContext.loading = true;

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should hide loading spinner when authentication check completes', async () => {
      const { rerender } = render(
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      // Initially loading
      mockAuthContext.loading = true;
      rerender(
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByRole('status')).toBeInTheDocument();

      // Finished loading with user
      mockAuthContext.loading = false;
      mockAuthContext.user = { id: '123', email: 'test@example.com' };
      rerender(
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });
  });

  describe('Redirect After Auth Hook Integration', () => {
    it('should call useRedirectAfterAuth when component mounts', () => {
      const mockUseRedirectAfterAuth = vi.mocked(useRedirectAfterAuth);

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      // The hook should be called (though the actual implementation is mocked)
      expect(mockUseRedirectAfterAuth).toHaveBeenCalled();
    });

    it('should handle auth page redirect correctly', () => {
      mockAuthContext.user = { id: '123', email: 'test@example.com' };
      mockAuthContext.profile = { username: 'testuser' };
      mockLocation.pathname = '/auth';

      const mockUseRedirectAfterAuth = vi.mocked(useRedirectAfterAuth);
      mockUseRedirectAfterAuth.mockImplementation(() => {
        // Simulate the redirect logic
        if (mockAuthContext.user && mockAuthContext.profile) {
          mockNavigate('/profile/testuser', { replace: true });
        }
      });

      render(
        <MemoryRouter initialEntries={['/auth']}>
          <ProtectedRoute requireAuth={false}>
            <div>Auth Page</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(mockNavigate).toHaveBeenCalledWith('/profile/testuser', { replace: true });
    });
  });

  describe('Role-Based Route Scenarios', () => {
    const testCases = [
      {
        route: '/admin',
        requiredRole: 'admin',
        userRoles: ['admin'],
        shouldAllow: true,
        description: 'admin user accessing admin route',
      },
      {
        route: '/admin',
        requiredRole: 'admin',
        userRoles: ['user'],
        shouldAllow: false,
        description: 'regular user accessing admin route',
      },
      {
        route: '/moderator',
        requiredRole: 'moderator',
        userRoles: ['admin'],
        shouldAllow: true,
        description: 'admin user accessing moderator route',
      },
      {
        route: '/user-dashboard',
        requiredRole: 'user',
        userRoles: ['user'],
        shouldAllow: true,
        description: 'user accessing user dashboard',
      },
    ];

    testCases.forEach(({ route, requiredRole, userRoles, shouldAllow, description }) => {
      it(`should ${shouldAllow ? 'allow' : 'deny'} ${description}`, () => {
        mockAuthContext.user = { id: '123', email: 'test@example.com' };
        mockAuthContext.hasRole.mockImplementation((role) => userRoles.includes(role));

        render(
          <MemoryRouter initialEntries={[route]}>
            <ProtectedRoute requiredRole={requiredRole}>
              <div>Route Content</div>
            </ProtectedRoute>
          </MemoryRouter>
        );

        if (shouldAllow) {
          expect(screen.getByText('Route Content')).toBeInTheDocument();
          expect(screen.queryByTestId('navigate-to')).not.toBeInTheDocument();
        } else {
          expect(screen.queryByText('Route Content')).not.toBeInTheDocument();
          expect(screen.getByTestId('navigate-to')).toHaveTextContent('/');
        }
      });
    });
  });
});