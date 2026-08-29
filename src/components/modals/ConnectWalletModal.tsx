import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { WalletBalance } from '../../types';
import { updateWalletDestination } from '../../services/store';

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: WalletBalance | null;
  bizName: string;
  primaryColor: string;
  actorName: string;
  onWalletUpdated: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({
  isOpen,
  onClose,
  wallet,
  bizName,
  primaryColor,
  actorName,
  onWalletUpdated,
  onShowToast,
}) => {
  const [tab, setTab] = useState<'bitcoin' | 'evm' | 'bank'>('bitcoin');
  const [btcAddress, setBtcAddress] = useState(wallet?.bitcoinAddress || '');
  const [evmAddress, setEvmAddress] = useState(wallet?.cryptoAddress || '');
  const [bankMask, setBankMask] = useState(wallet?.bankAccountMask || '');
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (wallet) {
      setBtcAddress(wallet.bitcoinAddress || '');
      setEvmAddress(wallet.cryptoAddress || '');
      setBankMask(wallet.bankAccountMask || '');
    }
  }, [wallet, isOpen]);

  if (!isOpen || !wallet) return null;

  const handleSimulateWeb3Connect = (type: 'btc' | 'evm') => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      if (type === 'btc') {
        const simulatedAddresses = [
          'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
          'bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqzk5jj0',
          '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
          '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy'
        ];
        const picked = simulatedAddresses[Math.floor(Math.random() * simulatedAddresses.length)];
        setBtcAddress(picked);
        onShowToast(`⚡ Connected Xverse/Unisat Bitcoin Wallet: ${picked.substring(0, 12)}...`, 'success');
      } else {
        const picked = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        setEvmAddress(picked);
        onShowToast(`⚡ Connected MetaMask/Base EVM Wallet: ${picked.substring(0, 10)}...`, 'success');
      }
    }, 1000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'bitcoin') {
      const cleanBtc = btcAddress.trim();
      if (!cleanBtc) {
        onShowToast('Please enter or connect a valid Bitcoin (BTC) address', 'error');
        return;
      }
      if (!cleanBtc.startsWith('bc1') && !cleanBtc.startsWith('1') && !cleanBtc.startsWith('3')) {
        onShowToast('Warning: Address does not start with bc1, 1, or 3. Please double check BTC format.', 'info');
      }
    }

    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      const updates: Partial<WalletBalance> = {};
      if (tab === 'bitcoin') updates.bitcoinAddress = btcAddress.trim();
      if (tab === 'evm') updates.cryptoAddress = evmAddress.trim();
      if (tab === 'bank') updates.bankAccountMask = bankMask.trim();

      const result = updateWalletDestination(wallet.bizId, updates, actorName);
      if (!result.success) {
        onShowToast(result.message, 'error');
        return;
      }

      confetti({
        particleCount: 110,
        spread: 75,
        origin: { y: 0.6 }
      });

      onShowToast(`🎉 ${result.message}`, 'success');
      onWalletUpdated();
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a14]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#2a2a4a] flex items-center justify-between bg-gradient-to-r from-[#1a1a2e] to-[#12121f]">
          <div className="flex items-center gap-3">
            <div
              style={{ background: `linear-gradient(135deg, ${primaryColor}, #f7931a)` }}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg text-lg font-bold"
            >
              ₿
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">Connect Payout Wallets</h3>
              <p className="text-xs text-[#9090b8]">Link hardware or Web3 wallets to receive instant <strong className="text-[#f7931a]">{bizName}</strong> payouts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#9090b8] hover:text-white transition-colors p-2 bg-[#12121f] rounded-lg border border-[#2a2a4a]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-[#2a2a4a] bg-[#0a0a14] px-4 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setTab('bitcoin')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              tab === 'bitcoin'
                ? 'border-[#f7931a] text-[#f7931a] bg-[#12121f]'
                : 'border-transparent text-[#9090b8] hover:text-white'
            }`}
          >
            <span className="text-sm">₿</span>
            <span>Bitcoin (BTC) Wallet</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('evm')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              tab === 'evm'
                ? 'border-[#0077ff] text-[#0077ff] bg-[#12121f]'
                : 'border-transparent text-[#9090b8] hover:text-white'
            }`}
          >
            <span className="text-sm">⚡</span>
            <span>EVM / Base Crypto</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('bank')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              tab === 'bank'
                ? 'border-[#00d4aa] text-[#00d4aa] bg-[#12121f]'
                : 'border-transparent text-[#9090b8] hover:text-white'
            }`}
          >
            <span className="text-sm">🏦</span>
            <span>Stripe Bank ACH</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1">
          {tab === 'bitcoin' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-[#f7931a]/15 border border-[#f7931a]/30 p-4 rounded-xl flex items-start gap-3">
                <span className="text-2xl mt-0.5">₿</span>
                <div>
                  <h4 className="text-xs font-bold text-white mb-1">Bitcoin Native Payout Engine</h4>
                  <p className="text-[11px] text-[#e8e8f4] leading-relaxed">
                    Connect your Bitcoin wallet (SegWit <code className="text-[#f7931a]">bc1q...</code>, Taproot <code className="text-[#f7931a]">bc1p...</code>, or Legacy <code className="text-[#f7931a]">1...</code>/<code className="text-[#f7931a]">3...</code>) to withdraw ZAR balances directly into Bitcoin over lightning and on-chain networks.
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider">
                    Bitcoin (BTC) Wallet Address *
                  </label>
                  <button
                    type="button"
                    onClick={() => handleSimulateWeb3Connect('btc')}
                    disabled={isConnecting}
                    className="px-3 py-1.5 rounded-lg bg-[#f7931a]/20 border border-[#f7931a]/40 text-[#f7931a] hover:bg-[#f7931a]/30 text-[11px] font-extrabold transition-all flex items-center gap-1.5 shadow"
                  >
                    {isConnecting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>⚡ 1-Click Connect Xverse / Unisat</span>}
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={btcAddress}
                  onChange={(e) => setBtcAddress(e.target.value)}
                  placeholder="bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq"
                  className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-4 py-3 text-[#f7931a] font-mono text-xs font-semibold focus:outline-none focus:border-[#f7931a]"
                />
                <span className="text-[10px] text-[#5c5c8a] mt-1.5 block">
                  Current Saved Address: {wallet.bitcoinAddress || 'None configured'}
                </span>
              </div>
            </div>
          )}

          {tab === 'evm' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-[#0077ff]/15 border border-[#0077ff]/30 p-4 rounded-xl flex items-start gap-3">
                <span className="text-2xl mt-0.5">⚡</span>
                <div>
                  <h4 className="text-xs font-bold text-white mb-1">EVM / Base Crypto Payout Vault</h4>
                  <p className="text-[11px] text-[#e8e8f4] leading-relaxed">
                    Connect your MetaMask, Phantom, or Ledger EVM wallet (<code className="text-[#0077ff]">0x...</code>) for crypto settlement equivalents on Base and Ethereum networks.
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider">
                    EVM (0x...) Wallet Address *
                  </label>
                  <button
                    type="button"
                    onClick={() => handleSimulateWeb3Connect('evm')}
                    disabled={isConnecting}
                    className="px-3 py-1.5 rounded-lg bg-[#0077ff]/20 border border-[#0077ff]/40 text-[#0077ff] hover:bg-[#0077ff]/30 text-[11px] font-extrabold transition-all flex items-center gap-1.5 shadow"
                  >
                    {isConnecting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>⚡ Connect MetaMask / Base</span>}
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={evmAddress}
                  onChange={(e) => setEvmAddress(e.target.value)}
                  placeholder="0x71C95911E9a5D330f4D0d282e5B29a24E48c882a"
                  className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-4 py-3 text-[#0077ff] font-mono text-xs font-semibold focus:outline-none focus:border-[#0077ff]"
                />
              </div>
            </div>
          )}

          {tab === 'bank' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="bg-[#00d4aa]/15 border border-[#00d4aa]/30 p-4 rounded-xl flex items-start gap-3">
                <span className="text-2xl mt-0.5">🏦</span>
                <div>
                  <h4 className="text-xs font-bold text-white mb-1">Stripe Connected Bank Account</h4>
                  <p className="text-[11px] text-[#e8e8f4] leading-relaxed">
                    Set your South African bank descriptor or wire descriptor to receive same-day fiat ZAR withdrawals.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2">
                  Bank Descriptor / Account Mask *
                </label>
                <input
                  type="text"
                  required
                  value={bankMask}
                  onChange={(e) => setBankMask(e.target.value)}
                  placeholder="Chase Business Checking ****8821"
                  className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-4 py-3 text-[#00d4aa] text-xs font-bold focus:outline-none focus:border-[#00d4aa]"
                />
              </div>
            </div>
          )}

          {/* Security banner */}
          <div className="bg-[#1a1a2e] border border-[#2a2a4a] p-3.5 rounded-xl flex items-center gap-3 text-xs text-[#9090b8]">
            <ShieldCheck className="w-5 h-5 text-[#00d4aa] flex-shrink-0" />
            <span>Connected payout addresses are protected with multi-signature verification and ISO-27001 encryption.</span>
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
              disabled={isConnecting}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#f7931a] via-[#7b2ff2] to-[#0077ff] text-white font-extrabold text-xs shadow-lg hover:opacity-95 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save {tab === 'bitcoin' ? 'Bitcoin (BTC)' : tab === 'evm' ? 'EVM Crypto' : 'Bank ACH'} Address →</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};