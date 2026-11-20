import React, { useState, useMemo } from 'react';
import {
  Mic,
  Volume2,
  Check,
  Search,
  ChevronDown,
  Sparkles,
  Sliders,
  X,
  Globe
} from 'lucide-react';
import { VoiceProfile, VoiceGender } from '../types';
import { VOICE_PROFILES, TONE_CATEGORIES, LANGUAGES } from '../data/voiceData';
import { useApp } from '../context/AppContext';

export interface VoiceSelectorProps {
  selectedVoice: VoiceProfile;
  onSelectVoice: (voice: VoiceProfile) => void;
  label?: string;
  variant?: 'full' | 'compact' | 'dropdown' | 'bar';
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onSelectVoice,
  label = 'AI Voice Character',
  variant = 'full'
}) => {
  const { previewVoice, activePreviewVoiceId } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'All' | VoiceGender>('All');
  const [toneFilter, setToneFilter] = useState<string>('All Tones');
  const [languageFilter, setLanguageFilter] = useState<string>('All Languages');

  // Filtered voice list for the modal gallery
  const filteredVoices = useMemo(() => {
    return VOICE_PROFILES.filter(voice => {
      const matchesGender = genderFilter === 'All' || voice.gender === genderFilter;
      const matchesTone = toneFilter === 'All Tones' || voice.tone === toneFilter;
      const matchesLanguage = languageFilter === 'All Languages' || voice.language === languageFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        voice.name.toLowerCase().includes(q) ||
        voice.nativeName.toLowerCase().includes(q) ||
        voice.tone.toLowerCase().includes(q) ||
        voice.accentRegion.toLowerCase().includes(q) ||
        voice.description.toLowerCase().includes(q) ||
        voice.recommendedFor.toLowerCase().includes(q);

      return matchesGender && matchesTone && matchesLanguage && matchesSearch;
    });
  }, [genderFilter, toneFilter, languageFilter, searchQuery]);

  const maleVoices = useMemo(() => VOICE_PROFILES.filter(v => v.gender === 'Male'), []);
  const femaleVoices = useMemo(() => VOICE_PROFILES.filter(v => v.gender === 'Female'), []);

  const handleSelect = (voice: VoiceProfile) => {
    onSelectVoice(voice);
    setIsOpen(false);
  };

  const handleNativeSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const voiceId = e.target.value;
    const voice = VOICE_PROFILES.find(v => v.id === voiceId);
    if (voice) {
      onSelectVoice(voice);
    }
  };

  const isTestingThisVoice = (voiceId: string) => activePreviewVoiceId === voiceId;

  if (variant === 'compact' || variant === 'bar') {
    return (
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <div className="flex items-center gap-1.5 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700/80 text-slate-200 shadow-sm">
          <Mic className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          <span className="text-slate-400 font-medium hidden sm:inline">Voice:</span>
          
          <select
            value={selectedVoice.id}
            onChange={handleNativeSelectChange}
            className="bg-transparent text-slate-100 font-medium outline-none text-xs cursor-pointer max-w-[170px] sm:max-w-[210px] truncate"
            title="Choose from 70+ Voices"
          >
            {LANGUAGES.map(lang => (
              <optgroup key={`opt-lang-${lang}`} label={`${lang} Voices`}>
                {VOICE_PROFILES.filter(v => v.language === lang).map(v => (
                  <option key={`bar-v-${v.id}`} value={v.id} className="bg-slate-900 text-white">
                    {v.name} · {v.tone}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => previewVoice(selectedVoice)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-colors ${
            isTestingThisVoice(selectedVoice.id)
              ? 'bg-orange-500 text-white border-orange-400 font-bold'
              : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-orange-400'
          }`}
          title="Listen to sample audio"
        >
          <Volume2 className={`w-3.5 h-3.5 ${isTestingThisVoice(selectedVoice.id) ? 'animate-pulse' : ''}`} />
          <span>{isTestingThisVoice(selectedVoice.id) ? 'Playing...' : 'Test'}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 transition-colors"
          title="Browse all 70+ Voice Talent Gallery"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Browse 70+ Voices</span>
        </button>

        {isOpen && renderVoiceModal()}
      </div>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <select
            value={selectedVoice.id}
            onChange={handleNativeSelectChange}
            className="w-full bg-slate-950/80 border border-slate-700/80 text-white text-xs rounded-xl px-3 py-2 outline-none focus:border-orange-500 cursor-pointer"
          >
            {LANGUAGES.map(lang => (
              <optgroup key={`dd-lang-${lang}`} label={lang}>
                {VOICE_PROFILES.filter(v => v.language === lang).map(v => (
                  <option key={`dd-v-${v.id}`} value={v.id} className="bg-slate-900 text-white">
                    {v.name} · {v.tone}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => previewVoice(selectedVoice)}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-orange-500"
          title="Test Voice Sample"
        >
          <Volume2 className={`w-3.5 h-3.5 ${isTestingThisVoice(selectedVoice.id) ? 'animate-pulse' : ''}`} />
        </button>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400"
          title="Open Voice Gallery"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>

        {isOpen && renderVoiceModal()}
      </div>
    );
  }

  return (
    <div className="relative w-full space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
        <span className="flex items-center gap-1.5">
          <Mic className="w-3.5 h-3.5 text-orange-500" />
          <span>{label}</span>
          <span className="text-[10px] text-orange-500/90 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
            70+ Multi-lingual Voices
          </span>
        </span>
        <span className="text-slate-400 text-[11px]">
          {selectedVoice.language} · {selectedVoice.gender}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <div className="relative">
          <select
            value={selectedVoice.id}
            onChange={handleNativeSelectChange}
            className="w-full bg-slate-950/90 hover:bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-medium outline-none focus:border-orange-500 cursor-pointer shadow-sm"
          >
            {LANGUAGES.map(lang => (
              <optgroup key={`full-lang-${lang}`} label={lang}>
                {VOICE_PROFILES.filter(v => v.language === lang).map(v => (
                  <option key={`full-v-${v.id}`} value={v.id} className="bg-slate-900 text-white">
                    {v.name} — {v.tone}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-md ${
                selectedVoice.gender === 'Female'
                  ? 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-rose-500/20'
                  : 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white shadow-cyan-500/20'
              }`}
            >
              {selectedVoice.nativeName.slice(0, 2)}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-sm text-white truncate">
                  {selectedVoice.name}
                </h4>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                    selectedVoice.gender === 'Female'
                      ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  }`}
                >
                  {selectedVoice.gender}
                </span>
                <span className="text-[10px] text-orange-400 font-medium bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20">
                  {selectedVoice.language}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {selectedVoice.tone} · {selectedVoice.accentRegion}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => previewVoice(selectedVoice)}
              className="px-3 py-1.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Test voice speech"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isTestingThisVoice(selectedVoice.id) ? 'animate-pulse text-orange-500' : ''}`} />
              <span className="hidden sm:inline">
                {isTestingThisVoice(selectedVoice.id) ? 'Speaking...' : 'Test'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>Browse (70+)</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {isOpen && renderVoiceModal()}
    </div>
  );

  function renderVoiceModal() {
    return (
      <div 
        className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
        onClick={() => setIsOpen(false)}
      >
        <div 
          className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/90 space-y-4 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Global Voice Library</h3>
                  <p className="text-xs text-slate-400">Discover 70+ premium quality voices across 11 languages.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search voices, tones, or accents..."
                  className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none"
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                {['All Languages', ...LANGUAGES].map((lang) => (
                  <button
                    key={`lang-filter-${lang}`}
                    onClick={() => setLanguageFilter(lang)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                      languageFilter === lang
                        ? 'bg-orange-500 text-white border-orange-400'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
               <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
                {(['All', 'Male', 'Female'] as const).map(g => (
                  <button
                    key={`gen-filter-${g}`}
                    onClick={() => setGenderFilter(g)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      genderFilter === g
                        ? 'bg-slate-800 text-orange-500 shadow-sm'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
              <div className="flex-1 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                {TONE_CATEGORIES.map(tone => (
                  <button
                    key={`tone-filter-${tone}`}
                    onClick={() => setToneFilter(tone)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap border transition-all ${
                      toneFilter === tone
                        ? 'bg-slate-800 text-orange-500 border-orange-500/30'
                        : 'bg-transparent text-slate-500 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
            {filteredVoices.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center">
                <Search className="w-12 h-12 text-slate-700 mb-3" />
                <p className="text-slate-500">No voices found matching your search filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredVoices.map((voice) => {
                  const isSelected = selectedVoice.id === voice.id;
                  const isSpeaking = isTestingThisVoice(voice.id);

                  return (
                    <div
                      key={`modal-v-${voice.id}`}
                      onClick={() => handleSelect(voice)}
                      className={`group relative p-4 rounded-2xl cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-orange-500/10 border-orange-500/50'
                          : 'bg-slate-850 border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                            voice.gender === 'Female'
                              ? 'bg-gradient-to-br from-rose-500 to-pink-600 text-white'
                              : 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white'
                          }`}
                        >
                          {voice.nativeName.slice(0, 2)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-white group-hover:text-orange-400 transition-colors">
                              {voice.name}
                            </h4>
                            {isSelected && <Check className="w-4 h-4 text-orange-500" />}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 uppercase">
                              {voice.language}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                              {voice.tone}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                            {voice.description}
                          </p>
                          
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                previewVoice(voice);
                              }}
                              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                                isSpeaking
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              }`}
                            >
                              <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'animate-pulse' : ''}`} />
                              {isSpeaking ? 'Speaking...' : 'Test Sample'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSelect(voice)}
                              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                                isSelected
                                  ? 'bg-transparent text-orange-500 border border-orange-500/30'
                                  : 'bg-orange-500 text-white hover:bg-orange-400'
                              }`}
                            >
                              {isSelected ? 'Current' : 'Select Voice'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
};
