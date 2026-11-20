import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  Headphones, 
  BookOpen, 
  Sliders, 
  MessageSquare, 
  ListMusic, 
  Sparkles, 
  X, 
  Lock, 
  Gauge, 
  RotateCcw, 
  SkipBack, 
  Pause, 
  Play, 
  SkipForward, 
  RotateCw, 
  Clock,
  MicOff,
  Bookmark,
  CloudRain,
  Map as MapIcon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ReaderModeView } from './ReaderModeView';
import { VoiceSelector } from './VoiceSelector';
import { AudioMixerPanel } from './AudioMixerPanel';
import { VisualScenePlayer } from './VisualScenePlayer';
import { EpisodeReactions } from './EpisodeReactions';
import { CommentSection } from './CommentSection';
import { SoundscapeSelectorPanel } from './SoundscapeSelectorPopover';
import { ChapterProgressMap, ChapterScrubberMarkers } from './ChapterProgressMap';
import { AMBIENT_SOUNDSCAPES } from '../data/bgmTracks';
import { SleepTimerOption, Episode } from '../types';
import { globalAudioEngine } from '../utils/audioEngine';
import { generateChapterProgressBeats } from '../utils/sceneGenerator';

export const ExpandedPlayerModal: React.FC = () => {
  const {
    currentStory,
    currentEpisode,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    sleepTimer,
    sleepTimerRemaining,
    viewMode,
    isExpandedPlayer,
    ambientBgmEnabled,
    togglePlayPause,
    seekPlayer,
    skipPlayer,
    setPlayerRate,
    setSleepTimerOption,
    setPlayerViewMode,
    setIsExpandedPlayer,
    toggleAmbientBgm,
    playNextEpisode,
    playPrevEpisode,
    playEpisode,
    isEpisodeUnlocked,
    openUnlockPrompt,
    selectedVoiceProfile,
    setSelectedVoiceProfile,
    activeSpeakerInfo,
    mixerState,
    currentSpokenSentence,
    saveChapterBookmark,
    removeChapterBookmark,
    isChapterBookmarked,
    getChapterBookmark
  } = useApp();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showTimerMenu, setShowTimerMenu] = useState(false);
  const [showSoundscapeMenu, setShowSoundscapeMenu] = useState(false);
  const [isMixerOpen, setIsMixerOpen] = useState(false);
  const [showProgressMap, setShowProgressMap] = useState(true);

  const chapterBeats = useMemo(() => {
    if (!currentEpisode) return [];
    return generateChapterProgressBeats(currentEpisode, currentStory?.genre);
  }, [currentEpisode, currentStory?.genre]);

  if (!isExpandedPlayer || !currentStory || !currentEpisode) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    seekPlayer(newTime);
  };

  const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
  const timerOptions: { label: string; value: SleepTimerOption }[] = [
    { label: 'Off', value: 0 },
    { label: '5 Min', value: 300 },
    { label: '15 Min', value: 900 },
    { label: '30 Min', value: 1800 },
    { label: 'End of Chapter', value: -1 }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black animate-in fade-in duration-500">
      <div className="relative w-full h-full bg-slate-950 flex flex-col overflow-hidden">
        
        <VisualScenePlayer 
          currentTime={currentTime} 
          scenes={currentEpisode.visualScenes || []} 
          isPlaying={isPlaying} 
        />

        <header className="px-4 sm:px-8 py-5 flex items-center justify-between gap-4 bg-gradient-to-b from-black/80 to-transparent z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsExpandedPlayer(false)}
              aria-label="Minimize player"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all backdrop-blur-md border border-white/10"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-white font-black text-sm uppercase tracking-[0.2em]">SGFM Premium</h2>
              <p className="text-white/50 text-[10px] font-bold">Cinematic Audio Stream</p>
            </div>
          </div>

          <div className="flex items-center p-1 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
            <button
              onClick={() => setPlayerViewMode('audio')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                viewMode === 'audio'
                  ? 'bg-orange-500 text-slate-950 shadow-lg shadow-orange-500/30'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Headphones className="w-4 h-4" />
              <span className="hidden xs:inline">Listen</span>
            </button>
            <button
              onClick={() => setPlayerViewMode('reader')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                viewMode === 'reader'
                  ? 'bg-orange-500 text-slate-950 shadow-lg shadow-orange-500/30'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden xs:inline">Read</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
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
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all backdrop-blur-md border ${
                    isBm
                      ? 'bg-orange-500/25 border-orange-400 text-orange-400 shadow-lg shadow-orange-500/20'
                      : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  }`}
                  title={isBm ? `Bookmarked at ${existingBm?.formattedProgress}` : 'Bookmark current timestamp'}
                >
                  <Bookmark className={`w-4 h-4 ${isBm ? 'fill-orange-400 text-orange-400' : ''}`} />
                </button>
              );
            })()}

            <button
              onClick={() => {
                if (viewMode === 'reader') {
                  setPlayerViewMode('audio');
                  setShowProgressMap(true);
                } else {
                  setShowProgressMap(prev => !prev);
                }
              }}
              className={`h-10 px-3 rounded-full flex items-center gap-1.5 transition-all backdrop-blur-md border text-xs font-bold ${
                showProgressMap && viewMode === 'audio'
                  ? 'bg-orange-500/20 border-orange-400/60 text-orange-300 shadow-lg shadow-orange-500/20'
                  : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
              }`}
              title="Toggle Visual Chapter Progress Map"
            >
              <MapIcon className="w-4 h-4" />
              <span className="hidden md:inline">Story Map</span>
              {chapterBeats.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-[10px] font-black tabular-nums">
                  {chapterBeats.length}
                </span>
              )}
            </button>

            <div className="relative">
              {(() => {
                const activeAmbient = AMBIENT_SOUNDSCAPES.find(s => s.id === mixerState.ambientSoundscape);
                const isAmbientOn = mixerState.ambientSoundscape !== 'none';
                return (
                  <button
                    onClick={() => setShowSoundscapeMenu(prev => !prev)}
                    className={`h-10 px-3 rounded-full flex items-center gap-1.5 transition-all backdrop-blur-md border text-xs font-bold ${
                      isAmbientOn || showSoundscapeMenu
                        ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-300 shadow-lg shadow-cyan-500/20'
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                    }`}
                    title="Layer Ambient Soundscape (Rain, Cafe, Cyberpunk City...)"
                  >
                    <CloudRain className={`w-4 h-4 ${isAmbientOn ? 'text-cyan-300 animate-pulse' : ''}`} />
                    <span className="hidden sm:inline">
                      {isAmbientOn && activeAmbient ? activeAmbient.shortLabel : 'Soundscape'}
                    </span>
                  </button>
                );
              })()}

              {showSoundscapeMenu && (
                <div className="absolute right-0 top-12 w-[320px] sm:w-[380px] rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/15 p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <SoundscapeSelectorPanel compact onClose={() => setShowSoundscapeMenu(false)} />
                </div>
              )}
            </div>

            <button
              onClick={() => setIsMixerOpen(true)}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all backdrop-blur-md border border-white/10"
              title="Audio Settings"
            >
              <Sliders className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsCommentsOpen(!isCommentsOpen)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all backdrop-blur-md border ${
                isCommentsOpen 
                  ? 'bg-orange-500 border-orange-400 text-slate-950 shadow-lg shadow-orange-500/20' 
                  : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsDrawerOpen(true)}
              className="px-4 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center gap-2 transition-all backdrop-blur-md border border-white/10 text-xs font-bold"
            >
              <ListMusic className="w-4 h-4" />
              <span className="hidden md:inline">Episodes</span>
            </button>
          </div>
        </header>

        <div className="relative flex-1 overflow-hidden flex">
          <div className="flex-1 flex flex-col h-full overflow-y-auto scrollbar-none relative z-10">
            {viewMode === 'reader' ? (
              <div className="bg-slate-950/80 backdrop-blur-2xl min-h-full">
                <ReaderModeView story={currentStory} episode={currentEpisode} />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center p-5 sm:p-8 max-w-4xl mx-auto w-full space-y-5 my-auto">
                
                {!currentEpisode.visualScenes?.length && (
                  <div className="relative group/art animate-in zoom-in-95 duration-700">
                    <div className="absolute inset-0 bg-orange-500/20 rounded-[2rem] blur-3xl transform scale-110" />
                    <div className="relative w-44 sm:w-56 aspect-[3/4] rounded-[2rem] overflow-hidden shadow-[0_30px_60px_-12px_rgba(0,0,0,0.7)] border border-white/10 bg-slate-900">
                      <img
                        src={currentStory.coverUrl}
                        alt={currentStory.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {isPlaying && currentSpokenSentence && (
                  <div className="max-w-2xl text-center px-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <p className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,1)] tracking-tight">
                      {currentSpokenSentence}
                    </p>
                  </div>
                )}

                <div className="text-center space-y-1.5 w-full pt-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">
                    <Sparkles className="w-3 h-3" />
                    <span>EPISODE {currentEpisode.episodeNumber} · {currentStory.genre}</span>
                  </div>
                  <h3 className="font-display font-black text-2xl sm:text-4xl md:text-5xl text-white drop-shadow-lg">
                    {currentEpisode.title}
                  </h3>
                  <p className="text-sm sm:text-base text-white/70 font-bold tracking-tight">
                    {currentStory.title} <span className="text-white/30 mx-2">|</span> {currentStory.author}
                  </p>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                  <EpisodeReactions episodeId={currentEpisode.id} />
                </div>

                {activeSpeakerInfo && isPlaying && (
                  <div className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl animate-in fade-in zoom-in-95">
                    <div className="relative">
                      <div className={`w-3 h-3 rounded-full animate-ping absolute inset-0 ${
                        activeSpeakerInfo.gender === 'Female' ? 'bg-rose-500' : 'bg-cyan-500'
                      }`} />
                      <div className={`w-3 h-3 rounded-full relative ${
                        activeSpeakerInfo.gender === 'Female' ? 'bg-rose-500' : 'bg-cyan-500'
                      }`} />
                    </div>
                    <span className="text-xs font-black text-white uppercase tracking-wider">
                      Speaking:{' '}
                      <span className={activeSpeakerInfo.gender === 'Female' ? 'text-rose-400' : 'text-cyan-400'}>
                        {activeSpeakerInfo.name}
                      </span>
                    </span>
                  </div>
                )}

                <div className="pt-1">
                  {currentEpisode.authorLocked ? (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                      <MicOff className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">Author Locked Cast</span>
                    </div>
                  ) : (
                    <VoiceSelector
                      selectedVoice={selectedVoiceProfile}
                      onSelectVoice={setSelectedVoiceProfile}
                      variant="compact"
                      label="Narrator"
                    />
                  )}
                </div>

                {showProgressMap ? (
                  <ChapterProgressMap
                    beats={chapterBeats}
                    currentTime={currentTime}
                    duration={duration}
                    onSeek={seekPlayer}
                    onCollapse={() => setShowProgressMap(false)}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowProgressMap(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-orange-500/15 border border-white/10 hover:border-orange-400/40 text-xs font-bold text-white/80 hover:text-orange-300 transition-all"
                  >
                    <MapIcon className="w-3.5 h-3.5 text-orange-400" />
                    <span>Show Chapter Progress Map ({chapterBeats.length} Plot Beats)</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {isDrawerOpen && (
            <aside className="w-full sm:w-96 bg-slate-950 border-l border-white/10 flex flex-col h-full animate-in slide-in-from-right duration-500 z-30">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="font-black text-lg text-white uppercase tracking-wider">Chapter List</h4>
                  <p className="text-xs text-slate-500 font-bold mt-0.5">{currentStory.title}</p>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2 rounded-full hover:bg-white/5 text-slate-400"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {currentStory.episodes.map((ep: Episode) => {
                  const isCurrent = ep.id === currentEpisode.id;
                  const unlocked = isEpisodeUnlocked(ep);
                  return (
                    <button
                      key={ep.id}
                      onClick={() => unlocked ? playEpisode(currentStory, ep, true) : openUnlockPrompt(ep, currentStory)}
                      className={`w-full p-4 rounded-2xl flex items-center justify-between gap-4 transition-all text-left ${
                        isCurrent ? 'bg-orange-500 text-slate-950 scale-[1.02] shadow-xl shadow-orange-500/20' : 'hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <span className={`text-xs font-black w-6 ${isCurrent ? 'text-slate-950' : 'text-slate-600'}`}>{ep.episodeNumber}</span>
                        <div className="min-w-0">
                          <h5 className="text-sm font-black truncate">{ep.title}</h5>
                          <span className={`text-[10px] font-bold ${isCurrent ? 'text-slate-900/60' : 'text-slate-500'}`}>{Math.ceil(ep.durationSeconds / 60)} MIN AUDIO</span>
                        </div>
                      </div>
                      {!unlocked && <Lock className="w-3.5 h-3.5 text-orange-500/50" />}
                      {unlocked && isCurrent && isPlaying && (
                        <div className="flex items-center gap-0.5 h-3">
                          <span className="w-0.5 bg-slate-950 h-2 animate-audio-bar-1 rounded-full" />
                          <span className="w-0.5 bg-slate-950 h-3 animate-audio-bar-2 rounded-full" />
                          <span className="w-0.5 bg-slate-950 h-1.5 animate-audio-bar-3 rounded-full" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </aside>
          )}

          {isCommentsOpen && (
            <aside className="w-full sm:w-96 h-full z-30 animate-in slide-in-from-right duration-500 border-l border-white/10 bg-slate-950/60 backdrop-blur-3xl">
              <CommentSection episodeId={currentEpisode.id} authorId={currentStory.authorId} />
            </aside>
          )}
        </div>

        <footer className="px-6 py-4 sm:px-10 sm:py-6 bg-gradient-to-t from-black to-black/70 border-t border-white/5 space-y-4 z-10 backdrop-blur-xl">
          <div className="max-w-3xl mx-auto w-full group/scrub space-y-2">
            <ChapterScrubberMarkers
              beats={chapterBeats}
              currentTime={currentTime}
              duration={duration}
              onSeek={seekPlayer}
            />
            <div className="flex justify-between text-[11px] font-black text-white/40 tabular-nums uppercase tracking-widest mb-1.5">
              <span>{formatTime(currentTime)}</span>
              <span className="text-white/80">{formatTime(duration)}</span>
            </div>
            <div className="relative h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)] transition-all"
                style={{ width: `${progressPercent}%` }}
              />
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.5"
                value={currentTime}
                onChange={handleSeekChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
            </div>
          </div>

          <div className="flex items-center justify-between max-w-2xl mx-auto w-full">
            <div className="relative">
              <button
                onClick={() => { setShowSpeedMenu(!showSpeedMenu); setShowTimerMenu(false); }}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/10"
                title="Speed"
              >
                <Gauge className="w-5 h-5 text-orange-500" />
              </button>
              {showSpeedMenu && (
                <div className="absolute bottom-14 left-0 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl z-30 min-w-[100px] animate-in slide-in-from-bottom-2">
                  {speedOptions.map(rate => (
                    <button
                      key={rate}
                      onClick={() => { setPlayerRate(rate); setShowSpeedMenu(false); }}
                      className={`w-full px-4 py-2 text-xs font-black rounded-xl text-left transition-all ${
                        playbackRate === rate ? 'bg-orange-500 text-slate-950' : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {rate}X
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-6 sm:gap-10">
              <button onClick={() => skipPlayer(-10)} className="text-white/60 hover:text-white transition-all transform active:scale-90"><RotateCcw className="w-6 h-6" /></button>
              <button onClick={playPrevEpisode} className="text-white/80 hover:text-white transition-all transform active:scale-90"><SkipBack className="w-7 h-7 fill-current" /></button>
              
              <button
                onClick={togglePlayPause}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.2)] transform hover:scale-105 active:scale-90 transition-all border-[6px] border-white/10"
              >
                {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-1" />}
              </button>

              <button onClick={playNextEpisode} className="text-white/80 hover:text-white transition-all transform active:scale-90"><SkipForward className="w-7 h-7 fill-current" /></button>
              <button onClick={() => skipPlayer(10)} className="text-white/60 hover:text-white transition-all transform active:scale-90"><RotateCw className="w-6 h-6" /></button>
            </div>

            <div className="relative">
              <button
                onClick={() => { setShowTimerMenu(!showTimerMenu); setShowSpeedMenu(false); }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${
                  sleepTimerRemaining ? 'bg-orange-500 border-orange-400 text-slate-950' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                }`}
                title="Timer"
              >
                <Clock className="w-5 h-5" />
              </button>
              {showTimerMenu && (
                <div className="absolute bottom-14 right-0 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl z-30 min-w-[140px] animate-in slide-in-from-bottom-2">
                  {timerOptions.map(opt => (
                    <button
                      key={opt.label}
                      onClick={() => { setSleepTimerOption(opt.value); setShowTimerMenu(false); }}
                      className={`w-full px-4 py-2 text-xs font-black rounded-xl text-left transition-all ${
                        sleepTimer === opt.value ? 'bg-orange-500 text-slate-950' : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </footer>
      </div>

      <AudioMixerPanel isOpen={isMixerOpen} onClose={() => setIsMixerOpen(false)} />
    </div>
  );
};
