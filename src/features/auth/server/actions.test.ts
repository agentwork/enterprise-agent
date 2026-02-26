import { login } from './actions';
import { createClient } from '@/lib/supabase/server';

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('login server action', () => {
  const mockSignInWithPassword = jest.fn();
  const mockSupabase = {
    auth: {
      signInWithPassword: mockSignInWithPassword,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  it('should return error for invalid input', async () => {
    const result = await login({ email: 'invalid', password: '123' });
    expect(result).toEqual({ success: false, error: 'Invalid input' });
  });

  it('should return error if supabase sign in fails', async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: { message: 'Invalid credentials' },
    });

    const result = await login({ email: 'test@example.com', password: 'password123' });
    expect(result).toEqual({ success: false, error: 'Invalid credentials' });
  });

  it('should redirect on success', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });
    
    // We expect it to throw a redirect error (Next.js behavior)
    // But since we mocked redirect, it won't throw, it will just be called.
    // However, typically server actions don't return anything on success if they redirect.
    // Let's check if redirect was called.
    
    await login({ email: 'test@example.com', password: 'password123' });
    
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { redirect } = require('next/navigation');
    expect(redirect).toHaveBeenCalledWith('/dashboard');
  });
});
