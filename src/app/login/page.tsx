'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      // Get registered users from localStorage
      const usersData = localStorage.getItem('registered_users');
      const users = usersData ? JSON.parse(usersData) : [];

      if (isLogin) {
        // LOGIN: Validate credentials
        const user = users.find((u: any) => u.email === email && u.password === password);

        if (!user) {
          setError('Invalid email or password. Please sign up if you don\'t have an account.');
          setLoading(false);
          return;
        }

        // Valid user - create session
        const token = btoa(JSON.stringify({
          email: user.email,
          name: user.name,
          timestamp: Date.now()
        }));

        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_email', user.email);
        localStorage.setItem('user_name', user.name);

        router.push('/');
      } else {
        // SIGNUP: Create new account
        if (!name) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }

        // Check if email already exists
        const existingUser = users.find((u: any) => u.email === email);
        if (existingUser) {
          setError('Email already registered. Please login instead.');
          setLoading(false);
          return;
        }

        // Add new user
        users.push({ email, password, name });
        localStorage.setItem('registered_users', JSON.stringify(users));

        setError('');
        alert('✅ Account created successfully! Please login.');
        setIsLogin(true);
        setEmail('');
        setPassword('');
        setName('');
        setLoading(false);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin ? 'Log in to access ClickPe Loan Dashboard' : 'Sign up to get started'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password (min 6 chars)</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-blue-600 hover:underline font-semibold"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
            </button>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded text-xs text-blue-900 border border-blue-200">
            <strong>📌 Note:</strong> First-time users must sign up before logging in.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
