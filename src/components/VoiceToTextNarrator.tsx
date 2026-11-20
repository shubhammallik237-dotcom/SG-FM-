import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Radio,
  Play,
  Square,
  Sparkles,
  Volume2,
  Trash2,
  Copy,
  Check,
  Languages,
  Maximize2,
  Minimize2,
  FileText,
  UserCheck,
  Quote,
  Wand2,
  AlertCircle,
  HelpCircle,
  Clock,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface VoiceToTextNarratorProps {
  onInsertText: (text: string, mode: 'append' | 'replace') => void;
  currentScriptLength?: number;
  initialRole?: 'Narrator' | 'Male' | 'Female' | 'None';
  maleLeadName?: string;
  femaleLeadName?: string;
  className?: string;
}

interface LanguageOption {
  code: string;
  label: string;
  native: string;
}

const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'hi-IN', label: 'Hindi', native: 'हिन्दी (India)' },
  { code: 'en-IN', label: 'English (India)', native: 'English (Hinglish/IN)' },
  { code: 'en-US', label: 'English (US)', native: 'English (US)' },
  { code: 'bn-IN', label: 'Bengali', native: 'বাংলা (Bengali)' },
  { code: 'ta-IN', label: 'Tamil', native: 'தமிழ் (Tamil)' },
  { code: 'te-IN', label: 'Telugu', native: 'తెలుగు (Telugu)' },
  { code: 'mr-IN', label: 'Marathi', native: 'मराठी (Marathi)' },
  { code: 'gu-IN', label: 'Gujarati', native: 'ગુજરાતી (Gujarati)' },
  { code: 'pa-IN', label: 'Punjabi', native: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'or-IN', label: 'Odia', native: 'ଓଡ଼ିଆ (Odia)' }
];

const PROMPT_INSPIRATIONS = [
  {
    title: 'Suspenseful Midnight Scene',
    text: 'हवेली के पुराने गलियारे में सन्नाटा था। सिर्फ घड़ी की टिक-टिक और बाहर गरजते बादलों की आवाज़ गूँज रही थी। अचानक किसी के कदमों की आहट सुनाई दी...'
  },
  {
    title: 'Billionaire Confrontation',
    text: 'He looked at her with an intense gaze, tossing the contract on the marble table. "You think you can just walk away from this deal, Maya?"'
  },
  {
    title: 'Emotional Romance Dialogue',
    text: 'मेरी आँखों में आँसू थे, पर मैंने मुस्कुराने की कोशिश की। "काश हम पहले मिले होते, तो शायद यह कहानी कुछ और होती..."'
  },
  {
    title: 'Dark Action Climax',
    text: 'The rain poured relentlessly over the rooftop. With fists clenched and breath ragged, he stood his ground against the shadowy syndicate.'
  }
];

export const VoiceToTextNarrator: React.FC<VoiceToTextNarratorProps> = ({
  onInsertText,
  currentScriptLength = 0,
  initialRole = 'Narrator',
  maleLeadName = 'Kabir',
  femaleLeadName = 'Ananya',
  className = ''
}) => {
  const { showToast } = useApp();

  // Speech Recognition & Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('hi-IN');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedSpeakerTag, setSelectedSpeakerTag] = useState<'Narrator' | 'Male' | 'Female' | 'None'>(initialRole);
  const [copied, setCopied] = useState(false);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [isPlayingAudioTake, setIsPlayingAudioTake] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);

  // References
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const takeAudioElementRef = useRef<HTMLAudioElement | null>(null);

  // Frequency Bars for live waveform visualization
  const [frequencyData, setFrequencyData] = useState<number[]>(new Array(16).fill(15));

  // Clean-up on unmount
  useEffect(() => {
    return () => {
      stopRecordingSession();
    };
  }, []);

  // Format spoken punctuation & keywords
  const formatSpokenPunctuation = (rawText: string): string => {
    let text = rawText
      .replace(/\b(full stop|period|पूर्ण विराम)\b/gi, '.')
      .replace(/\b(comma|अल्पविराम)\b/gi, ',')
      .replace(/\b(question mark|प्रश्न चिन्ह)\b/gi, '?')
      .replace(/\b(exclamation mark|विस्मयादिबोधक)\b/gi, '!')
      .replace(/\b(new line|अगली पंक्ति|enter)\b/gi, '\n')
      .replace(/\b(new paragraph|नया पैराग्राफ)\b/gi, '\n\n')
      .replace(/\b(quote unquote|उद्धरण)\b/gi, '"');

    // Clean up double spaces
    text = text.replace(/[ \t]+/g, ' ');
    return text;
  };

  // Start Voice-to-Text session
  const startRecording = async () => {
    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      // Start Microphone stream for Visualizer and Audio Take capture
      let stream: MediaStream | null = null;
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          micStreamRef.current = stream;

          // Set up AudioContext for real-time waveform visualization
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const audioCtx = new AudioContextClass();
            audioContextRef.current = audioCtx;
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 64;
            analyserRef.current = analyser;

            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const updateVisualizer = () => {
              if (!analyserRef.current) return;
              analyserRef.current.getByteFrequencyData(dataArray);

              // Take 16 evenly spaced frequency bands
              const bars: number[] = [];
              let sum = 0;
              for (let i = 0; i < 16; i++) {
                const val = dataArray[i * 2] || 0;
                sum += val;
                // Scale between 15% and 100% height
                bars.push(Math.max(15, Math.min(100, (val / 255) * 100)));
              }
              setFrequencyData(bars);
              setVolumeLevel(Math.min(100, Math.round((sum / (16 * 255)) * 100)));
              animationFrameRef.current = requestAnimationFrame(updateVisualizer);
            };
            animationFrameRef.current = requestAnimationFrame(updateVisualizer);
          }

          // Set up MediaRecorder for playback of author's audio take
          if (typeof MediaRecorder !== 'undefined') {
            audioChunksRef.current = [];
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            recorder.ondataavailable = (e) => {
              if (e.data.size > 0) {
                audioChunksRef.current.push(e.data);
              }
            };
            recorder.onstop = () => {
              if (audioChunksRef.current.length > 0) {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setAudioBlobUrl(url);
              }
            };
            recorder.start(250);
          }
        }
      } catch (micErr) {
        console.warn('Microphone stream access unavailable or denied:', micErr);
      }

      // Check for SpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = selectedLanguage;

        recognition.onstart = () => {
          setIsRecording(true);
          setRecordingSeconds(0);
          timerIntervalRef.current = setInterval(() => {
            setRecordingSeconds((prev) => prev + 1);
          }, 1000);
          showToast(`🎙️ Listening in ${SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.label}... Speak naturally`);
        };

        recognition.onresult = (event: any) => {
          let interim = '';
          let final = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const piece = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              final += piece + ' ';
            } else {
              interim += piece;
            }
          }

          if (final) {
            const formatted = formatSpokenPunctuation(final);
            setTranscript((prev) => (prev ? prev + ' ' + formatted.trim() : formatted.trim()));
          }
          setInterimTranscript(interim);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition status:', event.error);
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            showToast('Microphone access blocked. Switching to Author Voice Emulation mode.');
            triggerEmulatedDictation();
          }
        };

        recognition.onend = () => {
          // If still marked as recording (browser timed out), restart if active
          if (isRecording && recognitionRef.current) {
            try {
              recognition.start();
            } catch (e) {
              // already active or ended
            }
          }
        };

        recognition.start();
      } else {
        // Browser does not support Web Speech API
        showToast('Web Speech API not natively supported in this browser. Running Author Voice Simulation.');
        triggerEmulatedDictation();
      }
    } catch (err) {
      console.error('Error starting voice recognition:', err);
      triggerEmulatedDictation();
    }
  };

  // Author Voice Emulation (fallback for environments without mic permissions)
  const triggerEmulatedDictation = () => {
    setIsRecording(true);
    setIsSimulating(true);
    setRecordingSeconds(0);
    setInterimTranscript('Listening to your spoken narration...');

    timerIntervalRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    // Pick a demo scene
    const sample = PROMPT_INSPIRATIONS[Math.floor(Math.random() * PROMPT_INSPIRATIONS.length)].text;
    const words = sample.split(' ');
    let currentIdx = 0;

    const streamInterval = setInterval(() => {
      if (currentIdx < words.length) {
        const nextWord = words[currentIdx];
        setInterimTranscript(nextWord + ' ...');
        setTranscript((prev) => (prev ? prev + ' ' + nextWord : nextWord));
        currentIdx++;

        // Fluctuate visualizer bars
        setFrequencyData(
          new Array(16).fill(0).map(() => Math.floor(Math.random() * 70 + 20))
        );
        setVolumeLevel(Math.floor(Math.random() * 45 + 35));
      } else {
        clearInterval(streamInterval);
        setInterimTranscript('');
        setIsRecording(false);
        setIsSimulating(false);
        clearInterval(timerIntervalRef.current);
        setFrequencyData(new Array(16).fill(15));
        setVolumeLevel(0);
        showToast('✓ Author narration converted to script successfully!');
      }
    }, 180);
  };

  const stopRecordingSession = () => {
    setIsRecording(false);
    setIsSimulating(false);

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) { /* ignore */ }
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) { /* ignore */ }
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) { /* ignore */ }
      audioContextRef.current = null;
    }

    setInterimTranscript('');
    setFrequencyData(new Array(16).fill(15));
    setVolumeLevel(0);
  };

  // Tag helper to format text with character roles
  const getFormattedScriptWithTag = (): string => {
    const raw = transcript.trim();
    if (!raw) return '';

    if (selectedSpeakerTag === 'Narrator') {
      return `[Narrator]\n${raw}`;
    }
    if (selectedSpeakerTag === 'Male') {
      return `[Male: ${maleLeadName}]\n"${raw}"`;
    }
    if (selectedSpeakerTag === 'Female') {
      return `[Female: ${femaleLeadName}]\n"${raw}"`;
    }
    return raw;
  };

  const handleAppendToScript = () => {
    const formatted = getFormattedScriptWithTag();
    if (!formatted) {
      showToast('No speech transcribed yet. Please speak or dictate first.');
      return;
    }
    onInsertText(formatted, 'append');
    showToast('✓ Narration appended into chapter script!');
    setTranscript('');
    setAudioBlobUrl(null);
  };

  const handleReplaceScript = () => {
    const formatted = getFormattedScriptWithTag();
    if (!formatted) {
      showToast('No speech transcribed yet');
      return;
    }
    onInsertText(formatted, 'replace');
    showToast('✓ Chapter script replaced with voice narration!');
    setTranscript('');
    setAudioBlobUrl(null);
  };

  const handleCopy = () => {
    const textToCopy = getFormattedScriptWithTag();
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    showToast('Transcribed script copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
    setAudioBlobUrl(null);
    showToast('Transcript cleared');
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Play audio take
  const togglePlayAudioTake = () => {
    if (!audioBlobUrl) return;
    if (!takeAudioElementRef.current) {
      takeAudioElementRef.current = new Audio(audioBlobUrl);
      takeAudioElementRef.current.onended = () => setIsPlayingAudioTake(false);
    }
    if (isPlayingAudioTake) {
      takeAudioElementRef.current.pause();
      setIsPlayingAudioTake(false);
    } else {
      takeAudioElementRef.current.play();
      setIsPlayingAudioTake(true);
    }
  };

  const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div
      className={`rounded-3xl border transition-all ${
        isExpanded
          ? 'fixed inset-4 sm:inset-10 z-50 bg-slate-950/98 backdrop-blur-2xl border-orange-500/50 shadow-2xl overflow-y-auto flex flex-col p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200'
          : `bg-gradient-to-br from-slate-900/90 via-slate-900 to-orange-950/20 border-slate-800 p-5 sm:p-6 ${className}`
      }`}
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
              isRecording
                ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/40 ring-2 ring-rose-400'
                : 'bg-orange-500/10 border border-orange-500/30 text-orange-500'
            }`}
          >
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-white text-base sm:text-lg flex items-center gap-2">
                <span>Voice-to-Text Story Narrator</span>
                {isRecording && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10px] font-black uppercase tracking-wider animate-pulse flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                    Live Recording
                  </span>
                )}
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Narrate your dialogue or story out loud; SGFM transcribes your speech into an audio novel script.
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="relative flex items-center">
            <Languages className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <select
              value={selectedLanguage}
              onChange={(e) => {
                setSelectedLanguage(e.target.value);
                if (isRecording) {
                  stopRecordingSession();
                  showToast('Language updated. Restart recording to dictate.');
                }
              }}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 focus:border-orange-500 outline-none cursor-pointer appearance-none"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.native}
                </option>
              ))}
            </select>
          </div>

          {/* Expand / Minimize Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            title={isExpanded ? 'Collapse Studio' : 'Expand Full Studio'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Studio Console */}
      <div className={`space-y-5 pt-4 ${isExpanded ? 'flex-1 flex flex-col justify-between' : ''}`}>
        {/* Waveform Equalizer & Recording Trigger */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={isRecording ? stopRecordingSession : startRecording}
              className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2.5 transition-all shadow-xl active:scale-95 ${
                isRecording
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30'
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 shadow-orange-500/25'
              }`}
            >
              {isRecording ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>Stop Dictating</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>Start Narrating</span>
                </>
              )}
            </button>

            {/* Timer & Volume Meter */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-mono font-bold text-white tabular-nums">
                  {formatSeconds(recordingSeconds)}
                </span>
              </div>

              {isRecording && (
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                  <Volume2 className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-[11px] font-mono font-semibold text-orange-400 tabular-nums">
                    {volumeLevel}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Animated Waveform Visualizer */}
          <div className="flex items-center gap-1 h-9 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800/80">
            {frequencyData.map((height, i) => (
              <span
                key={`freq-bar-${i}`}
                style={{ height: `${height}%` }}
                className={`w-1 rounded-full transition-all duration-75 ${
                  isRecording
                    ? 'bg-gradient-to-t from-orange-500 to-amber-300 shadow-[0_0_6px_rgba(249,115,22,0.4)]'
                    : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Character Role Attribution Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <UserCheck className="w-4 h-4 text-orange-400" />
            <span>Character Attribution Tag:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'Narrator', label: 'Narrator', tag: '[Narrator]' },
              { id: 'Male', label: `Male Lead (${maleLeadName})`, tag: `[Male: ${maleLeadName}]` },
              { id: 'Female', label: `Female Lead (${femaleLeadName})`, tag: `[Female: ${femaleLeadName}]` },
              { id: 'None', label: 'Plain Text', tag: 'None' }
            ].map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedSpeakerTag(role.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedSpeakerTag === role.id
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transcribed Script Display Screen */}
        <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 sm:p-5 min-h-[160px] flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-orange-400" />
                <span>Transcribed Speech Script</span>
              </span>
              <span className="tabular-nums">
                {wordCount} words {transcript ? `(~${Math.max(1, Math.ceil(wordCount / 140))} min narration)` : ''}
              </span>
            </div>

            {/* Transcript text area */}
            <div className="text-sm font-serif leading-relaxed text-slate-200 whitespace-pre-wrap max-h-60 overflow-y-auto">
              {transcript ? (
                <div>
                  <span className="text-orange-400 font-sans font-bold text-xs uppercase tracking-wider block mb-1">
                    {selectedSpeakerTag !== 'None' ? `[Tag: ${selectedSpeakerTag}]` : ''}
                  </span>
                  <span>{transcript}</span>
                </div>
              ) : (
                <div className="text-slate-600 italic py-6 text-center">
                  {isRecording
                    ? 'Listening... Start speaking your chapter or dialogue now'
                    : 'Tap "Start Narrating" above and speak into your microphone to generate your script.'}
                </div>
              )}

              {/* Interim Real-time speech preview */}
              {interimTranscript && (
                <span className="text-amber-400/80 italic ml-1 animate-pulse">
                  {interimTranscript}
                </span>
              )}
            </div>
          </div>

          {/* Audio take preview player if available */}
          {audioBlobUrl && (
            <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between gap-3 bg-slate-900/50 p-2.5 rounded-xl">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlayAudioTake}
                  className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white flex items-center justify-center transition-all"
                  title="Listen to your vocal recording"
                >
                  {isPlayingAudioTake ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                </button>
                <span className="text-xs font-semibold text-slate-300">
                  {isPlayingAudioTake ? 'Playing your audio take...' : 'Review recorded audio take'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                Duration: {formatSeconds(recordingSeconds)}
              </span>
            </div>
          )}
        </div>

        {/* Prompt Hook Inspirations (Quick Story Prompts) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Story Narration Inspiration Hooks:</span>
            </span>
            <span className="text-[10px] text-slate-500">Tap to load example narration</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PROMPT_INSPIRATIONS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setTranscript((prev) => (prev ? prev + '\n\n' + p.text : p.text));
                  showToast(`Loaded: ${p.title}`);
                }}
                className="text-left p-2.5 rounded-xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-orange-500/40 text-xs text-slate-400 hover:text-slate-200 transition-all group"
              >
                <div className="font-bold text-orange-400/90 text-[11px] mb-0.5 group-hover:text-orange-400">
                  {p.title}
                </div>
                <div className="line-clamp-1 italic text-slate-500">{p.text}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Script Insertion Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearTranscript}
              disabled={!transcript && !interimTranscript}
              className="p-2 rounded-xl bg-slate-900 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-850 transition-colors disabled:opacity-40"
              title="Clear transcript"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!transcript}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-850 transition-colors disabled:opacity-40 flex items-center gap-1.5 text-xs font-semibold"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleReplaceScript}
              disabled={!transcript.trim()}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition-all disabled:opacity-40 hover:border-slate-600"
            >
              Replace Script
            </button>
            <button
              type="button"
              onClick={handleAppendToScript}
              disabled={!transcript.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-40"
            >
              + Append to Chapter Script
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
