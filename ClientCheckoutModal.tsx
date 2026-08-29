import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PaymentCheckoutLink, WalletTransaction } from '../../types';
import { processClientPayment } from '../../services/store';

interface ClientCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkoutLink: PaymentCheckoutLink | null;
  bizName: string;
  primaryColor: string;
  actorName: string;
  onPaymentSettled: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const ClientCheckoutModal: React.FC<ClientCheckoutModalProps> = ({
  isOpen,
  onClose,
  checkoutLink,
  bizName,
  primaryColor,
  actorName,
  onPaymentSettled,
  onShowToast,
}) => {
  const [method, setMethod] = useState<WalletTransaction['paymentMethod']>('stripe_card');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('882');
  const [cryptoNetwork, setCryptoNetwork] = useState('Ethereum / Base');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !checkoutLink) return null;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;

    setIsProcessing(true);
    setTimeout(() => {
      const result = processClientPayment(checkoutLink.id, method, actorName);
      setIsProcessing(false);

      if (!result.success) {
        onShowToast(result.message, 'error');
        return;
      }

      confetti({
        particleCount: 130,
        spread: 80,
        origin: { y: 0.6 }
      });

      onShowToast(`🎉 ${result.message}`, 'success');
      onPaymentSettled();
      onClose();
    }, 1200);
  };

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
              <div className="flex items-center gap-1.5">
                <h3 className="text-lg font-bold text-white leading-tight">Client Checkout Gateway</h3>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/40">
                  SECURE SSL
                </span>
              </div>
              <p className="text-xs text-[#9090b8]">Pay invoice directly into <strong className="text-white">{bizName}</strong> escrow wallet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#9090b8] hover:text-white transition-colors p-2 bg-[#12121f] rounded-lg border border-[#2a2a4a]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice summary */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          <div className="bg-[#0a0a14] border border-[#2a2a4a] p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#9090b8] uppercase tracking-wider">Invoice Summary</span>
              <span className="text-xs text-[#5c5c8a] font-mono">{checkoutLink.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm">{checkoutLink.title}</h4>
                <p className="text-xs text-[#9090b8]">{checkoutLink.description}</p>
                <span className="text-[10px] text-[#5c5c8a] mt-1 block">Billed to: {checkoutLink.clientName} ({checkoutLink.clientEmail})</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-[#00d4aa] block">R{checkoutLink.amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                <span className="text-[10px] text-[#5c5c8a] uppercase tracking-wider">ZAR Total</span>
              </div>
            </div>
          </div>

          {/* Payment method selector */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider">
              Select Payment Method
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setMethod('stripe_card')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  method === 'stripe_card'
                    ? 'bg-[#1a1a2e] border-[#0077ff] ring-1 ring-[#0077ff] shadow-md'
                    : 'bg-[#0a0a14] border-[#2a2a4a] hover:border-[#5c5c8a]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">💳</span>
                  <span className="font-bold text-white text-xs">Stripe Card</span>
                </div>
                <p className="text-[10px] text-[#9090b8]">Credit / Debit / ACH</p>
              </button>

              <button
                type="button"
                onClick={() => setMethod('apple_pay')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  method === 'apple_pay' || method === 'google_pay'
                    ? 'bg-[#1a1a2e] border-[#00d4aa] ring-1 ring-[#00d4aa] shadow-md'
                    : 'bg-[#0a0a14] border-[#2a2a4a] hover:border-[#5c5c8a]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">📱</span>
                  <span className="font-bold text-white text-xs">Apple/Google Pay</span>
                </div>
                <p className="text-[10px] text-[#9090b8]">1-Click Biometric</p>
              </button>

              <button
                type="button"
                onClick={() => setMethod('usdc_crypto')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  method === 'usdc_crypto'
                    ? 'bg-[#1a1a2e] border-[#c77dff] ring-1 ring-[#c77dff] shadow-md'
                    : 'bg-[#0a0a14] border-[#2a2a4a] hover:border-[#5c5c8a]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">⚡</span>
                  <span className="font-bold text-white text-xs">Crypto Equivalent</span>
                </div>
                <p className="text-[10px] text-[#9090b8]">Web3 MetaMask / Base</p>
              </button>
            </div>
          </div>

          {/* Conditional Method Form */}
          {method === 'stripe_card' && (
            <form onSubmit={handlePay} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2">
                  Card Number (Stripe Secure Element)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-[#0077ff]"
                  />
                  <Lock className="w-4 h-4 text-[#5c5c8a] absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2">
                    Expires (MM/YY)
                  </label>
                  <input
                    type="text"
                    required
                    value={cardExp}
                    onChange={(e) => setCardExp(e.target.value)}
                    className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-[#0077ff]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2">
                    CVC / Security Code
                  </label>
                  <input
                    type="text"
                    required
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-[#0077ff]"
                  />
                </div>
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
                  disabled={isProcessing}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00d4aa] to-[#0077ff] text-black font-extrabold text-sm shadow-lg hover:opacity-95 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>⏳ Settling Payment via Stripe...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Pay R{checkoutLink.amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })} Now →</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {(method === 'apple_pay' || method === 'google_pay') && (
            <div className="space-y-4 pt-1">
              <div className="bg-gradient-to-r from-[#00d4aa]/15 to-[#0077ff]/15 border border-[#00d4aa]/30 p-5 rounded-xl text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-white text-black font-bold flex items-center justify-center text-2xl mx-auto shadow">
                  📱
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Apple Pay & Google Pay Express</h4>
                  <p className="text-xs text-[#9090b8] mt-1">Instant biometric checkout verified via Stripe Wallet token.</p>
                </div>
                <button
                  type="button"
                  onClick={handlePay}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-xl bg-white text-black font-extrabold text-sm shadow-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <span>⏳ Biometric Verification...</span>
                  ) : (
                    <span>Pay R{checkoutLink.amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })} with Biometric Wallet →</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {method === 'usdc_crypto' && (
            <div className="space-y-4 pt-1">
              <div className="bg-[#1a1a2e] border border-[#c77dff]/40 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#c77dff]">Web3 Crypto Payment Gateway</span>
                  <select
                    value={cryptoNetwork}
                    onChange={(e) => setCryptoNetwork(e.target.value)}
                    className="bg-[#0a0a14] border border-[#2a2a4a] rounded-lg px-2 py-1 text-xs text-white"
                  >
                    <option>Ethereum / Base</option>
                    <option>Solana</option>
                    <option>Polygon</option>
                  </select>
                </div>
                <div className="bg-[#0a0a14] p-3 rounded-lg border border-[#2a2a4a] flex items-center justify-between">
                  <div className="overflow-hidden">
                    <span className="text-[10px] text-[#5c5c8a] uppercase block font-bold">Smart Contract Escrow Address</span>
                    <code className="text-xs text-[#00d4aa] font-mono truncate block">0x71C9...882a4d0E (Club Flow Vault)</code>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30">
                    VERIFIED
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handlePay}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#c77dff] to-[#7b2ff2] text-white font-extrabold text-sm shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <span>⏳ Awaiting On-Chain Settlement...</span>
                  ) : (
                    <span>Connect Web3 Wallet & Pay R{checkoutLink.amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })} equivalent →</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer SSL / Stripe guarantee */}
        <div className="p-4 border-t border-[#2a2a4a] bg-[#0a0a14] flex items-center justify-between text-xs text-[#5c5c8a]">
          <span className="flex items-center gap-1.5 text-[#9090b8]">
            <ShieldCheck className="w-4 h-4 text-[#00d4aa]" /> 256-bit Encrypted Wallet Gateway
          </span>
          <span>Stripe Connect Escrow</span>
        </div>
      </div>
    </div>
  );
};