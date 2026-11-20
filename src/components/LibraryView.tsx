import React, { useState } from 'react';
import { 
  Bookmark, 
  Clock, 
  Play, 
  Trash2, 
  Headphones, 
  PenTool, 
  Sparkles, 
  Coins, 
  Flame, 
  Gift, 
  Download, 
  HardDrive, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw,
  Layers,
  ArrowRight,
  BookOpen,
  BookmarkCheck
} from 'lucide-react';
import { StoryCard } from './StoryCard';
import { useApp } from '../context/AppContext';

export const LibraryView: React.FC = () => {
  const {
    user,
    savedLibraryStories,
    stories,
    playEpisode,
    toggleUserMode,
    openWallet,
    dailyRewardInfo,
    claimDailyReward,
    downloadedEpisodes,
    downloadingEpisodeIds,
    downloadEpisode,
    removeDownloadedEpisode,
    clearAllDownloads,
    isEpisodeDownloaded,
    isOfflineMode,
    toggleOfflineMode,
    totalStorageUsedMb,
    showToast,
    chapterBookmarks,
    removeChapterBookmark,
    resumeChapterBookmark
  } = useApp();

  const [activeTab, setActiveTab] = useState<'saved' | 'bookmarks' | 'history' | 'downloads'>('saved');

  const historyWithDetails = user.history
    .map(h => {
      const story = stories.find(s => s.id === h.storyId);
      const episode = story?.episodes.find(e => e.id === h.episodeId);
      return {
        ...h,
        story,
        episode
      };
    })
    .filter(item => item.story && item.episode);

  const handleDownloadAllSaved = async () => {
    let count = 0;
    for (const story of savedLibraryStories) {
      if (story.episodes[0] && !isEpisodeDownloaded(story.episodes[0].id)) {
        await downloadEpisode(story, story.episodes[0]);
        count++;
      }
    }
    if (count === 0) {
      showToast('All first episodes of saved stories are already downloaded!');
    }
  };

  return (
    <div className="space-y-8 pb-32 max-w-6xl mx-auto">
      {/* User Profile Card & Settings with Offline Toggle */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-orange-950/20 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex items-center gap-4">
          <img
            src={user.avatar}
            alt={user.name}
            referrerPolicy="no-referrer"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-orange-500/40 bg-slate-850 object-cover shadow-lg"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="font-display font-extrabold text-xl sm:text-2xl text-white">
                {user.name}
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[10px] font-bold uppercase tracking-wider">
                VIP Listener
              </span>
            </div>
            <p className="text-xs text-slate-400">{user.email || user.phone}</p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
              <button
                onClick={openWallet}
                className="flex items-center gap-1.5 text-orange-400 font-semibold hover:underline"
              >
                <Coins className="w-3.5 h-3.5 text-orange-500" />
                <span>{user.coinBalance} Coins</span>
              </button>
              <span className="text-slate-600">·</span>
              <span className="flex items-center gap-1 text-orange-400 font-medium">
                <Flame className="w-3.5 h-3.5" />
                <span>{dailyRewardInfo.streakDays} Day Streak</span>
              </span>
              <span className="text-slate-600">·</span>
              {dailyRewardInfo.canClaim ? (
                <button
                  onClick={() => claimDailyReward()}
                  className="flex items-center gap-1 text-orange-400 font-semibold bg-orange-500/15 hover:bg-orange-500/25 px-2.5 py-0.5 rounded-full border border-orange-500/30 transition-colors"
                >
                  <Gift className="w-3 h-3 text-orange-500" />
                  <span>Claim Daily +{dailyRewardInfo.rewardCoins}</span>
                </button>
              ) : (
                <span className="text-[11px] text-emerald-400/80 flex items-center gap-1">
                  <span>Daily gift claimed</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Profile Settings Actions & Offline Switch */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Offline Mode Toggle Switch in User Settings */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-inner">
            <div className="flex items-center gap-2">
              {isOfflineMode ? (
                <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
              ) : (
                <Wifi className="w-4 h-4 text-emerald-400" />
              )}
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Offline Mode</span>
                <span className="text-[11px] font-bold">
                  {isOfflineMode ? (
                    <span className="text-amber-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      Active (Local)
                    </span>
                  ) : (
                    <span className="text-slate-400">Online Stream</span>
                  )}
                </span>
              </div>
            </div>
            <button
              onClick={toggleOfflineMode}
              type="button"
              role="switch"
              aria-checked={isOfflineMode}
              title="Toggle Offline Local Storage Playback"
              className={`w-11 h-6 rounded-full transition-all relative p-0.5 ml-2 focus:outline-none ${
                isOfflineMode ? 'bg-amber-500 shadow-md shadow-amber-500/30' : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                isOfflineMode ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          <button
            onClick={openWallet}
            className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/15 transition-all"
          >
            <Coins className="w-4 h-4" />
            <span>Recharge</span>
          </button>

          <button
            onClick={toggleUserMode}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <PenTool className="w-4 h-4 text-orange-500" />
            <span>Author Dashboard</span>
          </button>
        </div>
      </div>

      {/* Offline Mode Active Banner */}
      {isOfflineMode && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <WifiOff className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                Offline Mode Active
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-md border border-amber-500/30">
                  No Network
                </span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Playback is limited to downloaded episodes. You have {downloadedEpisodes.length} episode{downloadedEpisodes.length === 1 ? '' : 's'} cached locally ({totalStorageUsedMb} MB).
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('downloads')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 transition-colors"
          >
            Manage Downloads
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 p-1 bg-slate-900 rounded-2xl border border-slate-800 max-w-2xl">
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex-1 min-w-[100px] py-2 px-3 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'saved'
              ? 'bg-orange-500 text-white font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Saved ({savedLibraryStories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex-1 min-w-[115px] py-2 px-3 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'bookmarks'
              ? 'bg-orange-500 text-white font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookmarkCheck className="w-3.5 h-3.5" />
          <span>Bookmarks ({chapterBookmarks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 min-w-[100px] py-2 px-3 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'history'
              ? 'bg-orange-500 text-white font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>History ({historyWithDetails.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('downloads')}
          className={`flex-1 min-w-[100px] py-2 px-3 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'downloads'
              ? 'bg-orange-500 text-white font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Offline ({downloadedEpisodes.length})</span>
        </button>
      </div>

      {/* Recently Listened Section (Only shown on Saved or History tabs) */}
      {activeTab !== 'downloads' && historyWithDetails.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              Recently Listened
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_#f97316]" />
            </h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {historyWithDetails.slice(0, 5).map((item) => (
              <div 
                key={`recent-${item.storyId}-${item.episodeId}`} 
                className="min-w-[280px] sm:min-w-[320px] shrink-0"
              >
                <div 
                  className="p-4 rounded-2xl bg-slate-900 border border-white/5 flex items-center gap-4 hover:border-orange-500/30 transition-all cursor-pointer group relative overflow-hidden"
                  onClick={() => playEpisode(item.story!, item.episode!, true)}
                >
                  {/* Subtle Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <img
                    src={item.story!.coverUrl}
                    alt={item.story!.title}
                    className="w-16 h-20 rounded-xl object-cover shrink-0 bg-slate-800 border border-white/5 shadow-lg group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                      <span>EPISODE {item.episode!.episodeNumber}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-700" />
                      <span className="text-slate-500">{Math.ceil(item.episode!.durationSeconds / 60)} MIN</span>
                    </div>
                    <h4 className="text-sm font-bold text-white truncate">{item.episode!.title}</h4>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{item.story!.title}</p>
                    
                    {/* Progress Bar */}
                    <div className="mt-3 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500" 
                        style={{ width: `${Math.min(100, (item.progressSeconds / (item.episode!.durationSeconds || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-slate-950 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 transition-transform">
                    <Play className="w-4 h-4 fill-current" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tab 1: Saved Stories */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Bookmarked Stories</h3>
            {savedLibraryStories.length > 0 && (
              <button
                onClick={handleDownloadAllSaved}
                className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download First Chapters</span>
              </button>
            )}
          </div>

          {savedLibraryStories.length === 0 ? (
            <div className="py-16 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-3">
              <Bookmark className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Your library is currently empty</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">Explore audio novels and bookmark your favorites.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {savedLibraryStories.map(story => (
                <StoryCard key={`saved-${story.id}`} story={story} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 1.5: Chapter Bookmarks */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Saved Chapter Bookmarks</h3>
              <p className="text-xs text-slate-500 mt-0.5">Pick up listening or reading at the exact moment you saved</p>
            </div>
          </div>

          {chapterBookmarks.length === 0 ? (
            <div className="py-16 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-3">
              <BookmarkCheck className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No chapter bookmarks yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Tap the Bookmark icon inside any episode row, audio player, or reader view to save your exact spot.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {chapterBookmarks.map((bm) => {
                const progressPct = Math.min(100, Math.round((bm.progressSeconds / (bm.totalDurationSeconds || 1)) * 100));
                return (
                  <div
                    key={bm.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-orange-500/30 transition-all flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={bm.storyCoverUrl}
                        alt={bm.storyTitle}
                        referrerPolicy="no-referrer"
                        className="w-16 h-20 rounded-xl object-cover shrink-0 bg-slate-800 border border-white/5 shadow-md"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black text-orange-400 uppercase tracking-wider">
                            Chapter {bm.episodeNumber} · {bm.formattedProgress}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border ${
                              bm.mode === 'reading'
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                                : 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                            }`}
                          >
                            {bm.mode === 'reading' ? (
                              <>
                                <BookOpen className="w-2.5 h-2.5" />
                                <span>Reading</span>
                              </>
                            ) : (
                              <>
                                <Headphones className="w-2.5 h-2.5" />
                                <span>Audio</span>
                              </>
                            )}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white truncate">{bm.episodeTitle}</h4>
                        <p className="text-xs text-slate-400 truncate">{bm.storyTitle}</p>
                        {bm.note && <p className="text-[11px] text-slate-500 italic truncate">"{bm.note}"</p>}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>{bm.formattedProgress} saved ({progressPct}%)</span>
                          <span>{bm.savedAt}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500 rounded-full" style={{ width: `${progressPct}%` }} />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => resumeChapterBookmark(bm)}
                          className="flex-1 py-2 px-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/15 transition-all"
                        >
                          {bm.mode === 'reading' ? (
                            <>
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>Resume Reading</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Resume Listening</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => removeChapterBookmark(bm.storyId, bm.episodeId)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
                          title="Remove bookmark"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: History */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {historyWithDetails.length === 0 ? (
            <div className="py-16 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-3">
              <Clock className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No listening history yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">Episodes you play will automatically appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {historyWithDetails.map((item, idx) => (
                <div
                  key={`history-${item.storyId}-${item.episodeId}-${idx}`}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={item.story!.coverUrl}
                      alt={item.story!.title}
                      referrerPolicy="no-referrer"
                      className="w-14 h-18 rounded-xl object-cover shrink-0 bg-slate-800 border border-white/5"
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-orange-400 uppercase mb-1">
                        <span>Episode {item.episode!.episodeNumber}</span>
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-white truncate">
                        {item.episode!.title}
                      </h4>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {item.story!.title} · By {item.story!.author}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => downloadEpisode(item.story!, item.episode!)}
                      disabled={isEpisodeDownloaded(item.episode!.id) || downloadingEpisodeIds.includes(item.episode!.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isEpisodeDownloaded(item.episode!.id)
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 cursor-default'
                          : downloadingEpisodeIds.includes(item.episode!.id)
                          ? 'bg-orange-500/20 border-orange-500/30 text-orange-400 animate-pulse'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                      title={isEpisodeDownloaded(item.episode!.id) ? "Downloaded" : "Download offline"}
                    >
                      {isEpisodeDownloaded(item.episode!.id) ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : downloadingEpisodeIds.includes(item.episode!.id) ? (
                        <RotateCcw className="w-4 h-4 animate-spin text-orange-500" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => playEpisode(item.story!, item.episode!, true)}
                      className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-orange-500/15"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Resume</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Offline Storage Manager */}
      {activeTab === 'downloads' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Storage Meter & Control Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                    Offline Storage Manager
                  </h3>
                  <p className="text-xs text-slate-400">
                    Downloaded episodes are stored securely in browser cache for zero-data playback.
                  </p>
                </div>
              </div>

              {downloadedEpisodes.length > 0 && (
                <button
                  onClick={clearAllDownloads}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold flex items-center gap-2 transition-colors self-start sm:self-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All Cache</span>
                </button>
              )}
            </div>

            {/* Storage Progress Bar */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  SGFM Offline Cache
                </span>
                <span className="font-mono text-slate-400">
                  <strong className="text-white">{totalStorageUsedMb} MB</strong> / 512.0 MB allocated
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(3, (totalStorageUsedMb / 512) * 100))}%` }}
                />
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-black">Downloaded</span>
                <p className="text-lg font-extrabold text-white mt-0.5">{downloadedEpisodes.length} Episodes</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-black">Storage Used</span>
                <p className="text-lg font-extrabold text-orange-400 mt-0.5">{totalStorageUsedMb} MB</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-black">Audio Playtime</span>
                <p className="text-lg font-extrabold text-white mt-0.5">
                  {Math.round(downloadedEpisodes.reduce((acc, d) => acc + d.durationSeconds, 0) / 60)} Mins
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-black">Network State</span>
                <p className="text-lg font-extrabold text-emerald-400 mt-0.5">
                  {isOfflineMode ? 'Offline Only' : 'Connected'}
                </p>
              </div>
            </div>
          </div>

          {/* Downloaded Episodes List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Downloaded Episodes ({downloadedEpisodes.length})
              </h4>
              <span className="text-[11px] text-slate-500">Ready for instant offline playback</span>
            </div>

            {downloadedEpisodes.length === 0 ? (
              <div className="py-16 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-850 flex items-center justify-center text-slate-600 mx-auto">
                  <Download className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">No episodes downloaded yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Download episodes while connected to the internet so you can stream them without interruptions anywhere.
                  </p>
                </div>
                {stories.length > 0 && stories[0].episodes[0] && (
                  <button
                    onClick={() => downloadEpisode(stories[0], stories[0].episodes[0])}
                    className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs inline-flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Featured Episode 1</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {downloadedEpisodes.map((download) => {
                  const matchingStory = stories.find(s => s.id === download.storyId);
                  const matchingEpisode = matchingStory?.episodes.find(e => e.id === download.episodeId);

                  return (
                    <div
                      key={`download-${download.episodeId}`}
                      className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4 hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <img
                          src={download.coverUrl}
                          alt={download.storyTitle}
                          referrerPolicy="no-referrer"
                          className="w-14 h-18 rounded-xl object-cover shrink-0 bg-slate-800 border border-white/5"
                        />

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-orange-400 uppercase mb-1">
                            <span>Episode {download.episodeNumber}</span>
                            <span className="text-slate-600">·</span>
                            <span className="text-slate-400">{download.genre}</span>
                            <span className="text-slate-600">·</span>
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                              {download.sizeMb} MB
                            </span>
                          </div>

                          <h4 className="text-sm sm:text-base font-bold text-white truncate">
                            {download.episodeTitle}
                          </h4>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {download.storyTitle} · By {download.author}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => removeDownloadedEpisode(download.episodeId)}
                          className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
                          title="Delete from offline storage"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (matchingStory && matchingEpisode) {
                              playEpisode(matchingStory, matchingEpisode, true);
                            } else {
                              showToast(`Playing "${download.episodeTitle}" from offline storage`);
                            }
                          }}
                          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/15 transition-all"
                        >
                          <Play className="w-3.5 h-3.5 fill-slate-950" />
                          <span>Play Offline</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
