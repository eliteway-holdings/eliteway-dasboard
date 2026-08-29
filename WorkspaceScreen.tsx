import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  ClipboardList,
  FolderOpen,
  Send,
  Users,
  Bell,
  Zap,
  LogOut,
  Plus,
  Sparkles,
  Lock,
  ArrowLeft,
  UserCog,
  Menu,
  X as CloseIcon,
  CreditCard,
  Wallet,
  DollarSign,
  ExternalLink,
  ArrowUpRight,
  Inbox,
  Archive,
  PhoneCall
} from 'lucide-react';
import {
  getBusinesses,
  getTasks,
  getSubmissions,
  getProjects,
  getIntegrations,
  moveTask,
  triggerWebhookSim,
  removeTeamMember,
  getEventSubaccountForBiz,
  getWalletByBiz,
  getTransactions,
  getCheckoutLinks,
  addTestFundsToWallet,
  getResourcesForBiz,
  formatZAR
} from '../../services/store';
import { BusinessFeature, PaymentCheckoutLink, Session, TaskColumn } from '../../types';
import { TaskModal } from '../modals/TaskModal';
import { SubmissionModal } from '../modals/SubmissionModal';
import { ProjectModal } from '../modals/ProjectModal';
import { InviteMemberModal } from '../modals/InviteMemberModal';
import { EditMemberModal } from '../modals/EditMemberModal';
import { ClientCheckoutModal } from '../modals/ClientCheckoutModal';
import { CreateCheckoutLinkModal } from '../modals/CreateCheckoutLinkModal';
import { WithdrawModal } from '../modals/WithdrawModal';
import { ConnectWalletModal } from '../modals/ConnectWalletModal';
import { TaskSubmitWorkModal } from '../modals/TaskSubmitWorkModal';
import { TaskReviewModal } from '../modals/TaskReviewModal';
import { AddResourceModal } from '../modals/AddResourceModal';
import { MyTasksView } from './MyTasksView';
import { EventsView } from './EventsView';
import { ResourcesView } from './ResourcesView';
import { DailyOutreachView } from './DailyOutreachView';

interface WorkspaceScreenProps {
  currentSession: Session;
  onSignOut: () => void;
  onExitUltraOverride: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
  refreshKey: number;
  onTriggerRefresh: () => void;
}

export const WorkspaceScreen: React.FC<WorkspaceScreenProps> = ({
  currentSession,
  onSignOut,
  onExitUltraOverride,
  onShowToast,
  refreshKey,
  onTriggerRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'kanban' | 'projects' | 'submissions' | 'team' | 'integrations' | 'notifications' | 'mytasks' | 'events' | 'wallet' | 'ai' | 'resources' | 'outreach'>('mytasks');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const switchTab = (tab: any) => {
    const featureByTab: Partial<Record<string, BusinessFeature>> = {
      kanban: 'kanban', projects: 'projects', submissions: 'submissions', team: 'team',
      integrations: 'integrations', notifications: 'notifications', events: 'events', resources: 'resources', outreach: 'outreach'
    };
    const workspace = getBusinesses().find(b => b.id === currentSession.bizId);
    const requiredFeature = featureByTab[tab];
    if (requiredFeature && !currentSession.ultraOverride && !workspace?.enabledFeatures?.includes(requiredFeature)) {
      onShowToast(`${tab} is not included in this business's monthly function allocation. Contact Ultra Admin.`, 'error');
      return;
    }
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };
  
  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTaskForModal, setSelectedTaskForModal] = useState<any>(null);
  const [taskModalTargetCol, setTaskModalTargetCol] = useState<TaskColumn>('todo');
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [selectedSubmissionForModal, setSelectedSubmissionForModal] = useState<any>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isInviteMemberModalOpen, setIsInviteMemberModalOpen] = useState(false);
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);
  const [selectedMemberForEdit, setSelectedMemberForEdit] = useState<any>(null);
  const [isClientCheckoutModalOpen, setIsClientCheckoutModalOpen] = useState(false);
  const [selectedCheckoutLinkForModal, setSelectedCheckoutLinkForModal] = useState<PaymentCheckoutLink | null>(null);
  const [isCreateCheckoutModalOpen, setIsCreateCheckoutModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isConnectWalletModalOpen, setIsConnectWalletModalOpen] = useState(false);
  const [isTaskSubmitModalOpen, setIsTaskSubmitModalOpen] = useState(false);
  const [isTaskReviewModalOpen, setIsTaskReviewModalOpen] = useState(false);
  const [selectedTaskForSubmit, setSelectedTaskForSubmit] = useState<any>(null);
  const [selectedTaskForReview, setSelectedTaskForReview] = useState<any>(null);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);

  // Drag state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskColumn | null>(null);

  const businesses = getBusinesses();
  const biz = businesses.find(b => b.id === currentSession.bizId) || businesses[0];
  const role = currentSession.role;
  const institutionName = biz.whiteLabelEnabled && biz.whiteLabelName ? biz.whiteLabelName : biz.name;
  const institutionLogo = biz.whiteLabelEnabled && biz.logoUrl ? biz.logoUrl : '';
  const hasFeature = (feature: BusinessFeature) =>
    Boolean(currentSession.ultraOverride) || (biz.enabledFeatures || []).includes(feature);

  // Filter workspace records for this business
  const allTasks = getTasks();
  const bizTasks = allTasks.filter(t => t.bizId === biz.id);
  const allSubmissions = getSubmissions();
  const bizSubmissions = allSubmissions.filter(s => s.bizId === biz.id);
  const allProjects = getProjects();
  const bizProjects = allProjects.filter(p => p.bizId === biz.id);
  const allIntegrations = getIntegrations();
  const bizIntegrations = allIntegrations.filter(i => i.bizId === biz.id || true);
  const wallet = getWalletByBiz(biz.id);
  const bizTransactions = getTransactions().filter(tx => tx.bizId === biz.id);
  const bizLinks = getCheckoutLinks().filter(link => link.bizId === biz.id);
  const bizResources = getResourcesForBiz(biz.id);

  // Check editing capabilities
  const canEditTasks = role === 'admin' || role === 'manager' || currentSession.ultraOverride;

  // Handle Drag Over
  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, col: TaskColumn) => {
    e.preventDefault();
    setDragOverCol(col);
  };

  const handleDrop = (targetCol: TaskColumn) => {
    setDragOverCol(null);
    if (!draggedTaskId) return;

    const moved = moveTask(draggedTaskId, targetCol, currentSession.name);
    if (moved) {
      onShowToast(`Moved "${moved.title.substring(0, 20)}..." to ${targetCol.toUpperCase()}`, 'success');
      onTriggerRefresh();
    }
    setDraggedTaskId(null);
  };

  const handleTriggerIntegration = (intId: string, name: string) => {
    const res = triggerWebhookSim(intId);
    if (res) {
      onShowToast(`⚡ Webhook fired! ${name} synced status payload via Make.com.`, 'success');
      onTriggerRefresh();
    }
  };

  useEffect(() => {
    // Re-render when global state updates via refreshKey
  }, [refreshKey]);

  const kanbanColumns: { id: TaskColumn; name: string; color: string }[] = [
    { id: 'backlog', name: 'Backlog', color: '#5c5c8a' },
    { id: 'todo', name: 'To Do', color: '#0077ff' },
    { id: 'inprogress', name: 'In Progress', color: '#ffc857' },
    { id: 'inreview', name: 'In Review', color: '#c77dff' },
    { id: 'done', name: 'Done', color: '#00d4aa' }
  ];

  return (
    <div
      style={{
        '--acc': biz.primaryColor,
        '--cob': biz.secondaryColor,
      } as React.CSSProperties}
      className="institution-mode flex flex-col h-screen w-screen overflow-hidden bg-[#f8fafc] text-slate-900"
    >
      {/* Ultra God Mode Override Banner */}
      {currentSession.ultraOverride && (
        <div className="bg-gradient-to-r from-[#ff4d6d] via-[#7b2ff2] to-[#ff4d6d] text-white px-6 py-2 flex items-center justify-between text-xs font-bold shadow-lg z-30 flex-shrink-0 animate-ultra-pulse">
          <div className="flex items-center gap-2.5">
            <span className="bg-black/30 px-2.5 py-1 rounded font-extrabold uppercase tracking-wide">
              ⚡ ULTRA GOD MODE ACTIVE
            </span>
            <span>Inspecting multi-tenant workspace: <strong>{biz.name}</strong></span>
          </div>
          <button
            onClick={onExitUltraOverride}
            className="px-3.5 py-1.5 rounded-lg bg-white text-[#ff4d6d] hover:bg-white/90 transition-colors flex items-center gap-1.5 font-extrabold shadow"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Ultra Panel</span>
          </button>
        </div>
      )}

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
            <div
              style={{ background: `linear-gradient(135deg, ${biz.primaryColor}, ${biz.secondaryColor})` }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-extrabold text-xs shadow"
            >
              {institutionLogo ? <img src={institutionLogo} alt="Logo" className="h-full w-full rounded-lg object-cover" /> : biz.logo}
            </div>
            <div className="overflow-hidden">
              <h2 className="font-bold text-white text-xs leading-tight truncate max-w-[150px] sm:max-w-[220px]">{institutionName}</h2>
              <span className="text-[9px] text-[#00d4aa] block truncate uppercase tracking-wider font-bold">
                {activeTab}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canEditTasks && (
            <button
              onClick={() => {
                setSelectedTaskForModal(null);
                setTaskModalTargetCol('todo');
                setIsTaskModalOpen(true);
              }}
              className="p-2 rounded-lg bg-gradient-to-r from-[#7b2ff2] to-[#0077ff] text-white shadow hover:opacity-95"
              title="New Task"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => {
              setSelectedSubmissionForModal(null);
              setIsSubmissionModalOpen(true);
            }}
            className="p-2 rounded-lg bg-[#1a1a2e] border border-[#2a2a4a] text-[#00d4aa] hover:border-[#00d4aa]"
            title="Submit Work"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Backdrop for Mobile Slide-over Drawer */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-[#0a0a14]/80 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
          />
        )}

        {/* Workspace Sidebar (Drawer on mobile (< lg), static on desktop (lg+)) */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-[#12121f] border-r border-[#2a2a4a] flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
        >
          {/* Brand Header */}
          <div className="p-5 border-b border-[#2a2a4a] flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div
                style={{ background: `linear-gradient(135deg, ${biz.primaryColor}, ${biz.secondaryColor})` }}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-base shadow-lg flex-shrink-0"
              >
                {institutionLogo ? <img src={institutionLogo} alt="Logo" className="h-full w-full rounded-xl object-cover" /> : biz.logo}
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <h2 className="font-bold text-white text-sm leading-tight truncate">{institutionName}</h2>
                </div>
                <span className="text-[10px] text-[#9090b8] block truncate">
                  {biz.customDomain || 'Club Flow Engine'}
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

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            <div className="text-[10px] font-bold text-[#5c5c8a] uppercase tracking-wider px-3 py-2">
              Workspace Core
            </div>

            <button
              onClick={() => switchTab('mytasks')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all relative overflow-hidden group ${
                activeTab === 'mytasks'
                  ? 'bg-gradient-to-r from-[#00d4aa]/25 to-[#0077ff]/25 text-white border border-[#00d4aa]/50 shadow-md'
                  : 'text-[#00d4aa] hover:bg-[#00d4aa]/15 border border-[#00d4aa]/30'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Inbox className="w-4 h-4 text-[#00d4aa]" />
                <span>My Tasks</span>
              </div>
              {(() => {
                const myTaskCount = bizTasks.filter(t => t.assignee === currentSession.initials && t.col !== 'done').length;
                return myTaskCount > 0 ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00d4aa] text-black font-extrabold shadow">
                    {myTaskCount}
                  </span>
                ) : null;
              })()}
            </button>

            <button
              onClick={() => switchTab('outreach')}
              className={`w-full items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${hasFeature('outreach') ? 'flex' : 'hidden'} ${
                activeTab === 'outreach'
                  ? 'bg-[#4c1d95] text-white border border-[#4c1d95] shadow-sm'
                  : 'text-slate-700 hover:bg-[#ede9fe] hover:text-[#4c1d95]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4" />
                <span>Daily Outreach</span>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e] font-extrabold uppercase">Today</span>
            </button>

            <button
              onClick={() => switchTab('dashboard')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-[#7b2ff2]/20 text-[#c77dff] border border-[#7b2ff2]/40 shadow-sm'
                  : 'text-[#9090b8] hover:text-white hover:bg-[#1a1a2e]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4" />
                <span>Dashboard</span>
              </div>
            </button>

            <button
              onClick={() => switchTab('kanban')}
              className={`w-full items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${hasFeature('kanban') ? 'flex' : 'hidden'} ${
                activeTab === 'kanban'
                  ? 'bg-[#7b2ff2]/20 text-[#c77dff] border border-[#7b2ff2]/40 shadow-sm'
                  : 'text-[#9090b8] hover:text-white hover:bg-[#1a1a2e]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ClipboardList className="w-4 h-4" />
                <span>Kanban Board</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1a1a2e] text-[#9090b8] font-bold border border-[#2a2a4a]">
                {bizTasks.length}
              </span>
            </button>

            {role !== 'member' && role !== 'client' && hasFeature('projects') && (
              <button
                onClick={() => switchTab('projects')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'projects'
                    ? 'bg-[#7b2ff2]/20 text-[#c77dff] border border-[#7b2ff2]/40 shadow-sm'
                    : 'text-[#9090b8] hover:text-white hover:bg-[#1a1a2e]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FolderOpen className="w-4 h-4" />
                  <span>Projects & Budgets</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1a1a2e] text-[#0077ff] font-bold border border-[#2a2a4a]">
                  {bizProjects.length}
                </span>
              </button>
            )}

            <button
              onClick={() => switchTab('submissions')}
              className={`w-full items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${hasFeature('submissions') ? 'flex' : 'hidden'} ${
                activeTab === 'submissions'
                  ? 'bg-[#7b2ff2]/20 text-[#c77dff] border border-[#7b2ff2]/40 shadow-sm'
                  : 'text-[#9090b8] hover:text-white hover:bg-[#1a1a2e]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Send className="w-4 h-4" />
                <span>Deliverables Review</span>
              </div>
              {bizSubmissions.filter(s => s.status === 'pending').length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ffc857]/20 text-[#ffc857] font-bold border border-[#ffc857]/40 animate-pulse">
                  {bizSubmissions.filter(s => s.status === 'pending').length}
                </span>
              )}
            </button>

            {/* Events Planner Button */}
            {(() => {
              const eventSub = getEventSubaccountForBiz(biz.id);
              const isLocked = !eventSub || !hasFeature('events');
              return (
                <button
                  onClick={() => switchTab('events')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all relative overflow-hidden group ${
                    activeTab === 'events'
                      ? 'bg-gradient-to-r from-[#ffc857]/25 to-[#f7931a]/25 text-white border border-[#ffc857]/60 shadow-md'
                      : 'text-[#ffc857] hover:bg-[#ffc857]/15 border border-[#ffc857]/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm">🎪</span>
                    <span>Events Planner</span>
                  </div>
                  {isLocked ? (
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#5c5c8a]/30 text-[#5c5c8a] font-extrabold flex items-center gap-1">
                      <span>🔒</span>
                    </span>
                  ) : (
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#ffc857] text-black font-extrabold shadow">
                      ZAR
                    </span>
                  )}
                </button>
              );
            })()}

            <div className="text-[10px] font-bold text-[#5c5c8a] uppercase tracking-wider px-3 pt-4 pb-2">
              Team & Connectors
            </div>

            {role !== 'member' && role !== 'client' && hasFeature('team') && (
              <button
                onClick={() => switchTab('team')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'team'
                    ? 'bg-[#7b2ff2]/20 text-[#c77dff] border border-[#7b2ff2]/40 shadow-sm'
                    : 'text-[#9090b8] hover:text-white hover:bg-[#1a1a2e]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4" />
                  <span>Team Members</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1a1a2e] text-[#9090b8] font-bold border border-[#2a2a4a]">
                  {biz.users.length}
                </span>
              </button>
            )}

            {role !== 'member' && role !== 'client' && hasFeature('integrations') && (
              <button
                onClick={() => switchTab('integrations')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'integrations'
                    ? 'bg-[#7b2ff2]/20 text-[#c77dff] border border-[#7b2ff2]/40 shadow-sm'
                    : 'text-[#9090b8] hover:text-white hover:bg-[#1a1a2e]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-[#ffc857]" />
                  <span>Make & Webhooks</span>
                </div>
              </button>
            )}

            <button
              onClick={() => switchTab('resources')}
              className={`w-full items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${hasFeature('resources') ? 'flex' : 'hidden'} ${
                activeTab === 'resources'
                  ? 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/40 shadow-sm'
                  : 'text-[#00d4aa] hover:text-white hover:bg-[#00d4aa]/10'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Archive className="w-4 h-4" />
                <span>Resource Repository</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00d4aa] text-black font-extrabold">
                {bizResources.length}
              </span>
            </button>

            <button
              onClick={() => switchTab('notifications')}
              className={`w-full items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${hasFeature('notifications') ? 'flex' : 'hidden'} ${
                activeTab === 'notifications'
                  ? 'bg-[#7b2ff2]/20 text-[#c77dff] border border-[#7b2ff2]/40 shadow-sm'
                  : 'text-[#9090b8] hover:text-white hover:bg-[#1a1a2e]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4" />
                <span>Activity Stream</span>
              </div>
            </button>
          </div>

          {/* Footer User Info */}
          <div className="p-4 border-t border-[#2a2a4a] bg-[#0a0a14] space-y-2">
            <div className="w-full p-2.5 rounded-xl bg-[#1a1a2e] border border-[#2a2a4a] flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div
                  style={{ background: biz.primaryColor }}
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white flex-shrink-0 shadow"
                >
                  {currentSession.initials}
                </div>
                <div className="overflow-hidden">
                  <div className="font-semibold text-white text-xs truncate">
                    {currentSession.name}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] font-extrabold tracking-wider uppercase px-1.5 py-0.5 rounded bg-[#7b2ff2]/30 text-[#c77dff] border border-[#7b2ff2]/40">
                      {role}
                    </span>
                    <span className="text-[10px] text-[#5c5c8a] truncate">{currentSession.email}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={onSignOut}
              className="w-full py-2 rounded-lg border border-[#2a2a4a] hover:bg-[#1a1a2e] text-xs text-[#9090b8] hover:text-white transition-colors flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Workspace Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#0a0a14]">
          {/* Desktop Header (hidden on mobile (< lg) because mobile navbar handles top bar) */}
          <header className="hidden lg:flex h-16 border-b border-[#2a2a4a] bg-[#12121f] px-6 items-center justify-between flex-shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white capitalize">
                  {activeTab === 'events' ? '🎪 Events Planner Subaccount (ZAR)' :
                   activeTab === 'mytasks' ? 'My Tasks & Personal Work Queue' :
                   activeTab === 'dashboard' ? 'Workspace Dashboard Overview' :
                   activeTab === 'kanban' ? 'Kanban Workflow Board' :
                   activeTab === 'projects' ? 'Project Directory & Campaign Budgets' :
                   activeTab === 'submissions' ? 'Deliverables Review & Approval Loop' :
                   activeTab === 'outreach' ? 'Daily Outreach & Contact Follow-Up' :
                   activeTab === 'team' ? 'Team Collaborator Directory' :
                   activeTab === 'integrations' ? 'Make.com & Webhook Automations' : activeTab === 'resources' ? 'Institutional Resource Repository' : 'Real-Time Activity Stream'}
                </h1>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#1a1a2e] border border-[#2a2a4a] text-[#00d4aa]">
                  {role === 'client' ? '👁️ CLIENT SPONSOR VIEW' : `● ${biz.plan.toUpperCase()} TIER`}
                </span>
              </div>
              <p className="text-xs text-[#9090b8]">
                {role === 'member' ? 'Member view: Update tasks and submit work deliverables' :
                 role === 'client' ? 'Guest portal: Review milestones and approve final deliverables' :
                 'Full admin/manager control over workflows and automation webhooks'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {canEditTasks && (
                <button
                  onClick={() => {
                    setSelectedTaskForModal(null);
                    setTaskModalTargetCol('todo');
                    setIsTaskModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7b2ff2] to-[#0077ff] text-white font-bold text-xs shadow-lg hover:opacity-95 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Task</span>
                </button>
              )}

              <button
                onClick={() => {
                  setSelectedSubmissionForModal(null);
                  setIsSubmissionModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#1a1a2e] border border-[#2a2a4a] hover:border-[#00d4aa] text-[#00d4aa] font-bold text-xs transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Work</span>
              </button>
            </div>
          </header>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Feature-gate redirect: if current tab's feature was de-allocated, bounce back */}
            {(() => {
              const tabFeatureMap: Record<string, BusinessFeature | null> = {
                kanban: 'kanban',
                projects: 'projects',
                submissions: 'submissions',
                team: 'team',
                integrations: 'integrations',
                notifications: 'notifications',
                resources: 'resources',
                outreach: 'outreach',
                events: 'events'
              };
              const required = tabFeatureMap[activeTab];
              if (required && !hasFeature(required)) {
                // De-allocated while user was on this tab → force back to personal queue
                setTimeout(() => setActiveTab('mytasks'), 0);
                return (
                  <div className="bg-[#12121f] border border-[#ffc857]/40 rounded-2xl p-12 text-center animate-in fade-in">
                    <Lock className="w-10 h-10 text-[#ffc857] mx-auto mb-3" />
                    <h3 className="text-base font-bold text-white mb-1">"{activeTab}" has been de-allocated from this business</h3>
                    <p className="text-xs text-[#9090b8]">
                      Ultra Admin removed this function from your monthly budget allocation. Please re-allocate it from the Platform Panel to regain access.
                    </p>
                  </div>
                );
              }
              return null;
            })()}

            {activeTab === 'mytasks' && (
              <MyTasksView
                bizId={biz.id}
                userInitials={currentSession.initials}
                userName={currentSession.name}
                userRole={role}
                primaryColor={biz.primaryColor}
                onRefresh={onTriggerRefresh}
                onShowToast={onShowToast}
                refreshKey={refreshKey}
              />
            )}

            {activeTab === 'outreach' && (
              <DailyOutreachView
                bizId={biz.id}
                teamMembers={biz.users}
                currentUserName={currentSession.name}
                currentUserInitials={currentSession.initials}
                currentUserRole={role}
                primaryColor={biz.primaryColor}
                refreshKey={refreshKey}
                onRefresh={onTriggerRefresh}
                onShowToast={onShowToast}
              />
            )}

            {activeTab === 'events' && (
              <EventsView
                bizId={biz.id}
                bizName={biz.name}
                primaryColor={biz.primaryColor}
                teamMembers={biz.users}
                currentUserName={currentSession.name}
                currentUserInitials={currentSession.initials}
                currentUserRole={role}
                refreshKey={refreshKey}
                onRefresh={onTriggerRefresh}
                onShowToast={onShowToast}
                onOpenKanban={hasFeature('kanban') ? () => setActiveTab('kanban') : undefined}
              />
            )}

            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl p-5 relative overflow-hidden group hover:border-[#7b2ff2] transition-colors">
                    <span className="text-xs font-semibold text-[#9090b8] block mb-2">Active Kanban Tasks</span>
                    <div className="text-3xl font-extrabold text-white">{bizTasks.length} Tasks</div>
                    <span className="text-xs text-[#c77dff] mt-2 block font-medium">
                      {bizTasks.filter(t => t.col === 'inprogress').length} currently in progress
                    </span>
                  </div>

                  <div className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl p-5 relative overflow-hidden group hover:border-[#0077ff] transition-colors">
                    <span className="text-xs font-semibold text-[#9090b8] block mb-2">Campaign Projects</span>
                    <div className="text-3xl font-extrabold text-white">{bizProjects.length} Projects</div>
                    <span className="text-xs text-[#0077ff] mt-2 block font-medium">
                      Across client & internal roadmaps
                    </span>
                  </div>

                  <div className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl p-5 relative overflow-hidden group hover:border-[#00d4aa] transition-colors">
                    <span className="text-xs font-semibold text-[#9090b8] block mb-2">Deliverables for Review</span>
                    <div className="text-3xl font-extrabold text-white">
                      {bizSubmissions.filter(s => s.status === 'pending').length} Pending
                    </div>
                    <span className="text-xs text-[#00d4aa] mt-2 block font-medium">
                      {bizSubmissions.filter(s => s.status === 'approved').length} approved deliverables
                    </span>
                  </div>

                  <div className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl p-5 relative overflow-hidden group hover:border-[#ffc857] transition-colors">
                    <span className="text-xs font-semibold text-[#9090b8] block mb-2">Team Collaborators</span>
                    <div className="text-3xl font-extrabold text-white">{biz.users.length} Members</div>
                    <span className="text-xs text-[#ffc857] mt-2 block font-medium">
                      Make.com & Slack synced
                    </span>
                  </div>
                </div>

                {/* Quick Actions Banner */}
                <div className="bg-gradient-to-r from-[#12121f] via-[#1a1a2e] to-[#12121f] border border-[#2a2a4a] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                  <div className="flex items-center gap-4">
                    <div
                      style={{ background: `linear-gradient(135deg, ${biz.primaryColor}, ${biz.secondaryColor})` }}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0"
                    >
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white mb-1">
                        Accelerate Workflows with Club Flow Engine 2.0
                      </h3>
                      <p className="text-xs text-[#9090b8] max-w-xl leading-relaxed">
                        Assign work, collect submissions, review deliverables, and track deadlines across your team.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    {hasFeature('kanban') && (
                      <button
                        onClick={() => setActiveTab('kanban')}
                        className="px-4 py-3 rounded-xl bg-[#1a1a2e] border border-[#2a2a4a] hover:border-[#7b2ff2] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 flex-1 md:flex-initial whitespace-nowrap"
                      >
                        <ClipboardList className="w-4 h-4 text-[#c77dff]" />
                        <span>Open Kanban Board</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Deliverables Review Feed Table — only when submissions feature allocated */}
                {hasFeature('submissions') ? (
                <div className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-5 border-b border-[#2a2a4a] flex items-center justify-between bg-[#1a1a2e]">
                    <div>
                      <h3 className="font-bold text-white text-sm">Recent Deliverable Submissions</h3>
                      <p className="text-xs text-[#9090b8]">Click any submission to inspect Figma links, review feedback threads, and approve work.</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('submissions')}
                      className="text-xs text-[#0077ff] hover:underline font-semibold"
                    >
                      View All Submissions →
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#0a0a14] text-[#9090b8] text-[11px] font-bold uppercase tracking-wider border-b border-[#2a2a4a]">
                          <th className="py-3.5 px-5">Deliverable Title</th>
                          <th className="py-3.5 px-5">Submitted By</th>
                          <th className="py-3.5 px-5">File Type</th>
                          <th className="py-3.5 px-5">Time</th>
                          <th className="py-3.5 px-5">Status</th>
                          <th className="py-3.5 px-5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2a2a4a]">
                        {bizSubmissions.slice(0, 5).map((sub) => (
                          <tr key={sub.id} className="hover:bg-[#1a1a2e]/60 transition-colors">
                            <td className="py-4 px-5 font-bold text-white text-xs">{sub.title}</td>
                            <td className="py-4 px-5 text-xs text-[#9090b8]">
                              <span className="text-white font-semibold">{sub.submitter}</span> ({sub.submitterRole || 'Team'})
                            </td>
                            <td className="py-4 px-5">
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#1a1a2e] text-[#c77dff] border border-[#2a2a4a]">
                                {sub.fileType} ({sub.version})
                              </span>
                            </td>
                            <td className="py-4 px-5 text-xs text-[#5c5c8a]">{sub.time}</td>
                            <td className="py-4 px-5">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                sub.status === 'approved' ? 'bg-[#00d4aa]/20 text-[#00d4aa]' :
                                sub.status === 'revision' ? 'bg-[#ff4d6d]/20 text-[#ff4d6d]' : 'bg-[#ffc857]/20 text-[#ffc857]'
                              }`}>
                                ● {sub.status}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-right">
                              <button
                                onClick={() => {
                                  setSelectedSubmissionForModal(sub);
                                  setIsSubmissionModalOpen(true);
                                }}
                                className="px-3.5 py-1.5 rounded-lg bg-[#1a1a2e] border border-[#2a2a4a] hover:border-[#7b2ff2] text-white text-xs font-semibold transition-colors"
                              >
                                Review & Inspect →
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                ) : (
                <div className="bg-[#12121f] border border-dashed border-[#ffc857]/40 rounded-2xl p-10 text-center">
                  <Lock className="w-8 h-8 text-[#ffc857] mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-white">Deliverable Reviews are de-allocated from this business</h4>
                  <p className="text-xs text-[#9090b8] mt-1">Ultra Admin can re-enable the <strong>Deliverable Reviews</strong> feature (R249/mo) from the Platform Panel's Functions allocation.</p>
                </div>
                )}
              </div>
            )}

            {activeTab === 'kanban' && (
              <div className="flex-1 flex flex-col min-h-[600px] animate-in fade-in duration-300">
                <div className="flex lg:grid lg:grid-cols-5 gap-4 h-full pb-6 overflow-x-auto snap-x snap-mandatory -mx-6 px-6 lg:mx-0 lg:px-0">
                  {kanbanColumns.map((col) => {
                    const colTasks = bizTasks.filter(t => t.col === col.id);
                    const isDragOver = dragOverCol === col.id;

                    return (
                      <div
                        key={col.id}
                        onDragOver={(e) => handleDragOver(e, col.id)}
                        onDrop={() => handleDrop(col.id)}
                        className={`w-[285px] sm:w-[320px] lg:w-auto flex-shrink-0 snap-start bg-[#12121f] border rounded-2xl flex flex-col overflow-hidden transition-colors max-h-full ${
                          isDragOver ? 'border-[#7b2ff2] bg-[#7b2ff2]/5 ring-1 ring-[#7b2ff2]' : 'border-[#2a2a4a]'
                        }`}
                      >
                        {/* Column Header */}
                        <div className="p-3.5 border-b border-[#2a2a4a] bg-[#1a1a2e] flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full shadow" style={{ background: col.color }} />
                            <span className="font-bold text-white text-xs uppercase tracking-wider">{col.name}</span>
                          </div>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#12121f] border border-[#2a2a4a] text-[#9090b8]">
                            {colTasks.length}
                          </span>
                        </div>

                        {/* Column Body */}
                        <div className="p-3 overflow-y-auto flex-1 space-y-3 min-h-[200px]">
                          {colTasks.map((task) => (
                            <div
                              key={task.id}
                              draggable={canEditTasks}
                              onDragStart={() => handleDragStart(task.id)}
                              onClick={() => {
                                // If task is in review OR has submissions/feedback → open Review modal
                                if (task.col === 'inreview' || (task.workSubmissions && task.workSubmissions.length > 0) || (task.feedbackReports && task.feedbackReports.length > 0)) {
                                  setSelectedTaskForReview(task);
                                  setIsTaskReviewModalOpen(true);
                                } else if (task.assignee === currentSession.initials && task.col !== 'done') {
                                  // If task is assigned to me and I can submit work → open Submit modal
                                  setSelectedTaskForSubmit(task);
                                  setIsTaskSubmitModalOpen(true);
                                } else {
                                  setSelectedTaskForModal(task);
                                  setIsTaskModalOpen(true);
                                }
                              }}
                              className={`p-3.5 rounded-xl border transition-all cursor-pointer bg-[#0a0a14] relative group ${
                                draggedTaskId === task.id ? 'opacity-40 border-dashed border-[#7b2ff2]' : 'border-[#2a2a4a] hover:border-[#7b2ff2] hover:-translate-y-0.5 shadow-md'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#7b2ff2]/20 text-[#c77dff] border border-[#7b2ff2]/30">
                                  {task.category}
                                </span>
                                <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                  task.priority === 'urgent' ? 'bg-[#ff4d6d]/20 text-[#ff4d6d]' :
                                  task.priority === 'high' ? 'bg-[#ffc857]/20 text-[#ffc857]' : 'bg-[#1a1a2e] text-[#9090b8]'
                                }`}>
                                  {task.priority}
                                </span>
                              </div>

                              {/* Linked source badge (Project or Event) */}
                              {(task.linkedEventName || task.linkedProjectName) && (
                                <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded mb-2 flex items-center gap-1 truncate ${
                                  task.linkedEventName
                                    ? 'bg-[#ffc857]/15 text-[#ffc857] border border-[#ffc857]/40'
                                    : 'bg-[#0077ff]/15 text-[#0077ff] border border-[#0077ff]/40'
                                }`}>
                                  <span>{task.linkedEventName ? '🎪' : '📁'}</span>
                                  <span className="truncate max-w-[180px]">{task.linkedEventName || task.linkedProjectName}</span>
                                </div>
                              )}

                              <h4 className="font-bold text-white text-xs leading-snug mb-2 group-hover:text-[#c77dff] transition-colors line-clamp-2">
                                {task.title}
                              </h4>

                              {task.checklist && task.checklist.length > 0 && (
                                <div className="flex items-center gap-2 mb-2 text-[10px] text-[#9090b8]">
                                  <span>☑ {task.checklist.filter(c => c.done).length}/{task.checklist.length} checklist steps</span>
                                </div>
                              )}

                              <div className="pt-2 border-t border-[#2a2a4a]/60 flex items-center justify-between text-[10px] text-[#5c5c8a]">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-5 h-5 rounded-full bg-[#1a1a2e] border border-[#2a2a4a] flex items-center justify-center font-bold text-[9px] text-[#0077ff]">
                                    {task.assignee}
                                  </div>
                                  <span className="text-[#9090b8] truncate max-w-[80px]">{task.assigneeName || task.assignee}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {task.workSubmissions && task.workSubmissions.length > 0 && (
                                    <span
                                      className="px-1.5 py-0.5 rounded bg-[#c77dff]/20 text-[#c77dff] text-[9px] font-extrabold uppercase border border-[#c77dff]/40 animate-pulse"
                                      title={`${task.workSubmissions.length} submission(s) awaiting review`}
                                    >
                                      📤 {task.workSubmissions.length}
                                    </span>
                                  )}
                                  {task.feedbackReports && task.feedbackReports.length > 0 && (
                                    <span
                                      className="px-1.5 py-0.5 rounded bg-[#ffc857]/20 text-[#ffc857] text-[9px] font-extrabold uppercase border border-[#ffc857]/40"
                                      title={`${task.feedbackReports.length} feedback report(s)`}
                                    >
                                      ⭐ {task.feedbackReports.length}
                                    </span>
                                  )}
                                  <span>📎 {task.attachmentsCount || 0}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Column Footer */}
                        {canEditTasks ? (
                          <div className="p-2.5 border-t border-[#2a2a4a] bg-[#1a1a2e]/60">
                            <button
                              onClick={() => {
                                setSelectedTaskForModal(null);
                                setTaskModalTargetCol(col.id);
                                setIsTaskModalOpen(true);
                              }}
                              className="w-full py-1.5 rounded-lg border border-dashed border-[#2a2a4a] hover:border-[#7b2ff2] text-xs text-[#9090b8] hover:text-white transition-colors flex items-center justify-center gap-1 font-semibold"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Task
                            </button>
                          </div>
                        ) : (
                          <div className="p-2.5 border-t border-[#2a2a4a] bg-[#1a1a2e]/60 text-[10px] text-center text-[#5c5c8a] flex items-center justify-center gap-1">
                            <Lock className="w-3 h-3" /> View & Move Only
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white text-base">Client Campaign Roadmaps & Budgets</h3>
                    <p className="text-xs text-[#9090b8]">Track milestone completion, financial allocations, and deadline risks.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasFeature('kanban') && (
                      <button
                        onClick={() => setActiveTab('kanban')}
                        className="px-4 py-2.5 rounded-xl bg-[#0077ff]/15 border border-[#0077ff]/40 text-[#0077ff] font-bold text-xs hover:bg-[#0077ff]/25 transition-all flex items-center gap-1.5"
                        title="All project milestones mirror inside Kanban board"
                      >
                        <ClipboardList className="w-4 h-4" />
                        <span>Open Kanban →</span>
                      </button>
                    )}
                    {(role === 'admin' || currentSession.ultraOverride) && (
                      <button
                        onClick={() => setIsProjectModalOpen(true)}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7b2ff2] to-[#0077ff] text-white font-bold text-xs shadow-lg hover:opacity-95 transition-all flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Launch Project</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Kanban link notice */}
                <div className="bg-gradient-to-r from-[#0077ff]/15 to-[#00d4aa]/10 border border-[#0077ff]/30 rounded-xl p-4 flex items-start gap-3">
                  <ClipboardList className="w-4 h-4 text-[#0077ff] flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-[#e8e8f4] leading-relaxed">
                    <strong className="text-white">Kanban Sync Active:</strong> every milestone below is mirrored as a card on your Kanban board titled <em>"Project Name: Milestone"</em>.
                    Moving a milestone card to <strong>Done</strong> on the board auto-marks the milestone as <em>completed</em> and advances this project's progress percentage.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {bizProjects.map((project) => (
                    <div key={project.id} className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl p-6 space-y-4 shadow-xl">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-[#0077ff] uppercase tracking-wider">{project.clientName}</span>
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30">
                              ● {project.status}
                            </span>
                          </div>
                          <h4 className="text-lg font-bold text-white leading-tight">{project.name}</h4>
                          <p className="text-xs text-[#9090b8] mt-1">{project.description}</p>
                        </div>

                        <div className="flex items-center gap-6 sm:text-right">
                          <div>
                            <span className="text-[10px] text-[#9090b8] block uppercase font-bold">Total Budget</span>
                            <span className="text-lg font-extrabold text-[#00d4aa]">{formatZAR(project.budget)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#9090b8] block uppercase font-bold">Target Launch</span>
                            <span className="text-xs font-bold text-white">{project.deadline}</span>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                          <span className="text-[#9090b8]">Milestone Progress</span>
                          <span className="text-[#c77dff]">{project.progress}% Complete</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#0a0a14] border border-[#2a2a4a] overflow-hidden">
                          <div
                            style={{ width: `${project.progress}%`, background: `linear-gradient(90deg, ${biz.primaryColor}, ${biz.secondaryColor})` }}
                            className="h-full rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>

                      {/* Milestones list */}
                      <div className="pt-3 border-t border-[#2a2a4a] grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {project.milestones.map((ms) => (
                          <div key={ms.id} className="bg-[#0a0a14] border border-[#2a2a4a] p-3 rounded-xl flex items-center justify-between gap-2">
                            <div className="truncate">
                              <span className="text-xs font-semibold text-white block truncate">{ms.title}</span>
                              <span className="text-[10px] text-[#5c5c8a]">Due: {ms.date} • {formatZAR(ms.amount || 0)}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                              ms.status === 'completed' ? 'bg-[#00d4aa]/20 text-[#00d4aa]' :
                              ms.status === 'in_progress' ? 'bg-[#ffc857]/20 text-[#ffc857]' : 'bg-[#1a1a2e] text-[#9090b8]'
                            }`}>
                              {ms.status.replace('_', ' ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'submissions' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">Work Deliverables & Review Loop</h3>
                    <p className="text-xs text-[#9090b8]">Team members upload Figma links, Make.com blueprints, and videos for manager approval.</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedSubmissionForModal(null);
                      setIsSubmissionModalOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00d4aa] to-[#0077ff] text-black font-extrabold text-xs shadow-lg hover:opacity-95 transition-all flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    <span>+ Submit New Package</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {bizSubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => {
                        setSelectedSubmissionForModal(sub);
                        setIsSubmissionModalOpen(true);
                      }}
                      className="bg-[#12121f] border border-[#2a2a4a] hover:border-[#7b2ff2] rounded-2xl p-5 space-y-4 shadow-xl cursor-pointer transition-all group"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#7b2ff2]/20 border border-[#7b2ff2]/30 flex items-center justify-center font-extrabold text-xs text-[#c77dff]">
                            {sub.fileType.substring(0, 3).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-base group-hover:text-[#c77dff] transition-colors">{sub.title}</h4>
                            <span className="text-xs text-[#9090b8]">
                              Submitted by <strong>{sub.submitter}</strong> • {sub.time}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                            sub.status === 'approved' ? 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/40' :
                            sub.status === 'revision' ? 'bg-[#ff4d6d]/20 text-[#ff4d6d] border border-[#ff4d6d]/40' :
                            'bg-[#ffc857]/20 text-[#ffc857] border border-[#ffc857]/40 animate-pulse'
                          }`}>
                            ● {sub.status}
                          </span>
                          <button className="px-3 py-1.5 rounded-lg bg-[#1a1a2e] border border-[#2a2a4a] text-xs font-semibold text-white group-hover:border-[#7b2ff2] transition-colors">
                            Review & Comment ({sub.feedback.length}) →
                          </button>
                        </div>
                      </div>

                      {sub.description && (
                        <p className="text-xs text-[#e8e8f4] leading-relaxed bg-[#0a0a14] p-3 rounded-xl border border-[#2a2a4a]/60">
                          {sub.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-[#5c5c8a] pt-2 border-t border-[#2a2a4a]/60">
                        <span className="truncate max-w-md text-[#0077ff] font-mono">{sub.fileUrl}</span>
                        <span>Version: {sub.version || 'v1.0'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'team' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">Team Directory & Role Assignment</h3>
                    <p className="text-xs text-[#9090b8]">
                      {biz.users.length} members in {biz.name} • {role === 'admin' || currentSession.ultraOverride ? 'Create real login credentials for new members' : 'View-only directory'}
                    </p>
                  </div>
                  {(role === 'admin' || currentSession.ultraOverride) && (
                    <button
                      onClick={() => setIsInviteMemberModalOpen(true)}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7b2ff2] to-[#0077ff] text-white font-bold text-xs shadow hover:opacity-95 transition-all flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Create Member Login</span>
                    </button>
                  )}
                </div>

                {/* Info banner about direct logins */}
                {(role === 'admin' || currentSession.ultraOverride) && (
                  <div className="bg-gradient-to-r from-[#7b2ff2]/15 to-[#0077ff]/15 border border-[#7b2ff2]/30 p-4 rounded-xl flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#7b2ff2]/20 border border-[#7b2ff2]/30 flex items-center justify-center text-[#c77dff] flex-shrink-0">
                      <Users className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white mb-0.5">Direct Credential Provisioning</h4>
                      <p className="text-[11px] text-[#9090b8] leading-relaxed">
                        No invitation links. Create email + password logins directly — new members sign in immediately from the main login page. You can also remove members or view their credentials.
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {biz.users.map((u) => {
                    const isAdminCount = biz.users.filter(x => x.role === 'admin').length;
                    const isLastAdmin = u.role === 'admin' && isAdminCount <= 1;
                    return (
                      <div key={u.id} className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl p-5 space-y-3 shadow-xl hover:border-[#7b2ff2]/50 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3.5 overflow-hidden">
                            <div
                              style={{ background: biz.primaryColor }}
                              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-base shadow flex-shrink-0"
                            >
                              {u.initials}
                            </div>
                            <div className="overflow-hidden">
                              <h4 className="font-bold text-white text-sm truncate">{u.name}</h4>
                              <span className="text-xs text-[#9090b8] block truncate">{u.email}</span>
                              <span className="text-[10px] text-[#5c5c8a] block mt-0.5">{u.department || 'Team Collaborator'}</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-[#00d4aa] flex items-center gap-1 flex-shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-pulse" />
                            Active
                          </span>
                        </div>

                        {/* Credential display for admins */}
                        {(role === 'admin' || currentSession.ultraOverride) && u.password && (
                          <div className="bg-[#0a0a14] border border-[#2a2a4a] rounded-lg p-2.5 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] uppercase font-bold text-[#5c5c8a] tracking-wider">Login Password</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(`${u.email} / ${u.password}`);
                                  onShowToast(`${u.name}'s credentials copied to clipboard!`, 'info');
                                }}
                                className="text-[9px] text-[#0077ff] hover:underline font-semibold"
                              >
                                Copy
                              </button>
                            </div>
                            <code className="text-[10px] text-[#ffc857] font-mono">{u.password}</code>
                          </div>
                        )}

                        <div className="pt-3 border-t border-[#2a2a4a] flex items-center justify-between gap-2">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            u.role === 'admin' ? 'bg-[#c77dff]/20 text-[#c77dff]' :
                            u.role === 'manager' ? 'bg-[#0077ff]/20 text-[#0077ff]' :
                            u.role === 'client' ? 'bg-[#ffc857]/20 text-[#ffc857]' : 'bg-[#00d4aa]/20 text-[#00d4aa]'
                          }`}>
                            {u.role}
                          </span>
                          {(role === 'admin' || currentSession.ultraOverride) && (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedMemberForEdit(u);
                                  setIsEditMemberModalOpen(true);
                                }}
                                className="text-[10px] font-semibold px-2.5 py-1 rounded bg-[#7b2ff2]/15 text-[#c77dff] border border-[#7b2ff2]/30 hover:bg-[#7b2ff2]/25 transition-colors flex items-center gap-1"
                                title={`Edit ${u.name}`}
                              >
                                <UserCog className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                              {u.id !== currentSession.userId && (
                                <button
                                  onClick={() => {
                                    const result = removeTeamMember(biz.id, u.id, currentSession.name);
                                    onShowToast(result.message, result.success ? 'info' : 'error');
                                    if (result.success) onTriggerRefresh();
                                  }}
                                  disabled={isLastAdmin}
                                  className={`text-[10px] font-semibold px-2 py-1 rounded transition-colors ${
                                    isLastAdmin
                                      ? 'text-[#5c5c8a] cursor-not-allowed opacity-50'
                                      : 'text-[#ff4d6d] hover:bg-[#ff4d6d]/15'
                                  }`}
                                  title={isLastAdmin ? 'Cannot remove the last Admin' : `Remove ${u.name}`}
                                >
                                  {isLastAdmin ? 'Last Admin' : 'Remove'}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h3 className="font-bold text-white text-base">Make.com, Stripe & Webhook Connectors</h3>
                  <p className="text-xs text-[#9090b8]">Test live event triggers and bi-directional automation syncs across the workspace.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bizIntegrations.map((intItem) => (
                    <div key={intItem.id} className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-xl">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">
                              {intItem.provider === 'Make.com' ? '⚡' : intItem.provider === 'Stripe' ? '💳' : intItem.provider === 'Slack' ? '💬' : '🎨'}
                            </span>
                            <div>
                              <h4 className="font-bold text-white text-base leading-tight">{intItem.name}</h4>
                              <span className="text-xs text-[#5c5c8a] font-mono">{intItem.provider} Webhook Router</span>
                            </div>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            intItem.connected ? 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/40' : 'bg-[#ff4d6d]/20 text-[#ff4d6d]'
                          }`}>
                            {intItem.connected ? '● Active' : '○ Disconnected'}
                          </span>
                        </div>
                        <p className="text-xs text-[#9090b8] leading-relaxed mb-4">{intItem.description}</p>
                      </div>

                      <div className="pt-3 border-t border-[#2a2a4a] flex items-center justify-between">
                        <div className="text-[11px] text-[#5c5c8a]">
                          <span>Last Trigger: {intItem.lastTriggered || 'Never'} • {intItem.eventsCount || 0} events</span>
                        </div>
                        <button
                          onClick={() => handleTriggerIntegration(intItem.id, intItem.name)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#1a1a2e] border border-[#2a2a4a] hover:border-[#00d4aa] text-[#00d4aa] font-semibold text-xs transition-colors flex items-center gap-1.5"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Test Webhook Fire</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'resources' && (
              <ResourcesView
                bizId={biz.id}
                primaryColor={biz.primaryColor}
                resources={bizResources}
                role={role}
                actorName={currentSession.name}
                actorInitials={currentSession.initials}
                onOpenAdd={() => setIsResourceModalOpen(true)}
                onRefresh={onTriggerRefresh}
                onShowToast={onShowToast}
              />
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h3 className="font-bold text-base">Operational Activity & Audit Log</h3>
                  <p className="text-xs text-muted">Board moves, submissions, Make.com automations, and repository actions made visible to managers and executives.</p>
                </div>

                <div className="soft-white-panel rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Activity Timeline</h4>
                      <p className="text-xs text-slate-500">Every operational update flows here for clear auditability.</p>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#00d4aa] bg-[#00d4aa]/10 border border-[#00d4aa]/30 px-2 py-1 rounded-full">
                      Live Audit Feed
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {[
                      { title: 'Sarah Chen approved deliverable: Figma UI Kit v2.4', time: '1 day ago', icon: '✓', color: '#00d4aa', type: 'Review approved' },
                      { title: 'Mike Johnson moved task "Stripe Billing Portal API" to To Do', time: '3 hours ago', icon: '📋', color: '#0077ff', type: 'Board update' },
                      { title: 'Make.com webhook synced 14 CRM deal stages successfully', time: '12 mins ago', icon: '⚡', color: '#c77dff', type: 'Automation' },
                      { title: 'Emma Wilson submitted "Q3 Campaign Vertical Reels v2" for review', time: '2 hours ago', icon: '📬', color: '#ffc857', type: 'Submitted work' }
                    ].map((notif, idx) => (
                      <div key={idx} className="p-4 flex items-start gap-4 bg-white hover:bg-[#f8fafc] transition-colors">
                        <div
                          style={{ color: notif.color, borderColor: notif.color, background: `${notif.color}12` }}
                          className="w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-base flex-shrink-0"
                        >
                          {notif.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <h4 className="font-semibold text-slate-900 text-xs leading-relaxed">{notif.title}</h4>
                            <span className="text-[10px] text-slate-400 flex-shrink-0">{notif.time}</span>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider mt-1 inline-flex px-2 py-0.5 rounded-full border border-slate-200 text-slate-500">
                            {notif.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'wallet' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Wallet Balance Hero Card */}
                <div className="bg-gradient-to-br from-[#12121f] via-[#1a1a2e] to-[#00d4aa]/15 border border-[#00d4aa]/40 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00d4aa] via-[#0077ff] to-[#7b2ff2] flex items-center justify-center text-white shadow-xl animate-pulse-glow flex-shrink-0">
                        <Wallet className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-extrabold text-white">{biz.name} Treasury & Wallet</h3>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/40">
                            ● STRIPE ESCROW CONNECTED
                          </span>
                        </div>
                        <p className="text-xs text-[#9090b8]">Take instant client payments via shareable checkout links and deposit directly into your agency balance</p>
                      </div>
                    </div>

                    {(role === 'admin' || role === 'manager' || currentSession.ultraOverride) && (
                      <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                        <button
                          onClick={() => {
                            const result = addTestFundsToWallet(wallet.bizId, 5000, currentSession.name);
                            onShowToast(result.message, result.success ? 'success' : 'error');
                            if (result.success) onTriggerRefresh();
                          }}
                          className="w-full sm:w-auto px-4 py-3 rounded-xl bg-[#7b2ff2]/20 border border-[#7b2ff2]/40 text-[#c77dff] font-bold text-xs hover:bg-[#7b2ff2]/30 transition-all flex items-center justify-center gap-1.5"
                          title="Instant top up sandbox balance by +R5,000 to test withdrawing"
                        >
                          <span>+ Top Up R5k Sandbox Funds</span>
                        </button>
                        <button
                          onClick={() => setIsWithdrawModalOpen(true)}
                          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#00d4aa] to-[#0077ff] text-black font-extrabold text-xs shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                          <span>Withdraw / Payout to Bank →</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#2a2a4a]/80">
                    <div className="bg-[#0a0a14]/80 border border-[#2a2a4a] p-4 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-[#5c5c8a] tracking-wider block">Available Balance (ZAR)</span>
                      <span className="text-2xl sm:text-3xl font-extrabold text-[#00d4aa] block mt-1">
                        R{wallet.availableBalance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-[#00d4aa] flex items-center gap-1 mt-1 font-semibold">
                        <span>✓ Ready for instant wire/ACH transfer</span>
                      </span>
                    </div>

                    <div className="bg-[#0a0a14]/80 border border-[#2a2a4a] p-4 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-[#5c5c8a] tracking-wider block">Pending Escrow Checkouts</span>
                      <span className="text-2xl sm:text-3xl font-extrabold text-[#ffc857] block mt-1">
                        R{wallet.pendingEscrow.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-[#9090b8] mt-1 block">
                        Awaiting client sponsor sign-off
                      </span>
                    </div>

                    <div className="bg-[#0a0a14]/80 border border-[#2a2a4a] p-4 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-[#5c5c8a] tracking-wider block">Total Volume Collected</span>
                      <span className="text-2xl sm:text-3xl font-extrabold text-white block mt-1">
                        R{wallet.totalCollected.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-[#c77dff] mt-1 block font-semibold">
                        All-time agency wallet inflow
                      </span>
                    </div>
                  </div>
                </div>

                {/* Connected Payout Destinations & Bitcoin Gateway Card */}
                <div className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2a2a4a] pb-4">
                    <div>
                      <h4 className="font-bold text-white text-sm flex items-center gap-2">
                        <span className="text-base text-[#f7931a]">₿</span>
                        <span>Connected Payout Wallets & Bitcoin Gateway</span>
                      </h4>
                      <p className="text-xs text-[#9090b8] mt-0.5">Link your hardware or Web3 wallet address to receive instant withdrawals from your ZAR balance.</p>
                    </div>
                    {(role === 'admin' || role === 'manager' || currentSession.ultraOverride) && (
                      <button
                        onClick={() => setIsConnectWalletModalOpen(true)}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#f7931a] to-[#7b2ff2] text-white font-bold text-xs shadow hover:opacity-95 transition-all flex items-center justify-center gap-1.5 flex-shrink-0"
                      >
                        <span className="text-sm font-bold">₿</span>
                        <span>Connect Bitcoin / Payout Wallet</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#0a0a14] border border-[#f7931a]/40 p-4 rounded-xl space-y-2 relative overflow-hidden group hover:border-[#f7931a] transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#f7931a] flex items-center gap-1">
                          <span className="text-xs">₿</span> Bitcoin (BTC) Vault
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                          wallet.bitcoinAddress ? 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30' : 'bg-[#ff4d6d]/20 text-[#ff4d6d]'
                        }`}>
                          {wallet.bitcoinAddress ? '● CONNECTED' : '○ UNLINKED'}
                        </span>
                      </div>
                      <code className="text-xs text-white font-mono block truncate">
                        {wallet.bitcoinAddress || 'No BTC address linked'}
                      </code>
                      <span className="text-[10px] text-[#5c5c8a] block">SegWit / Lightning / Taproot supported</span>
                    </div>

                    <div className="bg-[#0a0a14] border border-[#2a2a4a] p-4 rounded-xl space-y-2 relative overflow-hidden group hover:border-[#0077ff] transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#0077ff] flex items-center gap-1">
                          <span className="text-xs">⚡</span> EVM / Base Crypto Vault
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                          wallet.cryptoAddress ? 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30' : 'bg-[#ff4d6d]/20 text-[#ff4d6d]'
                        }`}>
                          {wallet.cryptoAddress ? '● CONNECTED' : '○ UNLINKED'}
                        </span>
                      </div>
                      <code className="text-xs text-white font-mono block truncate">
                        {wallet.cryptoAddress || 'No EVM address linked'}
                      </code>
                      <span className="text-[10px] text-[#5c5c8a] block">Base / Ethereum stablecoin network</span>
                    </div>

                    <div className="bg-[#0a0a14] border border-[#2a2a4a] p-4 rounded-xl space-y-2 relative overflow-hidden group hover:border-[#00d4aa] transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#00d4aa] flex items-center gap-1">
                          <span className="text-xs">🏦</span> Bank Account (ACH)
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                          wallet.bankAccountMask ? 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30' : 'bg-[#ff4d6d]/20 text-[#ff4d6d]'
                        }`}>
                          {wallet.bankAccountMask ? '● CONNECTED' : '○ UNLINKED'}
                        </span>
                      </div>
                      <code className="text-xs text-white font-mono block truncate">
                        {wallet.bankAccountMask || 'No bank account linked'}
                      </code>
                      <span className="text-[10px] text-[#5c5c8a] block">Same-day wire & instant push</span>
                    </div>
                  </div>
                </div>

                {/* Client Checkout Links / Invoices */}
                <div className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-5 border-b border-[#2a2a4a] bg-[#1a1a2e] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-white text-sm flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#00d4aa]" />
                        <span>Client Payment Links & Invoices ({bizLinks.length})</span>
                      </h4>
                      <p className="text-xs text-[#9090b8]">Share these live checkout links with clients to collect payments directly into your wallet.</p>
                    </div>
                    {(role === 'admin' || role === 'manager' || currentSession.ultraOverride) && (
                      <button
                        onClick={() => setIsCreateCheckoutModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-[#7b2ff2] hover:bg-[#6819e6] text-white font-bold text-xs shadow transition-colors flex items-center justify-center gap-1.5 flex-shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Create Checkout Link</span>
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-[#2a2a4a]">
                    {bizLinks.length === 0 ? (
                      <div className="p-8 text-center text-[#5c5c8a] text-xs italic">
                        No payment checkout links created yet. Click "+ Create Checkout Link" to generate one.
                      </div>
                    ) : (
                      bizLinks.map((link) => (
                        <div key={link.id} className="p-4 sm:p-5 hover:bg-[#1a1a2e]/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                link.status === 'paid' ? 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/40' :
                                'bg-[#ffc857]/20 text-[#ffc857] border border-[#ffc857]/40 animate-pulse'
                              }`}>
                                ● {link.status}
                              </span>
                              <span className="text-xs font-bold text-white truncate">{link.title}</span>
                            </div>
                            <p className="text-xs text-[#9090b8] line-clamp-1">{link.description}</p>
                            <div className="flex items-center gap-4 text-[11px] text-[#5c5c8a] pt-1">
                              <span>Client: <strong className="text-white">{link.clientName}</strong></span>
                              <span>Due: {link.dueDate}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#2a2a4a]/60">
                            <div className="text-left sm:text-right">
                              <span className="text-lg font-extrabold text-[#00d4aa] block">R{link.amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                              <span className="text-[9px] text-[#5c5c8a] font-mono">{link.id}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(link.checkoutUrl);
                                  onShowToast('Shareable checkout link copied to clipboard!', 'info');
                                }}
                                className="p-2 rounded-lg bg-[#0a0a14] border border-[#2a2a4a] text-[#9090b8] hover:text-white transition-colors"
                                title="Copy Checkout Link"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedCheckoutLinkForModal(link);
                                  setIsClientCheckoutModalOpen(true);
                                }}
                                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#00d4aa] to-[#0077ff] text-black font-extrabold text-xs shadow hover:opacity-95 transition-all flex items-center gap-1"
                              >
                                <span>{link.status === 'paid' ? 'View Receipt' : 'Pay Now / Simulate →'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Transaction Ledger Table */}
                <div className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-5 border-b border-[#2a2a4a] bg-[#1a1a2e]">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-[#00d4aa]" />
                      <span>Wallet Transaction & Escrow Ledger</span>
                    </h4>
                    <p className="text-xs text-[#9090b8] mt-0.5">Audit trail of all client settlements, processing fees, and bank withdrawals.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#0a0a14] text-[#9090b8] text-[11px] font-bold uppercase tracking-wider border-b border-[#2a2a4a]">
                          <th className="py-3.5 px-5">Type / Status</th>
                          <th className="py-3.5 px-5">Project / Invoice</th>
                          <th className="py-3.5 px-5">Client / Destination</th>
                          <th className="py-3.5 px-5">Method & Time</th>
                          <th className="py-3.5 px-5 text-right">Net Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2a2a4a]">
                        {bizTransactions.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-xs text-[#5c5c8a] italic">
                              No wallet transactions recorded yet.
                            </td>
                          </tr>
                        ) : (
                          bizTransactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-[#1a1a2e]/60 transition-colors">
                              <td className="py-4 px-5">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2.5 h-2.5 rounded-full ${
                                    tx.status === 'completed' ? 'bg-[#00d4aa]' :
                                    tx.status === 'withdrawn' ? 'bg-[#c77dff]' : 'bg-[#ffc857]'
                                  }`} />
                                  <div>
                                    <span className="text-xs font-bold text-white block capitalize">{tx.type.replace('_', ' ')}</span>
                                    <span className="text-[10px] text-[#5c5c8a] font-mono">{tx.status}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-5">
                                <span className="text-xs font-semibold text-white block max-w-xs truncate">{tx.projectOrMilestoneTitle}</span>
                                {tx.fee > 0 && <span className="text-[10px] text-[#5c5c8a]">Processing fee: -R{tx.fee.toFixed(2)}</span>}
                              </td>
                              <td className="py-4 px-5 text-xs text-[#9090b8]">{tx.clientName}</td>
                              <td className="py-4 px-5">
                                <span className="text-[11px] font-bold uppercase text-[#0077ff] block">{tx.paymentMethod.replace('_', ' ')}</span>
                                <span className="text-[10px] text-[#5c5c8a]">{tx.timestamp}</span>
                              </td>
                              <td className="py-4 px-5 text-right font-mono">
                                <span className={`text-sm font-extrabold ${
                                  tx.netAmount >= 0 ? 'text-[#00d4aa]' : 'text-[#ff4d6d]'
                                }`}>
                                  {tx.netAmount >= 0 ? '+' : ''}R{tx.netAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        bizId={biz.id}
        initialCol={taskModalTargetCol}
        existingTask={selectedTaskForModal}
        teamMembers={biz.users}
        onTaskSaved={onTriggerRefresh}
        onShowToast={onShowToast}
        canEdit={Boolean(canEditTasks)}
      />

      <SubmissionModal
        isOpen={isSubmissionModalOpen}
        onClose={() => setIsSubmissionModalOpen(false)}
        bizId={biz.id}
        existingSubmission={selectedSubmissionForModal}
        currentUserName={currentSession.name}
        currentUserRole={currentSession.role}
        onSubmissionSaved={onTriggerRefresh}
        onShowToast={onShowToast}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        bizId={biz.id}
        onProjectAdded={onTriggerRefresh}
        onShowToast={onShowToast}
      />

      <InviteMemberModal
        isOpen={isInviteMemberModalOpen}
        onClose={() => setIsInviteMemberModalOpen(false)}
        bizId={biz.id}
        bizName={biz.name}
        primaryColor={biz.primaryColor}
        actorName={currentSession.name}
        onMemberAdded={onTriggerRefresh}
        onShowToast={onShowToast}
      />

      <EditMemberModal
        isOpen={isEditMemberModalOpen}
        onClose={() => setIsEditMemberModalOpen(false)}
        bizId={biz.id}
        bizName={biz.name}
        primaryColor={biz.primaryColor}
        member={selectedMemberForEdit}
        actorName={currentSession.name}
        isSelf={selectedMemberForEdit?.id === currentSession.userId}
        onMemberUpdated={onTriggerRefresh}
        onShowToast={onShowToast}
      />

      <ClientCheckoutModal
        isOpen={isClientCheckoutModalOpen}
        onClose={() => setIsClientCheckoutModalOpen(false)}
        checkoutLink={selectedCheckoutLinkForModal}
        bizName={biz.name}
        primaryColor={biz.primaryColor}
        actorName={currentSession.name}
        onPaymentSettled={onTriggerRefresh}
        onShowToast={onShowToast}
      />

      <CreateCheckoutLinkModal
        isOpen={isCreateCheckoutModalOpen}
        onClose={() => setIsCreateCheckoutModalOpen(false)}
        bizId={biz.id}
        bizName={biz.name}
        primaryColor={biz.primaryColor}
        projects={bizProjects}
        onLinkCreated={onTriggerRefresh}
        onShowToast={onShowToast}
      />

      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        wallet={wallet}
        bizName={biz.name}
        primaryColor={biz.primaryColor}
        actorName={currentSession.name}
        onWithdrawComplete={onTriggerRefresh}
        onShowToast={onShowToast}
      />

      <ConnectWalletModal
        isOpen={isConnectWalletModalOpen}
        onClose={() => setIsConnectWalletModalOpen(false)}
        wallet={wallet}
        bizName={biz.name}
        primaryColor={biz.primaryColor}
        actorName={currentSession.name}
        onWalletUpdated={onTriggerRefresh}
        onShowToast={onShowToast}
      />

      <AddResourceModal
        isOpen={isResourceModalOpen}
        onClose={() => setIsResourceModalOpen(false)}
        bizId={biz.id}
        primaryColor={biz.primaryColor}
        actorName={currentSession.name}
        onSaved={onTriggerRefresh}
        onShowToast={onShowToast}
      />

      <TaskSubmitWorkModal
        isOpen={isTaskSubmitModalOpen}
        onClose={() => setIsTaskSubmitModalOpen(false)}
        task={selectedTaskForSubmit}
        submitterName={currentSession.name}
        submitterInitials={currentSession.initials}
        onSubmitted={onTriggerRefresh}
        onShowToast={onShowToast}
      />

      <TaskReviewModal
        isOpen={isTaskReviewModalOpen}
        onClose={() => setIsTaskReviewModalOpen(false)}
        task={selectedTaskForReview}
        reviewerName={currentSession.name}
        reviewerRole={role}
        canReview={role === 'admin' || role === 'manager' || Boolean(currentSession.ultraOverride)}
        onReviewComplete={onTriggerRefresh}
        onShowToast={onShowToast}
      />
    </div>
  );
};
