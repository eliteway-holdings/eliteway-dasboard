import React, { useEffect, useMemo, useState } from 'react';
import { Check, Lock, Settings2, Upload, X } from 'lucide-react';
import { Business, BusinessFeature, PlanTier } from '../../types';
import {
  BUSINESS_FEATURE_CATALOG,
  EVENT_TIER_FEES,
  PLAN_ACCESS,
  formatZAR,
  updateBusinessPlanAccess
} from '../../services/store';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  business: Business | null;
  actorName: string;
  onSaved: () => void;
  onShowToast: (message: string, type: 'success' | 'info' | 'error') => void;
}

export const BusinessFunctionsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  business,
  actorName,
  onSaved,
  onShowToast
}) => {
  const [plan, setPlan] = useState<PlanTier>('starter');
  const [customAddOns, setCustomAddOns] = useState<BusinessFeature[]>([]);
  const [agreementRef, setAgreementRef] = useState('');
  const [whiteLabelEnabled, setWhiteLabelEnabled] = useState(false);
  const [whiteLabelName, setWhiteLabelName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#7b2ff2');
  const [secondaryColor, setSecondaryColor] = useState('#0077ff');

  useEffect(() => {
    if (business) {
      setPlan(business.plan);
      setCustomAddOns((business.customFeatureAddOns || []).filter(f => f !== 'events'));
      setAgreementRef(business.callAgreementRef || '');
      setWhiteLabelEnabled(Boolean(business.whiteLabelEnabled));
      setWhiteLabelName(business.whiteLabelName || business.name);
      setLogoUrl(business.logoUrl || '');
      setPrimaryColor(business.primaryColor);
      setSecondaryColor(business.secondaryColor);
    }
  }, [business, isOpen]);

  const baseFeatures = PLAN_ACCESS[plan]?.features || PLAN_ACCESS.starter.features;
  const customCost = customAddOns.reduce((sum, f) => sum + BUSINESS_FEATURE_CATALOG[f].monthlyZAR, 0);
  const total = PLAN_ACCESS[plan].monthlyZAR + customCost;
  const canWhiteLabel = PLAN_ACCESS[plan].whiteLabel;
  const selectedFeatures = useMemo(() => Array.from(new Set([...baseFeatures, ...customAddOns])), [baseFeatures, customAddOns]);

  if (!isOpen || !business) return null;

  const toggleAddOn = (feature: BusinessFeature) => {
    if (feature === 'events') {
      onShowToast('Events is its own separate plan. Activate it from Event Subaccounts.', 'info');
      return;
    }
    if (baseFeatures.includes(feature)) return;
    setCustomAddOns(customAddOns.includes(feature) ? customAddOns.filter(f => f !== feature) : [...customAddOns, feature]);
  };

  const save = () => {
    const result = updateBusinessPlanAccess(
      business.id,
      plan,
      customAddOns,
      agreementRef,
      actorName,
      whiteLabelEnabled,
      whiteLabelName,
      logoUrl,
      primaryColor,
      secondaryColor
    );
    onShowToast(result.message, result.success ? 'success' : 'error');
    if (result.success) {
      onSaved();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a14]/85 backdrop-blur-md">
      <div className="w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col rounded-2xl bg-[#12121f] border border-[#2a2a4a] shadow-2xl">
        <div className="p-5 border-b border-[#2a2a4a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ffc857] to-[#7b2ff2] flex items-center justify-center">
              <Settings2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">Paid Plan Access</h3>
              <p className="text-xs text-[#9090b8]">{business.name} • plan packages and call-approved add-ons in ZAR</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-[#9090b8] hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            {(Object.keys(PLAN_ACCESS) as PlanTier[]).map(planKey => {
              const item = PLAN_ACCESS[planKey];
              const selected = plan === planKey;
              return (
                <button
                  key={planKey}
                  onClick={() => setPlan(planKey)}
                  className={`p-4 rounded-xl border text-left transition-all ${selected ? 'bg-[#7b2ff2]/15 border-[#c77dff] ring-1 ring-[#c77dff]/50' : 'bg-[#0a0a14] border-[#2a2a4a] hover:border-[#5c5c8a]'}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-sm font-extrabold text-white">{item.label}</span>
                    {selected && <Check className="w-4 h-4 text-[#00d4aa]" />}
                  </div>
                  <span className="text-xl font-extrabold text-[#ffc857]">{formatZAR(item.monthlyZAR)}</span>
                  <span className="text-[10px] text-[#9090b8] block mb-2">/month • {item.maxSeats === 999 ? 'unlimited users' : `${item.maxSeats} users`}</span>
                  <p className="text-[11px] text-[#9090b8] leading-relaxed">{item.summary}</p>
                  {item.whiteLabel && <span className="mt-2 inline-flex text-[10px] font-bold px-2 py-0.5 rounded bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/30">White-label included</span>}
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-[#2a2a4a] bg-[#0a0a14] p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h4 className="text-sm font-bold text-white">Platform Functions</h4>
                <p className="text-xs text-[#9090b8]">Included functions come from the package. Extra functions require an agreed paid call.</p>
              </div>
              <strong className="text-[#00d4aa] text-sm">Total: {formatZAR(total)}/mo</strong>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {(Object.keys(BUSINESS_FEATURE_CATALOG) as BusinessFeature[]).map(feature => {
                const item = BUSINESS_FEATURE_CATALOG[feature];
                const inPlan = baseFeatures.includes(feature);
                const custom = customAddOns.includes(feature);
                const eventPlanOnly = feature === 'events';
                return (
                  <button
                    key={feature}
                    onClick={() => toggleAddOn(feature)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      inPlan ? 'bg-[#00d4aa]/10 border-[#00d4aa]/30' : custom ? 'bg-[#ffc857]/10 border-[#ffc857]/40' : eventPlanOnly ? 'bg-[#1a1a2e] border-[#ffc857]/30 opacity-80' : 'bg-[#12121f] border-[#2a2a4a] hover:border-[#5c5c8a]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white">{item.label}</span>
                      {inPlan ? <Check className="w-4 h-4 text-[#00d4aa]" /> : eventPlanOnly ? <Lock className="w-4 h-4 text-[#ffc857]" /> : custom ? <Check className="w-4 h-4 text-[#ffc857]" /> : <span className="w-4 h-4 rounded border border-[#5c5c8a]" />}
                    </div>
                    <p className="text-[10px] text-[#9090b8] mt-1">{item.description}</p>
                    <span className="text-[10px] font-extrabold text-[#ffc857] mt-2 block">
                      {inPlan ? 'Included in package' : eventPlanOnly ? `Separate Events Plan: from ${formatZAR(EVENT_TIER_FEES.basic.monthlyZAR)}/mo` : `Call-approved add-on: +${formatZAR(item.monthlyZAR)}/mo`}
                    </span>
                  </button>
                );
              })}
            </div>

            {customAddOns.length > 0 && (
              <div className="mt-4">
                <label className="text-xs uppercase tracking-wider font-bold text-[#9090b8] block mb-2">Paid call agreement reference *</label>
                <input
                  value={agreementRef}
                  onChange={e => setAgreementRef(e.target.value)}
                  placeholder="e.g. CALL-2026-014 / Signed custom access agreement"
                  className="w-full rounded-xl bg-[#12121f] border border-[#2a2a4a] px-4 py-3 text-white text-xs focus:outline-none focus:border-[#ffc857]"
                />
              </div>
            )}
          </div>

          <div className={`rounded-xl border p-4 ${canWhiteLabel ? 'bg-[#00d4aa]/10 border-[#00d4aa]/30' : 'bg-[#1a1a2e] border-[#2a2a4a] opacity-80'}`}>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h4 className="text-sm font-bold text-white">Institution white-label branding</h4>
                <p className="text-xs text-[#9090b8]">Available from the second plan upward. Starter remains basic.</p>
              </div>
              {!canWhiteLabel && <Lock className="w-5 h-5 text-[#ffc857]" />}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 text-xs font-bold text-white">
                <input disabled={!canWhiteLabel} type="checkbox" checked={whiteLabelEnabled && canWhiteLabel} onChange={e => setWhiteLabelEnabled(e.target.checked)} className="accent-[#00d4aa]" />
                Enable white-label experience
              </label>
              <input disabled={!canWhiteLabel} value={whiteLabelName} onChange={e => setWhiteLabelName(e.target.value)} placeholder="Institution platform name" className="rounded-xl bg-[#12121f] border border-[#2a2a4a] px-3 py-2.5 text-white text-xs disabled:opacity-50" />
              <div className="sm:col-span-2">
                <label className="text-xs uppercase tracking-wider font-bold text-[#9090b8] block mb-2">Logo URL / uploaded asset link</label>
                <div className="flex gap-2">
                  <input disabled={!canWhiteLabel} value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="Paste logo URL or uploaded asset link" className="flex-1 rounded-xl bg-[#12121f] border border-[#2a2a4a] px-3 py-2.5 text-white text-xs disabled:opacity-50" />
                  <button type="button" disabled={!canWhiteLabel} onClick={() => setLogoUrl('https://dummyimage.com/128x128/ffffff/111827.png&text=' + business.logo)} className="px-3 py-2 rounded-xl bg-[#7b2ff2]/20 border border-[#7b2ff2]/40 text-[#c77dff] text-xs font-bold disabled:opacity-50 flex items-center gap-1"><Upload className="w-3.5 h-3.5" />Demo Upload</button>
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider font-bold text-[#9090b8] block mb-2">Primary colour</label>
                <input disabled={!canWhiteLabel} type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-full h-10 rounded-xl bg-[#12121f] border border-[#2a2a4a] p-1 disabled:opacity-50" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider font-bold text-[#9090b8] block mb-2">Secondary colour</label>
                <input disabled={!canWhiteLabel} type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="w-full h-10 rounded-xl bg-[#12121f] border border-[#2a2a4a] p-1 disabled:opacity-50" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#2a2a4a] bg-[#1a1a2e] p-4">
            <div className="text-xs text-[#9090b8]">Active functions after save:</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedFeatures.map(f => <span key={f} className="px-2 py-1 rounded-full bg-[#7b2ff2]/15 border border-[#7b2ff2]/30 text-[#c77dff] text-[10px] font-bold">{BUSINESS_FEATURE_CATALOG[f].label}</span>)}
              <span className="px-2 py-1 rounded-full bg-[#ffc857]/15 border border-[#ffc857]/30 text-[#ffc857] text-[10px] font-bold">Events only via separate Events plan</span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[#2a2a4a] flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-[#2a2a4a] text-xs text-[#9090b8]">Cancel</button>
          <button onClick={save} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#ffc857] to-[#7b2ff2] text-white font-bold text-xs">
            Save Plan Access
          </button>
        </div>
      </div>
    </div>
  );
};