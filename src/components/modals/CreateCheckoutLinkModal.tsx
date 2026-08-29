import React, { useState } from 'react';
import { X, CreditCard, DollarSign, ExternalLink, Mail, Calendar, FolderCheck } from 'lucide-react';
import { PaymentCheckoutLink, Project } from '../../types';
import { addCheckoutLink } from '../../services/store';

interface CreateCheckoutLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  bizId: string;
  bizName: string;
  primaryColor: string;
  projects: Project[];
  onLinkCreated: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const CreateCheckoutLinkModal: React.FC<CreateCheckoutLinkModalProps> = ({
  isOpen,
  onClose,
  bizId,
  bizName,
  primaryColor,
  projects,
  onLinkCreated,
  onShowToast,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('5500');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedMilestoneId, setSelectedMilestoneId] = useState('');
  const [createdLink, setCreatedLink] = useState<PaymentCheckoutLink | null>(null);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0) {
      onShowToast('Please provide a valid invoice title and amount', 'error');
      return;
    }

    const newId = 'chk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5);
    const link: PaymentCheckoutLink = {
      id: newId,
      bizId,
      title: title.trim(),
      description: description.trim() || `Client checkout invoice for ${bizName}`,
      amount: Number(amount),
      clientName: clientName.trim() || 'Acme Global Sponsor',
      clientEmail: clientEmail.trim() || 'billing@client.org',
      status: 'unpaid',
      dueDate,
      checkoutUrl: `https://pay.elitewayclub.com/checkouts/${newId}`,
      linkedProjectId: selectedProjectId || undefined,
      linkedMilestoneId: selectedMilestoneId || undefined,
      createdAt: new Date().toISOString().split('T')[0]
    };

    addCheckoutLink(link);
    setCreatedLink(link);
    onShowToast(`🎉 Created checkout link: "R${Number(amount).toLocaleString('en-ZA')}"`, 'success');
    onLinkCreated();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setAmount('5500');
    setClientName('');
    setClientEmail('');
    setSelectedProjectId('');
    setSelectedMilestoneId('');
    setCreatedLink(null);
    onClose();
  };

  const currentProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a14]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#2a2a4a] flex items-center justify-between bg-gradient-to-r from-[#1a1a2e] to-[#12121f]">
          <div className="flex items-center gap-3">
            <div
              style={{ background: `linear-gradient(135deg, ${primaryColor}, #0077ff)` }}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
            >
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">Create Client Payment Link</h3>
              <p className="text-xs text-[#9090b8]">Generate invoice checkout for <span className="text-[#c77dff] font-semibold">{bizName}</span></p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-[#9090b8] hover:text-white transition-colors p-2 bg-[#12121f] rounded-lg border border-[#2a2a4a]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!createdLink ? (
          <form onSubmit={handleCreate} className="p-6 overflow-y-auto space-y-4 flex-1">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2">
                Invoice / Milestone Deliverable Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Brand & UX Discovery Kickoff — Milestone #1"
                className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#7b2ff2]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-[#00d4aa]" /> Invoice Amount (ZAR) *
                </label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="5500"
                  className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-3 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-[#00d4aa]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#0077ff]" /> Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#7b2ff2]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2">
                  Client Sponsor Name
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="David Miller (Acme Global)"
                  className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#7b2ff2]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#c77dff]" /> Client Email Address
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="billing@client.org"
                  className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-3 py-2.5 text-white text-xs font-mono focus:outline-none focus:border-[#7b2ff2]"
                />
              </div>
            </div>

            {/* Link to project milestone */}
            {projects.length > 0 && (
              <div className="bg-[#0a0a14] border border-[#2a2a4a] p-3.5 rounded-xl space-y-3">
                <label className="block text-[11px] font-bold text-[#c77dff] uppercase tracking-wider flex items-center gap-1.5">
                  <FolderCheck className="w-3.5 h-3.5" /> Optional: Attach to Campaign Milestone
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <select
                    value={selectedProjectId}
                    onChange={(e) => {
                      setSelectedProjectId(e.target.value);
                      setSelectedMilestoneId('');
                    }}
                    className="w-full bg-[#12121f] border border-[#2a2a4a] rounded-lg px-2.5 py-2 text-xs text-white"
                  >
                    <option value="">-- Select Project --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>

                  <select
                    disabled={!selectedProjectId}
                    value={selectedMilestoneId}
                    onChange={(e) => {
                      setSelectedMilestoneId(e.target.value);
                      const ms = currentProject?.milestones.find(m => m.id === e.target.value);
                      if (ms) {
                        setTitle(`${ms.title} (${currentProject?.name})`);
                        if (ms.amount) setAmount(String(ms.amount));
                      }
                    }}
                    className="w-full bg-[#12121f] border border-[#2a2a4a] rounded-lg px-2.5 py-2 text-xs text-white disabled:opacity-50"
                  >
                    <option value="">-- Select Milestone --</option>
                    {currentProject?.milestones.map(ms => (
                      <option key={ms.id} value={ms.id}>{ms.title} (R{ms.amount?.toLocaleString('en-ZA')})</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2">
                Scope Summary & Payment Instructions
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Include deliverable links, SLA notes, or wire transfer instructions..."
                className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#7b2ff2]"
              />
            </div>

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
                <CreditCard className="w-3.5 h-3.5" />
                <span>Generate Checkout Link →</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            <div className="text-center py-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00d4aa] to-[#0077ff] flex items-center justify-center text-white mx-auto mb-3 shadow-lg">
                <CreditCard className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Checkout Link Created!</h3>
              <p className="text-xs text-[#9090b8]">Share this link directly with {createdLink.clientName}</p>
            </div>

            <div className="bg-[#0a0a14] border border-[#2a2a4a] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white truncate max-w-[240px]">{createdLink.title}</span>
                <span className="text-sm font-extrabold text-[#00d4aa]">R{createdLink.amount.toLocaleString('en-ZA')}</span>
              </div>

              <div className="bg-[#12121f] border border-[#2a2a4a] rounded-lg p-3 flex items-center justify-between gap-2">
                <code className="text-xs text-[#0077ff] font-mono truncate">{createdLink.checkoutUrl}</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(createdLink.checkoutUrl);
                    onShowToast('Checkout link URL copied to clipboard!', 'info');
                  }}
                  className="px-3 py-1.5 rounded bg-[#7b2ff2]/20 text-[#c77dff] border border-[#7b2ff2]/40 text-[11px] font-bold flex items-center gap-1 flex-shrink-0 hover:bg-[#7b2ff2]/30"
                >
                  <span>Copy Link</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
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