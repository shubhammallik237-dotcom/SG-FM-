import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Lock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Volume2,
  Sliders,
  Mic,
  Gauge,
  Bookmark,
  Play,
  Pause,
  Sparkles,
  Eye
} from 'lucide-react';
import { Story, Episode } from '../types';
import { useApp } from '../context/AppContext';
import { VoiceSelector } from './VoiceSelector';
import { AudioMixerPanel } from './AudioMixerPanel';

interface ReaderModeViewProps {
  story: Story;
  episode: Episode;
}

const READING_SPEED_OPTIONS = [
  { rate: 0.5, label: '0.5x', wpm: '~80 WPM', desc: 'Slow & Relaxed' },
  { rate: 0.75, label: '0.75x', wpm: '~120 WPM', desc: 'Calm Pace' },
  { rate: 1.0, label: '1.0x', wpm: '~160 WPM', desc: 'Natural' },
  { rate: 1.25, label: '1.25x', wpm: '~200 WPM', desc: 'Brisk' },
  { rate: 1.5, label: '1.5x', wpm: '~240 WPM', desc: 'Fast' },
  { rate: 2.0, label: '2.0x', wpm: '~320 WPM', desc: 'Speed Read' }
];

export const ReaderModeView: React.FC<ReaderModeViewProps> = ({ story, episode }) => {
  const {
    currentEpisode,
    currentSpokenSentence,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    setPlayerRate,
    playEpisode,
    togglePlayPause,
    playNextEpisode,
    playPrevEpisode,
    isEpisodeUnlocked,
    openUnlockPrompt,
    selectedVoiceProfile,
    setSelectedVoiceProfile,
    isChapterBookmarked,
    getChapterBookmark,
    saveChapterBookmark,
    removeChapterBookmark
  } = useApp();

  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [readerTheme, setReaderTheme] = useState<'midnight' | 'sepia' | 'oled'>('midnight');
  const [isMixerOpen, setIsMixerOpen] = useState(false);
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);
  const [liveRevealEnabled, setLiveRevealEnabled] = useState(true);
  const [revealedGlobalChars, setRevealedGlobalChars] = useState<number>(0);

  const speedMenuRef = useRef<HTMLDivElement>(null);

  const isThisEpisodeActive = currentEpisode?.id === episode.id;
  const isNarratingThis = isThisEpisodeActive && isPlaying;

  const fontSizeClasses = {
    sm: 'text-sm leading-relaxed',
    base: 'text-base leading-relaxed sm:text-lg sm:leading-loose',
    lg: 'text-lg leading-loose sm:text-xl sm:leading-loose',
    xl: 'text-xl leading-loose sm:text-2xl sm:leading-loose'
  };

  const themeClasses = {
    midnight: 'bg-slate-950 text-slate-200',
    sepia: 'bg-[#181512] text-[#e8decb]',
    oled: 'bg-black text-slate-100'
  };

  const parsedParagraphs = useMemo(() => {
    const rawParas = episode.content.split('\n\n').filter(p => p.trim().length > 0);
    let offset = 0;
    return rawParas.map((p) => {
      const tagMatch = p.match(/^\[(Male|Female|Narrator|M|F|N)(?::\s*([^\]]+))?\]/i);
      const speakerRole = tagMatch ? tagMatch[1].toLowerCase() : null;
      const speakerLabel = tagMatch ? (tagMatch[2]?.trim() || tagMatch[1]) : null;
      const cleanParagraph = (tagMatch ? p.replace(/^\[[^\]]+\]\s*/, '').trim() : p)
        .replace(/\[(?:BGM|Music|Mood|SFX):[^\]]+\]/gi, '')
        .trim();
      const isMale = speakerRole === 'male' || speakerRole === 'm';
      const isFemale = speakerRole === 'female' || speakerRole === 'f';

      const startOffset = offset;
      const endOffset = offset + cleanParagraph.length;
      offset = endOffset;

      return {
        raw: p,
        tagMatch,
        speakerLabel,
        cleanParagraph,
        isMale,
        isFemale,
        startOffset,
        endOffset
      };
    });
  }, [episode.content]);

  const totalCleanChars = useMemo(() => {
    if (parsedParagraphs.length === 0) return 0;
    return parsedParagraphs[parsedParagraphs.length - 1].endOffset;
  }, [parsedParagraphs]);

  // Close speed popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(e.target as Node)) {
        setIsSpeedMenuOpen(false);
      }
    };
    if (isSpeedMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSpeedMenuOpen]);

  // Reset / initialize reveal offset when switching episodes or jumping time
  useEffect(() => {
    if (totalCleanChars === 0) {
      setRevealedGlobalChars(0);
      return;
    }
    if (isThisEpisodeActive && currentTime > 1) {
      const effectiveDur = duration > 0 ? duration : episode.durationSeconds;
      const ratio = Math.min(1, currentTime / Math.max(1, effectiveDur));
      setRevealedGlobalChars(Math.floor(ratio * totalCleanChars));
    } else {
      setRevealedGlobalChars(0);
    }
  }, [episode.id, totalCleanChars]);

  // Snap reveal up to the spoken sentence if boundary events advance faster
  useEffect(() => {
    if (!isNarratingThis || !liveRevealEnabled || !currentSpokenSentence) return;
    const needle = currentSpokenSentence.trim().toLowerCase().slice(0, 24);
    if (!needle) return;

    const matchedPara = parsedParagraphs.find(p =>
      p.cleanParagraph.toLowerCase().includes(needle)
    );
    if (matchedPara) {
      const localIdx = matchedPara.cleanParagraph.toLowerCase().indexOf(needle);
      const sentenceGlobalStart = matchedPara.startOffset + Math.max(0, localIdx);
      setRevealedGlobalChars(prev => (prev < sentenceGlobalStart ? sentenceGlobalStart : prev));
    }
  }, [currentSpokenSentence, isNarratingThis, liveRevealEnabled, parsedParagraphs]);

  // Progressive text appearance timer scaled directly by playbackRate (reading speed)
  useEffect(() => {
    if (!isNarratingThis || !liveRevealEnabled || totalCleanChars === 0) return;

    // Base speed: ~18 characters per second at 1.0x, scaled linearly by playbackRate
    const intervalMs = 40;
    const timer = window.setInterval(() => {
      setRevealedGlobalChars(prev => {
        if (prev >= totalCleanChars) return totalCleanChars;
        const step = (18 * playbackRate * intervalMs) / 1000;
        return Math.min(totalCleanChars, prev + step);
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isNarratingThis, liveRevealEnabled, playbackRate, totalCleanChars]);

  const handleNarrateToggle = () => {
    if (!isEpisodeUnlocked(episode)) {
      openUnlockPrompt(episode, story);
      return;
    }
    if (isThisEpisodeActive) {
      togglePlayPause();
    } else {
      playEpisode(story, episode, true);
    }
  };

  const bookmarked = isChapterBookmarked(story.id, episode.id);
  const existingBookmark = getChapterBookmark(story.id, episode.id);

  const handleToggleBookmark = () => {
    const estimatedProgress = isThisEpisodeActive
      ? currentTime
      : Math.floor((revealedGlobalChars / Math.max(1, totalCleanChars)) * episode.durationSeconds);

    if (bookmarked && (!isThisEpisodeActive || Math.abs((existingBookmark?.progressSeconds || 0) - estimatedProgress) < 5)) {
      removeChapterBookmark(story.id, episode.id);
    } else {
      saveChapterBookmark(story, episode, estimatedProgress, 'reading');
    }
  };

  const curIdx = story.episodes.findIndex(e => e.id === episode.id);
  const nextEp = curIdx < story.episodes.length - 1 ? story.episodes[curIdx + 1] : null;
  const prevEp = curIdx > 0 ? story.episodes[curIdx - 1] : null;

  const isProgressiveActive = liveRevealEnabled && (isNarratingThis || (isThisEpisodeActive && revealedGlobalChars > 0 && revealedGlobalChars < totalCleanChars));

  return (
    <div className={`flex flex-col h-full rounded-2xl ${themeClasses[readerTheme]} transition-colors`}>
      <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-2.5 border-b border-slate-800/80 bg-slate-900/50 gap-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-bold text-orange-500 shrink-0">
            Chapter {episode.episodeNumber}
          </span>
          <span className="text-slate-500 text-xs">·</span>
          <span className="text-xs text-slate-400 truncate max-w-[120px] sm:max-w-[180px] font-medium uppercase tracking-widest">
            {story.title}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Play / Pause Narration Trigger */}
          <button
            type="button"
            onClick={handleNarrateToggle}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all border ${
              isNarratingThis
                ? 'bg-orange-500 text-slate-950 border-orange-400 shadow-md shadow-orange-500/20'
                : 'bg-slate-800/90 hover:bg-slate-700 text-white border-slate-700'
            }`}
            title={isNarratingThis ? 'Pause Narration' : 'Start Narration with Live Text Sync'}
          >
            {isNarratingThis ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current text-orange-400" />
                <span className="hidden sm:inline">Narrate</span>
              </>
            )}
          </button>

          {/* Reading Speed Control */}
          <div className="relative" ref={speedMenuRef}>
            <button
              type="button"
              onClick={() => setIsSpeedMenuOpen(prev => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800/90 hover:bg-slate-700 text-slate-100 text-xs font-bold transition-colors shadow-sm"
              title="Adjust Reading & Text Appearance Speed"
            >
              <Gauge className="w-3.5 h-3.5 text-orange-500" />
              <span className="tabular-nums font-black text-orange-400">{playbackRate}x</span>
              <span className="hidden md:inline text-[10px] text-slate-400 uppercase tracking-wider">Speed</span>
            </button>

            {isSpeedMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-3 z-40 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-wider">Reading Speed</p>
                    <p className="text-[10px] text-slate-400">Controls narration & text reveal pace</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 text-[10px] font-black tabular-nums">
                    {playbackRate}x
                  </span>
                </div>

                {/* Preset Grid */}
                <div className="grid grid-cols-3 gap-1.5">
                  {READING_SPEED_OPTIONS.map(opt => {
                    const active = playbackRate === opt.rate;
                    return (
                      <button
                        key={opt.rate}
                        type="button"
                        onClick={() => {
                          setPlayerRate(opt.rate);
                        }}
                        className={`px-2 py-2 rounded-xl text-center transition-all border ${
                          active
                            ? 'bg-orange-500 text-slate-950 border-orange-400 font-black shadow-md shadow-orange-500/20'
                            : 'bg-slate-950/70 hover:bg-slate-800 text-slate-300 border-slate-800'
                        }`}
                      >
                        <div className="text-xs font-black tabular-nums">{opt.label}</div>
                        <div className={`text-[9px] font-bold ${active ? 'text-slate-900' : 'text-slate-500'}`}>
                          {opt.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Fine Slider */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span>Slower (0.5x)</span>
                    <span className="text-orange-400">
                      {Math.round(160 * playbackRate)} WPM
                    </span>
                    <span>Faster (2.0x)</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.25"
                    value={playbackRate}
                    onChange={(e) => setPlayerRate(parseFloat(e.target.value))}
                    aria-label="Reading speed slider"
                    className="w-full accent-orange-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Progressive Reveal Toggle */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-bold text-white flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-orange-400" />
                      <span>Progressive Text Reveal</span>
                    </p>
                    <p className="text-[10px] text-slate-400">Text appears synced with speed</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={liveRevealEnabled}
                    onClick={() => setLiveRevealEnabled(prev => !prev)}
                    className={`w-9 h-5 rounded-full transition-all p-0.5 shrink-0 ${
                      liveRevealEnabled ? 'bg-orange-500' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        liveRevealEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Toggle Full Text / Live Reveal Quick Pill when progressively revealing */}
          {isProgressiveActive && (
            <button
              type="button"
              onClick={() => setLiveRevealEnabled(false)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 text-[10px] font-bold transition-colors"
              title="Show entire chapter text immediately"
            >
              <Eye className="w-3 h-3" />
              <span className="hidden sm:inline">Show All</span>
            </button>
          )}

          {/* Bookmark Reading Progress */}
          <button
            type="button"
            onClick={handleToggleBookmark}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
              bookmarked
                ? 'bg-orange-500/20 border-orange-500/40 text-orange-400'
                : 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
            title={bookmarked ? `Bookmarked at ${existingBookmark?.formattedProgress}` : 'Bookmark this chapter progress'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-orange-400 text-orange-400' : ''}`} />
            {bookmarked && existingBookmark && (
              <span className="text-[10px] font-mono hidden sm:inline">{existingBookmark.formattedProgress}</span>
            )}
          </button>

          <div className="flex items-center">
            <VoiceSelector
              selectedVoice={selectedVoiceProfile}
              onSelectVoice={setSelectedVoiceProfile}
              variant="compact"
              label="Narrator"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsMixerOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors shadow-sm"
            title="Audio Mixer"
          >
            <Sliders className="w-3.5 h-3.5 text-orange-500" />
            <span className="hidden lg:inline uppercase tracking-widest">Mixer</span>
          </button>

          <div className="flex items-center gap-1.5">
            <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/60">
              {(['sm', 'base', 'lg', 'xl'] as const).map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setFontSize(size)}
                  className={`px-2 py-1 text-[10px] rounded font-black transition-colors ${
                    fontSize === size ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {size.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/60">
              <button
                type="button"
                onClick={() => setReaderTheme('midnight')}
                aria-label="Midnight theme"
                className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                  readerTheme === 'midnight' ? 'bg-slate-700 text-orange-500' : 'text-slate-400'
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-700" />
              </button>
              <button
                type="button"
                onClick={() => setReaderTheme('sepia')}
                aria-label="Sepia theme"
                className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                  readerTheme === 'sepia' ? 'bg-slate-700 text-orange-500' : 'text-slate-400'
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-[#2a241e] border border-amber-900/50" />
              </button>
              <button
                type="button"
                onClick={() => setReaderTheme('oled')}
                aria-label="OLED black theme"
                className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                  readerTheme === 'oled' ? 'bg-slate-700 text-orange-500' : 'text-slate-400'
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-black border border-slate-700" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 sm:px-12 py-8 max-w-3xl mx-auto w-full space-y-6">
        <header className="text-center pb-6 border-b border-slate-800/60 space-y-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-orange-500 font-black">
            {story.title}
          </p>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
            {episode.title}
          </h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
            By {story.author} · {selectedVoiceProfile.language} Voice · {playbackRate}x Speed
          </p>
          {isNarratingThis && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-black uppercase">
              <Volume2 className="w-3 h-3 animate-pulse" />
              <span>
                {liveRevealEnabled
                  ? `Live Text Sync · ${playbackRate}x`
                  : 'Audio Sync Active'}
              </span>
            </div>
          )}
        </header>

        <article className={`space-y-6 ${fontSizeClasses[fontSize]} font-serif selection:bg-orange-500/30`}>
          {parsedParagraphs.map((para, idx) => {
            const { tagMatch, speakerLabel, cleanParagraph, isMale, isFemale, startOffset, endOffset } = para;

            const isSentenceInPara =
              isNarratingThis &&
              currentSpokenSentence &&
              cleanParagraph.toLowerCase().includes(currentSpokenSentence.toLowerCase().slice(0, 20));

            let visibleText = cleanParagraph;
            let upcomingText = '';
            let isActiveRevealPara = false;
            let isUpcomingPara = false;

            if (isProgressiveActive) {
              const revealedCount = Math.floor(revealedGlobalChars);
              if (revealedCount >= endOffset) {
                visibleText = cleanParagraph;
              } else if (revealedCount <= startOffset) {
                visibleText = '';
                upcomingText = cleanParagraph;
                isUpcomingPara = true;
              } else {
                const localCutoff = Math.max(0, revealedCount - startOffset);
                visibleText = cleanParagraph.slice(0, localCutoff);
                upcomingText = cleanParagraph.slice(localCutoff);
                isActiveRevealPara = true;
              }
            }

            return (
              <div
                key={`para-${idx}`}
                onClick={() => {
                  if (isUpcomingPara || isActiveRevealPara) {
                    setRevealedGlobalChars(endOffset);
                  }
                }}
                className={`transition-all duration-300 rounded-xl p-4 ${
                  isSentenceInPara || isActiveRevealPara
                    ? 'bg-orange-500/10 border-l-4 border-orange-500 text-white shadow-xl shadow-orange-500/5'
                    : isMale
                    ? 'bg-cyan-950/10 border-l-2 border-cyan-500/30'
                    : isFemale
                    ? 'bg-rose-950/10 border-l-2 border-rose-500/30'
                    : 'text-slate-300'
                } ${isUpcomingPara ? 'opacity-25 cursor-pointer hover:opacity-60' : ''}`}
                title={isUpcomingPara ? 'Click to reveal paragraph immediately' : undefined}
              >
                {tagMatch && (
                  <div className="flex items-center gap-2 mb-2 font-sans not-italic">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        isMale
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          : isFemale
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      }`}
                    >
                      <Mic className="w-3 h-3" />
                      <span>{speakerLabel}</span>
                    </span>
                  </div>
                )}
                <p className={isMale ? 'text-cyan-50 font-medium' : isFemale ? 'text-rose-50 font-medium' : 'text-slate-200'}>
                  <span>{visibleText}</span>
                  {isActiveRevealPara && (
                    <span className="inline-block w-0.5 h-[1.1em] align-middle bg-orange-400 animate-pulse mx-0.5 rounded-full shadow-[0_0_8px_#f97316]" />
                  )}
                  {upcomingText && (
                    <span className="text-slate-600/35 select-none transition-colors">
                      {upcomingText}
                    </span>
                  )}
                </p>
              </div>
            );
          })}
        </article>

        <div className="pt-10 pb-8 border-t border-slate-800/60 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={playPrevEpisode}
            disabled={!prevEp}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${
              prevEp ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700' : 'opacity-30 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {nextEp ? (
            isEpisodeUnlocked(nextEp) ? (
              <button
                type="button"
                onClick={playNextEpisode}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase bg-orange-500 hover:bg-orange-400 text-white transition-all shadow-xl shadow-orange-500/20"
              >
                <span>Next Chapter</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openUnlockPrompt(nextEp, story)}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase bg-orange-500/20 border border-orange-500/40 text-orange-400 transition-all"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Unlock Ep {nextEp.episodeNumber}</span>
              </button>
            )
          ) : (
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Finished Story</span>
            </div>
          )}
        </div>
      </div>

      <AudioMixerPanel isOpen={isMixerOpen} onClose={() => setIsMixerOpen(false)} />
    </div>
  );
};
