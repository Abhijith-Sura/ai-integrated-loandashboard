'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const LayoutWrapper = ({ children, onHome }: { children: React.ReactNode, onHome: () => void }) => (
  <div className="min-h-screen font-sans text-slate-900 dark:text-slate-100 transition-colors duration-150 relative overflow-hidden flex items-center justify-center p-4">
    {/* Background Image & Overlays */}
    <div 
      className="fixed inset-0 z-0 pointer-events-none"
      style={{
        backgroundImage: "url('/fintech-login-bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    />
    <div className="fixed inset-0 z-0 bg-white/75 dark:bg-slate-950/85 pointer-events-none transition-colors duration-150" />
    
    <div className="absolute top-8 left-8 sm:left-12 z-10">
      <Button variant="outline" onClick={onHome} className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md shadow-sm border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-50/90 dark:hover:bg-slate-800/90 transition-colors duration-150 text-slate-700 dark:text-slate-300">
        ← Return Home
      </Button>
    </div>
    
    <div className="relative z-10 w-full max-w-md bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-2xl p-8 lg:p-10 flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700">
      {children}
    </div>
  </div>
);

function LoginForm() {
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

    try {
      const response = await fetch('/api/send-reset-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(`❌ Failed to send email: ${data.error}`);
        setLoading(false);
        return;
      }

      setSuccess(`✅ Password reset email sent to ${email}!\n\n⚠️ CHECK YOUR SPAM FOLDER if you don't see it.\n\nThe link expires in 1 hour.`);
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

        router.replace('/dashboard');
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
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 dark:border-slate-700 dark:border-t-slate-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isForgotPassword && isResetWithToken) {
    return (
      <LayoutWrapper onHome={() => router.push('/')}>
        <div className="mb-8">
          <h1 className="text-3xl font-medium tracking-tight text-slate-900 dark:text-white mb-2">Reset Password</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Enter your new security credentials.</p>
        </div>
        <div className="w-full">
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
                  className="bg-white/70 dark:bg-slate-950/60 border-slate-200/80 dark:border-slate-700/80 focus-visible:ring-blue-500 shadow-inner"
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

            <div className="mt-6 text-center text-sm">
              <button
                type="button"
                onClick={() => {
                  router.push('/login');
                }}
                className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 font-semibold transition-colors duration-150"
              >
                Return to Sign In
              </button>
            </div>
        </div>
      </LayoutWrapper>
    );
  }

  if (isForgotPassword) {
    return (
      <LayoutWrapper onHome={() => router.push('/')}>
        <div className="mb-8">
          <h1 className="text-3xl font-medium tracking-tight text-slate-900 dark:text-white mb-2">Recover Access</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">We will send a secure reset protocol to your institutional email.</p>
        </div>
        <div className="w-full">
            <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/70 dark:bg-slate-950/60 border-slate-200/80 dark:border-slate-700/80 focus-visible:ring-blue-500 shadow-inner"
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

            <div className="mt-6 text-center text-sm">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setError('');
                  setSuccess('');
                }}
                className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 font-semibold transition-colors duration-150"
              >
                Return to Sign In
              </button>
            </div>

            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-md text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
              <span className="text-lg">🔐</span>
              <p>Security protocols will dispatch a reset link valid for exactly 1 hour. Ensure you have access to the associated inbox.</p>
            </div>
        </div>
      </LayoutWrapper>
    );
  }

  return (
      <LayoutWrapper onHome={() => router.push('/')}>
        <div className="mb-8">
          <h1 className="text-3xl font-medium tracking-tight text-slate-900 dark:text-white mb-2">
            {isLogin ? 'Authenticate' : 'Establish Profile'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isLogin ? 'Enter your credentials to access the enterprise portal.' : 'Provision a new institutional identity.'}
          </p>
        </div>
        <div className="w-full">
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
                  className="bg-white/70 dark:bg-slate-950/60 border-slate-200/80 dark:border-slate-700/80 focus-visible:ring-blue-500 shadow-inner"
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
                className="bg-white/70 dark:bg-slate-950/60 border-slate-200/80 dark:border-slate-700/80 focus-visible:ring-blue-500 shadow-inner"
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
                className="bg-white/70 dark:bg-slate-950/60 border-slate-200/80 dark:border-slate-700/80 focus-visible:ring-blue-500 shadow-inner"
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

            <div className="mt-6 text-center text-sm">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
              }}
              className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 font-semibold transition-colors duration-150"
            >
              {isLogin ? "Request access provisioning" : 'Authenticate existing profile'}
            </button>
          </div>
        </div>
      </LayoutWrapper>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 dark:border-slate-700 dark:border-t-slate-200 rounded-full animate-spin"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
