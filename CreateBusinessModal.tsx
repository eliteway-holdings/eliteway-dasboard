import React, { useState } from 'react';
import { X, Building2, Sparkles, Globe, ShieldCheck } from 'lucide-react';
import { InstitutionType, PlanTier } from '../../types';
import { addBusiness, addTask, formatZAR, getPlanFeatures, PLAN_ACCESS } from '../../services/store';

interface CreateBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBusinessCreated: () => void;
  onShowToast: (msg: string, type: 'success' | 'info') => void;
}

export const CreateBusinessModal: React.FC<CreateBusinessModalProps> = ({
  isOpen,
  onClose,
  onBusinessCreated,
  onShowToast,
}) => {
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [plan, setPlan] = useState<PlanTier>('starter');
  const [institutionType, setInstitutionType] = useState<InstitutionType>('business');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#7b2ff2');
  const [secondaryColor, setSecondaryColor] = useState('#0077ff');
  const [customDomain, setCustomDomain] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('Workspace2026!');

  const colorOptions = [
    { name: 'Deep Purple & Cobalt', primary: '#7b2ff2', secondary: '#0077ff' },
    { name: 'Neon Emerald & Violet', primary: '#00d4aa', secondary: '#7b2ff2' },
    { name: 'Crimson & Magenta', primary: '#ff4d6d', secondary: '#c77dff' },
    { name: 'Electric Blue & Cyan', primary: '#0077ff', secondary: '#4cc9f0' },
    { name: 'Solar Gold & Amber', primary: '#ffc857', secondary: '#fb5607' }
  ];

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !adminEmail.trim() || !adminPass.trim()) return;

    const initials = adminName
      ? adminName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : 'AD';
    const cleanLogo = logo.trim().toUpperCase().slice(0, 2) || name.substring(0, 2).toUpperCase();
    const newBizId = 'biz_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5);

    const planInfo = PLAN_ACCESS[plan];

    addBusiness({
      id: newBizId,
      name: name.trim(),
      logo: cleanLogo,
      primaryColor,
      secondaryColor,
      plan,
      status: 'active',
      institutionType,
      logoUrl: PLAN_ACCESS[plan].whiteLabel ? logoUrl.trim() || undefined : undefined,
      whiteLabelName: PLAN_ACCESS[plan].whiteLabel ? name.trim() : undefined,
      whiteLabelEnabled: PLAN_ACCESS[plan].whiteLabel,
      customFeatureAddOns: [],
      customDomain: customDomain.trim() || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.elitewayclub.com`,
      createdAt: new Date().toISOString().split('T')[0],
      users: [
        {
          id: 'usr_' + Date.now(),
          name: adminName.trim() || 'Workspace Admin',
          email: adminEmail.trim(),
          password: adminPass,
          role: 'admin',
          initials,
          department: 'Founding Admin'
        }
      ],
      stats: { projects: 1, tasks: 2, members: 1, completed: 0, mrr: planInfo.monthlyZAR },
      monthlyBudgetZAR: planInfo.monthlyZAR,
      enabledFeatures: getPlanFeatures(plan),
      settings: {
        enableClientPortal: true,
        autoWebhookSync: true,
        requireReviewForDone: true,
        slackChannel: `#${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-flow`
      }
    });

    // Seed introductory tasks for the new workspace
    addTask({
      id: 'tsk_seed_1_' + Date.now(),
      bizId: newBizId,
      title: `Welcome to ${name.trim()} — Set up company branding & theme tokens`,
      description: 'Your workspace colors and custom domain have been pre-provisioned via Club Flow Engine.',
      category: 'Design',
      col: 'todo',
      assignee: initials,
      assigneeName: adminName.trim() || 'Admin',
      priority: 'high',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      commentsCount: 0,
      attachmentsCount: 1,
      tags: ['Onboarding', 'Branding'],
      checklist: [
        { id: 'sc_1', text: 'Upload company SVG logo and verify custom domain DNS', done: true },
        { id: 'sc_2', text: 'Invite team designers & engineering leads', done: false }
      ],
      estimatedHours: 4,
      loggedHours: 0,
      createdAt: new Date().toISOString().split('T')[0]
    });

    onShowToast(`🎉 ${institutionType.toUpperCase()} workspace "${name}" provisioned on ${planInfo.label} (${formatZAR(planInfo.monthlyZAR)}/mo)!`, 'success');
    onBusinessCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a14]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#2a2a4a] flex items-center justify-between bg-gradient-to-r from-[#1a1a2e] to-[#12121f]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff4d6d] via-[#7b2ff2] to-[#0077ff] flex items-center justify-center text-white shadow-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">Provision New Client Workspace</h3>
              <p className="text-xs text-[#9090b8]">Multi-tenant isolation with custom branding and Make.com sync</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#9090b8] hover:text-white transition-colors p-2 bg-[#12121f] rounded-lg border border-[#2a2a4a]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleCreate} className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2">
                Business Agency Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!logo) setLogo(e.target.value.substring(0, 2).toUpperCase());
                }}
                placeholder="e.g. Global Media Studios"
                className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#7b2ff2]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2">
                Logo Initials (2 Chars) *
              </label>
              <input
                type="text"
                required
                maxLength={2}
                value={logo}
                onChange={(e) => setLogo(e.target.value.toUpperCase())}
                placeholder="GM"
                className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-4 py-3 text-white text-sm font-bold uppercase text-center focus:outline-none focus:border-[#7b2ff2]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#c77dff]" /> Paid Access Package
              </label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value as any)}
                className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-3 py-3 text-white text-xs focus:outline-none focus:border-[#7b2ff2]"
              >
                {(Object.keys(PLAN_ACCESS) as PlanTier[]).map(planKey => (
                  <option key={planKey} value={planKey}>{PLAN_ACCESS[planKey].label} — {formatZAR(PLAN_ACCESS[planKey].monthlyZAR)}/mo</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#0077ff]" /> Custom Subdomain / CNAME
              </label>
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="globalmedia.elitewayclub.com"
                className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-3 py-3 text-white text-xs focus:outline-none focus:border-[#7b2ff2]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2">
                Institution Type
              </label>
              <select
                value={institutionType}
                onChange={(e) => setInstitutionType(e.target.value as InstitutionType)}
                className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-3 py-3 text-white text-xs focus:outline-none focus:border-[#7b2ff2]"
              >
                <option value="business">Business</option>
                <option value="ngo">NGO / NPO</option>
                <option value="school">School</option>
                <option value="university">University</option>
                <option value="church">Church / Faith Institution</option>
                <option value="government">Government Department</option>
                <option value="agency">Agency</option>
                <option value="healthcare">Healthcare Institution</option>
                <option value="other">Other Institution</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2">
                Logo Upload / Logo URL {PLAN_ACCESS[plan].whiteLabel ? '' : '(from 2nd plan)'}
              </label>
              <input
                type="text"
                disabled={!PLAN_ACCESS[plan].whiteLabel}
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder={PLAN_ACCESS[plan].whiteLabel ? 'https://yourdomain.org/logo.png' : 'Upgrade to Institution Growth to white-label'}
                className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-3 py-3 text-white text-xs focus:outline-none focus:border-[#7b2ff2] disabled:opacity-50"
              />
            </div>
          </div>

          {/* Color Swatch Picker */}
          <div>
            <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2">
              Brand Accents & Theme Swatches {PLAN_ACCESS[plan].whiteLabel ? '' : '(from 2nd plan)'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
              {colorOptions.map((opt, idx) => {
                const isSelected = primaryColor === opt.primary && secondaryColor === opt.secondary;
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={!PLAN_ACCESS[plan].whiteLabel}
                    onClick={() => {
                      if (!PLAN_ACCESS[plan].whiteLabel) return;
                      setPrimaryColor(opt.primary);
                      setSecondaryColor(opt.secondary);
                    }}
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all text-left ${
                      !PLAN_ACCESS[plan].whiteLabel ? 'opacity-45 cursor-not-allowed ' : ''
                    }${
                      isSelected
                        ? 'bg-[#1a1a2e] border-white ring-1 ring-white shadow-md'
                        : 'bg-[#0a0a14] border-[#2a2a4a] hover:border-[#5c5c8a]'
                    }`}
                  >
                    <div className="flex -space-x-1 flex-shrink-0">
                      <span className="w-5 h-5 rounded-full border border-black shadow" style={{ background: opt.primary }} />
                      <span className="w-5 h-5 rounded-full border border-black shadow" style={{ background: opt.secondary }} />
                    </div>
                    <span className="text-xs text-white font-medium truncate">{opt.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-4 items-center bg-[#0a0a14] p-3 rounded-xl border border-[#2a2a4a]">
              <div className="flex items-center gap-2 flex-1">
                <label className="text-xs text-[#9090b8]">Primary Accent:</label>
                <input
                  type="color"
                  disabled={!PLAN_ACCESS[plan].whiteLabel}
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-8 h-8 rounded border border-[#2a2a4a] bg-transparent cursor-pointer p-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <code className="text-xs text-white">{primaryColor}</code>
              </div>
              <div className="flex items-center gap-2 flex-1">
                <label className="text-xs text-[#9090b8]">Secondary Accent:</label>
                <input
                  type="color"
                  disabled={!PLAN_ACCESS[plan].whiteLabel}
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-8 h-8 rounded border border-[#2a2a4a] bg-transparent cursor-pointer p-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <code className="text-xs text-white">{secondaryColor}</code>
              </div>
            </div>
          </div>

          {/* First Admin User Section */}
          <div className="pt-4 border-t border-[#2a2a4a] space-y-4">
            <h4 className="text-xs font-bold text-[#c77dff] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Provision First Workspace Admin User
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#9090b8] mb-1.5">Admin Full Name *</label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="e.g. David Miller"
                  className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#7b2ff2]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#9090b8] mb-1.5">Admin Email *</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="david@globalmedia.com"
                  className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#7b2ff2]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#9090b8] mb-1.5">Password *</label>
                <input
                  type="text"
                  required
                  minLength={6}
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-3 py-2.5 text-white text-xs font-mono focus:outline-none focus:border-[#7b2ff2]"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-[#2a2a4a] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#2a2a4a] text-xs text-[#9090b8] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#ff4d6d] via-[#7b2ff2] to-[#0077ff] text-white font-bold text-xs shadow-lg hover:opacity-95 transition-all"
            >
              Create Workspace & Seed Data →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
