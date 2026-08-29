import React, { useState } from 'react';
import { X, UserPlus, Mail, Lock, User as UserIcon, Briefcase, Building2, Key, CheckCircle2, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { UserRole } from '../../types';
import { addTeamMember } from '../../services/store';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  bizId: string;
  bizName: string;
  primaryColor: string;
  actorName: string;
  onMemberAdded: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  bizId,
  bizName,
  primaryColor,
  actorName,
  onMemberAdded,
  onShowToast,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('member');
  const [department, setDepartment] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [createdUser, setCreatedUser] = useState<{ email: string; password: string; name: string } | null>(null);

  if (!isOpen) return null;

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  const generateInitials = (fullName: string): string => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;

    if (password.length < 6) {
      onShowToast('Password must be at least 6 characters', 'error');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      onShowToast('Please enter a valid email address', 'error');
      return;
    }

    const result = addTeamMember(
      bizId,
      {
        id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        role,
        initials: generateInitials(name),
        department: department.trim() || 'Team Collaborator',
        joinedAt: new Date().toISOString().split('T')[0]
      },
      actorName
    );

    if (!result.success) {
      onShowToast(result.message, 'error');
      return;
    }

    setCreatedUser({ email: email.trim().toLowerCase(), password, name: name.trim() });
    onShowToast(result.message, 'success');
    onMemberAdded();
  };

  const handleClose = () => {
    // Reset form
    setName('');
    setEmail('');
    setPassword('');
    setRole('member');
    setDepartment('');
    setCreatedUser(null);
    onClose();
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const roleOptions: { value: UserRole; label: string; desc: string; icon: string; color: string }[] = [
    { value: 'admin', label: 'Admin', desc: 'Full control: team, billing, webhooks, all tasks', icon: '👑', color: '#c77dff' },
    { value: 'manager', label: 'Manager', desc: 'Manage tasks, submissions, projects and events', icon: '📊', color: '#0077ff' },
    { value: 'member', label: 'Team Member', desc: 'Execute tasks, submit deliverables, view Kanban', icon: '💼', color: '#00d4aa' },
    { value: 'client', label: 'Client Sponsor', desc: 'Guest portal: approve deliverables & milestones', icon: '👁️', color: '#ffc857' }
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
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">Create Team Member Login</h3>
              <p className="text-xs text-[#9090b8]">Provision direct credentials for <span className="text-[#c77dff] font-semibold">{bizName}</span></p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-[#9090b8] hover:text-white transition-colors p-2 bg-[#12121f] rounded-lg border border-[#2a2a4a]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!createdUser ? (
          <form onSubmit={handleCreate} className="p-6 overflow-y-auto space-y-5 flex-1">
            {/* Info banner */}
            <div className="bg-gradient-to-r from-[#7b2ff2]/15 to-[#0077ff]/15 border border-[#7b2ff2]/30 p-3.5 rounded-xl flex items-start gap-2.5">
              <Key className="w-4 h-4 text-[#c77dff] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#e8e8f4] leading-relaxed">
                Create real login credentials. The new member can sign in immediately at the login page using their email and password. No invitation link required.
              </p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-[#0077ff]" /> Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                onChange={(e) => setEmail(e.target.value)}
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
                    onChange={(e) => setPassword(e.target.value)}
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
                  <Key className="w-3.5 h-3.5 text-[#c77dff]" />
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
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Senior Product Designer"
                className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#7b2ff2] transition-all"
              />
            </div>

            {/* Role Selector */}
            <div>
              <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#c77dff]" /> Assign Permission Role *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {roleOptions.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
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

            {/* Footer */}
            <div className="pt-4 border-t border-[#2a2a4a] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl border border-[#2a2a4a] text-xs text-[#9090b8] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7b2ff2] to-[#0077ff] text-white font-bold text-xs shadow-lg hover:opacity-95 transition-all flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Login & Add Member →</span>
              </button>
            </div>
          </form>
        ) : (
          /* Success screen with credentials */
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            <div className="text-center py-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00d4aa] to-[#0077ff] flex items-center justify-center text-white mx-auto mb-3 shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Login Created Successfully!</h3>
              <p className="text-xs text-[#9090b8]">{createdUser.name} can now sign in to {bizName}</p>
            </div>

            <div className="bg-gradient-to-br from-[#7b2ff2]/15 to-[#0077ff]/15 border border-[#7b2ff2]/30 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-[#c77dff] uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" /> New Member Credentials
              </h4>

              <div className="flex items-center justify-between bg-[#0a0a14] border border-[#2a2a4a] rounded-lg px-3 py-2.5">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-[#5c5c8a] tracking-wider">Email</span>
                  <code className="text-sm text-[#00d4aa] font-mono font-semibold">{createdUser.email}</code>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(createdUser.email, 'email')}
                  className="p-1.5 rounded-md bg-[#12121f] border border-[#2a2a4a] hover:border-[#7b2ff2] text-[#9090b8] hover:text-white transition-colors"
                >
                  {copied === 'email' ? <Check className="w-3.5 h-3.5 text-[#00d4aa]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center justify-between bg-[#0a0a14] border border-[#2a2a4a] rounded-lg px-3 py-2.5">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-[#5c5c8a] tracking-wider">Password</span>
                  <code className="text-sm text-[#ffc857] font-mono font-semibold">{createdUser.password}</code>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(createdUser.password, 'pass')}
                  className="p-1.5 rounded-md bg-[#12121f] border border-[#2a2a4a] hover:border-[#7b2ff2] text-[#9090b8] hover:text-white transition-colors"
                >
                  {copied === 'pass' ? <Check className="w-3.5 h-3.5 text-[#00d4aa]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="bg-[#ffc857]/15 border border-[#ffc857]/30 p-3.5 rounded-xl flex items-start gap-2.5">
              <Eye className="w-4 h-4 text-[#ffc857] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#e8e8f4] leading-relaxed">
                <strong>Important:</strong> Share these credentials securely with {createdUser.name}. They can log in immediately from the main login page.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7b2ff2] to-[#0077ff] text-white font-bold text-xs shadow-lg hover:opacity-95 transition-all"
              >
                Done →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
