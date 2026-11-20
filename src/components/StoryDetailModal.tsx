import React, { useState } from 'react';
import {
  X,
  Play,
  Bookmark,
  Star,
  Lock,
  CheckCircle,
  Volume2,
  Headphones,
  BookOpen,
  Share2,
  MessageSquare,
  Clock,
  Heart,
  Send,
  Trash2,
  UserCheck,
  Download,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Flame,
  ThumbsUp,
  Maximize2,
  Minimize2,
  Type
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Episode } from '../types';
import { ReaderModeView } from './ReaderModeView';

export const StoryDetailModal: React.FC = () => {
  const {
    user,
    activeModal,
    modalStory,
    closeModal,
    playEpisode,
    seekPlayer,
    toggleSaveLibrary,
    isSavedInLibrary,
    isEpisodeUnlocked,
    openUnlockPrompt,
    currentStory,
    currentEpisode,
    isPlaying,
    currentTime,
    showToast,
    getEpisodeComments,
    addCommentToEpisode,
    likeComment,
    deleteComment,
    downloadEpisode,
    downloadingEpisodeIds,
    isEpisodeDownloaded,
    saveChapterBookmark,
    removeChapterBookmark,
    isChapterBookmarked,
    getChapterBookmark,
    resumeChapterBookmark
  } = useApp();

  const [activeTab, setActiveTab] = useState<'episodes' | 'read' | 'comments'>('episodes');
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string>('');
  const [newCommentText, setNewCommentText] = useState('');
  const [includeTimestamp, setIncludeTimestamp] = useState(false);
  const [customTimestampSecs, setCustomTimestampSecs] = useState<number>(30);
  const [isFullScreenReader, setIsFullScreenReader] = useState(false);

  if (activeModal !== 'story_detail' || !modalStory) return null;

  const isSaved = isSavedInLibrary(modalStory.id);

  // Initialize selected episode for comments
  const activeCommentEpisode = modalStory.episodes.find(
    e => e.id === (selectedEpisodeId || modalStory.episodes[0]?.id)
  ) || modalStory.episodes[0];

  const currentEpisodeComments = activeCommentEpisode
    ? getEpisodeComments(activeCommentEpisode.id)
    : [];

  const totalStoryComments = modalStory.episodes.reduce(
    (acc, ep) => acc + getEpisodeComments(ep.id).length,
    0
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: modalStory.title,
        text: `Listen to ${modalStory.title} on SGFM!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Story link copied to clipboard!');
    }
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeCommentEpisode) return;

    addCommentToEpisode(
      activeCommentEpisode.id,
      newCommentText.trim(),
      includeTimestamp ? customTimestampSecs : undefined
    );

    setNewCommentText('');
    setIncludeTimestamp(false);
  };

  const handleTimestampClick = (episode: Episode, seconds?: number) => {
    if (!isEpisodeUnlocked(episode)) {
      openUnlockPrompt(episode, modalStory);
      return;
    }
    playEpisode(modalStory, episode, true);
    if (seconds !== undefined && seconds >= 0) {
      setTimeout(() => {
        seekPlayer(seconds);
      }, 200);
      showToast(`Playing Chapter ${episode.episodeNumber} from [${formatTime(seconds)}]`);
    }
  };

  const quickEmojis = ['🔥', '❤️', '👏', '😲', '😂', '🎧'];

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isFullScreenReader ? 'p-0' : 'p-0 sm:p-4 md:p-6'} bg-slate-950/85 backdrop-blur-2xl animate-in fade-in duration-200`}>
      <div className={`relative w-full ${isFullScreenReader ? 'h-full max-h-none rounded-none' : 'max-w-4xl max-h-[92vh] rounded-none sm:rounded-3xl'} bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col`}>
        {/* Close Button */}
        <button
          onClick={() => {
            if (isFullScreenReader) {
              setIsFullScreenReader(false);
            } else {
              closeModal();
            }
          }}
          aria-label={isFullScreenReader ? "Exit full-screen reading mode" : "Close story detail modal"}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700/60"
        >
          {isFullScreenReader ? <Minimize2 className="w-5 h-5 text-orange-400" /> : <X className="w-5 h-5" />}
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1 divide-y divide-slate-800">
          {/* Top Hero Banner Section */}
          <div className="relative p-6 sm:p-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 overflow-hidden">
            {/* Subtle glow background */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              {/* Cover Art (3:4 ratio) */}
              <div className="sm:col-span-4 flex justify-center sm:justify-start">
                <div className="w-48 sm:w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-800 bg-slate-950">
                  <img
                    src={modalStory.coverUrl}
                    alt={modalStory.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Story Overview */}
              <div className="sm:col-span-8 space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                  <span>{modalStory.genre}</span>
                  <span className="text-slate-500">·</span>
                  <span className="flex items-center gap-1 text-amber-300">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {modalStory.rating}
                  </span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400">
                    {(modalStory.totalPlays / 1000).toFixed(0)}K plays
                  </span>
                </div>

                <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
                  {modalStory.title}
                </h2>

                <div className="text-xs sm:text-sm text-slate-400 space-y-1">
                  <p>Written by <strong className="text-slate-200">{modalStory.author}</strong></p>
                  <p className="flex items-center gap-1.5 text-slate-300">
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                    Voice Narration: {modalStory.narratorName}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
                  {modalStory.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {modalStory.tags.map((tag, tIdx) => (
                    <span
                      key={`${tag}-${tIdx}`}
                      className="text-[11px] font-medium text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Primary Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      if (modalStory.episodes.length > 0) {
                        playEpisode(modalStory, modalStory.episodes[0], true);
                        closeModal();
                      }
                    }}
                    className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Play Episode 1</span>
                  </button>

                  <button
                    onClick={() => {
                      if (modalStory.episodes.length > 0) {
                        if (!selectedEpisodeId) setSelectedEpisodeId(modalStory.episodes[0].id);
                        setActiveTab('read');
                      }
                    }}
                    className="px-5 py-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 font-bold text-xs flex items-center gap-2 border border-orange-500/30 transition-all shadow-sm"
                  >
                    <BookOpen className="w-4 h-4 text-orange-400" />
                    <span>Read Novel</span>
                  </button>

                  <button
                    onClick={() => toggleSaveLibrary(modalStory.id)}
                    className={`px-4 py-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-colors ${
                      isSaved
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                    <span>{isSaved ? 'Saved in Library' : 'Save to Library'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('comments');
                      if (modalStory.episodes[0]) {
                        setSelectedEpisodeId(modalStory.episodes[0].id);
                      }
                    }}
                    className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-orange-400" />
                    <span>Comments ({totalStoryComments})</span>
                  </button>

                  <button
                    onClick={handleShare}
                    aria-label="Share story"
                    className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation: Episodes vs Read vs Episode Comments */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 max-w-xl overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveTab('episodes')}
                className={`flex-1 min-w-[120px] py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'episodes'
                    ? 'bg-orange-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Headphones className="w-4 h-4" />
                <span>Episodes ({modalStory.episodes.length})</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('read');
                  if (!selectedEpisodeId && modalStory.episodes[0]) {
                    setSelectedEpisodeId(modalStory.episodes[0].id);
                  }
                }}
                className={`flex-1 min-w-[120px] py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'read'
                    ? 'bg-orange-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Read Text</span>
              </button>

              <button
                onClick={() => setActiveTab('comments')}
                className={`flex-1 min-w-[120px] py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'comments'
                    ? 'bg-orange-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Comments ({totalStoryComments})</span>
              </button>
            </div>

            {/* TAB 1: Episodes List */}
            {activeTab === 'episodes' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-base text-white">
                      Story Episodes
                    </h3>
                    <p className="text-xs text-slate-400">
                      Tap any chapter to listen or download for offline storage
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {modalStory.episodes.map((episode) => {
                    const unlocked = isEpisodeUnlocked(episode);
                    const isCurrent =
                      currentStory?.id === modalStory.id &&
                      currentEpisode?.id === episode.id &&
                      isPlaying;
                    const isDownloaded = isEpisodeDownloaded(episode.id);
                    const isDownloading = downloadingEpisodeIds.includes(episode.id);
                    const commentCount = getEpisodeComments(episode.id).length;
                    const bookmarked = isChapterBookmarked(modalStory.id, episode.id);
                    const savedBm = getChapterBookmark(modalStory.id, episode.id);

                    return (
                      <div
                        key={episode.id}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                          isCurrent
                            ? 'bg-amber-500/15 border-amber-500/40'
                            : 'bg-slate-950/60 hover:bg-slate-850 border-slate-800'
                        }`}
                      >
                        <div 
                          onClick={() => {
                            if (unlocked) {
                              playEpisode(modalStory, episode, true);
                              closeModal();
                            } else {
                              openUnlockPrompt(episode, modalStory);
                            }
                          }}
                          className="flex items-center gap-3.5 min-w-0 cursor-pointer flex-1"
                        >
                          {/* Play / Episode Number Icon */}
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isCurrent
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {isCurrent ? (
                              <div className="flex items-center gap-0.5 h-3.5">
                                <span className="w-1 bg-slate-950 h-2.5 animate-audio-bar-1 rounded-full" />
                                <span className="w-1 bg-slate-950 h-3.5 animate-audio-bar-2 rounded-full" />
                                <span className="w-1 bg-slate-950 h-2 animate-audio-bar-3 rounded-full" />
                              </div>
                            ) : (
                              episode.episodeNumber
                            )}
                          </div>

                          <div className="min-w-0">
                            <h4 className={`text-sm font-semibold truncate ${
                              isCurrent ? 'text-amber-300' : 'text-slate-100'
                            }`}>
                              {episode.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                              <span>{Math.ceil(episode.durationSeconds / 60)} min</span>
                              <span aria-hidden="true">·</span>
                              <span className="truncate max-w-[160px] sm:max-w-xs">{episode.summary}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons on episode card */}
                        <div className="shrink-0 flex items-center gap-2">
                          {/* Bookmark Chapter Progress */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (bookmarked) {
                                removeChapterBookmark(modalStory.id, episode.id);
                              } else {
                                const prog =
                                  currentStory?.id === modalStory.id && currentEpisode?.id === episode.id
                                    ? currentTime
                                    : 0;
                                saveChapterBookmark(modalStory, episode, prog, 'audio');
                              }
                            }}
                            className={`p-2 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1 ${
                              bookmarked
                                ? 'bg-orange-500/20 border-orange-500/40 text-orange-400'
                                : 'bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-orange-400 border-slate-800'
                            }`}
                            title={bookmarked ? `Bookmarked at ${savedBm?.formattedProgress} (click to remove)` : 'Bookmark chapter progress'}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-orange-400 text-orange-400' : ''}`} />
                            {bookmarked && savedBm && (
                              <span
                                onClick={(ev) => {
                                  ev.stopPropagation();
                                  resumeChapterBookmark(savedBm);
                                  closeModal();
                                }}
                                className="text-[10px] font-mono underline decoration-dotted hover:text-white"
                                title={`Resume from ${savedBm.formattedProgress}`}
                              >
                                {savedBm.formattedProgress}
                              </span>
                            )}
                          </button>

                          {/* Read Chapter in Full Text Mode */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEpisodeId(episode.id);
                              setActiveTab('read');
                            }}
                            className="p-2 rounded-xl bg-slate-850 hover:bg-slate-850 text-slate-300 hover:text-orange-400 border border-slate-800 transition-colors flex items-center gap-1.5 text-xs font-bold"
                            title={`Read Chapter ${episode.episodeNumber} text`}
                          >
                            <BookOpen className="w-3.5 h-3.5 text-orange-400" />
                            <span className="hidden sm:inline">Read</span>
                          </button>

                          {/* Jump to Episode Comments Button */}
                          <button
                            onClick={() => {
                              setSelectedEpisodeId(episode.id);
                              setActiveTab('comments');
                            }}
                            className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-orange-400 border border-slate-800 transition-colors flex items-center gap-1.5 text-xs font-bold"
                            title={`View comments for Episode ${episode.episodeNumber}`}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{commentCount}</span>
                          </button>

                          {/* Download for Offline Button */}
                          <button
                            onClick={() => downloadEpisode(modalStory, episode)}
                            disabled={isDownloaded || isDownloading}
                            className={`p-2 rounded-xl border text-xs font-bold transition-colors ${
                              isDownloaded
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : isDownloading
                                ? 'bg-orange-500/20 border-orange-500/30 text-orange-400 animate-pulse'
                                : 'bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800'
                            }`}
                            title={isDownloaded ? "Saved offline" : "Download chapter for offline playback"}
                          >
                            {isDownloaded ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : isDownloading ? (
                              <RotateCcw className="w-3.5 h-3.5 animate-spin text-orange-400" />
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Status Pill / Unlock Button */}
                          {unlocked ? (
                            episode.isFree ? (
                              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                                FREE
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                Unlocked
                              </span>
                            )
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openUnlockPrompt(episode, modalStory);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-colors"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>{episode.coinPrice} Coins</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: Full-Screen / In-Modal Text Reader Mode */}
            {activeTab === 'read' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Chapter Selector & Reader Controls Bar */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">Chapter:</span>
                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide max-w-md">
                      {modalStory.episodes.map((ep) => {
                        const isSelected = activeCommentEpisode?.id === ep.id;
                        const isEpUnlocked = isEpisodeUnlocked(ep);
                        return (
                          <button
                            key={`read-ep-select-${ep.id}`}
                            onClick={() => setSelectedEpisodeId(ep.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all border flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-orange-500 text-slate-950 border-orange-400 font-black shadow-md shadow-orange-500/20'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            <span>Ep {ep.episodeNumber}</span>
                            {!isEpUnlocked && <Lock className="w-3 h-3 text-orange-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    {/* Audio Playback Toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        if (activeCommentEpisode) {
                          if (isEpisodeUnlocked(activeCommentEpisode)) {
                            playEpisode(modalStory, activeCommentEpisode, true);
                            showToast(`Playing audio for ${activeCommentEpisode.title}`);
                          } else {
                            openUnlockPrompt(activeCommentEpisode, modalStory);
                          }
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                      <span>{isPlaying && currentEpisode?.id === activeCommentEpisode?.id ? 'Audio Playing' : 'Switch to Audio'}</span>
                    </button>

                    {/* Toggle Fullscreen Reading Mode */}
                    <button
                      type="button"
                      onClick={() => setIsFullScreenReader((prev) => !prev)}
                      className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        isFullScreenReader
                          ? 'bg-orange-500 text-slate-950 border-orange-400 font-black'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                      }`}
                      title={isFullScreenReader ? 'Exit Full-Screen Reading' : 'Full-Screen Text Reading Mode'}
                    >
                      {isFullScreenReader ? (
                        <>
                          <Minimize2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Exit Fullscreen</span>
                        </>
                      ) : (
                        <>
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Full-Screen</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Reader Content Body */}
                {activeCommentEpisode && (
                  isEpisodeUnlocked(activeCommentEpisode) ? (
                    <div className={`rounded-2xl border border-slate-800 overflow-hidden bg-slate-950 ${isFullScreenReader ? 'flex-1' : 'min-h-[480px]'}`}>
                      <ReaderModeView story={modalStory} episode={activeCommentEpisode} />
                    </div>
                  ) : (
                    <div className="p-12 text-center rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 mx-auto">
                        <Lock className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">
                          Chapter {activeCommentEpisode.episodeNumber}: {activeCommentEpisode.title} is Locked
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                          Unlock this chapter to read the complete novel text and stream synchronized voice acting.
                        </p>
                      </div>
                      <div className="pt-2 flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => openUnlockPrompt(activeCommentEpisode, modalStory)}
                          className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                        >
                          Unlock Chapter ({activeCommentEpisode.coinPrice} Coins)
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {/* TAB 3: Episode Comments & Time-Stamped Discussions */}
            {activeTab === 'comments' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Chapter Selector Carousel */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold uppercase tracking-wider text-slate-500">Select Audio Chapter:</span>
                    <span>{currentEpisodeComments.length} discussion threads</span>
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {modalStory.episodes.map((ep) => {
                      const isSelected = activeCommentEpisode?.id === ep.id;
                      const count = getEpisodeComments(ep.id).length;

                      return (
                        <button
                          key={`comment-tab-ep-${ep.id}`}
                          onClick={() => setSelectedEpisodeId(ep.id)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 border ${
                            isSelected
                              ? 'bg-orange-500 text-slate-950 border-orange-400 shadow-md shadow-orange-500/20'
                              : 'bg-slate-950 hover:bg-slate-850 text-slate-300 border-slate-800'
                          }`}
                        >
                          <span>Ch {ep.episodeNumber}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            isSelected ? 'bg-slate-950 text-white font-black' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Chapter Heading */}
                {activeCommentEpisode && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-black text-sm shrink-0">
                        {activeCommentEpisode.episodeNumber}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-black uppercase text-orange-400 tracking-wider">Chapter Discussion</span>
                        <h4 className="text-sm font-bold text-white truncate">{activeCommentEpisode.title}</h4>
                      </div>
                    </div>

                    <button
                      onClick={() => handleTimestampClick(activeCommentEpisode, 0)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 shrink-0 transition-colors"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Play Chapter</span>
                    </button>
                  </div>
                )}

                {/* Leave a Time-Stamped Comment Form */}
                <form onSubmit={handlePostComment} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
                      <span>Leave a Community Comment</span>
                    </span>

                    {/* Timestamp Toggle */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const next = !includeTimestamp;
                          setIncludeTimestamp(next);
                          if (next && currentStory?.id === modalStory.id && currentEpisode?.id === activeCommentEpisode?.id && currentTime > 0) {
                            setCustomTimestampSecs(Math.floor(currentTime));
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 border transition-all ${
                          includeTimestamp
                            ? 'bg-orange-500 text-slate-950 border-orange-400 shadow-sm'
                            : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{includeTimestamp ? `Timestamp [${formatTime(customTimestampSecs)}]` : '+ Add Audio Timestamp'}</span>
                      </button>

                      {includeTimestamp && (
                        <div className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                          <button
                            type="button"
                            onClick={() => setCustomTimestampSecs(Math.max(0, customTimestampSecs - 15))}
                            className="text-[10px] text-slate-400 hover:text-white font-mono px-1"
                          >
                            -15s
                          </button>
                          <span className="text-[11px] font-mono text-orange-400 font-bold px-1">
                            {formatTime(customTimestampSecs)}
                          </span>
                          <button
                            type="button"
                            onClick={() => setCustomTimestampSecs(Math.min(activeCommentEpisode?.durationSeconds || 300, customTimestampSecs + 15))}
                            className="text-[10px] text-slate-400 hover:text-white font-mono px-1"
                          >
                            +15s
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <textarea
                      rows={2}
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder={`Share your thoughts on Chapter ${activeCommentEpisode?.episodeNumber || ''}... (e.g. That plot twist had me on edge!)`}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500/50 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none resize-none transition-all"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    {/* Quick Emojis */}
                    <div className="flex items-center gap-1">
                      {quickEmojis.map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setNewCommentText(prev => `${prev} ${emoji}`.trim())}
                          className="w-7 h-7 rounded-lg hover:bg-slate-800 text-sm flex items-center justify-center transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={!newCommentText.trim()}
                      className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-orange-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post Comment</span>
                    </button>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 px-1">
                    Chapter Comments ({currentEpisodeComments.length})
                  </h4>

                  {currentEpisodeComments.length === 0 ? (
                    <div className="py-12 text-center rounded-2xl bg-slate-950/40 border border-slate-800 space-y-2">
                      <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-sm font-bold text-white">No comments on this chapter yet</p>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto">
                        Be the first to leave a time-stamped note and share your reaction with the community!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentEpisodeComments.map((comment) => (
                        <div
                          key={comment.id}
                          className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-750 transition-all space-y-2.5 group"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={comment.userAvatar}
                                alt={comment.userName}
                                className="w-8 h-8 rounded-full border border-slate-700 bg-slate-800 object-cover shrink-0"
                              />
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-bold text-white">{comment.userName}</span>
                                  {comment.isCreator && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[9px] font-black uppercase tracking-tight">
                                      <UserCheck className="w-2.5 h-2.5" />
                                      Author
                                    </span>
                                  )}
                                  <span className="text-[10px] text-slate-500">{comment.timestamp}</span>

                                  {/* Interactive Audio Timestamp Badge */}
                                  {comment.formattedAudioTimestamp && (
                                    <button
                                      onClick={() => handleTimestampClick(activeCommentEpisode, comment.audioTimestampSeconds)}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/15 hover:bg-orange-500/30 border border-orange-500/40 text-orange-400 text-[10px] font-mono font-bold transition-all"
                                      title="Click to jump to this moment in chapter audio"
                                    >
                                      <Play className="w-2.5 h-2.5 fill-current" />
                                      <span>{comment.formattedAudioTimestamp}</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Delete button for user's own comment */}
                            {comment.userId === user.id && (
                              <button
                                onClick={() => deleteComment(comment.episodeId, comment.id)}
                                className="p-1 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                title="Delete comment"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed pl-11">
                            {comment.text}
                          </p>

                          <div className="flex items-center gap-4 pl-11 pt-1">
                            <button
                              onClick={() => likeComment(comment.episodeId, comment.id)}
                              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-orange-400 font-bold transition-colors"
                            >
                              <Heart className="w-3.5 h-3.5 text-rose-500" />
                              <span>{comment.likes}</span>
                            </button>

                            <button
                              onClick={() => setNewCommentText(`@${comment.userName} `)}
                              className="text-[11px] text-slate-500 hover:text-slate-300 font-bold transition-colors"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
