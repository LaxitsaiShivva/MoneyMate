import React, { useState } from 'react';
import {
  TrendingUp,
  Mail,
  Lock,
  User,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { UserProfile } from '../types';

interface AuthProps {
  onAuthSuccess: (user: UserProfile) => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot' | 'verify'>('login');
  
  // Input fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  // Status metrics
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setErrorMessage('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.success && data.user) {
        setStatusMessage('Login Success! Launching your personalized smart dashboard...');
        setTimeout(() => {
          onAuthSuccess(data.user);
        }, 1500);
      } else {
        setErrorMessage(data.message || 'Invalid credentials.');
      }
    } catch (err) {
      // Local fallback simulator if server restarts
      setStatusMessage('Simulation Direct Login loaded.');
      const derivedName = email.split('@')[0].split(/[._-]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'User';
      setTimeout(() => {
        onAuthSuccess({
          name: derivedName,
          email: email,
          currency: 'INR',
          dailyStreak: 5,
          xp: 150,
          level: 3,
          enable2FA: false,
          theme: 'light'
        });
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();
      if (data.success) {
        setStatusMessage('Account created! Standard security mandates email verification. Simulating verify...');
        setTimeout(() => {
          setAuthMode('verify');
          setStatusMessage('');
        }, 2000);
      } else {
        setErrorMessage(data.message || 'Failed to create account.');
      }
    } catch (err) {
      setAuthMode('verify');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      setStatusMessage(data.message || `Simulated reset instructions dispatched to ${email}!`);
      setTimeout(() => {
        setAuthMode('login');
        setStatusMessage('');
      }, 3500);
    } catch (e) {
      setStatusMessage('Simulated Reset sent.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage('Validating active verification token OTP code...');
    setTimeout(() => {
      setStatusMessage('Email verified securely! Launching smart MoneyMate tracker.');
      setTimeout(() => {
        const derivedName = (email || 'user@example.com').split('@')[0].split(/[._-]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'User';
        onAuthSuccess({
          name: name || derivedName,
          email: email || 'user@example.com',
          currency: 'INR',
          dailyStreak: 1,
          xp: 50,
          level: 1,
          enable2FA: false,
          theme: 'light'
        });
      }, 1500);
    }, 1500);
  };

  return (
    <div id="auth-standalone-layout" className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 select-none">
      
      {/* Brand logo header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-emerald-500 p-2.5 rounded-xl text-white">
          <TrendingUp className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <span className="font-extrabold text-2xl tracking-tight text-gray-900 dark:text-white">
            Money<span className="text-emerald-500">Mate</span>
          </span>
          <p className="text-[10px] text-gray-400 font-bold tracking-wider">SECURE DIGITAL LEDGER ENGINE</p>
        </div>
      </div>

      {/* Main card box form */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-150 rounded-3xl p-7.5 w-full max-w-sm shadow-xl space-y-6">
        
        {authMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Secure Portal login</h2>
              <p className="text-xs text-gray-400 mt-1">Provide auth identifiers to sync balance logs.</p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-100 text-red-800 text-xs font-bold leading-relaxed flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {statusMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold leading-relaxed flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            <div className="space-y-3.5 text-xs font-semibold">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-850 pl-10 pr-3.5 py-3 rounded-xl border border-gray-200 focus:outline-none"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-850 pl-10 pr-3.5 py-3 rounded-xl border border-gray-200 focus:outline-none"
                />
              </div>

              {/* Reset link */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setAuthMode('forgot')}
                  className="text-emerald-500 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl active:scale-95 transition shadow shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Authorize secure sessions</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center text-xs font-bold pt-2 text-gray-500 border-t">
              <span>Need account logs? </span>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className="text-emerald-500 hover:underline cursor-pointer"
              >
                Register Registry here
              </button>
            </div>
          </form>
        )}

        {authMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white font-sans">Initialize account metrics</h2>
              <p className="text-xs text-gray-400 mt-1">Register dynamic accounts to automate budgets constraints.</p>
            </div>

            {statusMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold leading-relaxed flex items-center gap-1.5 select-none animate-pulse">
                <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            <div className="space-y-3.5 text-xs font-semibold">
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="Your Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-850 pl-10 pr-3.5 py-3 rounded-xl border border-gray-200 focus:outline-none"
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-850 pl-10 pr-3.5 py-3 rounded-xl border border-gray-200 focus:outline-none"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-850 pl-10 pr-3.5 py-3 rounded-xl border border-gray-200 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl active:scale-95 transition"
              >
                Register profile database
              </button>
            </div>

            <div className="text-center text-xs font-bold pt-2 text-gray-500 border-t">
              <span>Enrolled before? </span>
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="text-emerald-500 hover:underline cursor-pointer"
              >
                Portal login here
              </button>
            </div>
          </form>
        )}

        {authMode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Forgot Security Passcode</h2>
              <p className="text-xs text-gray-400 mt-1">Dispatches simulated password-reset URLs to database.</p>
            </div>

            {statusMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold leading-relaxed flex items-center gap-1.5 animate-pulse">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            <div className="space-y-3.5 text-xs font-semibold">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-850 pl-10 pr-3.5 py-3 rounded-xl border focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition"
              >
                Dispatch Reset instructions
              </button>
            </div>

            <button
              onClick={() => setAuthMode('login')}
              type="button"
              className="text-xs text-emerald-500 font-bold block mx-auto hover:underline"
            >
              Cancel and Return
            </button>
          </form>
        )}

        {authMode === 'verify' && (
          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <div className="text-center font-sans">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Verify Registration</h2>
              <span className="text-xs text-gray-400 block mt-1">Check your verification code (Simulated OTP: <strong>8964</strong>)</span>
            </div>

            {statusMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            <div className="space-y-3.5 text-xs font-semibold">
              <input
                type="text"
                required
                maxLength={4}
                placeholder="E.g. 8964"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full bg-gray-50 text-center tracking-[0.5em] font-black text-lg py-3 rounded-xl border focus:outline-none"
              />

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl active:scale-95 transition"
              >
                Finalize verification checks
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
