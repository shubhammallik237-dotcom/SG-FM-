import React, { useState } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Maximize2, BookOpen, Volume2, Sliders, Music, Bookmark, CloudRain } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AudioMixerPanel } from './AudioMixerPanel';
import { SoundscapeSelectorPanel } from './SoundscapeSelectorPopover';

export const FloatingPlayer: React.FC = () => {
  const {
    currentStory,
    currentEpisode,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    skipPlayer,
    seekPlayer,
    setIsExpandedPlayer,
    viewMode,
    setPlayerViewMode,
    ambientBgmEnabled,
    mixerState,
    saveChapterBookmark,
    removeChapterBookmark,
    isChapterBookmarked,
    getChapterBookmark
  } = useApp();

  const [isMixerOpen, setIsMixerOpen] = useState(false);
  const [showSoundscapePopover, setShowSoundscapePopover] = useState(false);

  if (!currentStory || !currentEpisode) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <aside 
      aria-label="Audio player"
      className="fixed bottom-[64px] md:bottom-0 left-0 right-0 z-40 bg-slate-900/90 backdrop-blur-xl border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.4)] transition-all"
    >
      {/* Top thin scrubber bar */}
      <div
        className="relative w-full h-1 bg-white/5 cursor-pointer group"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const ratio = Math.max(0, Math.min(1, clickX / rect.width));
          seekPlayer(ratio * duration);
        }}
      >
        <div
          className="h-full bg-orange-500 relative transition-all"
          style={{ width: `${progressPercent}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-orange-400 opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_8px_#f97316]" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Artwork & Episode info */}
        <div
          onClick={() => setIsExpandedPlayer(true)}
          className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer group"
        >
          <div className="relative w-10 h-12 sm:w-12 sm:h-14 rounded-lg overflow-hidden shrink-0 bg-slate-800 shadow-lg border border-white/5">
            <img
              src={currentStory.coverUrl}
              alt={currentStory.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-0.5">
                <span className="w-0.5 bg-orange-400 h-2 animate-audio-bar-1 rounded-full shadow-[0_0_5px_#fb923c]" />
                <span className="w-0.5 bg-orange-400 h-4 animate-audio-bar-2 rounded-full shadow-[0_0_5px_#fb923c]" />
                <span className="w-0.5 bg-orange-400 h-1.5 animate-audio-bar-3 rounded-full shadow-[0_0_5px_#fb923c]" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest truncate">
                Chapter {currentEpisode.episodeNumber}
              </span>
            </div>
            <h4 className="text-sm font-black text-white group-hover:text-orange-400 transition-colors truncate">
              {currentEpisode.title}
            </h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase truncate">
              {currentStory.title}
            </p>
          </div>
        </div>

        {/* Center: Playback Controls */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={() => skipPlayer(-10)}
            className="hidden xs:flex text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlayPause}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white hover:scale-105 text-slate-950 flex items-center justify-center shadow-lg active:scale-90 transition-all"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={() => skipPlayer(10)}
            className="hidden xs:flex text-slate-400 hover:text-white transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Bookmark, Mode Switcher & Expand Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          {(() => {
            const isBm = isChapterBookmarked(currentStory.id, currentEpisode.id);
            const existingBm = getChapterBookmark(currentStory.id, currentEpisode.id);
            return (
              <button
                onClick={() => {
                  if (isBm && Math.abs((existingBm?.progressSeconds || 0) - currentTime) < 5) {
                    removeChapterBookmark(currentStory.id, currentEpisode.id);
                  } else {
                    saveChapterBookmark(
                      currentStory,
                      currentEpisode,
                      currentTime,
                      viewMode === 'reader' ? 'reading' : 'audio'
                    );
                  }
                }}
                className={`p-2 rounded-lg transition-all border ${
                  isBm
                    ? 'bg-orange-500/20 border-orange-500/40 text-orange-400'
                    : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-orange-400 border-white/5'
                }`}
                title={isBm ? `Bookmarked at ${existingBm?.formattedProgress}` : 'Bookmark current position'}
              >
                <Bookmark className={`w-4 h-4 ${isBm ? 'fill-orange-400 text-orange-400' : ''}`} />
              </button>
            );
          })()}

          {/* Ambient Soundscape Layer Selector */}
          <div className="relative">
            <button
              onClick={() => setShowSoundscapePopover(prev => !prev)}
              className={`p-2 rounded-lg transition-all border flex items-center gap-1 ${
                mixerState.ambientSoundscape !== 'none' || showSoundscapePopover
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-cyan-300 border-white/5'
              }`}
              title="Layer Ambient Soundscape (Rain, Cafe, Cyberpunk City...)"
            >
              <CloudRain className="w-4 h-4" />
            </button>

            {showSoundscapePopover && (
              <div className="absolute bottom-14 right-0 w-[300px] sm:w-[340px] rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                <SoundscapeSelectorPanel compact onClose={() => setShowSoundscapePopover(false)} />
              </div>
            )}
          </div>

          {/* Mixer */}
          <button
            onClick={() => setIsMixerOpen(true)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-orange-400 transition-all relative border border-white/5"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Fullscreen Expand */}
          <button
            onClick={() => setIsExpandedPlayer(true)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Audio Mixer Modal */}
      <AudioMixerPanel isOpen={isMixerOpen} onClose={() => setIsMixerOpen(false)} />
    </aside>
  );
};
