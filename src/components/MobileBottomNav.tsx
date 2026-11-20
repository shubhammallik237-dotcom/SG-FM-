import React from 'react';
import { Compass, Bookmark, PenTool, Coins, Headphones, Home, ShoppingBag } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface MobileBottomNavProps {
  activeTab: 'home' | 'write' | 'discover' | 'library' | 'store' | 'contests';
  setActiveTab: (tab: 'home' | 'write' | 'discover' | 'library' | 'store' | 'contests') => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab
}) => {
  const { coinBalance } = useApp();

  return (
    <nav 
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-30 bg-slate-950/90 backdrop-blur-2xl border-t border-white/5 px-2 py-1.5 shadow-[0_-8px_30px_rgb(0,0,0,0.5)]"
    >
      <div className="grid grid-cols-5 items-center max-w-lg mx-auto">
        {/* Tab 1: Home */}
        <button
          onClick={() => setActiveTab('home')}
          className={`relative flex flex-col items-center justify-center py-1 transition-all duration-300 ${
            activeTab === 'home' ? 'text-orange-500 scale-110' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'fill-orange-500/10' : ''}`} />
          <span className="text-[9px] mt-1 font-bold uppercase tracking-tighter">Home</span>
          {activeTab === 'home' && (
            <span className="absolute -bottom-1.5 w-1 h-1 bg-orange-500 rounded-full shadow-[0_0_8px_#f97316]" />
          )}
        </button>

        {/* Tab 2: Write */}
        <button
          onClick={() => setActiveTab('write')}
          className={`relative flex flex-col items-center justify-center py-1 transition-all duration-300 ${
            activeTab === 'write' ? 'text-orange-500 scale-110' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <PenTool className="w-5 h-5" />
          <span className="text-[9px] mt-1 font-bold uppercase tracking-tighter">Write</span>
          {activeTab === 'write' && (
            <span className="absolute -bottom-1.5 w-1 h-1 bg-orange-500 rounded-full shadow-[0_0_8px_#f97316]" />
          )}
        </button>

        {/* Tab 3: Discover */}
        <button
          onClick={() => setActiveTab('discover')}
          className={`relative flex flex-col items-center justify-center py-1 transition-all duration-300 ${
            activeTab === 'discover' ? 'text-orange-500 scale-110' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[9px] mt-1 font-bold uppercase tracking-tighter">Discover</span>
          {activeTab === 'discover' && (
            <span className="absolute -bottom-1.5 w-1 h-1 bg-orange-500 rounded-full shadow-[0_0_8px_#f97316]" />
          )}
        </button>

        {/* Tab 4: Library */}
        <button
          onClick={() => setActiveTab('library')}
          className={`relative flex flex-col items-center justify-center py-1 transition-all duration-300 ${
            activeTab === 'library' ? 'text-orange-500 scale-110' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Bookmark className="w-5 h-5" />
          <span className="text-[9px] mt-1 font-bold uppercase tracking-tighter">Library</span>
          {activeTab === 'library' && (
            <span className="absolute -bottom-1.5 w-1 h-1 bg-orange-500 rounded-full shadow-[0_0_8px_#f97316]" />
          )}
        </button>

        {/* Tab 5: My Store */}
        <button
          onClick={() => setActiveTab('store')}
          className={`relative flex flex-col items-center justify-center py-1 transition-all duration-300 ${
            activeTab === 'store' ? 'text-orange-500 scale-110' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1 -right-2 bg-orange-500 text-slate-950 text-[7px] font-black rounded-full px-1 min-w-[12px] h-3 flex items-center justify-center border border-slate-950">
              {coinBalance}
            </span>
          </div>
          <span className="text-[9px] mt-1 font-bold uppercase tracking-tighter">Store</span>
          {activeTab === 'store' && (
            <span className="absolute -bottom-1.5 w-1 h-1 bg-orange-500 rounded-full shadow-[0_0_8px_#f97316]" />
          )}
        </button>
      </div>
    </nav>
  );
};
