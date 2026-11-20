import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  Check,
  Download,
  X,
  Palette,
  Layers,
  Wand2,
  RefreshCw,
  Sliders,
  Type,
  BookOpen,
  Monitor
} from 'lucide-react';
import { Genre } from '../types';

interface AiCoverPosterGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  initialTitle: string;
  initialGenre: Genre;
  initialSynopsis: string;
  initialAuthor: string;
  onSelectCover: (coverDataUrl: string) => void;
}

interface StylePreset {
  id: string;
  name: string;
  genre: Genre;
  description: string;
  primaryColor: string;
  accentColor: string;
  gradientOverlay: string;
  sampleBackdropUrl: string;
  tagline: string;
}

const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'dark-romance',
    name: 'Dark Romance & Crimson Velvet',
    genre: 'Romance',
    description: 'Sensual chiaroscuro shadows, deep burgundy velvet, intense stares, and opulent luxury.',
    primaryColor: '#881337',
    accentColor: '#fbbf24',
    gradientOverlay: 'rgba(88, 28, 135, 0.45)',
    sampleBackdropUrl: '/src/assets/images/novel_dark_romance_cover_1793427621801.jpg',
    tagline: 'Some contracts cannot be broken by love or money.'
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk & Rain-Slicked Neon',
    genre: 'Sci-Fi',
    description: 'Electric cyan and neon magenta lights cutting through dystopian smog and skyscrapers.',
    primaryColor: '#0891b2',
    accentColor: '#38bdf8',
    gradientOverlay: 'rgba(6, 182, 212, 0.35)',
    sampleBackdropUrl: '/src/assets/images/novel_scifi_cyber_cover_1793427621420.jpg',
    tagline: 'In a city of chrome, humanity is the ultimate contraband.'
  },
  {
    id: 'victorian-horror',
    name: 'Gothic Victorian Mist & Shadows',
    genre: 'Horror',
    description: 'Eerie emerald twilight, fog-drenched iron gates, decrepit gargoyles, and chilling whispers.',
    primaryColor: '#064e3b',
    accentColor: '#34d399',
    gradientOverlay: 'rgba(4, 120, 87, 0.35)',
    sampleBackdropUrl: '/src/assets/images/novel_horror_thriller_cover_1793427622671.jpg',
    tagline: 'The asylum remembers the sins that the living buried.'
  },
  {
    id: 'regal-dynasty',
    name: 'Royal Rajput & Mughal Dynasty',
    genre: 'Drama',
    description: 'Gilded palace battlements, burning torches, crimson royal silk, and ancient honor.',
    primaryColor: '#78350f',
    accentColor: '#f59e0b',
    gradientOverlay: 'rgba(217, 119, 6, 0.4)',
    sampleBackdropUrl: '/src/assets/images/novel_period_drama_cover_1793427622007.jpg',
    tagline: 'When crowns are forged in blood, no king rules alone.'
  },
  {
    id: 'celestial-fantasy',
    name: 'Celestial Arcane Fantasy',
    genre: 'Fantasy',
    description: 'Glowing sapphire and purple ley-lines, ancient floating citadels, and starry nebulae.',
    primaryColor: '#3b0764',
    accentColor: '#c084fc',
    gradientOverlay: 'rgba(147, 51, 234, 0.4)',
    sampleBackdropUrl: '/src/assets/images/novel_urban_fantasy_cover_1793427621890.jpg',
    tagline: 'The stars whisper secrets that gods died to conceal.'
  },
  {
    id: 'noir-thriller',
    name: 'High-Stakes Crime Noir',
    genre: 'Thriller',
    description: 'Venetian blind shadows, monochrome rain, high-contrast amber headlights, and gritty mystery.',
    primaryColor: '#1e293b',
    accentColor: '#f59e0b',
    gradientOverlay: 'rgba(30, 41, 59, 0.5)',
    sampleBackdropUrl: '/src/assets/images/novel_horror_thriller_cover_1793427622671.jpg',
    tagline: 'In Manhattan after dark, everyone is running from someone.'
  }
];

export const AiCoverPosterGenerator: React.FC<AiCoverPosterGeneratorProps> = ({
  isOpen,
  onClose,
  initialTitle,
  initialGenre,
  initialSynopsis,
  initialAuthor,
  onSelectCover
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Form & Generator State
  const [format, setFormat] = useState<'cover' | 'poster'>('cover'); // 3:4 vs 16:9
  const [selectedStyle, setSelectedStyle] = useState<StylePreset>(() => {
    return STYLE_PRESETS.find(s => s.genre === initialGenre) || STYLE_PRESETS[0];
  });
  const [customTitle, setCustomTitle] = useState(initialTitle || 'The Shadow Over Manhattan');
  const [customAuthor, setCustomAuthor] = useState(initialAuthor || 'Eleanor Reed');
  const [customTagline, setCustomTagline] = useState(selectedStyle.tagline);
  const [lightingMood, setLightingMood] = useState<'dramatic' | 'vibrant' | 'nocturne' | 'golden'>('dramatic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [autoPromptText, setAutoPromptText] = useState('');

  // Update style when initialGenre changes
  useEffect(() => {
    const match = STYLE_PRESETS.find(s => s.genre === initialGenre);
    if (match) {
      setSelectedStyle(match);
      setCustomTagline(match.tagline);
    }
    if (initialTitle) setCustomTitle(initialTitle);
    if (initialAuthor) setCustomAuthor(initialAuthor);
  }, [initialGenre, initialTitle, initialAuthor]);

  // Generate dynamic AI prompt synopsis
  useEffect(() => {
    const prompt = `Photorealistic ${format === 'cover' ? 'book cover' : 'cinematic landscape movie poster'} for "${customTitle}", ${selectedStyle.name} style. Featuring dramatic ${lightingMood} lighting, atmospheric mist, volumetric rays, high contrast chiaroscuro, 8k resolution masterwork, typography space, cinematic color grading. Theme: ${initialSynopsis || selectedStyle.description}`;
    setAutoPromptText(prompt);
  }, [customTitle, selectedStyle, format, lightingMood, initialSynopsis]);

  // Render to canvas
  const renderArt = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isCover = format === 'cover';
    const width = isCover ? 600 : 960;
    const height = isCover ? 800 : 540;

    canvas.width = width;
    canvas.height = height;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';
    img.src = selectedStyle.sampleBackdropUrl;

    img.onload = () => {
      // 1. Draw base image scaled to fill
      const imgRatio = img.width / img.height;
      const targetRatio = width / height;
      let sWidth = img.width;
      let sHeight = img.height;
      let sx = 0;
      let sy = 0;

      if (imgRatio > targetRatio) {
        sWidth = img.height * targetRatio;
        sx = (img.width - sWidth) / 2;
      } else {
        sHeight = img.width / targetRatio;
        sy = (img.height - sHeight) / 2;
      }

      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, width, height);

      // 2. Apply artistic lighting & color mood tint
      const moodGradients: Record<string, [string, string]> = {
        dramatic: ['rgba(5, 5, 12, 0.2)', 'rgba(2, 6, 23, 0.85)'],
        vibrant: ['rgba(67, 24, 255, 0.25)', 'rgba(15, 23, 42, 0.85)'],
        nocturne: ['rgba(2, 6, 23, 0.4)', 'rgba(0, 0, 0, 0.92)'],
        golden: ['rgba(180, 83, 9, 0.3)', 'rgba(24, 15, 2, 0.88)']
      };

      const [topTint, bottomTint] = moodGradients[lightingMood] || moodGradients.dramatic;
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, topTint);
      grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.25)');
      grad.addColorStop(0.85, bottomTint);
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 3. Subtle vignette corners
      const vignette = ctx.createRadialGradient(
        width / 2, height / 2, width * 0.3,
        width / 2, height / 2, width * 0.75
      );
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.65)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      // 4. Draw Typography & Layout
      ctx.textAlign = 'center';

      if (isCover) {
        // --- 3:4 NOVEL COVER LAYOUT ---
        // Top Emblem / Audio Story Badge
        ctx.fillStyle = selectedStyle.accentColor;
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.letterSpacing = '3px';
        ctx.fillText('✦ AURA ORIGINAL AUDIO NOVEL ✦', width / 2, 48);

        // Genre Pill
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.roundRect(width / 2 - 60, 64, 120, 22, [11]);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px system-ui, sans-serif';
        ctx.letterSpacing = '2px';
        ctx.fillText(selectedStyle.genre.toUpperCase(), width / 2, 79);

        // Story Title (Wrapped & Scaled)
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.9)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 4;
        ctx.font = 'bold 36px serif';
        ctx.letterSpacing = '1px';

        const words = (customTitle || 'Untitled Novel').split(' ');
        let line = '';
        const lines: string[] = [];
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > width - 100 && n > 0) {
            lines.push(line.trim());
            line = words[n] + ' ';
          } else {
            line = testLine;
          }
        }
        lines.push(line.trim());

        const startY = height - 170 - (lines.length - 1) * 42;
        for (let i = 0; i < lines.length; i++) {
          // Metallic gold shimmer on title
          const titleGrad = ctx.createLinearGradient(0, startY + i * 42 - 25, 0, startY + i * 42 + 10);
          titleGrad.addColorStop(0, '#ffffff');
          titleGrad.addColorStop(0.7, '#fef3c7');
          titleGrad.addColorStop(1, selectedStyle.accentColor);
          ctx.fillStyle = titleGrad;
          ctx.fillText(lines[i], width / 2, startY + i * 42);
        }

        // Author Name
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '500 13px system-ui, sans-serif';
        ctx.letterSpacing = '2px';
        ctx.fillText(`BY ${customAuthor.toUpperCase()}`, width / 2, height - 75);

        // Bottom Accent Bar
        ctx.fillStyle = selectedStyle.accentColor;
        ctx.fillRect(width / 2 - 35, height - 52, 70, 2);

        // Subtle Multi-Voice Audio watermark
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '10px system-ui, sans-serif';
        ctx.letterSpacing = '1px';
        ctx.fillText('MULTI-VOICE HINDI AUDIO STREAMING', width / 2, height - 30);
      } else {
        // --- 16:9 LANDSCAPE PROMOTIONAL POSTER ---
        // Left-to-Right layout or centered cinematic poster
        // Top watermark
        ctx.fillStyle = selectedStyle.accentColor;
        ctx.font = 'bold 12px system-ui, sans-serif';
        ctx.letterSpacing = '4px';
        ctx.fillText('✦ STREAMING IN MULTI-VOICE 40+ HINDI AUDIO ✦', width / 2, 45);

        // Large Title
        const titleGrad = ctx.createLinearGradient(0, height / 2 - 30, 0, height / 2 + 30);
        titleGrad.addColorStop(0, '#ffffff');
        titleGrad.addColorStop(1, selectedStyle.accentColor);
        ctx.fillStyle = titleGrad;
        ctx.shadowColor = 'rgba(0,0,0,0.9)';
        ctx.shadowBlur = 16;
        ctx.font = 'bold 44px serif';
        ctx.fillText(customTitle || 'Untitled Novel', width / 2, height / 2);

        // Tagline
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#f1f5f9';
        ctx.font = 'italic 16px serif';
        ctx.letterSpacing = '1px';
        ctx.fillText(`"${customTagline}"`, width / 2, height / 2 + 45);

        // Genre & Author pill footer
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 12px system-ui, sans-serif';
        ctx.letterSpacing = '2px';
        ctx.fillText(`${selectedStyle.genre.toUpperCase()} · ORIGINAL AUDIO NOVEL BY ${customAuthor.toUpperCase()}`, width / 2, height - 55);

        // Five Gold Stars
        ctx.fillStyle = '#fbbf24';
        ctx.font = '14px system-ui, sans-serif';
        ctx.fillText('★★★★★  4.9 / 5.0 (1.4M+ LISTENS)', width / 2, height - 30);
      }

      setPreviewDataUrl(canvas.toDataURL('image/jpeg', 0.92));
    };

    img.onerror = () => {
      // Fallback procedural canvas if image fails
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = selectedStyle.accentColor;
      ctx.font = 'bold 28px serif';
      ctx.textAlign = 'center';
      ctx.fillText(customTitle, width / 2, height / 2);
      setPreviewDataUrl(canvas.toDataURL('image/jpeg', 0.92));
    };
  };

  useEffect(() => {
    if (isOpen) {
      renderArt();
    }
  }, [isOpen, format, selectedStyle, customTitle, customAuthor, customTagline, lightingMood]);

  const handleApplyArt = () => {
    if (previewDataUrl) {
      onSelectCover(previewDataUrl);
      onClose();
    }
  };

  const handleDownload = () => {
    if (!previewDataUrl) return;
    const a = document.createElement('a');
    a.href = previewDataUrl;
    a.download = `${customTitle.replace(/\s+/g, '_')}_${format}.jpg`;
    a.click();
  };

  const handleRegenerate = () => {
    setIsGenerating(true);
    // Cycle lighting mood or random variation
    const moods: ('dramatic' | 'vibrant' | 'nocturne' | 'golden')[] = ['dramatic', 'vibrant', 'nocturne', 'golden'];
    const nextMood = moods[(moods.indexOf(lightingMood) + 1) % moods.length];
    setLightingMood(nextMood);

    setTimeout(() => {
      renderArt();
      setIsGenerating(false);
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-slate-950">
              <Sparkles className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>AI Story Cover & Poster Generator</span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
                  Photorealistic 8K
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Automatically generate book covers (3:4) & promotional cinema posters (16:9)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Visual Controls & Form */}
          <div className="lg:col-span-6 space-y-4">
            {/* Format Switcher */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Aspect Ratio & Format</span>
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setFormat('cover')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    format === 'cover'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>3:4 Novel Book Cover</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('poster')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    format === 'poster'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>16:9 Cinema Poster</span>
                </button>
              </div>
            </div>

            {/* Title & Author Customizer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Cover Story Title</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  placeholder="Story Title"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-amber-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Author Pen Name</label>
                <input
                  type="text"
                  value={customAuthor}
                  onChange={e => setCustomAuthor(e.target.value)}
                  placeholder="Author Name"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Poster Tagline */}
            {format === 'poster' && (
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Cinematic Poster Tagline</label>
                <input
                  type="text"
                  value={customTagline}
                  onChange={e => setCustomTagline(e.target.value)}
                  placeholder="Hook tagline for listeners"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-amber-400"
                />
              </div>
            )}

            {/* Visual Style & Aesthetic Themes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-amber-400" />
                  <span>Aesthetic Style Preset ({STYLE_PRESETS.length} Available)</span>
                </span>
                <span className="text-[11px] text-amber-400 font-normal">{selectedStyle.genre}</span>
              </label>

              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {STYLE_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSelectedStyle(preset);
                      setCustomTagline(preset.tagline);
                    }}
                    className={`p-2 rounded-xl text-left border transition-all text-xs flex flex-col justify-between ${
                      selectedStyle.id === preset.id
                        ? 'bg-amber-500/15 border-amber-400 text-white ring-1 ring-amber-400/30'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-semibold line-clamp-1 text-[11px] text-white">
                      {preset.name}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                      {preset.genre}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Lighting Mood Sliders */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Atmospheric Lighting & Color Grading</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['dramatic', 'vibrant', 'nocturne', 'golden'] as const).map(mood => (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => setLightingMood(mood)}
                    className={`py-1.5 text-[11px] font-semibold rounded-lg capitalize transition-colors ${
                      lightingMood === mood
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Synthesized Prompt Preview */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-semibold text-amber-400 flex items-center gap-1">
                  <Wand2 className="w-3 h-3" />
                  <span>AI Prompt Generated from Synopsis:</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-mono line-clamp-2 leading-relaxed">
                {autoPromptText}
              </p>
            </div>
          </div>

          {/* Right Column: Live Art Canvas Preview */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center space-y-3">
            <div className="relative w-full flex items-center justify-center p-3 rounded-2xl bg-slate-950 border border-slate-800">
              {/* Hidden Canvas used for high-res generation */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Rendered Preview */}
              {previewDataUrl ? (
                <div
                  className={`overflow-hidden rounded-xl shadow-2xl border border-slate-700/80 transition-all ${
                    format === 'cover' ? 'w-[240px] sm:w-[270px] aspect-[3/4]' : 'w-full aspect-[16/9]'
                  }`}
                >
                  <img
                    src={previewDataUrl}
                    alt="AI Generated Cover Art"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-[240px] aspect-[3/4] bg-slate-900 rounded-xl flex items-center justify-center text-slate-500">
                  <ImageIcon className="w-8 h-8 animate-pulse text-amber-400" />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 w-full">
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={isGenerating}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>Variations</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save PNG</span>
              </button>

              <button
                type="button"
                onClick={handleApplyArt}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Use as Novel Cover</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
