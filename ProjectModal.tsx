import React, { useState } from 'react';
import { X, FolderPlus, DollarSign, Calendar, UserCheck } from 'lucide-react';
import { ProjectStatus } from '../../types';
import { addProject } from '../../services/store';
import { formatZAR } from '../../services/store';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  bizId: string;
  onProjectAdded: () => void;
  onShowToast: (msg: string, type: 'success' | 'info') => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  bizId,
  onProjectAdded,
  onShowToast,
}) => {
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('Active');
  const [budget, setBudget] = useState('18500');
  const [deadline, setDeadline] = useState('2026-05-30');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addProject({
      id: 'prj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      bizId,
      name: name.trim(),
      clientName: clientName.trim() || 'Internal Agency Goal',
      status,
      budget: Number(budget) || 12000,
      spent: 0,
      progress: 10,
      deadline,
      description,
      teamInitials: ['SC', 'MJ'],
      milestones: [
        { id: 'ms_' + Date.now() + '_1', title: 'Brand & UX Discovery Kickoff', date: new Date().toISOString().split('T')[0], status: 'in_progress', amount: Number(budget) * 0.3 },
        { id: 'ms_' + Date.now() + '_2', title: 'Make.com Webhook Integration & QA', date: deadline, status: 'pending', amount: Number(budget) * 0.7 }
      ]
    });

    onShowToast(`Launched project: "${name}" (${formatZAR(Number(budget))})`, 'success');
    onProjectAdded();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a14]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#2a2a4a] flex items-center justify-between bg-[#1a1a2e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7b2ff2] to-[#0077ff] flex items-center justify-center text-white shadow-lg">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">Launch New Campaign Project</h3>
              <p className="text-xs text-[#9090b8]">Track budget utilization, deadlines, and Make.com milestones</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#9090b8] hover:text-white transition-colors p-2 bg-[#12121f] rounded-lg border border-[#2a2a4a]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleCreate} className="p-6 overflow-y-auto space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2">
              Project / Campaign Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Q3 Mobile App Refresh & Make.com Billing Engine"
              className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#7b2ff2]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#c77dff]" /> Client Sponsor / Org
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Acme Global Media"
                className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#7b2ff2]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#7b2ff2]"
              >
                <option value="Active">🟢 Active Production</option>
                <option value="Planning">🟡 Planning & Briefing</option>
                <option value="In Review">🟣 Client Review</option>
                <option value="On Hold">⚪ On Hold</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#00d4aa]" /> Budget Allocated (ZAR)
              </label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="15000"
                className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#7b2ff2]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#0077ff]" /> Target Launch Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#7b2ff2]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2">
              Campaign Scope & Expected ROI
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline high-level deliverable goals, custom domain needs, and Make.com integrations..."
              className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#7b2ff2] leading-relaxed"
            />
          </div>

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
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7b2ff2] to-[#0077ff] text-white font-bold text-xs shadow-lg hover:opacity-95 transition-all"
            >
              Launch Project →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
