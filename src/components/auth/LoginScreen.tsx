import React, { useState } from 'react';
import { Zap, RotateCcw, AlertTriangle, ArrowRight, ShieldCheck, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { getBusinesses, resetToDefaultData, saveSession } from '../../services/store';
import { Session } from '../../types';

interface LoginScreenProps {
  onLoginSuccess: (session: Session) => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const ULTRA_EMAIL = 'ultra@elitewayclub.com';
const ULTRA_PASSWORDS = ['EliteFlow2026!', 'EliteFlow2026'];

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onShowToast }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isUltraMatch = (inputEmail: string, inputPass: string) => {
    const cleanEmail = inputEmail.trim().toLowerCase();
    const cleanPass = inputPass.trim();
    return cleanEmail === ULTRA_EMAIL.toLowerCase() && ULTRA_PASSWORDS.includes(cleanPass);
  };

  const createUltraSession = (): Session => {
    return {
      type: 'ultra',
      userId: 'ultra_god_1',
      name: 'Ultra Admin',
      email: ULTRA_EMAIL,
      initials: '⚡',
      role: 'owner',
      bizId: null,
      bizName: 'Platform God Mode'
    };
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // 1. ULTRA ADMIN CHECK (silent check behind the scenes)
    if (isUltraMatch(cleanEmail, cleanPass)) {
      const ultraSession = createUltraSession();
      saveSession(ultraSession);
      onShowToast('Welcome to Platform God Mode, Ultra Admin!', 'success');
      onLoginSuccess(ultraSession);
      return;
    }

    // 2. Business users check — strict email + password match only
    const businesses = getBusinesses();
    let foundUser = null;
    let foundBiz = null;

    for (const biz of businesses) {
      for (const u of biz.users) {
        if (u.email.toLowerCase() === cleanEmail && u.password === cleanPass) {
          foundUser = u;
          foundBiz = biz;
          break;
        }
      }
      if (foundUser) break;
    }

    if (!foundUser || !foundBiz) {
      setError('Invalid email or password. Please verify your credentials or contact your workspace Admin.');
      onShowToast('Login failed: Credential mismatch', 'error');
      return;
    }

    if (foundBiz.status === 'suspended') {
      setError(`Workspace "${foundBiz.name}" has been suspended due to billing issues. Contact support to reactivate.`);
      onShowToast('Workspace account suspended', 'error');
      return;
    }

    const bizSession: Session = {
      type: 'business',
      userId: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      initials: foundUser.initials,
      role: foundUser.role,
      bizId: foundBiz.id,
      bizName: foundBiz.name
    };
    saveSession(bizSession);
    onShowToast(`Welcome back to ${foundBiz.name}, ${foundUser.name}!`, 'success');
    onLoginSuccess(bizSession);
  };

  const handleFactoryReset = () => {
    setIsResetting(true);
    resetToDefaultData();
    setTimeout(() => {
      setIsResetting(false);
      onShowToast('Demo database restored to factory default state!', 'info');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#0a0a14] bg-grid-pattern relative flex flex-col items-center justify-center p-4 selection:bg-[#7b2ff2]/30 selection:text-white">
      {/* Background Glowing Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-[#7b2ff2]/20 via-[#0077ff]/15 to-[#ff4d6d]/15 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-20 right-20 w-[300px] h-[300px] bg-[#0077ff]/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Top Brand Banner */}
      <div className="z-10 mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#12121f] border border-[#2a2a4a] text-xs text-[#c77dff] mb-3 shadow-lg">
          <Zap className="w-3.5 h-3.5 animate-pulse text-[#00d4aa]" />
          <span>Multi-Tenant Club Flow Engine 2.1 • Enterprise Workspace Portal</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
          Elite Way <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7b2ff2] via-[#c77dff] to-[#0077ff]">Club Flow</span>
        </h1>
        <p className="text-sm text-[#9090b8] max-w-md mx-auto">
          Sign in to access your secure high-velocity agency workspace.
        </p>
      </div>

      {/* Login Card */}
      <div className="z-10 w-full max-w-md glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-300 border border-[#2a2a4a]">
        <div>
          <h2 className="text-lg font-bold text-white leading-tight">Workspace Login</h2>
          <p className="text-xs text-[#9090b8] mt-0.5">Enter your email and password to continue</p>
        </div>

        {error && (
          <div className="bg-[#ff4d6d]/15 border border-[#ff4d6d]/40 p-3.5 rounded-xl flex items-start gap-3 text-xs text-[#ff4d6d] animate-in fade-in">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#0077ff]" /> Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#7b2ff2] focus:ring-1 focus:ring-[#7b2ff2]/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#ffc857]" /> Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-4 py-3 pr-10 text-white text-sm font-mono focus:outline-none focus:border-[#7b2ff2] focus:ring-1 focus:ring-[#7b2ff2]/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9090b8] hover:text-white p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7b2ff2] via-[#c77dff] to-[#0077ff] text-white font-bold text-sm shadow-lg hover:opacity-95 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 pt-3.5 mt-2"
          >
            <span>Sign In to Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer: workspace login info & reset button */}
        <div className="pt-4 border-t border-[#2a2a4a]/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#5c5c8a] uppercase tracking-wider">
              Need Help?
            </span>
            <button
              onClick={handleFactoryReset}
              disabled={isResetting}
              className="text-[11px] text-[#9090b8] hover:text-white flex items-center gap-1 transition-colors underline decoration-dotted"
            >
              <RotateCcw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
              <span>Reset Demo Data</span>
            </button>
          </div>
          <p className="text-[11px] text-[#5c5c8a] leading-relaxed mt-2">
            Workspace members: sign in using the credentials created by your Admin. If you forgot your password or need access, please contact your workspace Admin directly.
          </p>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="z-10 mt-6 text-center text-xs text-[#5c5c8a] flex items-center gap-4">
        <span>© 2026 Elite Way Club Flow</span>
        <span>•</span>
        <span className="flex items-center gap-1 text-[#9090b8]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00d4aa]" /> ISO-27001 Multi-Tenant Isolation
        </span>
      </div>
    </div>
  );
};
