import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, Calendar, ShieldCheck, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Business, EventPlanTier } from '../../types';
import { createEventSubaccount, EVENT_TIER_FEES, formatZAR } from '../../services/store';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  businesses: Business[];
  actorName: string;
  onCreated: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const CreateEventSubaccountModal: React.FC<Props> = ({
  isOpen,
  onClose,
  businesses,
  actorName,
  onCreated,
  onShowToast,
}) => {
  const [selectedBizId, setSelectedBizId] = useState('');
  const [tier, setTier] = useState<EventPlanTier>('pro');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBizId) {
      onShowToast('Please select a workspace to activate the Events subaccount for', 'error');
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      const result = createEventSubaccount(selectedBizId, tier, actorName);
      setIsSaving(false);

      if (!result.success) {
        onShowToast(result.message, 'error');
        return;
      }

      confetti({
        particleCount: 130,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#ffc857', '#f7931a', '#7b2ff2', '#00d4aa']
      });

      onShowToast(`🎉 ${result.message}`, 'success');
      setSelectedBizId('');
      onCreated();
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a14]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        <div className="p-6 border-b border-[#2a2a4a] bg-gradient-to-r from-[#1a1a2e] to-[#12121f] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ffc857] via-[#f7931a] to-[#7b2ff2] flex items-center justify-center text-white shadow-lg text-lg">
              🎪
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#ffc857]">Ultra Admin • Provision Subaccount</span>
              <h3 className="text-lg font-bold text-white leading-tight">Activate Events Planner Subaccount</h3>
              <p className="text-xs text-[#9090b8]">Enable event management with ZAR ticketing, sponsor tracking & live execution</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#9090b8] hover:text-white transition-colors p-2 bg-[#12121f] rounded-lg border border-[#2a2a4a]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleActivate} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Workspace selector */}
          <div>
            <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2">
              Select Client Workspace *
            </label>
            <select
              required
              value={selectedBizId}
              onChange={(e) => setSelectedBizId(e.target.value)}
              className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#ffc857]"
            >
              <option value="">-- Select workspace to activate Events for --</option>
              {businesses.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.plan.toUpperCase()} • {b.users.length} users)
                </option>
              ))}
            </select>
          </div>

          {/* Tier selection */}
          <div>
            <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-3">
              Choose Events Subscription Tier (Billed Monthly in ZAR) *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(Object.keys(EVENT_TIER_FEES) as EventPlanTier[]).map(t => {
                const info = EVENT_TIER_FEES[t];
                const isSelected = tier === t;
                const tierColor = t === 'basic' ? '#0077ff' : t === 'pro' ? '#ffc857' : '#c77dff';
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTier(t)}
                    className={`p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden ${
                      isSelected
                        ? 'shadow-xl scale-[1.02]'
                        : 'border-[#2a2a4a] hover:border-[#5c5c8a] bg-[#0a0a14]'
                    }`}
                    style={{
                      background: isSelected ? `linear-gradient(135deg, ${tierColor}15, transparent)` : undefined,
                      borderColor: isSelected ? tierColor : undefined
                    }}
                  >
                    {t === 'pro' && (
                      <span className="absolute top-2 right-2 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#ffc857] text-black">
                        POPULAR
                      </span>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-4 h-4" style={{ color: tierColor }} />
                      <span className="text-xs font-extrabold text-white uppercase">{info.label}</span>
                    </div>
                    <div className="mb-3">
                      <span className="text-2xl font-extrabold" style={{ color: tierColor }}>
                        {formatZAR(info.monthlyZAR)}
                      </span>
                      <span className="text-[11px] text-[#9090b8] block">per month • billed monthly</span>
                    </div>
                    <div className="space-y-1">
                      {info.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[11px] text-[#e8e8f4]">
                          <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: tierColor }} />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fee summary */}
          <div className="bg-gradient-to-r from-[#ffc857]/15 to-[#f7931a]/15 border border-[#ffc857]/40 rounded-xl p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#ffc857] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-xs font-bold text-white mb-1">Subscription Fee Summary</h4>
              <div className="text-[11px] text-[#e8e8f4] space-y-0.5">
                <div className="flex justify-between">
                  <span>{EVENT_TIER_FEES[tier].label}</span>
                  <span className="font-extrabold text-[#ffc857]">{formatZAR(EVENT_TIER_FEES[tier].monthlyZAR)}/mo</span>
                </div>
                <div className="flex justify-between text-[#9090b8]">
                  <span>12-month commitment total</span>
                  <span>{formatZAR(EVENT_TIER_FEES[tier].monthlyZAR * 12)}</span>
                </div>
                <div className="flex justify-between border-t border-[#2a2a4a]/60 pt-1 mt-1">
                  <span className="text-white font-bold">Charged today</span>
                  <span className="font-extrabold text-[#00d4aa]">{formatZAR(EVENT_TIER_FEES[tier].monthlyZAR)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a2e] border border-[#2a2a4a] p-3.5 rounded-xl flex items-center gap-3 text-xs text-[#9090b8]">
            <ShieldCheck className="w-5 h-5 text-[#00d4aa] flex-shrink-0" />
            <span>Fees billed to the workspace's Stripe subscription. Cancel anytime with 30 days notice.</span>
          </div>

          <div className="pt-3 border-t border-[#2a2a4a] flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#2a2a4a] text-xs text-[#9090b8] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !selectedBizId}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#ffc857] via-[#f7931a] to-[#7b2ff2] text-white font-extrabold text-xs shadow-lg hover:opacity-95 transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSaving ? '⏳ Activating...' : <>
                <Calendar className="w-4 h-4" />
                <span>Activate Events Subaccount for {formatZAR(EVENT_TIER_FEES[tier].monthlyZAR)}/mo →</span>
              </>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
