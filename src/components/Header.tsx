'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Building2, Sun, Moon, LogOut, Globe } from 'lucide-react';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [lang, setLang] = useState('en');

  useEffect(() => {
    setMounted(true);
    // Theme setup
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }

    // Auth setup
    const token = localStorage.getItem('auth_token');
    if (token) {
      setIsAuthenticated(true);
      const name = localStorage.getItem('user_name');
      if (name) setUserName(name);
    }

    // Lang setup
    const savedLang = localStorage.getItem('app_lang') || 'en';
    setLang(savedLang);
  }, [pathname]);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    setIsAuthenticated(false);
    router.replace('/');
  };

  const changeLang = (newLang: string) => {
    setLang(newLang);
    localStorage.setItem('app_lang', newLang);
    window.dispatchEvent(new Event('app_lang_changed'));
  };

  if (!mounted) return null;

  return (
    <header className="relative z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => router.push(isAuthenticated ? '/dashboard' : '/')}
        >
          <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
          <div className="hidden md:block">
            <h1 className="text-lg font-bold tracking-tight leading-tight text-slate-900 dark:text-white">
              Fintech<span className="text-blue-600 dark:text-blue-500">Core</span>
            </h1>
            {isAuthenticated && userName && (
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                Client: {userName}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          <div className="relative group">
            <Button variant="ghost" className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors duration-150 px-2 sm:px-4">
              <Globe className="w-4 h-4 sm:mr-2" />
              <span className="text-sm font-medium hidden sm:inline">{lang.toUpperCase()}</span>
            </Button>
            <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-[100]">
              <div className="py-1">
                <button onClick={() => changeLang('en')} className="block px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 w-full text-left transition-colors duration-150">English</button>
                <button onClick={() => changeLang('hi')} className="block px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 w-full text-left transition-colors duration-150">हिंदी</button>
                <button onClick={() => changeLang('es')} className="block px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 w-full text-left transition-colors duration-150">Español</button>
              </div>
            </div>
          </div>

          {!isAuthenticated ? (
            <Button 
              onClick={() => router.push('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-150 rounded-md text-sm font-medium h-9 px-4 ml-2"
            >
              Client Login
            </Button>
          ) : (
            <>
              {pathname !== '/management' && (
                <Button onClick={() => router.push('/management')} variant="ghost" className="text-blue-600 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors duration-150 font-medium hidden md:flex">
                  Management
                </Button>
              )}
              {pathname === '/management' && (
                <Button onClick={() => router.push('/dashboard')} variant="ghost" className="text-blue-600 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors duration-150 font-medium hidden md:flex">
                  Dashboard
                </Button>
              )}

              <Button onClick={handleLogout} variant="ghost" className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors duration-150 px-2 sm:px-4 ml-1">
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="text-sm font-medium hidden sm:inline">Sign Out</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
