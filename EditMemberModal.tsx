import React, { useState, useEffect } from 'react';
import { X, UserCog, Mail, Lock, User as UserIcon, Briefcase, Building2, Key, CheckCircle2, Eye, EyeOff, Copy, Check, RefreshCw } from 'lucide-react';
import { UserRole, User } from '../../types';
import { updateTeamMember } from '../../services/store';

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  bizId: string;
  bizName: string;
  primaryColor: string;
  member: User | null;
  actorName: string;
  isSelf: boolean;
  onMemberUpdated: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const EditMemberModal: React.FC<EditMemberModalProps> = ({
  isOpen,
  onClose,
  bizId,
  bizName,
  primaryColor,
  member,
  actorName,
  isSelf,
  onMemberUpdated,
  onShowToast,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('member');
  const [department, setDepartment] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (member) {
      setName(member.name);
      setEmail(member.email);
      setPassword(member.password || '');
      setRole(member.role);
      setDepartment(member.department || '');
      setHasChanges(false);
    }
  }, [member, isOpen]);

  if (!isOpen || !member) return null;

  const handleFieldChange = (setter: (v: any) => void) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setter(e.target.value);
    setHasChanges(true);
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
    setShowPassword(true);
    setHasChanges(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    if (!name.trim() || !email.trim() || !password.trim()) {
      onShowToast('All fields are required', 'error');
      return;
    }

    if (password.length < 6) {
      onShowToast('Password must be at least 6 characters', 'error');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      onShowToast('Please enter a valid email address', 'error');
      return;
    }

    const result = updateTeamMember(
      bizId,
      member.id,
      { name: name.trim(), email: email.trim(), password, role, department: department.trim() },
      actorName
    );

    if (!result.success) {
      onShowToast(result.message, 'error');
      return;
    }

    onShowToast(result.message, 'success');
    onMemberUpdated();
    onClose();
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const roleOptions: { value: UserRole; label: string; desc: string; icon: string; color: string }[] = [
    { value: 'admin', label: 'Admin', desc: 'Full control: team, billing, webhooks', icon: '👑', color: '#c77dff' },
    { value: 'manager', label: 'Manager', desc: 'Manage tasks, submissions, projects and events', icon: '📊', color: '#0077ff' },
    { value: 'member', label: 'Team Member', desc: 'Execute tasks, submit deliverables', icon: '💼', color: '#00d4aa' },
    { value: 'client', label: 'Client Sponsor', desc: 'Guest portal: approve deliverables', icon: '👁️', color: '#ffc857' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a14]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#2a2a4a] flex items-center justify-between bg-gradient-to-r from-[#1a1a2e] to-[#12121f]">
          <div className="flex items-center gap-3">
            <div
              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)` }}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
            >
              <UserCog className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">Edit Team Member</h3>
              <p className="text-xs text-[#9090b8]">
                Customize <span className="text-[#c77dff] font-semibold">{member.name}</span> in <span className="text-white font-semibold">{bizName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#9090b8] hover:text-white transition-colors p-2 bg-[#12121f] rounded-lg border border-[#2a2a4a]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current avatar preview */}
        <div className="px-6 pt-4">
          <div className="bg-[#0a0a14] border border-[#2a2a4a] rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                style={{ background: primaryColor }}
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-base shadow"
              >
                {name.trim().split(/\s+/).map(p => p[0]).join('').substring(0, 2).toUpperCase() || member.initials}
              </div>
              <div>
                <div className="text-sm font-bold text-white">{name || member.name}</div>
                <div className="text-xs text-[#9090b8]">{email || member.email}</div>
              </div>
            </div>
            {isSelf && (
              <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-[#7b2ff2]/20 text-[#c77dff] border border-[#7b2ff2]/30">
                Your Account
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-[#0077ff]" /> Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={handleFieldChange(setName)}
              placeholder="e.g. Jessica Williams"
              className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#7b2ff2] focus:ring-1 focus:ring-[#7b2ff2] transition-all"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#c77dff]" /> Email Address (Login ID) *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={handleFieldChange(setEmail)}
              placeholder="e.g. jessica@acme.com"
              className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-[#7b2ff2] focus:ring-1 focus:ring-[#7b2ff2] transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#ffc857]" /> Password * <span className="text-[#5c5c8a] normal-case font-normal">(min 6 chars)</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={handleFieldChange(setPassword)}
                  placeholder="Set a secure password"
                  className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-4 py-3 pr-10 text-white text-sm font-mono focus:outline-none focus:border-[#7b2ff2] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9090b8] hover:text-white p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                type="button"
                onClick={generatePassword}
                className="px-4 py-3 rounded-xl bg-[#1a1a2e] border border-[#2a2a4a] hover:border-[#7b2ff2] text-xs text-white font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#c77dff]" />
                <span>Generate</span>
              </button>
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#00d4aa]" /> Department / Title
            </label>
            <input
              type="text"
              value={department}
              onChange={handleFieldChange(setDepartment)}
              placeholder="e.g. Senior Product Designer"
              className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#7b2ff2] transition-all"
            />
          </div>

          {/* Role Selector */}
          <div>
            <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-[#c77dff]" /> Permission Role *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {roleOptions.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => { setRole(r.value); setHasChanges(true); }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    role === r.value
                      ? 'bg-[#1a1a2e] border-white ring-1 ring-white/30 shadow-md'
                      : 'bg-[#0a0a14] border-[#2a2a4a] hover:border-[#5c5c8a]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">{r.icon}</span>
                    <span className="font-bold text-white text-xs">{r.label}</span>
                    {role === r.value && (
                      <CheckCircle2 className="w-3.5 h-3.5 ml-auto" style={{ color: r.color }} />
                    )}
                  </div>
                  <p className="text-[10px] text-[#9090b8] leading-snug">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Credential quick copy */}
          <div className="bg-[#0a0a14] border border-[#2a2a4a] rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-[#5c5c8a] tracking-wider">
              <Key className="w-3 h-3" /> Current Login Credentials
            </div>
            <div className="flex items-center justify-between bg-[#12121f] border border-[#2a2a4a] rounded-lg px-3 py-2">
              <code className="text-xs text-[#00d4aa] font-mono">{email || member.email}</code>
              <button
                type="button"
                onClick={() => handleCopy(`${email || member.email} / ${password || member.password}`, 'creds')}
                className="p-1 rounded-md bg-[#1a1a2e] border border-[#2a2a4a] hover:border-[#7b2ff2] text-[#9090b8] hover:text-white transition-colors"
              >
                {copied === 'creds' ? <Check className="w-3 h-3 text-[#00d4aa]" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-[#2a2a4a] flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#2a2a4a] text-xs text-[#9090b8] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!hasChanges}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7b2ff2] to-[#0077ff] text-white font-bold text-xs shadow-lg hover:opacity-95 transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save Changes →</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
