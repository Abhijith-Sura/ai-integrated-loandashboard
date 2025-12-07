'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetWithToken, setIsResetWithToken] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetToken, setResetToken] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
    const token = searchParams.get('reset_token');
    if (token) {
      setIsResetWithToken(true);
      setResetToken(token);
      setIsForgotPassword(true);
      setIsLogin(false);
    }
  }, [searchParams]);

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!email) {
      setError('Please enter your email');
      setLoading(false);
      return;
    }

    const usersData = localStorage.getItem('registered_users');
    const users = usersData ? JSON.parse(usersData) : [];

    const userExists = users.find((u: any) => u.email === email);

    if (!userExists) {
      setSuccess('✅ If an account exists with this email, you will receive a password reset link shortly.');
      setLoading(false);
      return;
    }

    try {
      const token = btoa(JSON.stringify({
        email,
        timestamp: Date.now(),
        expires: Date.now() + 15 * 60 * 1000
      }));

      const resetTokens = JSON.parse(localStorage.getItem('reset_tokens') || '[]');
      resetTokens.push({ token, email, createdAt: Date.now() });
      localStorage.setItem('reset_tokens', JSON.stringify(resetTokens));

      const resetLink = `${window.location.origin}/login?reset_token=${token}`;

      const response = await fetch('/api/send-reset-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resetLink }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(`❌ Failed to send email: ${data.error}`);
        setLoading(false);
        return;
      }

      setSuccess(`✅ Email sent to ${email}!\n\n⚠️ CHECK YOUR SPAM FOLDER if you don't see it in your inbox.\n\nThe link expires in 15 minutes.`);
      setEmail('');
    } catch (error: any) {
      console.error('Error:', error);
      setError(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordWithToken = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const decodedToken = JSON.parse(atob(resetToken));
      
      if (decodedToken.expires < Date.now()) {
        setError('❌ Reset link has expired. Please request a new one.');
        setLoading(false);
        return;
      }

      const usersData = localStorage.getItem('registered_users');
      const users = usersData ? JSON.parse(usersData) : [];

      const userIndex = users.findIndex((u: any) => u.email === decodedToken.email);

      if (userIndex === -1) {
        setError('User not found');
        setLoading(false);
        return;
      }

      users[userIndex].password = newPassword;
      localStorage.setItem('registered_users', JSON.stringify(users));

      const resetTokens = JSON.parse(localStorage.getItem('reset_tokens') || '[]');
      const filteredTokens = resetTokens.filter((t: any) => t.token !== resetToken);
      localStorage.setItem('reset_tokens', JSON.stringify(filteredTokens));

      setSuccess('✅ Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError('❌ Invalid or expired reset link');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
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

      const usersData = localStorage.getItem('registered_users');
      const users = usersData ? JSON.parse(usersData) : [];

      if (isLogin) {
        const user = users.find((u: any) => u.email === email && u.password === password);

        if (!user) {
          setError('Invalid email or password. Please sign up if you don\'t have an account.');
          setLoading(false);
          return;
        }

        const token = btoa(JSON.stringify({
          email: user.email,
          name: user.name,
          timestamp: Date.now()
        }));

        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_email', user.email);
        localStorage.setItem('user_name', user.name);

        window.location.href = '/';
      } else {
        if (!name) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }

        const existingUser = users.find((u: any) => u.email === email);
        if (existingUser) {
          setError('Email already registered. Please login instead.');
          setLoading(false);
          return;
        }

        users.push({ email, password, name });
        localStorage.setItem('registered_users', JSON.stringify(users));

        setSuccess('✅ Account created successfully! Please login.');
        setTimeout(() => {
          setIsLogin(true);
          setEmail('');
          setPassword('');
          setName('');
          setSuccess('');
        }, 1500);
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

  if (isForgotPassword && isResetWithToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">🔐 Reset Your Password</CardTitle>
            <CardDescription className="text-center">
              Enter your new password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPasswordWithToken} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">New Password (min 6 chars)</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md border border-green-200">
                  {success}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Processing...' : 'Reset Password'}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <button
                type="button"
                onClick={() => {
                  router.push('/login');
                }}
                className="text-blue-600 hover:underline font-semibold"
              >
                Back to Login
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">📧 Forgot Password</CardTitle>
            <CardDescription className="text-center">
              Enter your email to receive a password reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md border border-green-200 whitespace-pre-wrap">
                  {success}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setError('');
                  setSuccess('');
                }}
                className="text-blue-600 hover:underline font-semibold"
              >
                Back to Login
              </button>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 rounded text-xs text-yellow-900 border border-yellow-200">
              <strong>🔐 Security:</strong> Password reset link will be sent to your email and expires in 15 minutes.
            </div>
          </CardContent>
        </Card>
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

            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setError('');
                    setEmail('');
                  }}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                {error}
              </div>
            )}

            {success && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md border border-green-200">
                {success}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
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
