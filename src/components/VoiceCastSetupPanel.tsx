import React, { useState } from 'react';
import {
  Users,
  Mic,
  Volume2,
  Play,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Info,
  CheckCircle2,
  Layers,
  Tag,
  Globe
} from 'lucide-react';
import { VoiceProfile, VoiceCastConfig, VoiceRole } from '../types';
import { VOICE_PROFILES, LANGUAGES } from '../data/voiceData';
import { VoiceSelector } from './VoiceSelector';
import { useApp } from '../context/AppContext';

interface VoiceCastSetupPanelProps {
  cast: VoiceCastConfig;
  onUpdateCast: (cast: VoiceCastConfig) => void;
  onInsertTag?: (tag: string) => void;
}

export const VoiceCastSetupPanel: React.FC<VoiceCastSetupPanelProps> = ({
  cast,
  onUpdateCast,
  onInsertTag
}) => {
  const { previewVoice, previewMultiVoiceCast, activePreviewVoiceId } = useApp();
  
  // Filter voices by gender
  const maleVoices = VOICE_PROFILES.filter(v => v.gender === 'Male');
  const femaleVoices = VOICE_PROFILES.filter(v => v.gender === 'Female');

  const handlePreviewNarrator = () => {
    previewVoice(cast.narrator);
  };

  const handlePreviewMale = () => {
    previewVoice(cast.maleLead);
  };

  const handlePreviewFemale = () => {
    previewVoice(cast.femaleLead);
  };

  const handleTestTrio = () => {
    previewMultiVoiceCast(cast);
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-4 sm:p-5 space-y-4">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Scene-Based Multi-Voice Cast</span>
              <span className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                Auto Voice-Switching Active
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Assign dedicated actors for Narrator, Male Lead, and Female Lead dialogues across 70+ voices
            </p>
          </div>
        </div>

        {/* Demo Test Button */}
        <button
          type="button"
          onClick={handleTestTrio}
          className="px-3.5 py-1.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/40 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Play className="w-3.5 h-3.5 fill-orange-400" />
          <span>Demo Multi-Voice Cast</span>
        </button>
      </div>

      {/* Cast Setup Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Role 1: Narrator Voice */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-orange-500/20 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-orange-400 flex items-center gap-1">
                <Mic className="w-3.5 h-3.5" />
                <span>1. Narrator</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-400/10 text-orange-300 font-mono">
                [Narrator]
              </span>
            </div>
            
            <div className="relative mt-2">
              <select
                value={cast.narrator.id}
                onChange={e => {
                  const found = VOICE_PROFILES.find(v => v.id === e.target.value);
                  if (found) onUpdateCast({ ...cast, narrator: found });
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium outline-none focus:border-orange-400 appearance-none"
              >
                {LANGUAGES.map(lang => (
                  <optgroup key={`n-lang-${lang}`} label={lang}>
                    {VOICE_PROFILES.filter(v => v.language === lang).map(v => (
                      <option key={`narrator-opt-${v.id}`} value={v.id}>
                        {v.name} ({v.gender}, {v.tone})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
            <span className="text-slate-400 truncate max-w-[130px]">
              {cast.narrator.language} · {cast.narrator.tone}
            </span>
            <button
              type="button"
              onClick={handlePreviewNarrator}
              className="text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1 text-[11px]"
            >
              <Volume2 className="w-3 h-3" />
              <span>Preview</span>
            </button>
          </div>
        </div>

        {/* Role 2: Male Character Voice */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-cyan-500/20 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>2. Male Lead</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-400/10 text-cyan-300 font-mono">
                [Male]
              </span>
            </div>
            
            <div className="relative mt-2">
              <select
                value={cast.maleLead.id}
                onChange={e => {
                  const found = maleVoices.find(v => v.id === e.target.value);
                  if (found) onUpdateCast({ ...cast, maleLead: found });
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium outline-none focus:border-cyan-400 appearance-none"
              >
                {LANGUAGES.map(lang => (
                  <optgroup key={`m-lang-${lang}`} label={lang}>
                    {maleVoices.filter(v => v.language === lang).map(v => (
                      <option key={`male-opt-${v.id}`} value={v.id}>
                        {v.name} ({v.tone})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
            <span className="text-slate-400 truncate max-w-[130px]">
              {cast.maleLead.language} · {cast.maleLead.tone}
            </span>
            <button
              type="button"
              onClick={handlePreviewMale}
              className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 text-[11px]"
            >
              <Volume2 className="w-3 h-3" />
              <span>Preview</span>
            </button>
          </div>
        </div>

        {/* Role 3: Female Character Voice */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-rose-500/20 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>3. Female Lead</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-400/10 text-rose-300 font-mono">
                [Female]
              </span>
            </div>
            
            <div className="relative mt-2">
              <select
                value={cast.femaleLead.id}
                onChange={e => {
                  const found = femaleVoices.find(v => v.id === e.target.value);
                  if (found) onUpdateCast({ ...cast, femaleLead: found });
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium outline-none focus:border-rose-400 appearance-none"
              >
                {LANGUAGES.map(lang => (
                  <optgroup key={`f-lang-${lang}`} label={lang}>
                    {femaleVoices.filter(v => v.language === lang).map(v => (
                      <option key={`female-opt-${v.id}`} value={v.id}>
                        {v.name} ({v.tone})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
            <span className="text-slate-400 truncate max-w-[130px]">
              {cast.femaleLead.language} · {cast.femaleLead.tone}
            </span>
            <button
              type="button"
              onClick={handlePreviewFemale}
              className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 text-[11px]"
            >
              <Volume2 className="w-3 h-3" />
              <span>Preview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Tagging Guide & Insert Shortcuts */}
      <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-orange-500 shrink-0" />
          <span className="text-slate-300 text-[11px]">
            <strong className="text-white">Smart Voice Tagging:</strong> Tag dialogue lines as <code className="text-cyan-300 bg-cyan-950/60 px-1 py-0.5 rounded">[Male]</code> or <code className="text-rose-300 bg-rose-950/60 px-1 py-0.5 rounded">[Female]</code> to auto-switch voices seamlessly!
          </span>
        </div>

        {onInsertTag && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500">Insert Tag:</span>
            <button
              type="button"
              onClick={() => onInsertTag('[Male] ')}
              className="px-2 py-1 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px] font-semibold hover:bg-cyan-500/25"
            >
              + [Male]
            </button>
            <button
              type="button"
              onClick={() => onInsertTag('[Female] ')}
              className="px-2 py-1 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] font-semibold hover:bg-rose-500/25"
            >
              + [Female]
            </button>
            <button
              type="button"
              onClick={() => onInsertTag('[Narrator] ')}
              className="px-2 py-1 rounded bg-orange-500/15 text-orange-300 border border-orange-500/30 text-[10px] font-semibold hover:bg-orange-500/25"
            >
              + [Narrator]
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
