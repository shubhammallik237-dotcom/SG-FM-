import React from 'react';
import {
  CloudRain,
  Coffee,
  Building2,
  Trees,
  Flame,
  Waves,
  VolumeX,
  Volume2,
  Check,
  X,
  Sparkles
} from 'lucide-react';
import { AMBIENT_SOUNDSCAPES } from '../data/bgmTracks';
import { AmbientSoundscapeId } from '../types';
import { useApp } from '../context/AppContext';

interface SoundscapeSelectorPanelProps {
  onClose?: () => void;
  compact?: boolean;
}

const SOUNDSCAPE_ICONS: Record<AmbientSoundscapeId, React.ReactNode> = {
  none: <VolumeX className="w-4 h-4 text-slate-400" />,
  rain: <CloudRain className="w-4 h-4 text-cyan-400" />,
  cafe: <Coffee className="w-4 h-4 text-amber-400" />,
  cyberpunk: <Building2 className="w-4 h-4 text-fuchsia-400" />,
  forest: <Trees className="w-4 h-4 text-emerald-400" />,
  fireplace: <Flame className="w-4 h-4 text-orange-400" />,
  ocean: <Waves className="w-4 h-4 text-sky-400" />
};

export const SoundscapeSelectorPanel: React.FC<SoundscapeSelectorPanelProps> = ({
  onClose,
  compact = false
}) => {
  const { mixerState, setAmbientSoundscape, setAmbientVolume } = useApp();
  const activeId = mixerState.ambientSoundscape;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/10">
        <div>
          <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Ambient Soundscape Layer</span>
          </h4>
          <p className="text-[11px] text-slate-400">
            Layer real-time background atmosphere over your story
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close soundscapes"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Soundscape Options Grid */}
      <div className={`grid gap-2 ${compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
        {AMBIENT_SOUNDSCAPES.map(opt => {
          const isSelected = activeId === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setAmbientSoundscape(opt.id)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                isSelected
                  ? 'bg-orange-500/20 border-orange-400 text-white shadow-lg shadow-orange-500/10'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-1.5">
                <div className="w-7 h-7 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center shrink-0">
                  {SOUNDSCAPE_ICONS[opt.id]}
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-orange-400 shrink-0" />}
              </div>

              <div>
                <div className="text-xs font-bold text-white truncate">{opt.shortLabel}</div>
                <div className="text-[10px] text-slate-400 line-clamp-1">{opt.badge}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Independent Ambient Layer Volume */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-orange-400" />
            <span>Ambience Blend Level</span>
          </span>
          <span className="font-black text-orange-400 tabular-nums">
            {Math.round(mixerState.ambientVolume * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={mixerState.ambientVolume}
          onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
          aria-label="Ambient soundscape volume"
          className="w-full accent-orange-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />
      </div>
    </div>
  );
};
