import React, { useState } from 'react';
import {
  Sliders,
  Volume2,
  VolumeX,
  Music,
  Mic,
  Sparkles,
  Zap,
  RotateCcw,
  Play,
  Check,
  X,
  Radio,
  CloudRain,
  Flame,
  ShieldAlert,
  Heart,
  Skull
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BGM_TRACKS } from '../data/bgmTracks';
import { BgmMood } from '../types';
import { SoundscapeSelectorPanel } from './SoundscapeSelectorPopover';

interface AudioMixerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: 'modal' | 'embedded';
}

export const AudioMixerPanel: React.FC<AudioMixerPanelProps> = ({
  isOpen,
  onClose,
  variant = 'modal'
}) => {
  const {
    mixerState,
    setVoiceVolume,
    setBgmVolume,
    setBgmMood,
    setDuckingEnabled,
    playSfx,
    ambientBgmEnabled,
    toggleAmbientBgm
  } = useApp();

  const [previewingTrackId, setPreviewingTrackId] = useState<string | null>(null);

  if (!isOpen && variant === 'modal') return null;

  const handleTrackSelect = (moodId: BgmMood) => {
    setBgmMood(moodId);
  };

  const currentTrack = BGM_TRACKS.find(t => t.id === mixerState.activeBgmMood) || BGM_TRACKS[0];
  const detectedTrack = BGM_TRACKS.find(t => t.id === mixerState.detectedMood) || BGM_TRACKS[1];

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-500 flex items-center justify-center text-slate-950">
            <Sliders className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>Audio Settings & Mixing</span>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
                Real-Time WebAudio
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Balance narration voice, cinematic music, and dynamic auto-ducking
            </p>
          </div>
        </div>

        {variant === 'modal' && (
          <button
            onClick={onClose}
            aria-label="Close mixer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Dual Channel Sliders: Voice vs BGM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Channel 1: AI Voice Narration */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Voice Narration Channel</h4>
                <p className="text-[10px] text-slate-400">Hindi dialogue & story narration</p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-400 tabular-nums">
              {Math.round(mixerState.voiceVolume * 100)}%
            </span>
          </div>

          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={mixerState.voiceVolume}
              onChange={e => setVoiceVolume(parseFloat(e.target.value))}
              className="w-full accent-amber-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px]">
            <button
              onClick={() => setVoiceVolume(mixerState.voiceVolume === 0 ? 1 : 0)}
              className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              {mixerState.voiceVolume === 0 ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{mixerState.voiceVolume === 0 ? 'Unmute Voice' : 'Mute Voice'}</span>
            </button>
            <button
              onClick={() => setVoiceVolume(1.0)}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300"
            >
              Reset 100%
            </button>
          </div>
        </div>

        {/* Channel 2: Background Music (BGM) */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Music className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Cinematic Music (BGM)</h4>
                <p className="text-[10px] text-slate-400">Atmospheric soundtrack & drones</p>
              </div>
            </div>
            <span className="text-xs font-bold text-indigo-400 tabular-nums">
              {Math.round(mixerState.bgmVolume * 100)}%
            </span>
          </div>

          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={mixerState.bgmVolume}
              onChange={e => setBgmVolume(parseFloat(e.target.value))}
              className="w-full accent-indigo-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px]">
            <button
              onClick={() => setBgmVolume(mixerState.bgmVolume === 0 ? 0.35 : 0)}
              className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              {mixerState.bgmVolume === 0 ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{mixerState.bgmVolume === 0 ? 'Unmute BGM' : 'Mute BGM'}</span>
            </button>
            <button
              onClick={() => setBgmVolume(0.35)}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              Cinema Balance (35%)
            </button>
          </div>
        </div>
      </div>

      {/* Smart Voice Clarity Ducking Option */}
      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-white">Auto-Ducking Voice Clarity</h5>
            <p className="text-[11px] text-slate-400">
              Lowers background music by 50% while actors speak, swelling up during dramatic pauses
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDuckingEnabled(!mixerState.duckingEnabled)}
          className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${
            mixerState.duckingEnabled ? 'bg-amber-500' : 'bg-slate-800'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
              mixerState.duckingEnabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Ambient Background Soundscape Layering (Rain, Cafe, Cyberpunk City, etc.) */}
      <div className="p-4 rounded-2xl bg-slate-950/70 border border-cyan-500/20">
        <SoundscapeSelectorPanel />
      </div>

      {/* Cinematic BGM Track Selection Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5 text-amber-400" />
            <span>Soundtrack Atmosphere (Auto & Curated Themes)</span>
          </label>
          {mixerState.activeBgmMood === 'auto' && (
            <span className="text-[10px] text-amber-400 font-semibold bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full">
              Detected: {detectedTrack.name.split(' (')[0]}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
          {BGM_TRACKS.map(track => {
            const isSelected = mixerState.activeBgmMood === track.id;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => handleTrackSelect(track.id)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-400 text-white ring-1 ring-amber-400/30'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold truncate text-white">
                      {track.name.split(' (')[0]}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 font-medium">
                    {track.badge}
                  </span>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-1">
                    {track.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cinematic Sound FX Trigger Buttons */}
      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive Cinematic Sound Effects (SFX)</span>
          </span>
          <span className="text-[10px] text-slate-500">Click to audition in real-time</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <button
            type="button"
            onClick={() => playSfx('heartbeat')}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>Heartbeat</span>
          </button>
          <button
            type="button"
            onClick={() => playSfx('thunder')}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
            <span>Thunder</span>
          </button>
          <button
            type="button"
            onClick={() => playSfx('suspense_hit')}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Suspense Hit</span>
          </button>
          <button
            type="button"
            onClick={() => playSfx('chime')}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Crystal Chime</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (variant === 'embedded') {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {content}
      </div>
    </div>
  );
};
