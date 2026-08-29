import React, { useState } from 'react';
import {
  BarChart3,
  Building2,
  Users,
  ClipboardList,
  CreditCard,
  Settings,
  LogOut,
  Plus,
  ArrowRight,
  Search,
  Key,
  Database,
  Menu,
  X as CloseIcon
} from 'lucide-react';
import { getBusinesses, getLogs, toggleBusinessStatus, getEventSubaccounts, getEvents, formatZAR, toggleEventSubaccountStatus, EVENT_TIER_FEES, PLAN_ACCESS } from '../../services/store';
import { CreateEventSubaccountModal } from '../modals/CreateEventSubaccountModal';
import { Business, Session } from '../../types';
import { BusinessFunctionsModal } from '../modals/BusinessFunctionsModal';

interface UltraAdminScreenProps {
  currentSession: Session;
  onSignOut: () => void;
  onEnterWorkspace: (bizId: string, bizName: string) => void;
  onOpenCreateBizModal: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
  refreshKey: number;
}

export const UltraAdminScreen: React.FC<UltraAdminScreenProps> = ({
  currentSession,
  onSignOut,
  onEnterWorkspace,
  onOpenCreateBizModal,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'businesses' | 'users' | 'activity' | 'billing' | 'settings' | 'events'>('overview');
  const [isCreateEventSubOpen, setIsCreateEventSubOpen] = useState(false);
  const [functionsBusiness, setFunctionsBusiness] = useState<Business | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const switchTab = (tab: any) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  const businesses = getBusinesses();
  const logs = getLogs();
  // Compute Platform Totals
  let totalUsers = 0;
  let totalProjects = 0;
  let totalTasks = 0;
  let totalMRR = 0;
  let activeAgencies = 0;

  businesses.forEach((b) => {
    totalUsers += b.users.length;
    totalProjects += b.stats.projects || 0;
    totalTasks += b.stats.tasks || 0;
    if (b.status === 'active') {
      activeAgencies += 1;
      totalMRR += b.stats.mrr || (b.plan === 'enterprise' ? 399 : b.plan === 'pro' ? 149 : 49);
    }
  });

  // Collect all users across all agencies
  const allUsersList: any[] = [];
  businesses.forEach((b) => {
    b.users.forEach((u) => {
      allUsersList.push({ ...u, bizName: b.name, bizId: b.id, bizStatus: b.status });
    });
  });

  const filteredUsers = allUsersList.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.bizName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleStatus = (bizId: string) => {
    const updated = toggleBusinessStatus(bizId);
    if (updated) {
      onShowToast(`Workspace "${updated.name}" is now ${updated.status.toUpperCase()}`, 'info');
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0a0a14] text-white">
      {/* Top Mobile Navbar (< lg) */}
      <div className="h-14 border-b border-[#2a2a4a] bg-[#12121f] px-4 flex lg:hidden items-center justify-between z-30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg bg-[#1a1a2e] border border-[#2a2a4a] text-[#9090b8] hover:text-white transition-colors"
            title="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#ff4d6d] to-[#7b2ff2] flex items-center justify-center text-white font-bold text-xs shadow animate-ultra-pulse">
              ⚡
            </div>
            <div className="overflow-hidden">
              <h2 className="font-bold text-white text-xs leading-tight truncate">Ultra God Mode</h2>
              <span className="text-[9px] text-[#ff4d6d] block truncate uppercase tracking-wider font-bold">
                {activeTab}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenCreateBizModal}
          className="p-2 rounded-lg bg-gradient-to-r from-[#ff4d6d] via-[#7b2ff2] to-[#0077ff] text-white shadow hover:opacity-95"
          title="New Workspace"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Backdrop for Mobile Slide-over Drawer */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-[#0a0a14]/80 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
          />
        )}

        {/* Ultra God Mode Sidebar (Drawer on mobile (< lg), static on desktop (lg+)) */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-[#12121f] border-r border-[#2a2a4a] flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="p-5 border-b border-[#2a2a4a] flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#ff4d6d] to-[#7b2ff2] flex items-center justify-center text-white font-bold text-base shadow-lg animate-ultra-pulse flex-shrink-0">
                ⚡
              </div>
              <div className="overflow-hidden">
                <h2 className="font-bold text-white text-sm leading-tight">Ultra Admin</h2>
                <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded bg-[#ff4d6d]/20 text-[#ff4d6d] border border-[#ff4d6d]/40 inline-block mt-1">
                  GOD MODE
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-[#9090b8] hover:text-white hover:bg-[#1a1a2e]"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            <div className="text-[10px] font-bold text-[#5c5c8a] uppercase tracking-wider px-3 py-2">
              Platform Overview
            </div>

            <button
              onClick={() => switchTab('overview')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-[#ff4d6d]/15 text-[#ff4d6d] border border-[#ff4d6d]/30 shadow-sm'
                  : 'text-[#9090b8] hover:text-white hover:bg-[#1a1a2e]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4" />
                <span>Global Dashboard</span>
              </div>
            </button>

            <button
              onClick={() => switchTab('businesses')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'businesses'
                  ? 'bg-[#ff4d6d]/15 text-[#ff4d6d] border border-[#ff4d6d]/30 shadow-sm'
                  : 'text-[#9090b8] hover:text-white hover:bg-[#1a1a2e]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4" />
                <span>Workspaces / Agencies</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1a1a2e] text-[#c77dff] font-bold border border-[#2a2a4a]">
                {businesses.length}
              </span>
            </button>

            <button
              onClick={() => switchTab('users')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'users'
                  ? 'bg-[#ff4d6d]/15 text-[#ff4d6d] border border-[#ff4d6d]/30 shadow-sm'
                  : 'text-[#9090b8] hover:text-white hover:bg-[#1a1a2e]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>All Workspace Users</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1a1a2e] text-[#0077ff] font-bold border border-[#2a2a4a]">
                {totalUsers}
              </span>
            </button>

            <div className="text-[10px] font-bold text-[#5c5c8a] uppercase tracking-wider px-3 pt-4 pb-2">
              System & Billing
            </div>

            <button
              onClick={() => switchTab('activity')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'activity'
                  ? 'bg-[#ff4d6d]/15 text-[#ff4d6d] border border-[#ff4d6d]/30 shadow-sm'
                  : 'text-[#9090b8] hover:text-white hover:bg-[#1a1a2e]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ClipboardList className="w-4 h-4" />
                <span>Audit Trail & Webhooks</span>
              </div>
            </button>

            <button
              onClick={() => switchTab('billing')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'billing'
                  ? 'bg-[#ff4d6d]/15 text-[#ff4d6d] border border-[#ff4d6d]/30 shadow-sm'
                  : 'text-[#9090b8] hover:text-white hover:bg-[#1a1a2e]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4" />
                <span>SaaS MRR & Plans</span>
              </div>
            </button>

            <button
              onClick={() => switchTab('events')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'events'
                  ? 'bg-gradient-to-r from-[#ffc857]/25 to-[#f7931a]/25 text-white border border-[#ffc857]/60 shadow-sm'
                  : 'text-[#ffc857] hover:bg-[#ffc857]/15 border border-[#ffc857]/30'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-sm">🎪</span>
                <span>Event Subaccounts</span>
              </div>
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#ffc857] text-black font-extrabold">
                ZAR
              </span>
            </button>

            <button
              onClick={() => switchTab('settings')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'bg-[#ff4d6d]/15 text-[#ff4d6d] border border-[#ff4d6d]/30 shadow-sm'
                  : 'text-[#9090b8] hover:text-white hover:bg-[#1a1a2e]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4" />
                <span>Platform Settings</span>
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#2a2a4a] bg-[#0a0a14] flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#ff4d6d]/20 text-[#ff4d6d] border border-[#ff4d6d]/40 flex items-center justify-center font-bold text-xs flex-shrink-0">
                ⚡
              </div>
              <div className="overflow-hidden">
                <div className="font-semibold text-white text-xs truncate">{currentSession.name}</div>
                <div className="text-[10px] text-[#9090b8]">Platform Owner</div>
              </div>
            </div>
            <button
              onClick={onSignOut}
              title="Sign Out of Ultra Admin"
              className="p-2 rounded-lg text-[#9090b8] hover:text-[#ff4d6d] hover:bg-[#1a1a2e] transition-colors flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#0a0a14]">
          {/* Desktop Header (hidden on mobile (< lg)) */}
          <header className="hidden lg:flex h-16 border-b border-[#2a2a4a] bg-[#12121f] px-6 items-center justify-between flex-shrink-0">
            <div>
              <h1 className="text-base font-bold text-white capitalize flex items-center gap-2">
                <span>{activeTab === 'overview' ? 'Global SaaS Health & Multi-Tenant Metrics' : activeTab === 'businesses' ? 'Client Agency Workspaces' : activeTab === 'users' ? 'Global User Directory' : activeTab === 'activity' ? 'System & Webhook Activity Stream' : activeTab === 'billing' ? 'Monthly Recurring Revenue (MRR)' : activeTab === 'events' ? '🎪 Event Subaccounts Management (ZAR)' : 'Global Engine Settings'}</span>
              </h1>
              <p className="text-xs text-[#9090b8]">Club Flow Engine • Multi-Tenant Isolation Controller</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onOpenCreateBizModal}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff4d6d] via-[#7b2ff2] to-[#0077ff] text-white font-bold text-xs shadow-lg hover:opacity-95 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>New Workspace</span>
              </button>
              <button
                onClick={onSignOut}
                className="px-3.5 py-2 rounded-xl border border-[#2a2a4a] text-xs text-[#9090b8] hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          </header>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Stat Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl p-5 relative overflow-hidden group hover:border-[#ff4d6d] transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-[#9090b8]">Total Workspaces</span>
                    <Building2 className="w-5 h-5 text-[#ff4d6d]" />
                  </div>
                  <div className="text-2xl font-extrabold text-white">{businesses.length} Agencies</div>
                  <div className="text-xs text-[#00d4aa] mt-2 flex items-center gap-1 font-semibold">
                    <span>↑ {activeAgencies} active operational tenants</span>
                  </div>
                </div>

                <div className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl p-5 relative overflow-hidden group hover:border-[#7b2ff2] transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-[#9090b8]">Total Users across Tenants</span>
                    <Users className="w-5 h-5 text-[#c77dff]" />
                  </div>
                  <div className="text-2xl font-extrabold text-white">{totalUsers} Members</div>
                  <div className="text-xs text-[#9090b8] mt-2 flex items-center gap-1">
                    <span>Across Admins, Managers & Creatives</span>
                  </div>
                </div>

                <div className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl p-5 relative overflow-hidden group hover:border-[#0077ff] transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-[#9090b8]">Active Kanban Tasks & Projects</span>
                    <Database className="w-5 h-5 text-[#0077ff]" />
                  </div>
                  <div className="text-2xl font-extrabold text-white">{totalTasks} Tasks • {totalProjects} Projects</div>
                  <div className="text-xs text-[#0077ff] mt-2 font-semibold">
                    <span>Synchronized via Make.com webhooks</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#12121f] via-[#1a1a2e] to-[#7b2ff2]/20 border border-[#7b2ff2]/40 rounded-2xl p-5 relative overflow-hidden group shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#c77dff] uppercase tracking-wider">Total Monthly MRR</span>
                    <CreditCard className="w-5 h-5 text-[#00d4aa]" />
                  </div>
                  <div className="text-2xl font-extrabold text-white">{formatZAR(totalMRR)}/mo</div>
                  <div className="text-xs text-[#00d4aa] mt-2 font-semibold flex items-center gap-1">
                    <span>↑ 100% Stripe & Make billing verified</span>
                  </div>
                </div>
              </div>

              {/* Quick God Mode Impersonation Table */}
              <div className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl overflow-hidden shadow-xl">
                <div className="p-5 border-b border-[#2a2a4a] flex items-center justify-between bg-[#1a1a2e]">
                  <div>
                    <h3 className="font-bold text-white text-sm">Active Client Workspaces (God Mode Quick-Enter)</h3>
                    <p className="text-xs text-[#9090b8]">Click any workspace to inspect internal board, tasks, and team deliverables directly.</p>
                  </div>
                  <button
                    onClick={onOpenCreateBizModal}
                    className="px-3.5 py-2 rounded-xl bg-[#ff4d6d]/20 border border-[#ff4d6d]/40 text-[#ff4d6d] hover:bg-[#ff4d6d] hover:text-white transition-all text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Provision New Agency
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#0a0a14] text-[#9090b8] text-[11px] font-bold uppercase tracking-wider border-b border-[#2a2a4a]">
                        <th className="py-3.5 px-5">Workspace Agency</th>
                        <th className="py-3.5 px-5">Theme Colors</th>
                        <th className="py-3.5 px-5">Plan & Subdomain</th>
                        <th className="py-3.5 px-5">Status</th>
                        <th className="py-3.5 px-5">Team Size</th>
                        <th className="py-3.5 px-5">MRR</th>
                        <th className="py-3.5 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2a2a4a]">
                      {businesses.map((biz) => (
                        <tr key={biz.id} className="hover:bg-[#1a1a2e]/60 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div
                                style={{ background: `linear-gradient(135deg, ${biz.primaryColor}, ${biz.secondaryColor})` }}
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-xs shadow"
                              >
                                {biz.logo}
                              </div>
                              <div>
                                <span className="font-bold text-white text-sm block">{biz.name}</span>
                                <span className="text-[10px] text-[#5c5c8a] font-mono">{biz.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full border border-white/20 shadow" style={{ background: biz.primaryColor }} title={`Primary: ${biz.primaryColor}`} />
                              <span className="w-4 h-4 rounded-full border border-white/20 shadow" style={{ background: biz.secondaryColor }} title={`Secondary: ${biz.secondaryColor}`} />
                              <code className="text-[11px] text-[#9090b8]">{biz.primaryColor}</code>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-[#7b2ff2]/20 text-[#c77dff] border border-[#7b2ff2]/30 block w-fit mb-1">
                              {biz.plan}
                            </span>
                            <span className="text-xs text-[#0077ff]">{biz.customDomain || `${biz.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.elitewayclub.com`}</span>
                          </td>
                          <td className="py-4 px-5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              biz.status === 'active'
                                ? 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/40'
                                : 'bg-[#ff4d6d]/20 text-[#ff4d6d] border border-[#ff4d6d]/40'
                            }`}>
                              ● {biz.status}
                            </span>
                          </td>
                          <td className="py-4 px-5 font-semibold text-xs text-white">
                            {biz.users.length} members
                          </td>
                          <td className="py-4 px-5 font-bold text-xs text-[#00d4aa]">
                            {formatZAR(biz.stats.mrr)}/mo
                          </td>
                          <td className="py-4 px-5 text-right space-x-2">
                            <button
                              onClick={() => setFunctionsBusiness(biz)}
                              className="px-3 py-2 rounded-xl border border-[#ffc857]/40 text-[#ffc857] text-xs font-bold hover:bg-[#ffc857]/10 transition-colors"
                            >
                              Plan Access
                            </button>
                            <button
                              onClick={() => onEnterWorkspace(biz.id, biz.name)}
                              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#7b2ff2] to-[#0077ff] text-white font-bold text-xs shadow hover:opacity-95 transition-all inline-flex items-center gap-1"
                            >
                              <span>Inspect God Mode →</span>
                            </button>
                            <button
                              onClick={() => handleToggleStatus(biz.id)}
                              className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                                biz.status === 'active'
                                  ? 'border-[#ff4d6d]/40 text-[#ff4d6d] hover:bg-[#ff4d6d] hover:text-white'
                                  : 'border-[#00d4aa]/40 text-[#00d4aa] hover:bg-[#00d4aa] hover:text-black'
                              }`}
                            >
                              {biz.status === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'businesses' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">All Multi-Tenant Workspaces</h3>
                  <p className="text-xs text-[#9090b8]">Complete database directory of active and suspended client agencies.</p>
                </div>
                <button
                  onClick={onOpenCreateBizModal}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ff4d6d] via-[#7b2ff2] to-[#0077ff] text-white font-bold text-xs shadow-lg hover:opacity-95 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Provision New Workspace</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {businesses.map((biz) => (
                  <div key={biz.id} className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl p-5 space-y-4 relative overflow-hidden group hover:border-[#7b2ff2] transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div
                          style={{ background: `linear-gradient(135deg, ${biz.primaryColor}, ${biz.secondaryColor})` }}
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-base shadow-lg"
                        >
                          {biz.logo}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-base leading-tight">{biz.name}</h4>
                          <span className="text-xs text-[#0077ff] block mt-0.5">{biz.customDomain || `${biz.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.elitewayclub.com`}</span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        biz.status === 'active' ? 'bg-[#00d4aa]/20 text-[#00d4aa]' : 'bg-[#ff4d6d]/20 text-[#ff4d6d]'
                      }`}>
                        ● {biz.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2 border-y border-[#2a2a4a]/60 text-center">
                      <div>
                        <span className="text-[10px] text-[#9090b8] block">Plan Tier</span>
                        <span className="text-xs font-bold text-[#c77dff] uppercase">{biz.plan}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#9090b8] block">Team Members</span>
                        <span className="text-xs font-bold text-white">{biz.users.length} Users</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#9090b8] block">MRR Contribution</span>
                        <span className="text-xs font-bold text-[#00d4aa]">{formatZAR(biz.stats.mrr)}/mo</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#9090b8] block">Paid Package</span>
                        <span className="text-xs font-bold text-[#ffc857]">{PLAN_ACCESS[biz.plan]?.label || biz.plan}</span>
                        <span className="text-[9px] text-[#5c5c8a] block">{biz.enabledFeatures?.length || 0} functions</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-1">
                      <button
                        onClick={() => setFunctionsBusiness(biz)}
                        className="px-3.5 py-2 rounded-xl border border-[#ffc857]/40 text-[#ffc857] text-xs font-semibold hover:bg-[#ffc857]/10 transition-all flex-1"
                      >
                        Plan Access
                      </button>
                      <button
                        onClick={() => handleToggleStatus(biz.id)}
                        className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all flex-1 ${
                          biz.status === 'active'
                            ? 'border-[#ff4d6d]/40 text-[#ff4d6d] hover:bg-[#ff4d6d] hover:text-white'
                            : 'border-[#00d4aa]/40 text-[#00d4aa] hover:bg-[#00d4aa] hover:text-black'
                        }`}
                      >
                        {biz.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                      </button>
                      <button
                        onClick={() => onEnterWorkspace(biz.id, biz.name)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7b2ff2] to-[#0077ff] text-white font-bold text-xs shadow hover:opacity-95 transition-all flex items-center justify-center gap-1.5 flex-1"
                      >
                        <span>Enter God Mode</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-white text-base">Global User Directory ({totalUsers} Registered)</h3>
                  <p className="text-xs text-[#9090b8]">Search any executive, engineer, or client across all multi-tenant workspaces.</p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-[#5c5c8a] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, or agency..."
                    className="w-full bg-[#12121f] border border-[#2a2a4a] rounded-xl pl-10 pr-4 py-2 text-white text-xs focus:outline-none focus:border-[#7b2ff2]"
                  />
                </div>
              </div>

              <div className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#0a0a14] text-[#9090b8] text-[11px] font-bold uppercase tracking-wider border-b border-[#2a2a4a]">
                        <th className="py-3.5 px-5">User & Email</th>
                        <th className="py-3.5 px-5">Workspace Agency</th>
                        <th className="py-3.5 px-5">Role Level</th>
                        <th className="py-3.5 px-5">Department / Title</th>
                        <th className="py-3.5 px-5">Test Password (Simulated)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2a2a4a]">
                      {filteredUsers.map((u, i) => (
                        <tr key={i} className="hover:bg-[#1a1a2e]/60 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#7b2ff2]/20 border border-[#7b2ff2]/30 flex items-center justify-center font-bold text-xs text-[#c77dff] flex-shrink-0">
                                {u.initials}
                              </div>
                              <div>
                                <span className="font-bold text-white text-xs block">{u.name}</span>
                                <span className="text-[11px] text-[#9090b8]">{u.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <span className="font-semibold text-xs text-white">{u.bizName}</span>
                          </td>
                          <td className="py-4 px-5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              u.role === 'admin' ? 'bg-[#c77dff]/20 text-[#c77dff] border border-[#c77dff]/30' :
                              u.role === 'manager' ? 'bg-[#0077ff]/20 text-[#0077ff] border border-[#0077ff]/30' :
                              u.role === 'client' ? 'bg-[#ffc857]/20 text-[#ffc857] border border-[#ffc857]/30' :
                              'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-xs text-[#9090b8]">
                            {u.department || 'Team Collaborator'}
                          </td>
                          <td className="py-4 px-5">
                            <code className="text-xs bg-[#0a0a14] px-2.5 py-1 rounded border border-[#2a2a4a] text-[#c77dff] font-mono">
                              {u.password || 'Acme2026!'}
                            </code>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h3 className="font-bold text-white text-base">System Audit Trail & Webhook Stream</h3>
                <p className="text-xs text-[#9090b8]">Real-time security log of workspace entries, Make.com automations, and deliverable approvals.</p>
              </div>

              <div className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl overflow-hidden shadow-xl">
                <div className="divide-y divide-[#2a2a4a]">
                  {logs.map((log) => (
                    <div key={log.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[#1a1a2e]/60 transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                          log.type === 'ultra' ? 'bg-[#ff4d6d]' : log.type === 'webhook' ? 'bg-[#0077ff]' : log.type === 'alert' ? 'bg-[#ffc857]' : 'bg-[#00d4aa]'
                        }`} />
                        <div className="overflow-hidden">
                          <p className="text-xs text-white font-medium truncate">{log.text}</p>
                          <span className="text-[10px] text-[#5c5c8a]">Actor: {log.actor || 'System Bot'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#0a0a14] text-[#9090b8] border border-[#2a2a4a]">
                          {log.type}
                        </span>
                        <span className="text-xs text-[#5c5c8a] w-24 text-right">{log.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl p-5">
                  <span className="text-xs text-[#9090b8] block mb-1">Total SaaS MRR Collected</span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#00d4aa]">{formatZAR(totalMRR)}/mo</div>
                  <span className="text-[11px] text-[#5c5c8a] block mt-2">South African Rand subscription ledger</span>
                </div>
                <div className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl p-5">
                  <span className="text-xs text-[#9090b8] block mb-1">Paid Plan Revenue (ZAR)</span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#c77dff]">{formatZAR(businesses.reduce((sum, b) => sum + (PLAN_ACCESS[b.plan]?.monthlyZAR || 0), 0))}/mo</div>
                  <span className="text-[11px] text-[#5c5c8a] block mt-2">Plan packages only; custom add-ons require call agreement</span>
                </div>
                <div className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl p-5">
                  <span className="text-xs text-[#9090b8] block mb-1">Active Paying Agencies</span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#ffc857]">{activeAgencies} Workspaces</div>
                  <span className="text-[11px] text-[#5c5c8a] block mt-2">100% operational uptime</span>
                </div>
              </div>

              <div className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl overflow-hidden shadow-xl">
                <div className="p-5 border-b border-[#2a2a4a] bg-[#1a1a2e]">
                  <h3 className="font-bold text-white text-sm">Tenant Subscription Roster</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#0a0a14] text-[#9090b8] text-[11px] font-bold uppercase tracking-wider border-b border-[#2a2a4a]">
                        <th className="py-3.5 px-5">Workspace Agency</th>
                        <th className="py-3.5 px-5">Plan Tier</th>
                        <th className="py-3.5 px-5">Billing Frequency</th>
                        <th className="py-3.5 px-5">Monthly Price</th>
                        <th className="py-3.5 px-5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2a2a4a]">
                      {businesses.map((biz) => (
                        <tr key={biz.id} className="hover:bg-[#1a1a2e]/60 transition-colors">
                          <td className="py-4 px-5 font-bold text-white text-xs">{biz.name}</td>
                          <td className="py-4 px-5">
                            <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-[#7b2ff2]/20 text-[#c77dff] border border-[#7b2ff2]/30">
                              {biz.plan}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-xs text-[#9090b8]">Monthly Auto-Renew</td>
                          <td className="py-4 px-5 font-extrabold text-xs text-[#00d4aa]">
                            {formatZAR(biz.stats.mrr)}/mo
                          </td>
                          <td className="py-4 px-5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              biz.status === 'active' ? 'bg-[#00d4aa]/20 text-[#00d4aa]' : 'bg-[#ff4d6d]/20 text-[#ff4d6d]'
                            }`}>
                              ● {biz.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'events' && (() => {
            const eventSubs = getEventSubaccounts();
            const allEvents = getEvents();
            const totalEventRevenueZAR = eventSubs.reduce((acc, s) => acc + s.totalRevenueZAR, 0);
            const totalMonthlyFeesZAR = eventSubs.filter(s => s.status === 'active').reduce((acc, s) => acc + s.monthlyFeeZAR, 0);
            const totalTicketsSold = allEvents.reduce((acc, e) => acc + e.ticketsSold, 0);

            return (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <span className="text-lg">🎪</span>
                      Event Subaccounts Management
                    </h3>
                    <p className="text-xs text-[#9090b8]">Activate & manage paid Events Planner subaccounts for client workspaces. All billing in South African Rand (ZAR).</p>
                  </div>
                  <button
                    onClick={() => setIsCreateEventSubOpen(true)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ffc857] via-[#f7931a] to-[#7b2ff2] text-white font-extrabold text-xs shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>+ Activate New Events Subaccount</span>
                  </button>
                </div>

                {/* Revenue Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-[#12121f] via-[#1a1a2e] to-[#ffc857]/15 border border-[#ffc857]/40 rounded-2xl p-5">
                    <span className="text-[10px] text-[#ffc857] block mb-1 uppercase font-bold tracking-wider">Monthly Recurring Fees</span>
                    <div className="text-2xl font-extrabold text-[#ffc857]">{formatZAR(totalMonthlyFeesZAR)}/mo</div>
                    <span className="text-[11px] text-[#5c5c8a] block mt-2">Across {eventSubs.filter(s => s.status === 'active').length} active subs</span>
                  </div>
                  <div className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl p-5">
                    <span className="text-xs text-[#9090b8] block mb-1">Total Subaccounts</span>
                    <div className="text-2xl font-extrabold text-white">{eventSubs.length}</div>
                    <span className="text-[11px] text-[#5c5c8a] block mt-2">{eventSubs.filter(s => s.status === 'active').length} active</span>
                  </div>
                  <div className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl p-5">
                    <span className="text-xs text-[#9090b8] block mb-1">Total Events Created</span>
                    <div className="text-2xl font-extrabold text-[#c77dff]">{allEvents.length}</div>
                    <span className="text-[11px] text-[#5c5c8a] block mt-2">{allEvents.filter(e => e.status === 'live' || e.status === 'confirmed').length} confirmed/live</span>
                  </div>
                  <div className="bg-gradient-to-br from-[#00d4aa]/20 to-[#0077ff]/10 border border-[#00d4aa]/40 rounded-2xl p-5">
                    <span className="text-[10px] text-[#00d4aa] block mb-1 uppercase font-bold tracking-wider">Tickets Sold Lifetime</span>
                    <div className="text-2xl font-extrabold text-[#00d4aa]">{totalTicketsSold.toLocaleString('en-ZA')}</div>
                    <span className="text-[11px] text-[#00d4aa] block mt-2">Revenue: {formatZAR(totalEventRevenueZAR)}</span>
                  </div>
                </div>

                {/* Tier Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(Object.keys(EVENT_TIER_FEES) as Array<'basic' | 'pro' | 'elite'>).map(tier => {
                    const info = EVENT_TIER_FEES[tier];
                    const subsOnTier = eventSubs.filter(s => s.tier === tier && s.status === 'active').length;
                    const c = tier === 'basic' ? '#0077ff' : tier === 'pro' ? '#ffc857' : '#c77dff';
                    return (
                      <div key={tier} className="bg-[#12121f] border border-[#2a2a4a] rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-extrabold text-white uppercase">{info.label}</span>
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: `${c}20`, color: c }}>
                            {subsOnTier} active
                          </span>
                        </div>
                        <span className="text-xl font-extrabold" style={{ color: c }}>{formatZAR(info.monthlyZAR)}<span className="text-xs text-[#9090b8]"> /mo</span></span>
                        <p className="text-[10px] text-[#9090b8] mt-1">{info.maxEvents === 999 ? 'Unlimited events' : `Up to ${info.maxEvents} events`}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Subaccounts Table */}
                <div className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-5 border-b border-[#2a2a4a] bg-[#1a1a2e]">
                    <h3 className="font-bold text-white text-sm">Active Event Subaccounts Roster</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#0a0a14] text-[#9090b8] text-[11px] font-bold uppercase tracking-wider border-b border-[#2a2a4a]">
                          <th className="py-3.5 px-5">Workspace</th>
                          <th className="py-3.5 px-5">Tier</th>
                          <th className="py-3.5 px-5">Monthly Fee (ZAR)</th>
                          <th className="py-3.5 px-5">Events Created</th>
                          <th className="py-3.5 px-5">Revenue Generated</th>
                          <th className="py-3.5 px-5">Status</th>
                          <th className="py-3.5 px-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2a2a4a]">
                        {eventSubs.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-xs text-[#5c5c8a] italic">
                              No Event Subaccounts activated yet. Click "+ Activate New" above.
                            </td>
                          </tr>
                        ) : (
                          eventSubs.map(sub => {
                            const biz = businesses.find(b => b.id === sub.bizId);
                            return (
                              <tr key={sub.id} className="hover:bg-[#1a1a2e]/60 transition-colors">
                                <td className="py-4 px-5">
                                  <div className="flex items-center gap-2">
                                    {biz && (
                                      <div
                                        style={{ background: `linear-gradient(135deg, ${biz.primaryColor}, ${biz.secondaryColor})` }}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-extrabold text-[10px] shadow"
                                      >
                                        {biz.logo}
                                      </div>
                                    )}
                                    <div>
                                      <span className="text-xs font-bold text-white block">{biz?.name || 'Unknown'}</span>
                                      <span className="text-[10px] text-[#5c5c8a] font-mono">{sub.id}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-5">
                                  <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                                    sub.tier === 'basic' ? 'bg-[#0077ff]/20 text-[#0077ff]' :
                                    sub.tier === 'pro' ? 'bg-[#ffc857]/20 text-[#ffc857]' :
                                    'bg-[#c77dff]/20 text-[#c77dff]'
                                  }`}>{sub.tier}</span>
                                </td>
                                <td className="py-4 px-5 font-extrabold text-xs text-[#ffc857]">{formatZAR(sub.monthlyFeeZAR)}</td>
                                <td className="py-4 px-5 text-xs text-white font-bold">{sub.eventsCreated} events</td>
                                <td className="py-4 px-5 text-xs text-[#00d4aa] font-bold">{formatZAR(sub.totalRevenueZAR)}</td>
                                <td className="py-4 px-5">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                    sub.status === 'active' ? 'bg-[#00d4aa]/20 text-[#00d4aa]' : 'bg-[#ff4d6d]/20 text-[#ff4d6d]'
                                  }`}>● {sub.status}</span>
                                </td>
                                <td className="py-4 px-5 text-right">
                                  <button
                                    onClick={() => {
                                      const result = toggleEventSubaccountStatus(sub.id, currentSession.name);
                                      if (result) onShowToast(`Subaccount ${result.status === 'active' ? 'reactivated' : 'suspended'}`, 'info');
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
                                      sub.status === 'active'
                                        ? 'bg-[#ff4d6d]/15 text-[#ff4d6d] hover:bg-[#ff4d6d]/25 border border-[#ff4d6d]/40'
                                        : 'bg-[#00d4aa]/15 text-[#00d4aa] hover:bg-[#00d4aa]/25 border border-[#00d4aa]/40'
                                    }`}
                                  >
                                    {sub.status === 'active' ? 'Suspend' : 'Reactivate'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-6 animate-in fade-in duration-300">
              <div className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl p-6 space-y-5">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-[#ff4d6d]" /> Master Platform Configuration
                </h3>

                <div>
                  <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2">
                    SaaS Platform Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Elite Way Club Flow — Multi-Tenant Club Flow Engine"
                    className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-[#ff4d6d]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2">
                    Ultra Admin God Mode Email
                  </label>
                  <input
                    type="text"
                    disabled
                    value="ultra@elitewayclub.com"
                    className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-4 py-3 text-[#9090b8] text-xs font-mono opacity-70"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2">
                    Make.com Master Sync Webhook URL
                  </label>
                  <input
                    type="text"
                    defaultValue="https://hook.us1.make.com/ewcf-master-engine-sync-9921"
                    className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-4 py-3 text-[#c77dff] text-xs font-mono focus:outline-none focus:border-[#ff4d6d]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2">
                    Global System Timezone
                  </label>
                  <select className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-[#ff4d6d]">
                    <option>UTC (Universal Coordinated Time)</option>
                    <option selected>America/New_York (EST / EDT)</option>
                    <option>America/Los_Angeles (PST / PDT)</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => onShowToast('Master platform settings saved successfully!', 'success')}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#ff4d6d] to-[#7b2ff2] text-white font-bold text-xs shadow-lg hover:opacity-95 transition-all"
                  >
                    Save Master Settings →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      </div>

      <CreateEventSubaccountModal
        isOpen={isCreateEventSubOpen}
        onClose={() => setIsCreateEventSubOpen(false)}
        businesses={businesses}
        actorName={currentSession.name}
        onCreated={() => {
          onShowToast('Events subaccount activated! The workspace can now access the Events Planner tab.', 'success');
        }}
        onShowToast={onShowToast}
      />

      <BusinessFunctionsModal
        isOpen={!!functionsBusiness}
        onClose={() => setFunctionsBusiness(null)}
        business={functionsBusiness}
        actorName={currentSession.name}
        onSaved={() => onShowToast('Business plan access refreshed.', 'success')}
        onShowToast={onShowToast}
      />
    </div>
  );
};
