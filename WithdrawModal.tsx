import React, { useState } from 'react';
import { X, DollarSign, Building2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { WalletBalance } from '../../types';
import { withdrawWalletBalance, addTestFundsToWallet } from '../../services/store';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: WalletBalance | null;
  bizName: string;
  primaryColor: string;
  actorName: string;
  onWithdrawComplete: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  wallet,
  bizName,
  primaryColor,
  actorName,
  onWithdrawComplete,
  onShowToast,
}) => {
  const [amount, setAmount] = useState(wallet ? String(wallet.availableBalance || 1000) : '1000');
  const [destination, setDestination] = useState(wallet?.bitcoinAddress || wallet?.bankAccountMask || 'Chase Checking ****8821');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !wallet) return null;

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      onShowToast('Please enter a valid withdrawal amount greater than R0', 'error');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const result = withdrawWalletBalance(wallet.bizId, numAmount, destination, actorName);
      setIsProcessing(false);

      if (!result.success) {
        onShowToast(result.message, 'error');
        return;
      }

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      onShowToast(`🎉 ${result.message}`, 'success');
      onWithdrawComplete();
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a14]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#2a2a4a] flex items-center justify-between bg-gradient-to-r from-[#1a1a2e] to-[#12121f]">
          <div className="flex items-center gap-3">
            <div
              style={{ background: `linear-gradient(135deg, ${primaryColor}, #00d4aa)` }}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
            >
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">Withdraw Wallet Balance</h3>
              <p className="text-xs text-[#9090b8]">Instant payout from <strong className="text-[#00d4aa]">{bizName}</strong> wallet</p>
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
        <form onSubmit={handleWithdraw} className="p-6 space-y-5">
          {/* Available balance preview box */}
          <div className="bg-[#0a0a14] border border-[#2a2a4a] p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#5c5c8a] tracking-wider block">Available Balance</span>
                <span className="text-2xl font-extrabold text-[#00d4aa] block mt-0.5">R{wallet.availableBalance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const result = addTestFundsToWallet(wallet.bizId, 5000, actorName);
                    onShowToast(result.message, result.success ? 'success' : 'error');
                    setAmount(String((wallet.availableBalance || 0) + 5000));
                    onWithdrawComplete();
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-[#7b2ff2]/20 border border-[#7b2ff2]/40 text-[#c77dff] text-[11px] font-bold hover:bg-[#7b2ff2]/30 transition-colors"
                  title="Add R5,000 sandbox funds to test withdrawals instantly"
                >
                  + Add R5k Sandbox Funds
                </button>
                <button
                  type="button"
                  onClick={() => setAmount(String(wallet.availableBalance || 1000))}
                  className="px-3 py-1.5 rounded-lg bg-[#00d4aa]/15 border border-[#00d4aa]/30 text-[#00d4aa] text-xs font-bold hover:bg-[#00d4aa]/25 transition-colors"
                >
                  Withdraw Max
                </button>
              </div>
            </div>
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-[#00d4aa]" /> Withdrawal Amount (ZAR) *
            </label>
            <input
              type="number"
              required
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1000.00"
              className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-4 py-3 text-white text-base font-bold focus:outline-none focus:border-[#00d4aa]"
            />
          </div>

          {/* Destination dropdown */}
          <div>
            <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#0077ff]" /> Payout Destination *
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-3 py-3 text-white text-xs font-semibold focus:outline-none focus:border-[#f7931a]"
            >
              {wallet.bitcoinAddress && (
                <option value={wallet.bitcoinAddress}>₿ Bitcoin (BTC) Wallet: {wallet.bitcoinAddress} (SegWit / Lightning)</option>
              )}
              {wallet.bankAccountMask && (
                <option value={wallet.bankAccountMask}>🏦 Bank Account: {wallet.bankAccountMask} (Instant ACH)</option>
              )}
              {wallet.cryptoAddress && (
                <option value={wallet.cryptoAddress}>⚡ EVM Crypto Vault: {wallet.cryptoAddress} (Base crypto payout)</option>
              )}
              <option value="bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq">₿ Bitcoin (BTC) Hardware Vault: bc1qar0...mdq</option>
              <option value="Stripe Debit Card ****4412">💳 Stripe Express Debit Card ****4412 (Instant Push)</option>
              <option value="Chase Business Checking ****9910">🏦 Chase Business Checking ****9910 (Same-Day Wire)</option>
            </select>
          </div>

          {/* Live Bitcoin Payout Calculator */}
          {(destination.includes('bc1') || destination.includes('1') || destination.includes('3') || destination.includes('BTC') || destination.includes('Bitcoin')) && (
            <div className="bg-gradient-to-r from-[#f7931a]/15 via-[#f7931a]/10 to-transparent border border-[#f7931a]/40 p-4 rounded-xl space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#f7931a] flex items-center gap-1.5">
                  <span className="text-sm">₿</span> Live Bitcoin Mempool Rate
                </span>
                <span className="text-[10px] bg-[#f7931a]/20 text-[#f7931a] px-2 py-0.5 rounded font-mono font-bold">1 BTC ≈ R1 720 000</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[#e8e8f4]">Estimated Payout Deposit:</span>
                <span className="text-lg font-extrabold text-[#f7931a] font-mono">
                  {(Number(amount || 0) / 91450).toFixed(6)} BTC
                </span>
              </div>
            </div>
          )}

          {/* Security note */}
          <div className="bg-[#1a1a2e] border border-[#2a2a4a] p-3.5 rounded-xl flex items-center gap-3 text-xs text-[#9090b8]">
            <ShieldCheck className="w-5 h-5 text-[#00d4aa] flex-shrink-0" />
            <span>Transfers to verified bank accounts and crypto wallets settle instantly via Stripe Connect & Base network.</span>
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
              disabled={isProcessing || Number(amount) <= 0}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00d4aa] to-[#0077ff] text-black font-extrabold text-xs shadow-lg hover:opacity-95 transition-all flex items-center gap-1.5 disabled:opacity-40"
            >
              {isProcessing ? (
                <span>⏳ Initiating Transfer...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Payout of R{Number(amount || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })} →</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};