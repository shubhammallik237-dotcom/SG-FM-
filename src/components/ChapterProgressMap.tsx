import React, { useMemo, useState } from 'react';
import {
  Compass,
  Heart,
  Zap,
  Sparkles,
  Ghost,
  CloudRain,
  Flame,
  Activity,
  Moon,
  Check,
  Play,
  ChevronUp,
  Map as MapIcon,
  User
} from 'lucide-react';
import { BeatEmotionType, ChapterPlotBeat } from '../types';

export const BEAT_VISUAL_CONFIG: Record<
  BeatEmotionType,
  {
    icon: React.ComponentType<{ className?: string }>;
    badgeClass: string;
    dotClass: string;
    ringClass: string;
    hex: string;
    cardActiveClass: string;
  }
> = {
  opening: {
    icon: Compass,
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
    dotClass: 'bg-amber-400 text-slate-950',
    ringClass: 'ring-amber-400/50',
    hex: '#fbbf24',
    cardActiveClass: 'border-amber-400/60 bg-amber-500/10 shadow-amber-500/15'
  },
  romance: {
    icon: Heart,
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
    dotClass: 'bg-rose-400 text-slate-950',
    ringClass: 'ring-rose-400/50',
    hex: '#fb7185',
    cardActiveClass: 'border-rose-400/60 bg-rose-500/10 shadow-rose-500/15'
  },
  tension: {
    icon: Activity,
    badgeClass: 'bg-orange-500/15 text-orange-300 border-orange-400/30',
    dotClass: 'bg-orange-400 text-slate-950',
    ringClass: 'ring-orange-400/50',
    hex: '#fb923c',
    cardActiveClass: 'border-orange-400/60 bg-orange-500/10 shadow-orange-500/15'
  },
  twist: {
    icon: Zap,
    badgeClass: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-400/30',
    dotClass: 'bg-fuchsia-400 text-slate-950',
    ringClass: 'ring-fuchsia-400/50',
    hex: '#e879f9',
    cardActiveClass: 'border-fuchsia-400/60 bg-fuchsia-500/10 shadow-fuchsia-500/15'
  },
  climax: {
    icon: Flame,
    badgeClass: 'bg-red-500/20 text-red-300 border-red-400/40',
    dotClass: 'bg-red-400 text-slate-950',
    ringClass: 'ring-red-400/60',
    hex: '#f87171',
    cardActiveClass: 'border-red-400/60 bg-red-500/10 shadow-red-500/20'
  },
  sorrow: {
    icon: CloudRain,
    badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-400/30',
    dotClass: 'bg-sky-400 text-slate-950',
    ringClass: 'ring-sky-400/50',
    hex: '#38bdf8',
    cardActiveClass: 'border-sky-400/60 bg-sky-500/10 shadow-sky-500/15'
  },
  revelation: {
    icon: Sparkles,
    badgeClass: 'bg-violet-500/15 text-violet-300 border-violet-400/30',
    dotClass: 'bg-violet-400 text-slate-950',
    ringClass: 'ring-violet-400/50',
    hex: '#a78bfa',
    cardActiveClass: 'border-violet-400/60 bg-violet-500/10 shadow-violet-500/15'
  },
  dread: {
    icon: Ghost,
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
    dotClass: 'bg-emerald-400 text-slate-950',
    ringClass: 'ring-emerald-400/50',
    hex: '#34d399',
    cardActiveClass: 'border-emerald-400/60 bg-emerald-500/10 shadow-emerald-500/15'
  },
  calm: {
    icon: Moon,
    badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-400/30',
    dotClass: 'bg-indigo-400 text-slate-950',
    ringClass: 'ring-indigo-400/50',
    hex: '#818cf8',
    cardActiveClass: 'border-indigo-400/60 bg-indigo-500/10 shadow-indigo-500/15'
  }
};

export function findActiveBeatIndex(beats: ChapterPlotBeat[], currentTime: number): number {
  if (beats.length === 0) return -1;
  let activeIdx = 0;
  for (let i = 0; i < beats.length; i++) {
    if (currentTime + 1.5 >= beats[i].timestampSeconds) {
      activeIdx = i;
    } else {
      break;
    }
  }
  return activeIdx;
}

interface ChapterScrubberMarkersProps {
  beats: ChapterPlotBeat[];
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

export const ChapterScrubberMarkers: React.FC<ChapterScrubberMarkersProps> = ({
  beats,
  currentTime,
  duration,
  onSeek
}) => {
  const [hoveredBeatId, setHoveredBeatId] = useState<string | null>(null);

  if (beats.length === 0) return null;

  const activeIdx = findActiveBeatIndex(beats, currentTime);
  const activeBeat = beats[activeIdx];
  const nextBeat = activeIdx >= 0 && activeIdx + 1 < beats.length ? beats[activeIdx + 1] : null;
  const secondsUntilNext = nextBeat ? Math.max(0, Math.round(nextBeat.timestampSeconds - currentTime)) : 0;

  const formatDelta = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return mins > 0 ? `${mins}m ${rem}s` : `${rem}s`;
  };

  return (
    <div className="w-full space-y-2">
      {/* Live Beat & Upcoming Plot Cue Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
        {activeBeat && (
          <div className="flex items-center gap-2 min-w-0">
            {(() => {
              const cfg = BEAT_VISUAL_CONFIG[activeBeat.beatType];
              const Icon = cfg.icon;
              return (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border font-bold shrink-0 ${cfg.badgeClass}`}>
                  <Icon className="w-3 h-3" />
                  <span>{activeBeat.emotionLabel}</span>
                </span>
              );
            })()}
            <span className="text-white/90 font-bold truncate">{activeBeat.title}</span>
          </div>
        )}

        {nextBeat && duration > 0 && (
          <button
            type="button"
            onClick={() => onSeek(nextBeat.timestampSeconds)}
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-orange-500/20 border border-white/10 hover:border-orange-400/40 text-white/70 hover:text-orange-300 font-bold transition-all shrink-0"
            title={`Jump to ${nextBeat.title} at ${nextBeat.formattedTime}`}
          >
            <span className="text-white/40">Next:</span>
            <span className="truncate max-w-[140px]">{nextBeat.title}</span>
            <span className="text-orange-400 tabular-nums">in {formatDelta(secondsUntilNext)}</span>
          </button>
        )}
      </div>

      {/* Interactive Timeline Plot Pins Track */}
      <div className="relative h-6 w-full select-none">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-white/10" />
        {beats.map((beat, idx) => {
          const cfg = BEAT_VISUAL_CONFIG[beat.beatType];
          const Icon = cfg.icon;
          const isCurrent = idx === activeIdx;
          const isPassed = currentTime >= beat.timestampSeconds;
          const isHovered = hoveredBeatId === beat.id;

          return (
            <div
              key={beat.id}
              style={{ left: `${beat.percent}%` }}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20"
            >
              <button
                type="button"
                onClick={() => onSeek(beat.timestampSeconds)}
                onMouseEnter={() => setHoveredBeatId(beat.id)}
                onMouseLeave={() => setHoveredBeatId(null)}
                onFocus={() => setHoveredBeatId(beat.id)}
                onBlur={() => setHoveredBeatId(null)}
                aria-label={`Jump to ${beat.title} at ${beat.formattedTime}`}
                className={`group/pin relative flex items-center justify-center rounded-full transition-all duration-200 ${
                  isCurrent
                    ? `w-5 h-5 ${cfg.dotClass} ring-4 ${cfg.ringClass} scale-110 shadow-lg`
                    : isPassed
                    ? `w-4 h-4 ${cfg.dotClass} opacity-90 hover:scale-125`
                    : 'w-4 h-4 bg-slate-800 border border-white/30 text-white/80 hover:border-orange-400 hover:scale-125'
                }`}
              >
                <Icon className="w-2.5 h-2.5" />
              </button>

              {isHovered && (
                <div className="absolute bottom-7 left-1/2 -translate-x-1/2 w-56 p-2.5 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-white/15 shadow-2xl pointer-events-none z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${cfg.badgeClass}`}>
                      {beat.emotionLabel}
                    </span>
                    <span className="text-[10px] font-black text-orange-400 tabular-nums">
                      {beat.formattedTime}
                    </span>
                  </div>
                  <p className="text-xs font-black text-white leading-snug">{beat.title}</p>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    "{beat.excerpt}"
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface ChapterProgressMapProps {
  beats: ChapterPlotBeat[];
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
  onCollapse?: () => void;
}

export const ChapterProgressMap: React.FC<ChapterProgressMapProps> = ({
  beats,
  currentTime,
  duration,
  onSeek,
  onCollapse
}) => {
  const activeIdx = findActiveBeatIndex(beats, currentTime);
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  // Build smooth SVG wave curve coordinates for the emotional intensity arc
  const curveGeometry = useMemo(() => {
    if (beats.length === 0) return { linePath: '', areaPath: '', points: [] as { x: number; y: number; beat: ChapterPlotBeat }[] };

    const width = 1000;
    const height = 100;
    const padYTop = 18;
    const padYBottom = 16;
    const usableH = height - padYTop - padYBottom;

    const pts = beats.map(beat => {
      const x = Math.max(25, Math.min(975, (beat.percent / 100) * width));
      const norm = Math.max(0, Math.min(1, (beat.intensity - 25) / 75));
      const y = height - padYBottom - norm * usableH;
      return { x, y, beat };
    });

    if (pts.length === 1) {
      const p = pts[0];
      return {
        linePath: `M 0 ${p.y} L ${width} ${p.y}`,
        areaPath: `M 0 ${height} L 0 ${p.y} L ${width} ${p.y} L ${width} ${height} Z`,
        points: pts
      };
    }

    let line = `M 0 ${pts[0].y} L ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const midX = (curr.x + next.x) / 2;
      line += ` C ${midX} ${curr.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
    }
    const last = pts[pts.length - 1];
    line += ` L ${width} ${last.y}`;

    const area = `${line} L ${width} ${height} L 0 ${height} Z`;
    return { linePath: line, areaPath: area, points: pts };
  }, [beats]);

  if (beats.length === 0) return null;

  const activeBeat = beats[activeIdx] || beats[0];

  return (
    <section
      aria-label="Chapter Progress Map"
      className="w-full rounded-3xl bg-slate-900/75 backdrop-blur-2xl border border-white/10 p-4 sm:p-5 shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300"
    >
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-400/30 flex items-center justify-center text-orange-400">
            <MapIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                Chapter Progress Map
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-black text-white/80 tabular-nums">
                Beat {Math.max(1, activeIdx + 1)} / {beats.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Tap any emotional beat or plot twist node to jump straight to that moment
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeBeat && (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                BEAT_VISUAL_CONFIG[activeBeat.beatType].badgeClass
              }`}
            >
              <span>Now: {activeBeat.emotionLabel}</span>
            </span>
          )}
          {onCollapse && (
            <button
              type="button"
              onClick={onCollapse}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/10"
              title="Collapse Chapter Progress Map"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Emotional Arc SVG Curve + Interactive Beat Nodes */}
      <div className="relative w-full h-24 sm:h-28 rounded-2xl bg-slate-950/70 border border-white/5 overflow-hidden px-2">
        {/* Subtle horizontal intensity guide lines */}
        <div className="absolute inset-x-0 top-1/3 border-t border-dashed border-white/5 pointer-events-none" />
        <div className="absolute inset-x-0 top-2/3 border-t border-dashed border-white/5 pointer-events-none" />
        <span className="absolute left-2.5 top-1.5 text-[9px] font-bold uppercase tracking-widest text-white/25 pointer-events-none">
          Peak Drama
        </span>
        <span className="absolute left-2.5 bottom-1.5 text-[9px] font-bold uppercase tracking-widest text-white/20 pointer-events-none">
          Calm / Setup
        </span>

        <svg
          viewBox="0 0 1000 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <defs>
            <linearGradient id="sgfmBeatCurveDim" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#fb7185" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.32" />
            </linearGradient>
            <linearGradient id="sgfmBeatCurveLit" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
            <linearGradient id="sgfmBeatArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </linearGradient>
            <clipPath id="sgfmProgressClip">
              <rect x="0" y="0" width={progressPercent * 10} height="100" />
            </clipPath>
          </defs>

          {/* Unplayed arc */}
          <path
            d={curveGeometry.linePath}
            fill="none"
            stroke="url(#sgfmBeatCurveDim)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Played glowing arc + area fill */}
          <g clipPath="url(#sgfmProgressClip)">
            <path d={curveGeometry.areaPath} fill="url(#sgfmBeatArea)" />
            <path
              d={curveGeometry.linePath}
              fill="none"
              stroke="url(#sgfmBeatCurveLit)"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </g>

          {/* Current playhead beam */}
          <line
            x1={progressPercent * 10}
            y1="4"
            x2={progressPercent * 10}
            y2="96"
            stroke="#ffffff"
            strokeOpacity="0.55"
            strokeWidth="2"
            strokeDasharray="3 3"
          />
        </svg>

        {/* Interactive Node Buttons positioned along the curve */}
        {curveGeometry.points.map(({ x, y, beat }, idx) => {
          const cfg = BEAT_VISUAL_CONFIG[beat.beatType];
          const Icon = cfg.icon;
          const isCurrent = idx === activeIdx;
          const isPassed = currentTime >= beat.timestampSeconds;
          const leftPct = (x / 1000) * 100;
          const topPct = (y / 100) * 100;

          return (
            <button
              key={beat.id}
              type="button"
              onClick={() => onSeek(beat.timestampSeconds)}
              style={{ left: `${leftPct}%`, top: `${topPct}%` }}
              title={`${beat.formattedTime} · ${beat.title}`}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center transition-all duration-200 z-10 ${
                isCurrent
                  ? `w-8 h-8 ${cfg.dotClass} ring-4 ${cfg.ringClass} scale-110 shadow-xl`
                  : isPassed
                  ? `w-6 h-6 ${cfg.dotClass} hover:scale-125 shadow-md`
                  : 'w-6 h-6 bg-slate-900 border-2 border-white/30 text-white hover:border-orange-400 hover:scale-125'
              }`}
            >
              <Icon className={isCurrent ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
            </button>
          );
        })}
      </div>

      {/* Horizontal Storyboard Beat Cards */}
      <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10">
        {beats.map((beat, idx) => {
          const cfg = BEAT_VISUAL_CONFIG[beat.beatType];
          const Icon = cfg.icon;
          const isCurrent = idx === activeIdx;
          const isPassed = idx < activeIdx;

          return (
            <button
              key={beat.id}
              type="button"
              onClick={() => onSeek(beat.timestampSeconds)}
              className={`group/beat text-left shrink-0 w-52 sm:w-56 p-3 rounded-2xl border transition-all duration-200 ${
                isCurrent
                  ? `${cfg.cardActiveClass} shadow-lg scale-[1.01]`
                  : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${cfg.badgeClass}`}>
                  <Icon className="w-2.5 h-2.5" />
                  <span>{beat.emotionLabel}</span>
                </span>

                <div className="flex items-center gap-1 text-[10px] font-black tabular-nums">
                  {isPassed && !isCurrent && (
                    <Check className="w-3 h-3 text-emerald-400" />
                  )}
                  {isCurrent && (
                    <Play className="w-2.5 h-2.5 text-orange-400 fill-current" />
                  )}
                  <span className={isCurrent ? 'text-orange-300' : 'text-slate-400'}>
                    {beat.formattedTime}
                  </span>
                </div>
              </div>

              <h5 className="text-xs font-black text-white truncate group-hover/beat:text-orange-300 transition-colors">
                {idx + 1}. {beat.title}
              </h5>

              <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                "{beat.excerpt}"
              </p>

              {beat.speaker && (
                <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-cyan-300/80">
                  <User className="w-2.5 h-2.5" />
                  <span className="truncate">{beat.speaker}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};
