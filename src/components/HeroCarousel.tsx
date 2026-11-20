import React, { useState, useEffect } from 'react';
import { Play, Bookmark, Star, ChevronLeft, ChevronRight, Headphones, Sparkles, Volume2 } from 'lucide-react';
import { Story } from '../types';
import { useApp } from '../context/AppContext';

interface HeroCarouselProps {
  stories: Story[];
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ stories }) => {
  const {
    playEpisode,
    openStoryDetail,
    toggleSaveLibrary,
    isSavedInLibrary,
    currentStory,
    isPlaying
  } = useApp();

  const featuredStories = stories.slice(0, 4);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance banner every 6 seconds
  useEffect(() => {
    if (featuredStories.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredStories.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featuredStories.length]);

  if (featuredStories.length === 0) return null;

  const current = featuredStories[currentIndex];
  const isSaved = isSavedInLibrary(current.id);
  const isPlayingCurrent = currentStory?.id === current.id && isPlaying;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredStories.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredStories.length) % featuredStories.length);
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
      {/* Background Ambience / Backdrop glow */}
      <div className="absolute inset-0 z-0">
        <img
          src={current.coverUrl}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover blur-2xl opacity-25 scale-110 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8 md:p-10 items-center">
        {/* Left Column: Story Information */}
        <div className="md:col-span-7 flex flex-col justify-center space-y-4">
          {/* Editorial Kicker */}
          <div className="flex items-center gap-2 text-xs font-medium text-amber-400">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="uppercase tracking-wider font-semibold">Featured Audio Series</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-300">{current.genre}</span>
          </div>

          <h2 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight">
            {current.title}
          </h2>

          <p className="text-sm sm:text-base text-slate-300 line-clamp-3 leading-relaxed">
            {current.description}
          </p>

          {/* Clean Unboxed Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-400 pt-1">
            <span className="flex items-center gap-1 text-amber-300 font-semibold">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {current.rating} Rating
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-200">{current.totalEpisodes} Episodes</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              {current.narratorName}
            </span>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={() => {
                if (current.episodes.length > 0) {
                  playEpisode(current, current.episodes[0], true);
                }
              }}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>{isPlayingCurrent ? 'Playing Episode 1' : 'Listen Episode 1'}</span>
            </button>

            <button
              onClick={() => openStoryDetail(current)}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-sm transition-colors border border-slate-700"
            >
              View Chapters
            </button>

            <button
              onClick={() => toggleSaveLibrary(current.id)}
              className={`p-3 rounded-xl border transition-colors ${
                isSaved
                  ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
              title={isSaved ? "Remove from Library" : "Save to Library"}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Right Column: High Quality Vertical Cover Card */}
        <div className="md:col-span-5 flex justify-center md:justify-end">
          <div
            onClick={() => openStoryDetail(current)}
            className="group/cover relative w-56 sm:w-64 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-800/90 cursor-pointer transform hover:-translate-y-1 transition-transform"
          >
            <img
              src={current.coverUrl}
              alt={current.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover/cover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-200">
              <span className="font-semibold text-amber-400 drop-shadow">By {current.author}</span>
              <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[11px]">
                <Headphones className="w-3 h-3 text-amber-400" />
                HD Audio
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel Navigation Indicators & Chevrons */}
      <div className="relative z-10 px-6 sm:px-10 pb-5 pt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {featuredStories.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                currentIndex === idx ? 'w-8 bg-amber-400' : 'w-2 bg-slate-700 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            aria-label="Previous story"
            className="w-8 h-8 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next story"
            className="w-8 h-8 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
