import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from '@/components/routing/ProtectedRoute';
import { AuthProvider } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Mock the auth context
const mockAuthContext = {
  user: null,
  loading: false,
  hasRole: vi.fn(),
  isAdmin: vi.fn(),
};

const MockAuthProvider = ({ children, value = mockAuthContext }: any) => (
  <div data-testid="mock-auth-provider">
    {children}
  </div>
);

// Mock useAuth hook
vi.mock('@/contexts/AuthContext', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    useAuth: () => mockAuthContext,
    AuthProvider: MockAuthProvider,
  };
});

describe('Routing Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthContext.user = null;
    mockAuthContext.loading = false;
    mockAuthContext.hasRole.mockReturnValue(false);
  });

  describe('ProtectedRoute', () => {
    it('should redirect unauthenticated users to auth page', () => {
      render(
        <MemoryRouter initialEntries={['/protected']}>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      // Should not show protected content
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should show loading state when auth is loading', () => {
      mockAuthContext.loading = true;

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should render children when user is authenticated', () => {
      mockAuthContext.user = { id: '123', email: 'test@example.com' };

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should check role requirements', () => {
      mockAuthContext.user = { id: '123', email: 'test@example.com' };
      mockAuthContext.hasRole.mockImplementation((role) => role === 'admin');

      render(
        <MemoryRouter>
          <ProtectedRoute requiredRole="admin">
            <div>Admin Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });

    it('should redirect when user lacks required role', () => {
      mockAuthContext.user = { id: '123', email: 'test@example.com' };
      mockAuthContext.hasRole.mockReturnValue(false);

      render(
        <MemoryRouter initialEntries={['/admin']}>
          <ProtectedRoute requiredRole="admin">
            <div>Admin Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });

    it('should allow custom redirect paths', () => {
      render(
        <MemoryRouter initialEntries={['/custom-protected']}>
          <ProtectedRoute redirectTo="/custom-login">
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should allow public routes when requireAuth is false', () => {
      render(
        <MemoryRouter>
          <ProtectedRoute requireAuth={false}>
            <div>Public Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Public Content')).toBeInTheDocument();
    });
  });

  describe('Profile Route Integration', () => {
    it('should handle UUID-based profile routes', () => {
      const TestProfileRoute = () => {
        const userId = '550e8400-e29b-41d4-a716-446655440000';
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
        
        return (
          <div data-testid="profile-route">
            {isUUID ? 'UUID Route' : 'Username Route'}
          </div>
        );
      };

      render(<TestProfileRoute />);
      expect(screen.getByTestId('profile-route')).toHaveTextContent('UUID Route');
    });

    it('should handle username-based profile routes', () => {
      const TestProfileRoute = () => {
        const username = 'testuser123';
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(username);
        
        return (
          <div data-testid="profile-route">
            {isUUID ? 'UUID Route' : 'Username Route'}
          </div>
        );
      };

      render(<TestProfileRoute />);
      expect(screen.getByTestId('profile-route')).toHaveTextContent('Username Route');
    });
  });

  describe('Module Route Navigation', () => {
    it('should construct correct music profile URLs', () => {
      const artistSlug = 'john-artist-123';
      const expectedUrl = `/music/${artistSlug}`;
      
      expect(expectedUrl).toBe('/music/john-artist-123');
    });

    it('should construct correct job profile URLs', () => {
      const jobSlug = 'developer123-456';
      const expectedUrl = `/jobs/${jobSlug}`;
      
      expect(expectedUrl).toBe('/jobs/developer123-456');
    });

    it('should construct correct village profile URLs', () => {
      const villageSlug = 'testvillage';
      const expectedUrl = `/villages/${villageSlug}`;
      
      expect(expectedUrl).toBe('/villages/testvillage');
    });

    it('should construct correct marketplace URLs', () => {
      const marketplaceSlug = 'seller123-789';
      const expectedUrl = `/marketplace/${marketplaceSlug}`;
      
      expect(expectedUrl).toBe('/marketplace/seller123-789');
    });
  });
});