import React from 'react';
import { X, Lock, Coins, Sparkles, AlertCircle, Headphones, Play } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const UnlockEpisodeModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    modalEpisode,
    modalStory,
    coinBalance,
    unlockEpisodeWithCoins,
    openWallet
  } = useApp();

  const [isWatchingAd, setIsWatchingAd] = React.useState(false);
  const { unlockEpisodeWithAd } = useApp();

  if (activeModal !== 'unlock' || !modalEpisode || !modalStory) return null;

  const hasEnoughCoins = coinBalance >= modalEpisode.coinPrice;
  const balanceAfter = coinBalance - modalEpisode.coinPrice;

  const handleUnlockClick = () => {
    if (hasEnoughCoins) {
      unlockEpisodeWithCoins(modalEpisode, modalStory);
    } else {
      openWallet();
    }
  };

  const handleAdComplete = () => {
    setIsWatchingAd(false);
    unlockEpisodeWithAd(modalEpisode, modalStory);
  };

  if (isWatchingAd) {
    return (
      <RewardedAdModal 
        onComplete={handleAdComplete} 
        onCancel={() => setIsWatchingAd(false)} 
        storyTitle={modalStory.title}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-6">
        
        {/* Close Button */}
        <button
          onClick={closeModal}
          aria-label="Close unlock modal"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Lock Graphic Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-lg shadow-amber-500/10">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="font-display font-extrabold text-xl text-white">
            Unlock Premium Chapter
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Support the author and continue streaming this exclusive audio episode.
          </p>
        </div>

        {/* Episode Card Details */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
          <img
            src={modalStory.coverUrl}
            alt={modalStory.title}
            referrerPolicy="no-referrer"
            className="w-14 h-18 rounded-xl object-cover shrink-0 bg-slate-800"
          />
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-semibold text-amber-400">
              Episode {modalEpisode.episodeNumber}
            </span>
            <h4 className="text-sm font-bold text-white truncate">{modalEpisode.title}</h4>
            <p className="text-xs text-slate-400 truncate mt-0.5">{modalStory.title}</p>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span>{Math.ceil(modalEpisode.durationSeconds / 60)} min audio</span>
              <span aria-hidden="true">·</span>
              <span>Full Novel Text</span>
            </div>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Episode Unlock Cost:</span>
            <span className="font-bold text-amber-400 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5" />
              {modalEpisode.coinPrice} Coins
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Your Current Balance:</span>
            <span className="font-bold text-white flex items-center gap-1">
              {coinBalance} Coins
            </span>
          </div>
          {hasEnoughCoins && (
            <div className="flex items-center justify-between text-xs pt-2 border-t border-amber-500/20 text-slate-300">
              <span>Balance After Unlock:</span>
              <span className="font-bold text-emerald-400">{balanceAfter} Coins</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="space-y-2 pt-2">
          {hasEnoughCoins ? (
            <button
              onClick={handleUnlockClick}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all"
            >
              <Headphones className="w-4 h-4 fill-slate-950" />
              <span>Unlock & Stream Now ({modalEpisode.coinPrice} Coins)</span>
            </button>
          ) : (
            <button
              onClick={handleUnlockClick}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-98 transition-all"
            >
              <Coins className="w-4 h-4 fill-slate-950" />
              <span>Need {modalEpisode.coinPrice - coinBalance} More Coins — Recharge</span>
            </button>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
              <span className="bg-slate-900 px-3 text-slate-500">Or Unlock for Free</span>
            </div>
          </div>

          <button
            onClick={() => setIsWatchingAd(true)}
            className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 border border-slate-700 active:scale-98 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Watch Short Ad to Unlock Episode</span>
          </button>

          <button
            onClick={closeModal}
            className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

interface RewardedAdModalProps {
  onComplete: () => void;
  onCancel: () => void;
  storyTitle: string;
}

const RewardedAdModal: React.FC<RewardedAdModalProps> = ({ onComplete, onCancel, storyTitle }) => {
  const [timeLeft, setTimeLeft] = React.useState(15);
  const [isRewardGranted, setIsRewardGranted] = React.useState(false);

  React.useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsRewardGranted(true);
    }
  }, [timeLeft]);

  if (isRewardGranted) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-in zoom-in-95 duration-300">
        <div className="w-full max-w-sm bg-slate-900 border border-emerald-500/30 rounded-3xl p-8 text-center space-y-6 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mx-auto">
            <Sparkles className="w-10 h-10 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Reward Granted!</h3>
            <p className="text-sm text-slate-400 font-medium">Thank you for watching. Your episode is now unlocked.</p>
          </div>
          <button
            onClick={onComplete}
            className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            Start Listening
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl aspect-video bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-white/5">
        {/* Ad Content Simulation */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div className="w-24 h-24 rounded-3xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 mb-2">
            <Headphones className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">SGFM Premium Ads</h2>
          <p className="text-slate-500 max-w-md text-sm">Experience the most immersive audio novels in the world. Upgrade to Pro for ad-free listening and exclusive early access.</p>
          
          <div className="pt-8 flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`h-1.5 w-12 rounded-full transition-all duration-500 ${i <= (15 - timeLeft) / 3 ? 'bg-orange-500' : 'bg-white/10'}`} />
              ))}
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sponsored Content · AI Optimized</p>
          </div>
        </div>

        {/* Ad Overlays */}
        <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">Ad playing for: {storyTitle}</span>
        </div>

        <div className="absolute top-6 right-6">
          <div className="bg-orange-500 text-slate-950 px-4 py-2 rounded-2xl font-black text-xs shadow-lg">
            {timeLeft}s remaining
          </div>
        </div>

        <button
          onClick={onCancel}
          className="absolute bottom-6 left-6 text-[10px] font-black text-white/30 uppercase tracking-widest hover:text-white transition-colors"
        >
          Cancel Ad (No Reward)
        </button>

        <div className="absolute bottom-0 left-0 h-1.5 bg-orange-500 transition-all duration-1000" style={{ width: `${((15 - timeLeft) / 15) * 100}%` }} />
      </div>
    </div>
  );
};

