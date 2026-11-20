/**
 * SGFM Real Audio, Speech Synthesis & Dynamic BGM Engine
 * Enhanced with 70+ Multi-lingual Voice Characters, scene-based dynamic multi-voice switching,
 * procedural Web Audio API multi-genre cinematic soundtrack engine (Romance, Horror, Thriller, Sad, Action, Mystical, Rain),
 * auto-BGM mood detection, audio ducking, and dual-channel Voice & BGM Audio Mixer.
 */

import { VoiceProfile, VoiceRole, VoiceCastConfig, DialogueSegment, ActiveSpeakerInfo, BgmMood, AudioMixerState, AmbientSoundscapeId } from '../types';
import { VOICE_PROFILES, HINDI_VOICES, DEFAULT_HINDI_VOICE, LANGUAGES } from '../data/voiceData';
import { detectMoodFromText } from '../data/bgmTracks';

type BoundaryCallback = (charIndex: number, textLength: number, sentenceText: string) => void;
type TimeUpdateCallback = (currentTime: number, duration: number) => void;
type StateChangeCallback = (isPlaying: boolean, isEnded: boolean) => void;
type SpeakerChangeCallback = (info: ActiveSpeakerInfo) => void;
type MoodChangeCallback = (mood: BgmMood, isAuto: boolean) => void;
type MixerChangeCallback = (mixer: AudioMixerState) => void;

export const DEFAULT_VOICE_CAST: VoiceCastConfig = {
  narrator: VOICE_PROFILES.find(v => v.id === 'hi-m-kabir') || DEFAULT_HINDI_VOICE,
  maleLead: VOICE_PROFILES.find(v => v.id === 'hi-m-aarav') || VOICE_PROFILES[2],
  femaleLead: VOICE_PROFILES.find(v => v.id === 'hi-f-ananya') || VOICE_PROFILES[21]
};

const LANG_TO_BCP47: Record<string, string> = {
  'Hindi': 'hi-IN',
  'Bengali': 'bn-IN',
  'Tamil': 'ta-IN',
  'Telugu': 'te-IN',
  'Marathi': 'mr-IN',
  'Odia': 'or-IN',
  'Gujarati': 'gu-IN',
  'Kannada': 'kn-IN',
  'Malayalam': 'ml-IN',
  'Punjabi': 'pa-IN',
  'English': 'en-IN'
};

/**
 * Detects the language of the text based on script characters.
 */
export function detectLanguageFromText(text: string): string {
  // Simple heuristic based on unicode ranges
  if (/[\u0900-\u097F]/.test(text)) return 'Hindi';
  if (/[\u0980-\u09FF]/.test(text)) return 'Bengali';
  if (/[\u0B80-\u0BFF]/.test(text)) return 'Tamil';
  if (/[\u0C00-\u0C7F]/.test(text)) return 'Telugu';
  if (/[\u0D00-\u0D7F]/.test(text)) return 'Malayalam';
  if (/[\u0C80-\u0CFF]/.test(text)) return 'Kannada';
  if (/[\u0B00-\u0B7F]/.test(text)) return 'Odia';
  if (/[\u0A00-\u0A7F]/.test(text)) return 'Punjabi';
  if (/[\u0A80-\u0AFF]/.test(text)) return 'Gujarati';
  
  // Default to Hindi if it looks like Romanized Hindi, or English if standard Latin
  return 'Hindi'; 
}

/**
 * Parses chapter text into scene-based dialogue segments tagged with [Male], [Female], [Narrator],
 * and extracts [BGM: mood] and [SFX: sound] cues while cleaning spoken text.
 */
export function parseDialogueSegments(
  text: string,
  cast: VoiceCastConfig = DEFAULT_VOICE_CAST
): DialogueSegment[] {
  const segments: DialogueSegment[] = [];
  const tagRegex = /\[(Male|Female|Narrator|M|F|N)(?::\s*([^\]]+))?\]/gi;

  const extractCues = (rawChunk: string) => {
    let bgmTrigger: BgmMood | undefined = undefined;
    let sfxTrigger: string | undefined = undefined;

    const bgmMatch = rawChunk.match(/\[(?:BGM|Music|Mood):\s*([a-zA-Z_-]+)\]/i);
    if (bgmMatch) {
      bgmTrigger = bgmMatch[1].toLowerCase() as BgmMood;
    }

    const sfxMatch = rawChunk.match(/\[(?:SFX):\s*([a-zA-Z_-]+)\]/i);
    if (sfxMatch) {
      sfxTrigger = sfxMatch[1].toLowerCase();
    }

    // Clean out BGM, SFX, and markdown formatting tags from spoken text
    const cleanedText = rawChunk
      .replace(/\[(?:BGM|Music|Mood|SFX):[^\]]+\]/gi, '')
      .replace(/[*_#]/g, '')
      .trim();

    return { cleanedText, bgmTrigger, sfxTrigger };
  };

  if (!tagRegex.test(text)) {
    const { cleanedText, bgmTrigger, sfxTrigger } = extractCues(text);
    return [{
      speakerRole: 'Narrator',
      speakerName: cast.narrator.name,
      text: cleanedText,
      voiceProfile: cast.narrator,
      startCharIndex: 0,
      endCharIndex: text.length,
      bgmTrigger,
      sfxTrigger
    }];
  }

  tagRegex.lastIndex = 0;
  let lastIndex = 0;
  let currentRole: VoiceRole = 'Narrator';
  let currentName: string = cast.narrator.name;
  let currentProfile: VoiceProfile = cast.narrator;

  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(text)) !== null) {
    const tagStart = match.index;
    const tagEnd = tagRegex.lastIndex;
    const rawRole = match[1].toLowerCase();
    const customName = match[2]?.trim();

    if (tagStart > lastIndex) {
      const rawChunk = text.slice(lastIndex, tagStart);
      const { cleanedText, bgmTrigger, sfxTrigger } = extractCues(rawChunk);
      if (cleanedText.length > 0) {
        segments.push({
          speakerRole: currentRole,
          speakerName: currentName,
          text: cleanedText,
          voiceProfile: currentProfile,
          startCharIndex: lastIndex,
          endCharIndex: tagStart,
          bgmTrigger,
          sfxTrigger
        });
      }
    }

    if (rawRole === 'male' || rawRole === 'm') {
      currentRole = 'Male';
      currentName = customName || cast.maleLead.name;
      currentProfile = cast.maleLead;
    } else if (rawRole === 'female' || rawRole === 'f') {
      currentRole = 'Female';
      currentName = customName || cast.femaleLead.name;
      currentProfile = cast.femaleLead;
    } else {
      currentRole = 'Narrator';
      currentName = customName || cast.narrator.name;
      currentProfile = cast.narrator;
    }

    lastIndex = tagEnd;
  }

  if (lastIndex < text.length) {
    const rawChunk = text.slice(lastIndex);
    const { cleanedText, bgmTrigger, sfxTrigger } = extractCues(rawChunk);
    if (cleanedText.length > 0) {
      segments.push({
        speakerRole: currentRole,
        speakerName: currentName,
        text: cleanedText,
        voiceProfile: currentProfile,
        startCharIndex: lastIndex,
        endCharIndex: text.length,
        bgmTrigger,
        sfxTrigger
      });
    }
  }

  return segments.length > 0 ? segments : [{
    speakerRole: 'Narrator',
    speakerName: cast.narrator.name,
    text: text.replace(/\[(?:BGM|Music|Mood|SFX):[^\]]+\]/gi, '').replace(/[*_#]/g, '').trim(),
    voiceProfile: cast.narrator,
    startCharIndex: 0,
    endCharIndex: text.length
  }];
}

class AudioEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  
  // Web Audio Context & Multi-Node Routing
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bgmFilter: BiquadFilterNode | null = null;
  private activeSoundscapeNodes: (AudioNode | { stop?: () => void; disconnect: () => void })[] = [];
  private activeAmbientLayerNodes: (AudioNode | { stop?: () => void; disconnect: () => void })[] = [];
  private ambientLayerInterval: number | null = null;
  
  // Dynamic BGM State
  private isBgmPlaying: boolean = false;
  private userSelectedBgmMood: BgmMood = 'auto';
  private currentEffectiveMood: BgmMood = 'romance';
  private autoDetectedMood: BgmMood = 'romance';
  private currentStoryGenre: string = 'Romance';

  // User-Layered Ambient Soundscape State
  private activeAmbientSoundscape: AmbientSoundscapeId = 'none';
  private ambientVolume: number = 0.45;

  // Audio Mixer State
  private voiceVolume: number = 1.0;     // 0.0 to 1.0
  private bgmVolume: number = 0.35;       // 0.0 to 1.0
  private isDuckingEnabled: boolean = true;
  private isCurrentlyDucked: boolean = false;

  // Background Timers (Rain thunder / Heartbeat pulses)
  private sfxLoopInterval: number | null = null;

  // Callbacks
  private onBoundaryCb: BoundaryCallback | null = null;
  private onTimeUpdateCb: TimeUpdateCallback | null = null;
  private onStateChangeCb: StateChangeCallback | null = null;
  private onSpeakerChangeCb: SpeakerChangeCallback | null = null;
  private onMoodChangeCb: MoodChangeCallback | null = null;
  private onMixerChangeCb: MixerChangeCallback | null = null;

  // Playback parameters
  private currentText: string = "";
  private currentTime: number = 0;
  private estimatedDuration: number = 180;
  private timerInterval: number | null = null;
  private isPaused: boolean = false;
  private playbackRate: number = 1.0;
  private pitch: number = 1.0;
  private selectedBrowserVoice: SpeechSynthesisVoice | null = null;
  
  // Active Voice Profiles & Cast
  private activeVoiceProfile: VoiceProfile = DEFAULT_HINDI_VOICE;
  private activeVoiceCast: VoiceCastConfig = DEFAULT_VOICE_CAST;

  // Segments queue
  private currentSegments: DialogueSegment[] = [];
  private currentSegmentIndex: number = 0;
  private isMultiVoiceMode: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  private initAudioContext() {
    if (this.audioCtx) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;
      
      this.audioCtx = new AudioCtxClass();
      
      // Master Gain
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);

      // BGM Gain node
      this.bgmGain = this.audioCtx.createGain();
      this.bgmGain.gain.setValueAtTime(this.bgmVolume * 0.08, this.audioCtx.currentTime);
      this.bgmGain.connect(this.masterGain);

      // Independent Ambient Soundscape Layer Gain node
      this.ambientGain = this.audioCtx.createGain();
      this.ambientGain.gain.setValueAtTime(this.ambientVolume * 0.22, this.audioCtx.currentTime);
      this.ambientGain.connect(this.masterGain);

      // SFX Gain node
      this.sfxGain = this.audioCtx.createGain();
      this.sfxGain.gain.setValueAtTime(0.25, this.audioCtx.currentTime);
      this.sfxGain.connect(this.masterGain);
    } catch (e) {
      console.warn('AudioContext initialization failed:', e);
    }
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  public setBrowserVoice(voice: SpeechSynthesisVoice | null) {
    this.selectedBrowserVoice = voice;
  }

  public setVoiceProfile(profile: VoiceProfile | null) {
    if (!profile) return;
    this.activeVoiceProfile = profile;
    this.pitch = profile.pitch;
    
    const voices = this.getAvailableVoices();
    const langTag = LANG_TO_BCP47[profile.language] || 'hi-IN';
    
    const matchedVoice = voices.find(v => 
      v.lang.toLowerCase().startsWith(langTag.toLowerCase().slice(0, 2)) ||
      v.name.toLowerCase().includes(profile.language.toLowerCase()) ||
      v.lang.toLowerCase().includes(langTag.toLowerCase())
    );
    if (matchedVoice) {
      this.selectedBrowserVoice = matchedVoice;
    }
  }

  public getActiveVoiceProfile(): VoiceProfile {
    return this.activeVoiceProfile;
  }

  public setVoiceCast(cast: VoiceCastConfig) {
    this.activeVoiceCast = cast;
    if (cast.narrator) {
      this.setVoiceProfile(cast.narrator);
    }
  }

  public getVoiceCast(): VoiceCastConfig {
    return this.activeVoiceCast;
  }

  public setRate(rate: number) {
    this.playbackRate = Math.max(0.5, Math.min(2.0, rate));
  }

  public setPitch(pitch: number) {
    this.pitch = Math.max(0.5, Math.min(1.5, pitch));
  }

  // ==========================================
  // AUDIO MIXER METHODS
  // ==========================================

  public setVoiceVolume(vol: number) {
    this.voiceVolume = Math.max(0, Math.min(1.0, vol));
    if (this.currentUtterance) {
      this.currentUtterance.volume = this.voiceVolume;
    }
    this.broadcastMixerState();
  }

  public setBgmVolume(vol: number) {
    this.bgmVolume = Math.max(0, Math.min(1.0, vol));
    if (this.bgmGain && this.audioCtx) {
      const targetGain = this.isCurrentlyDucked && this.isDuckingEnabled
        ? this.bgmVolume * 0.04
        : this.bgmVolume * 0.08;
      this.bgmGain.gain.setTargetAtTime(targetGain, this.audioCtx.currentTime, 0.1);
    }
    this.broadcastMixerState();
  }

  public setDuckingEnabled(enabled: boolean) {
    this.isDuckingEnabled = enabled;
    if (!enabled && this.isCurrentlyDucked) {
      this.duckBgm(false);
    }
    this.broadcastMixerState();
  }

  private duckBgm(shouldDuck: boolean) {
    if (!this.isDuckingEnabled || !this.bgmGain || !this.audioCtx) return;
    this.isCurrentlyDucked = shouldDuck;
    // Exactly 65% reduction (1.0 -> 0.35)
    const reductionFactor = 0.35;
    const targetGain = shouldDuck ? this.bgmVolume * 0.08 * reductionFactor : this.bgmVolume * 0.08;
    this.bgmGain.gain.setTargetAtTime(targetGain, this.audioCtx.currentTime, shouldDuck ? 0.05 : 0.4);
  }

  public setAmbientVolume(vol: number) {
    this.ambientVolume = Math.max(0, Math.min(1.0, vol));
    if (this.ambientGain && this.audioCtx) {
      this.ambientGain.gain.setTargetAtTime(this.ambientVolume * 0.22, this.audioCtx.currentTime, 0.08);
    }
    this.broadcastMixerState();
  }

  public setAmbientSoundscape(id: AmbientSoundscapeId) {
    this.activeAmbientSoundscape = id;
    if (id === 'none') {
      this.stopAmbientLayerNodes();
      this.broadcastMixerState();
      return;
    }

    this.initAudioContext();
    if (!this.audioCtx || !this.ambientGain) {
      this.broadcastMixerState();
      return;
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    this.stopAmbientLayerNodes();

    const now = this.audioCtx.currentTime;
    this.ambientGain.gain.setValueAtTime(0.001, now);
    this.ambientGain.gain.exponentialRampToValueAtTime(
      Math.max(0.001, this.ambientVolume * 0.22),
      now + 0.6
    );

    switch (id) {
      case 'rain':
        this.buildAmbientRainLayer(this.ambientGain);
        break;
      case 'cafe':
        this.buildAmbientCafeLayer(this.ambientGain);
        break;
      case 'cyberpunk':
        this.buildAmbientCyberpunkLayer(this.ambientGain);
        break;
      case 'forest':
        this.buildAmbientForestLayer(this.ambientGain);
        break;
      case 'fireplace':
        this.buildAmbientFireplaceLayer(this.ambientGain);
        break;
      case 'ocean':
        this.buildAmbientOceanLayer(this.ambientGain);
        break;
    }

    this.broadcastMixerState();
  }

  private stopAmbientLayerNodes() {
    if (this.ambientLayerInterval !== null) {
      clearInterval(this.ambientLayerInterval);
      this.ambientLayerInterval = null;
    }
    if (this.activeAmbientLayerNodes.length > 0) {
      this.activeAmbientLayerNodes.forEach((node) => {
        try {
          if ('stop' in node && typeof node.stop === 'function') node.stop();
          node.disconnect();
        } catch (e) { /* ignore */ }
      });
      this.activeAmbientLayerNodes = [];
    }
  }

  private createAmbientFilteredNoise(
    dest: AudioNode,
    filterType: BiquadFilterType,
    centerFreq: number,
    qValue: number,
    gainLevel: number
  ) {
    if (!this.audioCtx) return null;
    const bufferSize = this.audioCtx.sampleRate * 3;
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.04 * white) / 1.04;
      output[i] = lastOut * 2.5 + white * 0.25;
    }
    const source = this.audioCtx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(centerFreq, this.audioCtx.currentTime);
    filter.Q.setValueAtTime(qValue, this.audioCtx.currentTime);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(gainLevel, this.audioCtx.currentTime);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    source.start();

    this.activeAmbientLayerNodes.push(source, filter, gain);
    return { source, filter, gain };
  }

  private buildAmbientRainLayer(dest: AudioNode) {
    this.createAmbientFilteredNoise(dest, 'bandpass', 1200, 0.7, 0.38);
    this.createAmbientFilteredNoise(dest, 'lowpass', 380, 0.5, 0.28);
  }

  private buildAmbientCafeLayer(dest: AudioNode) {
    if (!this.audioCtx) return;
    const murmur = this.createAmbientFilteredNoise(dest, 'bandpass', 480, 1.4, 0.35);
    this.createAmbientFilteredNoise(dest, 'lowpass', 240, 0.6, 0.22);

    if (murmur) {
      const lfo = this.audioCtx.createOscillator();
      const lfoGain = this.audioCtx.createGain();
      lfo.frequency.setValueAtTime(0.35, this.audioCtx.currentTime);
      lfoGain.gain.setValueAtTime(160, this.audioCtx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(murmur.filter.frequency);
      lfo.start();
      this.activeAmbientLayerNodes.push(lfo, lfoGain);
    }

    // Subtle periodic ceramic cup clink
    this.ambientLayerInterval = window.setInterval(() => {
      if (!this.audioCtx || this.activeAmbientSoundscape !== 'cafe') return;
      if (Math.random() > 0.45) {
        const now = this.audioCtx.currentTime;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2200 + Math.random() * 600, now);
        gain.gain.setValueAtTime(0.035, now);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.14);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.16);
      }
    }, 3200);
  }

  private buildAmbientCyberpunkLayer(dest: AudioNode) {
    if (!this.audioCtx) return;
    // Neon rain hiss + futuristic sub-city synth hum
    this.createAmbientFilteredNoise(dest, 'bandpass', 1650, 0.9, 0.24);
    const subOsc = this.audioCtx.createOscillator();
    const padOsc = this.audioCtx.createOscillator();
    const filter = this.audioCtx.createBiquadFilter();
    const padGain = this.audioCtx.createGain();

    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(55, this.audioCtx.currentTime);
    padOsc.type = 'triangle';
    padOsc.frequency.setValueAtTime(164.81, this.audioCtx.currentTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(260, this.audioCtx.currentTime);
    padGain.gain.setValueAtTime(0.16, this.audioCtx.currentTime);

    const lfo = this.audioCtx.createOscillator();
    const lfoGain = this.audioCtx.createGain();
    lfo.frequency.setValueAtTime(0.18, this.audioCtx.currentTime);
    lfoGain.gain.setValueAtTime(90, this.audioCtx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    subOsc.connect(filter);
    padOsc.connect(filter);
    filter.connect(padGain);
    padGain.connect(dest);

    subOsc.start();
    padOsc.start();
    this.activeAmbientLayerNodes.push(subOsc, padOsc, filter, padGain, lfo, lfoGain);
  }

  private buildAmbientForestLayer(dest: AudioNode) {
    if (!this.audioCtx) return;
    const wind = this.createAmbientFilteredNoise(dest, 'bandpass', 620, 1.8, 0.25);
    if (wind) {
      const lfo = this.audioCtx.createOscillator();
      const lfoGain = this.audioCtx.createGain();
      lfo.frequency.setValueAtTime(0.12, this.audioCtx.currentTime);
      lfoGain.gain.setValueAtTime(220, this.audioCtx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(wind.filter.frequency);
      lfo.start();
      this.activeAmbientLayerNodes.push(lfo, lfoGain);
    }

    // Gentle night crickets
    this.ambientLayerInterval = window.setInterval(() => {
      if (!this.audioCtx || this.activeAmbientSoundscape !== 'forest') return;
      const now = this.audioCtx.currentTime;
      for (let i = 0; i < 3; i++) {
        const t = now + i * 0.09;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(4100 + (i % 2) * 180, t);
        gain.gain.setValueAtTime(0.02, t);
        gain.gain.exponentialRampToValueAtTime(0.0005, t + 0.05);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(t);
        osc.stop(t + 0.06);
      }
    }, 2200);
  }

  private buildAmbientFireplaceLayer(dest: AudioNode) {
    if (!this.audioCtx) return;
    this.createAmbientFilteredNoise(dest, 'lowpass', 220, 0.7, 0.42);
    this.ambientLayerInterval = window.setInterval(() => {
      if (!this.audioCtx || this.activeAmbientSoundscape !== 'fireplace') return;
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800 + Math.random() * 1800, now);
      gain.gain.setValueAtTime(0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.035);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.04);
    }, 380);
  }

  private buildAmbientOceanLayer(dest: AudioNode) {
    if (!this.audioCtx) return;
    const surf = this.createAmbientFilteredNoise(dest, 'lowpass', 520, 0.6, 0.34);
    if (surf) {
      const waveLfo = this.audioCtx.createOscillator();
      const waveDepth = this.audioCtx.createGain();
      waveLfo.type = 'sine';
      waveLfo.frequency.setValueAtTime(0.14, this.audioCtx.currentTime);
      waveDepth.gain.setValueAtTime(0.22, this.audioCtx.currentTime);
      waveLfo.connect(waveDepth);
      waveDepth.connect(surf.gain.gain);
      waveLfo.start();
      this.activeAmbientLayerNodes.push(waveLfo, waveDepth);
    }
  }

  public getMixerState(): AudioMixerState {
    return {
      voiceVolume: this.voiceVolume,
      bgmVolume: this.bgmVolume,
      activeBgmMood: this.userSelectedBgmMood,
      autoMatchingEnabled: this.userSelectedBgmMood === 'auto',
      duckingEnabled: this.isDuckingEnabled,
      detectedMood: this.autoDetectedMood,
      ambientSoundscape: this.activeAmbientSoundscape,
      ambientVolume: this.ambientVolume
    };
  }

  private broadcastMixerState() {
    this.onMixerChangeCb?.(this.getMixerState());
  }

  // ==========================================
  // DYNAMIC BGM ENGINE
  // ==========================================

  public setBgmMood(mood: BgmMood, smoothCrossfade: boolean = true) {
    this.userSelectedBgmMood = mood;
    const resolved = mood === 'auto'
      ? (this.autoDetectedMood || detectMoodFromText(this.currentText, this.currentStoryGenre))
      : mood;

    if (resolved !== this.currentEffectiveMood || !this.isBgmPlaying) {
      this.currentEffectiveMood = resolved;
      this.startProceduralBgmSoundscape(resolved, smoothCrossfade);
    }
    this.broadcastMixerState();
    this.onMoodChangeCb?.(resolved, mood === 'auto');
  }

  public getEffectiveMood(): BgmMood {
    return this.currentEffectiveMood;
  }

  public getDetectedMood(): BgmMood {
    return this.autoDetectedMood;
  }

  private startProceduralBgmSoundscape(mood: BgmMood, smoothCrossfade: boolean = true) {
    this.initAudioContext();
    if (!this.audioCtx || !this.bgmGain) return;

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    this.stopActiveBgmNodes();

    const now = this.audioCtx.currentTime;

    const masterFilter = this.audioCtx.createBiquadFilter();
    masterFilter.type = 'lowpass';
    masterFilter.frequency.setValueAtTime(1400, now);
    masterFilter.connect(this.bgmGain);
    this.bgmFilter = masterFilter;
    this.activeSoundscapeNodes.push(masterFilter);

    if (smoothCrossfade) {
      this.bgmGain.gain.setValueAtTime(0.001, now);
      const targetGain = this.isCurrentlyDucked ? this.bgmVolume * 0.04 : this.bgmVolume * 0.08;
      this.bgmGain.gain.exponentialRampToValueAtTime(Math.max(0.001, targetGain), now + 0.8);
    }

    switch (mood) {
      case 'romance':
        this.buildRomanceSoundscape(masterFilter);
        break;
      case 'horror':
        this.buildHorrorSoundscape(masterFilter);
        break;
      case 'thriller':
        this.buildThrillerSoundscape(masterFilter);
        break;
      case 'sad':
        this.buildSadSoundscape(masterFilter);
        break;
      case 'action':
        this.buildActionSoundscape(masterFilter);
        break;
      case 'mystical':
        this.buildMysticalSoundscape(masterFilter);
        break;
      case 'rain':
        this.buildRainSoundscape(masterFilter);
        break;
      case 'peaceful':
      default:
        this.buildPeacefulSoundscape(masterFilter);
        break;
    }

    this.isBgmPlaying = true;
  }

  private buildRomanceSoundscape(dest: AudioNode) {
    if (!this.audioCtx) return;
    const chords = [65.41, 130.81, 164.81, 196.0, 246.94];
    chords.forEach((freq, idx) => {
      const osc = this.audioCtx!.createOscillator();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.audioCtx!.currentTime);
      const lfo = this.audioCtx!.createOscillator();
      const lfoGain = this.audioCtx!.createGain();
      lfo.frequency.setValueAtTime(0.08 + idx * 0.02, this.audioCtx!.currentTime);
      lfoGain.gain.setValueAtTime(1.2, this.audioCtx!.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();
      osc.connect(dest);
      osc.start();
      this.activeSoundscapeNodes.push(osc, lfo, lfoGain);
    });
  }

  private buildHorrorSoundscape(dest: AudioNode) {
    if (!this.audioCtx) return;
    const clusterFreqs = [49.0, 51.91, 92.5, 116.54, 145.7];
    clusterFreqs.forEach((freq, idx) => {
      const osc = this.audioCtx!.createOscillator();
      osc.type = idx === 0 ? 'sine' : 'sawtooth';
      osc.frequency.setValueAtTime(freq, this.audioCtx!.currentTime);
      const oscFilter = this.audioCtx!.createBiquadFilter();
      oscFilter.type = 'lowpass';
      oscFilter.frequency.setValueAtTime(320, this.audioCtx!.currentTime);
      osc.connect(oscFilter);
      oscFilter.connect(dest);
      osc.start();
      this.activeSoundscapeNodes.push(osc, oscFilter);
    });
    this.createFilteredNoise(dest, 'bandpass', 450, 0.025);
  }

  private buildThrillerSoundscape(dest: AudioNode) {
    if (!this.audioCtx) return;
    const drones = [55.0, 110.0, 164.81];
    drones.forEach((freq) => {
      const osc = this.audioCtx!.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.audioCtx!.currentTime);
      osc.connect(dest);
      osc.start();
      this.activeSoundscapeNodes.push(osc);
    });
    if (this.sfxLoopInterval !== null) clearInterval(this.sfxLoopInterval);
    this.sfxLoopInterval = window.setInterval(() => {
      if (!this.isBgmPlaying || !this.audioCtx) return;
      this.triggerSubHeartbeatThud();
    }, 1100);
  }

  private buildSadSoundscape(dest: AudioNode) {
    if (!this.audioCtx) return;
    const sorrowFreqs = [55.0, 82.41, 130.81, 174.61];
    sorrowFreqs.forEach((freq, idx) => {
      const osc = this.audioCtx!.createOscillator();
      osc.type = idx === 0 ? 'sine' : 'sawtooth';
      osc.frequency.setValueAtTime(freq, this.audioCtx!.currentTime);
      const filter = this.audioCtx!.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(360, this.audioCtx!.currentTime);
      const lfo = this.audioCtx!.createOscillator();
      const lfoGain = this.audioCtx!.createGain();
      lfo.frequency.setValueAtTime(0.06 + idx * 0.03, this.audioCtx!.currentTime);
      lfoGain.gain.setValueAtTime(40, this.audioCtx!.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
      osc.connect(filter);
      filter.connect(dest);
      osc.start();
      this.activeSoundscapeNodes.push(osc, filter, lfo, lfoGain);
    });
  }

  private buildActionSoundscape(dest: AudioNode) {
    if (!this.audioCtx) return;
    const bassOsc = this.audioCtx.createOscillator();
    bassOsc.type = 'sawtooth';
    bassOsc.frequency.setValueAtTime(73.42, this.audioCtx.currentTime);
    const bassFilter = this.audioCtx.createBiquadFilter();
    bassFilter.type = 'lowpass';
    bassFilter.frequency.setValueAtTime(500, this.audioCtx.currentTime);
    bassFilter.Q.setValueAtTime(3.0, this.audioCtx.currentTime);
    const arpLfo = this.audioCtx.createOscillator();
    const arpLfoGain = this.audioCtx.createGain();
    arpLfo.type = 'square';
    arpLfo.frequency.setValueAtTime(2.0, this.audioCtx.currentTime);
    arpLfoGain.gain.setValueAtTime(450, this.audioCtx.currentTime);
    arpLfo.connect(arpLfoGain);
    arpLfoGain.connect(bassFilter.frequency);
    arpLfo.start();
    bassOsc.connect(bassFilter);
    bassFilter.connect(dest);
    bassOsc.start();
    this.activeSoundscapeNodes.push(bassOsc, bassFilter, arpLfo, arpLfoGain);
  }

  private buildMysticalSoundscape(dest: AudioNode) {
    if (!this.audioCtx) return;
    const mysticalFreqs = [130.81, 196.0, 261.63, 329.63, 392.0];
    mysticalFreqs.forEach((freq, idx) => {
      const osc = this.audioCtx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx!.currentTime);
      const lfo = this.audioCtx!.createOscillator();
      const lfoGain = this.audioCtx!.createGain();
      lfo.frequency.setValueAtTime(0.2 + idx * 0.08, this.audioCtx!.currentTime);
      lfoGain.gain.setValueAtTime(1.8, this.audioCtx!.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();
      osc.connect(dest);
      osc.start();
      this.activeSoundscapeNodes.push(osc, lfo, lfoGain);
    });
  }

  private buildRainSoundscape(dest: AudioNode) {
    if (!this.audioCtx) return;
    this.createFilteredNoise(dest, 'bandpass', 1100, 0.04);
    if (this.sfxLoopInterval !== null) clearInterval(this.sfxLoopInterval);
    this.sfxLoopInterval = window.setInterval(() => {
      if (!this.isBgmPlaying || !this.audioCtx) return;
      this.playSfx('thunder');
    }, 18000);
  }

  private buildPeacefulSoundscape(dest: AudioNode) {
    if (!this.audioCtx) return;
    const peacefulFreqs = [65.41, 98.0, 130.81, 164.81];
    peacefulFreqs.forEach((freq, idx) => {
      const osc = this.audioCtx!.createOscillator();
      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.audioCtx!.currentTime);
      osc.connect(dest);
      osc.start();
      this.activeSoundscapeNodes.push(osc);
    });
  }

  private createFilteredNoise(dest: AudioNode, filterType: BiquadFilterType, centerFreq: number, gainLevel: number) {
    if (!this.audioCtx) return;
    const bufferSize = this.audioCtx.sampleRate * 2;
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = this.audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(centerFreq, this.audioCtx.currentTime);
    const noiseGain = this.audioCtx.createGain();
    noiseGain.gain.setValueAtTime(gainLevel, this.audioCtx.currentTime);
    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(dest);
    whiteNoise.start();
    this.activeSoundscapeNodes.push(whiteNoise, filter, noiseGain);
  }

  public playSfx(type: 'heartbeat' | 'thunder' | 'suspense_hit' | 'chime') {
    this.initAudioContext();
    if (!this.audioCtx || !this.sfxGain) return;
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    const now = this.audioCtx.currentTime;
    switch (type) {
      case 'heartbeat': this.triggerSubHeartbeatThud(); break;
      case 'thunder': this.triggerDistantThunder(now); break;
      case 'suspense_hit': this.triggerSuspenseBraam(now); break;
      case 'chime': this.triggerCrystalChime(now); break;
    }
  }

  private triggerSubHeartbeatThud() {
    if (!this.audioCtx || !this.sfxGain) return;
    const now = this.audioCtx.currentTime;
    const osc1 = this.audioCtx.createOscillator();
    const gain1 = this.audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(54, now);
    osc1.frequency.exponentialRampToValueAtTime(32, now + 0.12);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc1.connect(gain1);
    gain1.connect(this.sfxGain);
    osc1.start(now);
    osc1.stop(now + 0.15);
    const osc2 = this.audioCtx.createOscillator();
    const gain2 = this.audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(46, now + 0.18);
    osc2.frequency.exponentialRampToValueAtTime(28, now + 0.32);
    gain2.gain.setValueAtTime(0.24, now + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
    osc2.connect(gain2);
    gain2.connect(this.sfxGain);
    osc2.start(now + 0.18);
    osc2.stop(now + 0.35);
  }

  private triggerDistantThunder(now: number) {
    if (!this.audioCtx || !this.sfxGain) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(48, now);
    osc.frequency.linearRampToValueAtTime(30, now + 1.8);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 2.6);
  }

  private triggerSuspenseBraam(now: number) {
    if (!this.audioCtx || !this.sfxGain) return;
    const osc = this.audioCtx.createOscillator();
    const osc2 = this.audioCtx.createOscillator();
    const filter = this.audioCtx.createBiquadFilter();
    const gain = this.audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(58.27, now);
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(58.7, now);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(180, now + 1.2);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc2.start(now);
    osc.stop(now + 1.5);
    osc2.stop(now + 1.5);
  }

  private triggerCrystalChime(now: number) {
    if (!this.audioCtx || !this.sfxGain) return;
    const freqs = [1046.5, 1318.51, 1567.98];
    freqs.forEach((f, i) => {
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.05);
      gain.gain.setValueAtTime(0.15, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6 + i * 0.05);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + i * 0.05);
      osc.stop(now + 0.65 + i * 0.05);
    });
  }

  private stopActiveBgmNodes() {
    if (this.sfxLoopInterval !== null) {
      clearInterval(this.sfxLoopInterval);
      this.sfxLoopInterval = null;
    }
    if (this.activeSoundscapeNodes.length > 0) {
      this.activeSoundscapeNodes.forEach((node) => {
        try {
          if ('stop' in node && typeof node.stop === 'function') node.stop();
          node.disconnect();
        } catch (e) { /* ignore */ }
      });
      this.activeSoundscapeNodes = [];
    }
  }

  public stopAmbientSoundscape() {
    this.stopActiveBgmNodes();
    this.isBgmPlaying = false;
  }

  public startAmbientSoundscape() {
    this.setBgmMood(this.userSelectedBgmMood);
  }

  public setCallbacks(
    onBoundary: BoundaryCallback,
    onTimeUpdate: TimeUpdateCallback,
    onStateChange: StateChangeCallback,
    onSpeakerChange?: SpeakerChangeCallback,
    onMoodChange?: MoodChangeCallback,
    onMixerChange?: MixerChangeCallback
  ) {
    this.onBoundaryCb = onBoundary;
    this.onTimeUpdateCb = onTimeUpdate;
    this.onStateChangeCb = onStateChange;
    if (onSpeakerChange) this.onSpeakerChangeCb = onSpeakerChange;
    if (onMoodChange) this.onMoodChangeCb = onMoodChange;
    if (onMixerChange) this.onMixerChangeCb = onMixerChange;
  }

  public playEpisodeText(
    text: string,
    initialDurationSeconds: number = 200,
    startOffsetSeconds: number = 0,
    enableAmbientBgm: boolean = true,
    voiceProfile?: VoiceProfile,
    voiceCast?: VoiceCastConfig,
    configuredBgmMood?: BgmMood,
    storyGenre?: string
  ) {
    this.stop();
    this.currentText = text;
    this.estimatedDuration = initialDurationSeconds > 0 ? initialDurationSeconds : Math.max(60, Math.floor(text.split(/\s+/).length / 2.5));
    this.currentTime = startOffsetSeconds;
    this.isPaused = false;
    this.currentStoryGenre = storyGenre || 'Romance';

    if (voiceProfile) {
      this.setVoiceProfile(voiceProfile);
    }
    if (voiceCast) {
      this.activeVoiceCast = voiceCast;
    } else {
      this.activeVoiceCast = {
        narrator: this.activeVoiceProfile,
        maleLead: this.activeVoiceCast.maleLead,
        femaleLead: this.activeVoiceCast.femaleLead
      };
    }

    this.autoDetectedMood = detectMoodFromText(text, this.currentStoryGenre);
    if (configuredBgmMood) this.userSelectedBgmMood = configuredBgmMood;
    if (enableAmbientBgm) this.setBgmMood(this.userSelectedBgmMood, false);

    this.currentSegments = parseDialogueSegments(text, this.activeVoiceCast);
    this.isMultiVoiceMode = this.currentSegments.length > 1;

    if (!this.synth) {
      this.startSimulatedTimer();
      this.onStateChangeCb?.(true, false);
      return;
    }

    let startSegmentIndex = 0;
    if (startOffsetSeconds > 0 && this.estimatedDuration > 0) {
      const frac = Math.min(0.95, startOffsetSeconds / this.estimatedDuration);
      startSegmentIndex = Math.min(this.currentSegments.length - 1, Math.floor(this.currentSegments.length * frac));
    }

    this.currentSegmentIndex = startSegmentIndex;
    this.playSegment(this.currentSegmentIndex);
    this.startSimulatedTimer();
    this.onStateChangeCb?.(true, false);
  }

  private playSegment(index: number) {
    if (!this.synth || index >= this.currentSegments.length) {
      this.onEndReached();
      return;
    }

    const seg = this.currentSegments[index];
    if (seg.bgmTrigger) this.setBgmMood(seg.bgmTrigger, true);
    if (seg.sfxTrigger) this.playSfx(seg.sfxTrigger as any);

    const profile = seg.voiceProfile || this.activeVoiceProfile;
    const langTag = LANG_TO_BCP47[profile.language] || 'hi-IN';

    const voices = this.getAvailableVoices();
    const matchedVoice = voices.find(v => 
      v.lang.toLowerCase().startsWith(langTag.toLowerCase().slice(0, 2)) ||
      v.name.toLowerCase().includes(profile.language.toLowerCase()) ||
      v.lang.toLowerCase().includes(langTag.toLowerCase())
    );

    const voiceToUse = matchedVoice || voices.find(v => 
      (profile.gender === 'Female' 
        ? (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Victoria'))
        : (v.name.includes('Male') || v.name.includes('Daniel') || v.name.includes('Guy'))
      )
    ) || voices[0];

    this.onSpeakerChangeCb?.({
      role: seg.speakerRole,
      name: seg.speakerName,
      gender: profile.gender,
      voiceProfile: profile,
      segmentIndex: index,
      totalSegments: this.currentSegments.length
    });

    try {
      const sentences = seg.text.match(/[^.!?]+[.!?]*/g) || [seg.text];
      let sentenceIndex = 0;

      const speakSentence = () => {
        if (sentenceIndex >= sentences.length || this.isPaused) {
          if (sentenceIndex >= sentences.length) {
            this.duckBgm(false);
            if (this.currentSegmentIndex < this.currentSegments.length - 1) {
              this.currentSegmentIndex++;
              window.setTimeout(() => this.playSegment(this.currentSegmentIndex), 600);
            } else {
              this.onEndReached();
            }
          }
          return;
        }

        const sentenceText = sentences[sentenceIndex].trim();
        if (!sentenceText) {
          sentenceIndex++;
          speakSentence();
          return;
        }

        const sUtterance = new SpeechSynthesisUtterance(sentenceText);
        this.currentUtterance = sUtterance;
        sUtterance.rate = Math.max(0.5, Math.min(2.0, this.playbackRate * (profile.rate || 1.0)));
        sUtterance.pitch = Math.max(0.5, Math.min(1.5, (profile.pitch || 1.0) * this.pitch));
        
        if (sentenceText.endsWith('?')) sUtterance.pitch *= 1.1;
        else if (sentenceText.length > 80) sUtterance.rate *= 0.95;

        sUtterance.volume = this.voiceVolume;
        sUtterance.lang = langTag;
        sUtterance.voice = voiceToUse;

        sUtterance.onstart = () => {
          this.duckBgm(true);
          const overallCharIdx = seg.startCharIndex + seg.text.indexOf(sentenceText);
          this.onBoundaryCb?.(overallCharIdx, this.currentText.length, sentenceText);
        };

        sUtterance.onend = () => {
          sentenceIndex++;
          const pauseDur = sentenceText.endsWith('.') ? 400 : 250;
          window.setTimeout(() => speakSentence(), pauseDur);
        };

        sUtterance.onerror = (e) => {
          if (e.error !== 'interrupted' && e.error !== 'canceled') {
            sentenceIndex++;
            speakSentence();
          }
        };

        this.synth!.speak(sUtterance);
      };
      speakSentence();
    } catch (e) {
      console.warn('Speech synthesis speak segment failed:', e);
    }
  }

  private onEndReached() {
    this.stopTimer();
    this.currentTime = this.estimatedDuration;
    this.onTimeUpdateCb?.(this.estimatedDuration, this.estimatedDuration);
    this.onStateChangeCb?.(false, true);
    this.duckBgm(false);
    this.stopAmbientSoundscape();
  }

  public previewVoice(
    voiceProfile: VoiceProfile,
    onStart?: () => void,
    onEnd?: () => void
  ) {
    if (!this.synth) { onEnd?.(); return; }
    try { this.synth.cancel(); } catch (e) { }
    const dialogue = `${voiceProfile.sampleDialogue}`;
    const utterance = new SpeechSynthesisUtterance(dialogue);
    const langTag = LANG_TO_BCP47[voiceProfile.language] || 'hi-IN';
    utterance.lang = langTag;
    utterance.rate = voiceProfile.rate;
    utterance.pitch = voiceProfile.pitch;
    utterance.volume = this.voiceVolume;
    const voices = this.getAvailableVoices();
    const matchedVoice = voices.find(v => 
      v.lang.toLowerCase().startsWith(langTag.toLowerCase().slice(0, 2)) ||
      v.name.toLowerCase().includes(voiceProfile.language.toLowerCase()) ||
      v.lang.toLowerCase().includes(langTag.toLowerCase())
    );
    if (matchedVoice) utterance.voice = matchedVoice;
    else {
      const genderVoice = voices.find(v => 
        voiceProfile.gender === 'Female' 
          ? (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Victoria'))
          : (v.name.includes('Male') || v.name.includes('Daniel') || v.name.includes('Guy'))
      );
      if (genderVoice) utterance.voice = genderVoice;
    }
    utterance.onstart = () => onStart?.();
    utterance.onend = () => onEnd?.();
    utterance.onerror = () => onEnd?.();
    try { this.synth.speak(utterance); } catch (e) { onEnd?.(); }
  }

  public previewMultiVoiceDialogue(
    cast: VoiceCastConfig,
    onSpeakerStart?: (role: VoiceRole, voice: VoiceProfile) => void,
    onComplete?: () => void
  ) {
    if (!this.synth) { onComplete?.(); return; }
    try { this.synth.cancel(); } catch (e) { }

    const demoSegments = [
      { role: 'Narrator' as VoiceRole, profile: cast.narrator, text: `Hello, I am the narrator for this story. I will guide you through the journey.` },
      { role: 'Male' as VoiceRole, profile: cast.maleLead, text: `And I am the male lead character. I bring intensity and emotion to the dialogues.` },
      { role: 'Female' as VoiceRole, profile: cast.femaleLead, text: `I am the female lead. Together, we create a cinematic audio experience for our listeners.` }
    ];

    let currentIdx = 0;

    const speakNext = () => {
      if (currentIdx >= demoSegments.length) {
        onComplete?.();
        return;
      }

      const seg = demoSegments[currentIdx];
      const utterance = new SpeechSynthesisUtterance(seg.text);
      const langTag = LANG_TO_BCP47[seg.profile.language] || 'hi-IN';
      utterance.lang = langTag;
      utterance.rate = seg.profile.rate;
      utterance.pitch = seg.profile.pitch;
      utterance.volume = this.voiceVolume;

      const voices = this.getAvailableVoices();
      const matchedVoice = voices.find(v => 
        v.lang.toLowerCase().startsWith(langTag.toLowerCase().slice(0, 2)) ||
        v.name.toLowerCase().includes(seg.profile.language.toLowerCase()) ||
        v.lang.toLowerCase().includes(langTag.toLowerCase())
      );
      if (matchedVoice) utterance.voice = matchedVoice;

      utterance.onstart = () => onSpeakerStart?.(seg.role, seg.profile);
      utterance.onend = () => {
        currentIdx++;
        window.setTimeout(speakNext, 500);
      };
      utterance.onerror = () => {
        currentIdx++;
        speakNext();
      };

      try { this.synth!.speak(utterance); } catch (e) { onComplete?.(); }
    };

    speakNext();
  }

  public pause() {
    this.isPaused = true;
    if (this.synth && this.synth.speaking) {
      try { this.synth.pause(); } catch (e) { }
    }
    this.stopTimer();
    this.duckBgm(false);
    this.onStateChangeCb?.(false, false);
  }

  public resume() {
    this.isPaused = false;
    if (this.synth && this.synth.paused) {
      try { this.synth.resume(); } catch (e) { }
      this.startSimulatedTimer();
      this.duckBgm(true);
      this.onStateChangeCb?.(true, false);
    } else if (this.currentText) {
      this.playEpisodeText(this.currentText, this.estimatedDuration, this.currentTime, this.isBgmPlaying, this.activeVoiceProfile, this.activeVoiceCast, this.userSelectedBgmMood, this.currentStoryGenre);
    }
  }

  public seek(targetSeconds: number) {
    const clamped = Math.max(0, Math.min(this.estimatedDuration, targetSeconds));
    this.currentTime = clamped;
    this.onTimeUpdateCb?.(this.currentTime, this.estimatedDuration);
    if (this.currentText && !this.isPaused) {
      this.playEpisodeText(this.currentText, this.estimatedDuration, clamped, this.isBgmPlaying, this.activeVoiceProfile, this.activeVoiceCast, this.userSelectedBgmMood, this.currentStoryGenre);
    }
  }

  public skipSeconds(delta: number) { this.seek(this.currentTime + delta); }

  public stop() {
    this.stopTimer();
    if (this.synth) { try { this.synth.cancel(); } catch (e) { } }
    this.currentUtterance = null;
    this.isPaused = false;
    this.stopAmbientSoundscape();
    this.onStateChangeCb?.(false, false);
  }

  private startSimulatedTimer() {
    this.stopTimer();
    this.timerInterval = window.setInterval(() => {
      if (this.isPaused) return;
      this.currentTime += 0.5 * this.playbackRate;
      if (this.currentTime >= this.estimatedDuration) {
        this.stop();
        this.onStateChangeCb?.(false, true);
      } else {
        this.onTimeUpdateCb?.(this.currentTime, this.estimatedDuration);
      }
    }, 500);
  }

  private stopTimer() {
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  public playCoinChime() {
    this.triggerCrystalChime(this.audioCtx ? this.audioCtx.currentTime : 0);
  }
}

export const globalAudioEngine = new AudioEngine();
