import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HomeDiscovery } from './components/HomeDiscovery';
import { LibraryView } from './components/LibraryView';
import { AuthorDashboard } from './components/AuthorDashboard';
import { WriterContestView } from './components/WriterContestView';
import { FloatingPlayer } from './components/FloatingPlayer';
import { ExpandedPlayerModal } from './components/ExpandedPlayerModal';
import { StoryDetailModal } from './components/StoryDetailModal';
import { WalletModal } from './components/WalletModal';
import { UnlockEpisodeModal } from './components/UnlockEpisodeModal';
import { AuthModal } from './components/AuthModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Sparkles } from 'lucide-react';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'write' | 'discover' | 'library' | 'store' | 'contests'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const { toastMessage } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-orange-500/30 selection:text-orange-200">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 md:pb-24">
        {activeTab === 'home' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <HomeDiscovery
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              mode={searchQuery.trim() ? 'discover' : 'home'}
              onOpenContests={() => setActiveTab('contests')}
            />
          </div>
        )}

        {activeTab === 'discover' && (
          <HomeDiscovery
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpenContests={() => setActiveTab('contests')}
          />
        )}

        {activeTab === 'contests' && (
          <WriterContestView onNavigateToWriter={() => setActiveTab('write')} />
        )}

        {activeTab === 'write' && <AuthorDashboard />}
        
        {activeTab === 'library' && <LibraryView />}
        
        {activeTab === 'store' && <WalletModal embedded />}
      </main>

      {/* Persistent Floating Audio Player Bar */}
      <FloatingPlayer />

      {/* Mobile Bottom Navigation Anchor */}
      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Modals & Overlays */}
      <ExpandedPlayerModal />
      <StoryDetailModal />
      <WalletModal />
      <UnlockEpisodeModal />
      <AuthModal />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-slate-900/95 backdrop-blur-md border border-orange-500/50 text-slate-100 px-4 py-3 rounded-2xl shadow-2xl shadow-orange-500/10 flex items-center gap-3 text-xs sm:text-sm font-semibold ring-1 ring-orange-400/20">
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
            </div>
            <span className="text-orange-100">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
