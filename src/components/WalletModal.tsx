import React, { useState } from 'react';
import { X, Coins, Sparkles, Check, ArrowUpRight, ArrowDownLeft, ShieldCheck, Zap, Gift, Flame, Clock } from 'lucide-react';
import { COIN_PACKS } from '../data/initialStories';
import { useApp } from '../context/AppContext';

interface WalletModalProps {
  embedded?: boolean;
}

export const WalletModal: React.FC<WalletModalProps> = ({ embedded = false }) => {
  const {
    activeModal,
    closeModal,
    coinBalance,
    transactions,
    rechargeCoins,
    dailyRewardInfo,
    claimDailyReward
  } = useApp();

  const [activeTab, setActiveTab] = useState<'store' | 'history'>('store');
  const [selectedPackId, setSelectedPackId] = useState<string>(COIN_PACKS[1].id);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!embedded && activeModal !== 'wallet') return null;

  const selectedPack = COIN_PACKS.find(p => p.id === selectedPackId) || COIN_PACKS[1];

  const handlePayNow = () => {
    setIsProcessing(true);
    setTimeout(() => {
      rechargeCoins(selectedPack.coins, selectedPack.bonusCoins, selectedPack.priceInr);
      setIsProcessing(false);
    }, 800);
  };

  const content = (
    <div className={`relative w-full flex flex-col ${embedded ? 'min-h-full' : 'max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh]'}`}>
      {/* Header */}
      {!embedded && (
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-orange-950/20 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500">
              <Coins className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg text-white">SGFM Store</h3>
              <p className="text-xs text-slate-400">Unlock premium audio & support stars</p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {embedded && (
        <div className="pt-2 pb-6">
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">SGFM Store</h2>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Refill your coin balance</p>
        </div>
      )}

      {/* Current Balance Banner */}
      <div className={`px-6 py-5 bg-slate-950 flex items-center justify-between border border-white/5 ${embedded ? 'rounded-3xl mb-6' : 'border-x-0'}`}>
        <div>
          <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Available Balance</span>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-6 h-6 rounded-lg bg-orange-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-[0_0_10px_#f97316]">
              <Coins className="w-4 h-4 text-slate-950" />
            </div>
            <span className="font-display font-black text-3xl text-white tabular-nums">
              {coinBalance}
            </span>
            <span className="text-[10px] text-orange-400 font-black uppercase tracking-widest">Coins</span>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-widest">
          <button
            onClick={() => setActiveTab('store')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'store' ? 'bg-orange-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'history' ? 'bg-orange-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white'
            }`}
          >
            Log
          </button>
        </div>
      </div>

      {/* Body */}
      <div className={`overflow-y-auto flex-1 space-y-6 ${embedded ? 'pb-20' : 'p-6'}`}>
        {activeTab === 'store' ? (
          <>
            {/* Daily Login Reward Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-orange-500/20 via-slate-900 to-slate-900 border border-orange-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/20">
                  <Gift className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-black text-white uppercase tracking-tight">Daily Streak Reward</h4>
                    <span className="flex items-center gap-1 text-[9px] font-black text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20 uppercase">
                      <Flame className="w-3 h-3" />
                      {dailyRewardInfo.streakDays} Days
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-bold mt-0.5">
                    +{dailyRewardInfo.rewardCoins} Free Coins ready to collect
                  </p>
                </div>
              </div>

              {dailyRewardInfo.canClaim ? (
                <button
                  type="button"
                  onClick={() => claimDailyReward()}
                  className="px-6 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 transition-all active:scale-95"
                >
                  Collect Now
                </button>
              ) : (
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-2xl border border-emerald-500/20">
                  <Check className="w-4 h-4" />
                  <span>Collected · {dailyRewardInfo.hoursUntilNext}H Left</span>
                </div>
              )}
            </div>

            {/* Coin Packs Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                <span>Select Recharge Pack</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {COIN_PACKS.map(pack => {
                  const isSelected = selectedPackId === pack.id;
                  const totalCoins = pack.coins + pack.bonusCoins;

                  return (
                    <div
                      key={pack.id}
                      onClick={() => setSelectedPackId(pack.id)}
                      className={`relative p-5 rounded-3xl cursor-pointer border-2 transition-all flex flex-col justify-between group ${
                        isSelected
                          ? 'bg-orange-500/10 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.15)]'
                          : 'bg-slate-900 border-white/5 hover:border-white/20'
                      }`}
                    >
                      {pack.tag && (
                        <span className={`absolute -top-3 right-4 px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg ${
                          pack.popular
                            ? 'bg-orange-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400 border border-white/5'
                        }`}>
                          {pack.tag}
                        </span>
                      )}

                      <div>
                        <div className="flex items-center gap-3">
                          <Coins className={`w-6 h-6 ${isSelected ? 'text-orange-400' : 'text-slate-600'}`} />
                          <span className="font-display font-black text-2xl text-white tabular-nums">
                            {totalCoins}
                          </span>
                        </div>

                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">
                          {pack.bonusCoins > 0 ? (
                            <span>
                              {pack.coins} + <span className="text-orange-400">{pack.bonusCoins} Bonus</span>
                            </span>
                          ) : (
                            <span>Standard Credits</span>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-xl font-black text-white">
                          ₹{pack.priceInr}
                        </span>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          isSelected ? 'bg-orange-500 text-slate-950 scale-110 shadow-lg shadow-orange-500/20' : 'border-2 border-white/5'
                        }`}>
                          {isSelected && <Check className="w-4 h-4 stroke-[4]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sticky Action Footer Simulation */}
            <div className={`mt-6 pt-4 border-t border-white/5 flex items-center justify-between gap-4 ${embedded ? 'pb-10' : ''}`}>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Payable Amount</span>
                <div className="font-display font-black text-3xl text-white mt-1">
                  ₹{selectedPack.priceInr}
                </div>
              </div>

              <button
                onClick={handlePayNow}
                disabled={isProcessing}
                className="flex-1 max-w-[240px] h-14 rounded-2xl bg-white hover:bg-orange-500 hover:text-slate-950 text-slate-950 font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 group"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-4 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap className="w-5 h-5 group-hover:fill-current" />
                    <span>Recharge Now</span>
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          /* Transaction History */
          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Transaction History</span>
            {transactions.length === 0 ? (
              <div className="py-20 text-center rounded-3xl bg-slate-900 border border-white/5">
                <Clock className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <p className="text-sm font-bold text-slate-500">No activity recorded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map(tx => (
                  <div
                    key={tx.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.type === 'credit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {tx.type === 'credit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white leading-tight">{tx.description}</h4>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 block">{tx.timestamp}</span>
                      </div>
                    </div>
                    <span className={`text-base font-black tabular-nums ${tx.type === 'credit' ? 'text-emerald-500' : 'text-slate-300'}`}>
                      {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (embedded) return content;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
      {content}
    </div>
  );
};

