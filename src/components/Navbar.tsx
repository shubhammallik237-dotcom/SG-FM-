import React from 'react';
import { Headphones, PenTool, Coins, Bookmark, Search, LayoutDashboard, WifiOff, Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavbarProps {
  activeTab: 'home' | 'write' | 'discover' | 'library' | 'store' | 'contests';
  setActiveTab: (tab: 'home' | 'write' | 'discover' | 'library' | 'store' | 'contests') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery
}) => {
  const {
    user,
    isLoggedIn,
    coinBalance,
    toggleUserMode,
    openWallet,
    openAuth,
    isOfflineMode
  } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 text-left group focus-visible:outline-none rounded-lg py-1 px-1"
          >
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-slate-950 shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Headphones className="w-5 h-5 fill-slate-950" />
            </div>
            <span className="font-display font-black text-2xl tracking-tighter text-white group-hover:text-orange-500 transition-colors">
              SGFM
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3.5 py-1.5 text-sm font-black uppercase tracking-widest rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'home' ? 'text-orange-500' : 'text-slate-500 hover:text-white'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`px-3.5 py-1.5 text-sm font-black uppercase tracking-widest rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'discover' ? 'text-orange-500' : 'text-slate-500 hover:text-white'
              }`}
            >
              Discover
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`px-3.5 py-1.5 text-sm font-black uppercase tracking-widest rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'library' ? 'text-orange-500' : 'text-slate-500 hover:text-white'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Library</span>
            </button>
            <button
              onClick={() => setActiveTab('contests')}
              className={`px-3.5 py-1.5 text-sm font-black uppercase tracking-widest rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'contests' ? 'text-orange-500' : 'text-slate-500 hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Contests</span>
            </button>
            <button
              onClick={() => {
                if (user.mode !== 'creator') toggleUserMode();
                setActiveTab('write');
              }}
              className={`px-3.5 py-1.5 text-sm font-black uppercase tracking-widest rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'write' ? 'text-orange-500' : 'text-slate-500 hover:text-white'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>Author</span>
            </button>
          </nav>
        </div>

        <div className="hidden lg:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search audiobooks, authors..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-600 transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {isOfflineMode && (
            <button
              onClick={() => setActiveTab('library')}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold animate-pulse"
              title="Offline Mode Active - Click to view downloads in Library"
            >
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline</span>
            </button>
          )}

          <button
            onClick={openWallet}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 transition-all active:scale-95 group"
          >
            <Coins className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-black tabular-nums">{coinBalance}</span>
          </button>

          <button
            onClick={() => {
              toggleUserMode();
              setActiveTab(user.mode === 'listener' ? 'write' : 'home');
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors"
          >
            {user.mode === 'listener' ? (
              <>
                <LayoutDashboard className="w-3.5 h-3.5 text-orange-500" />
                <span>Author Mode</span>
              </>
            ) : (
              <>
                <Headphones className="w-3.5 h-3.5 text-cyan-500" />
                <span>Listener Mode</span>
              </>
            )}
          </button>

          {isLoggedIn ? (
            <button
              onClick={openAuth}
              className="flex items-center gap-2 p-1 rounded-full border-2 border-orange-500/50 hover:border-orange-500 transition-all"
            >
              <img
                src={user.avatar}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover"
              />
            </button>
          ) : (
            <button
              onClick={openAuth}
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs uppercase tracking-widest"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
