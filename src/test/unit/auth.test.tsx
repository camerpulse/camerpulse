import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Test component to access auth context
const TestComponent = () => {
  const { user, loading, signIn, signOut, hasRole } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="user">{user ? user.email : 'no-user'}</div>
      <div data-testid="has-admin">{hasRole('admin') ? 'is-admin' : 'not-admin'}</div>
      <button onClick={() => signIn('test@example.com', 'password')}>Sign In</button>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
};

describe('Authentication Context', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide initial loading state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
  });

  it('should handle successful sign in', async () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    const mockSession = { user: mockUser, access_token: 'token' };

    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: mockUser, session: mockSession },
      error: null
    });

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null
    });

    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signInButton = screen.getByText('Sign In');
    signInButton.click();

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password'
      });
    });
  });

  it('should handle sign out', async () => {
    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signOutButton = screen.getByText('Sign Out');
    signOutButton.click();

    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });

  it('should check user roles correctly', async () => {
    const mockUser = { id: '123', email: 'admin@example.com' };
    const mockSession = { user: mockUser, access_token: 'token' };

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [{ role_name: 'admin' }],
          error: null
        })
      })
    } as any);

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('has-admin')).toHaveTextContent('is-admin');
    });
  });

  it('should handle authentication errors', async () => {
    const mockError = new Error('Invalid credentials');

    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error: mockError
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signInButton = screen.getByText('Sign In');
    signInButton.click();

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalled();
    });
  });
});