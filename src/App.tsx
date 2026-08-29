import React, { useState, useEffect } from 'react';
import { initStore, getSession, saveSession, clearSession, getBusinesses } from './services/store';
import { Session } from './types';
import { LoginScreen } from './components/auth/LoginScreen';
import { UltraAdminScreen } from './components/ultra/UltraAdminScreen';
import { WorkspaceScreen } from './components/workspace/WorkspaceScreen';
import { ToastContainer, ToastMessage } from './components/common/ToastContainer';
import { CreateBusinessModal } from './components/modals/CreateBusinessModal';

export const App: React.FC = () => {
  const [session, setSessionState] = useState<Session | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCreateBizModalOpen, setIsCreateBizModalOpen] = useState(false);

  useEffect(() => {
    initStore();
    const storedSession = getSession();
    if (storedSession) {
      setSessionState(storedSession);
    }
  }, []);

  const showToast = (title: string, type: 'success' | 'info' | 'error' | 'warning' = 'info', description?: string) => {
    const newToast: ToastMessage = {
      id: 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      title,
      description,
      type,
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLoginSuccess = (newSession: Session) => {
    setSessionState(newSession);
  };

  const handleSignOut = () => {
    clearSession();
    setSessionState(null);
    showToast('Signed out of Club Flow Engine', 'info');
  };

  const handleEnterWorkspaceFromUltra = (bizId: string, _bizName: string) => {
    if (!session || session.type !== 'ultra') return;
    const businesses = getBusinesses();
    const biz = businesses.find(b => b.id === bizId);
    if (!biz) return;

    const adminUser = biz.users.find(u => u.role === 'admin') || biz.users[0];

    const impersonatedSession: Session = {
      type: 'business',
      userId: adminUser ? adminUser.id : 'god_impersonate',
      name: adminUser ? adminUser.name : 'Simulated Admin',
      email: adminUser ? adminUser.email : 'admin@workspace.org',
      initials: adminUser ? adminUser.initials : '⚡',
      role: 'admin',
      bizId: biz.id,
      bizName: biz.name,
      ultraOverride: true
    };

    saveSession(impersonatedSession);
    setSessionState(impersonatedSession);
    showToast(`God Mode: Entered workspace "${biz.name}"`, 'success');
  };

  const handleExitUltraOverride = () => {
    const ultraSession: Session = {
      type: 'ultra',
      userId: 'ultra_god_1',
      name: 'Ultra Admin',
      email: 'ultra@elitewayclub.com',
      initials: '⚡',
      role: 'owner',
      bizId: null,
      bizName: 'Platform God Mode'
    };
    saveSession(ultraSession);
    setSessionState(ultraSession);
    showToast('Returned to Ultra Admin Platform Panel', 'info');
  };

  const handleTriggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#0a0a14] text-[#e8e8f4] selection:bg-[#7b2ff2]/30 selection:text-white">
      {/* Toast System */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Main Screen Router */}
      {!session ? (
        <LoginScreen onLoginSuccess={handleLoginSuccess} onShowToast={showToast} />
      ) : session.type === 'ultra' && !session.ultraOverride ? (
        <UltraAdminScreen
          currentSession={session}
          onSignOut={handleSignOut}
          onEnterWorkspace={handleEnterWorkspaceFromUltra}
          onOpenCreateBizModal={() => setIsCreateBizModalOpen(true)}
          onShowToast={showToast}
          refreshKey={refreshKey}
        />
      ) : (
        <WorkspaceScreen
          currentSession={session}
          onSignOut={handleSignOut}
          onExitUltraOverride={handleExitUltraOverride}
          onShowToast={showToast}
          refreshKey={refreshKey}
          onTriggerRefresh={handleTriggerRefresh}
        />
      )}

      {/* Global Modal for Ultra Admin Creating Businesses */}
      <CreateBusinessModal
        isOpen={isCreateBizModalOpen}
        onClose={() => setIsCreateBizModalOpen(false)}
        onBusinessCreated={() => {
          handleTriggerRefresh();
          showToast('New multi-tenant agency workspace added to Club Flow Engine!', 'success');
        }}
        onShowToast={showToast}
      />
    </div>
  );
};

export default App;
