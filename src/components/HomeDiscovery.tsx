import React, { useState, useMemo } from 'react';
import {
  Flame,
  Trophy,
  Sparkles,
  Filter,
  Headphones,
  Compass,
  Search,
  Play,
  Clock,
  Globe,
  X,
  RotateCcw,
  SlidersHorizontal,
  Volume2,
  Tag,
  Check,
  LayoutGrid,
  List,
  BookOpen
} from 'lucide-react';
import { Genre, Story } from '../types';
import { HeroCarousel } from './HeroCarousel';
import { StoryCard } from './StoryCard';
import { useApp } from '../context/AppContext';

const GENRES: ('All' | Genre)[] = [
  'All',
  'Romance',
  'Fantasy',
  'Horror',
  'Sci-Fi',
  'Drama',
  'Thriller'
];

type DurationFilter = 'all' | 'short' | 'medium' | 'long';

interface DurationOption {
  id: DurationFilter;
  label: string;
  badge: string;
  description: string;
}

const DURATION_OPTIONS: DurationOption[] = [
  { id: 'all', label: 'All Lengths', badge: 'Any', description: 'All audio stories' },
  { id: 'short', label: '< 15 Mins', badge: 'Quick', description: 'Quick bites under 15 min' },
  { id: 'medium', label: '15 – 25 Mins', badge: 'Standard', description: 'Average chapter length' },
  { id: 'long', label: '25+ Mins', badge: 'Epic', description: 'Long full storylines' }
];

interface LanguageOption {
  id: string;
  label: string;
  native: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { id: 'All', label: 'All Languages', native: 'All' },
  { id: 'Hindi', label: 'Hindi', native: 'हिन्दी' },
  { id: 'English', label: 'English', native: 'English' },
  { id: 'Bengali', label: 'Bengali', native: 'বাংলা' },
  { id: 'Tamil', label: 'Tamil', native: 'தமிழ்' },
  { id: 'Telugu', label: 'Telugu', native: 'తెలుగు' },
  { id: 'Marathi', label: 'Marathi', native: 'मराठी' }
];

const POPULAR_SEARCH_TAGS = [
  'Billionaire',
  'Dark Fantasy',
  'Psychological Horror',
  'Cyberpunk',
  'Enemies to Lovers',
  'Royal Intrigue',
  'Forbidden Love'
];

interface HomeDiscoveryProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  mode?: 'home' | 'discover';
  onOpenContests?: () => void;
}

export const HomeDiscovery: React.FC<HomeDiscoveryProps> = ({
  searchQuery,
  setSearchQuery,
  mode = 'home',
  onOpenContests
}) => {
  const { stories, user, contests, contestEntries } = useApp();

  // Search & Filter State
  const [selectedGenre, setSelectedGenre] = useState<'All' | Genre>('All');
  const [selectedDuration, setSelectedDuration] = useState<DurationFilter>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest'>('popular');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Active filter count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedGenre !== 'All') count++;
    if (selectedDuration !== 'all') count++;
    if (selectedLanguage !== 'All') count++;
    return count;
  }, [selectedGenre, selectedDuration, selectedLanguage]);

  // Home Page All Stories Filter & Layout State
  const [homeGenreFilter, setHomeGenreFilter] = useState<'All' | Genre>('All');
  const [homeViewLayout, setHomeViewLayout] = useState<'grid' | 'list'>('grid');

  const homeAllStories = useMemo(() => {
    if (homeGenreFilter === 'All') return stories;
    return stories.filter((s) => s.genre === homeGenreFilter);
  }, [stories, homeGenreFilter]);

  // Real-Time Filtered and Searched Stories
  const filteredStories = useMemo(() => {
    return stories
      .filter((story) => {
        // 1. Genre filter
        const matchesGenre = selectedGenre === 'All' || story.genre === selectedGenre;

        // 2. Duration filter (sum total duration in minutes)
        const totalDurationMins = Math.round(
          (story.episodes || []).reduce((acc, ep) => acc + (ep.durationSeconds || 180), 0) / 60
        );

        let matchesDuration = true;
        if (selectedDuration === 'short') {
          matchesDuration = totalDurationMins < 15;
        } else if (selectedDuration === 'medium') {
          matchesDuration = totalDurationMins >= 15 && totalDurationMins <= 25;
        } else if (selectedDuration === 'long') {
          matchesDuration = totalDurationMins > 25;
        }

        // 3. Language filter
        const storyLanguage =
          story.language ||
          (story.narratorName?.toLowerCase().includes('english')
            ? 'English'
            : story.narratorName?.toLowerCase().includes('kabir') ||
              story.narratorName?.toLowerCase().includes('samar') ||
              story.narratorName?.toLowerCase().includes('meera') ||
              story.narratorName?.includes('कबीर') ||
              story.narratorName?.includes('समर') ||
              story.narratorName?.includes('मीरा')
            ? 'Hindi'
            : 'Hindi');

        const matchesLanguage =
          selectedLanguage === 'All' ||
          storyLanguage.toLowerCase() === selectedLanguage.toLowerCase();

        // 4. Real-time Search Query matching
        const query = searchQuery.trim().toLowerCase();
        if (!query) {
          return matchesGenre && matchesDuration && matchesLanguage;
        }

        const titleMatch = story.title.toLowerCase().includes(query);
        const authorMatch = story.author.toLowerCase().includes(query);
        const descMatch = story.description.toLowerCase().includes(query);
        const tagMatch = story.tags.some((t) => t.toLowerCase().includes(query));
        const genreMatch = story.genre.toLowerCase().includes(query);
        const narratorMatch = story.narratorName.toLowerCase().includes(query);
        const epMatch = (story.episodes || []).some(
          (ep) =>
            ep.title.toLowerCase().includes(query) ||
            (ep.summary && ep.summary.toLowerCase().includes(query))
        );

        const matchesSearch =
          titleMatch || authorMatch || descMatch || tagMatch || genreMatch || narratorMatch || epMatch;

        return matchesGenre && matchesDuration && matchesLanguage && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest') return (b.newlyAdded ? 1 : 0) - (a.newlyAdded ? 1 : 0);
        return b.totalPlays - a.totalPlays;
      });
  }, [stories, selectedGenre, selectedDuration, selectedLanguage, searchQuery, sortBy]);

  // Section collections for Home View
  const continuePlaying = useMemo(() => {
    return user.history
      .map((h) => stories.find((s) => s.id === h.storyId))
      .filter(Boolean)
      .slice(0, 4) as Story[];
  }, [stories, user.history]);

  const trailers = useMemo(() => {
    return stories.filter((s) => s.trailerVideoUrl).slice(0, 4);
  }, [stories]);

  const emergingStars = useMemo(() => {
    return stories.filter((s) => s.isEmergingStar).slice(0, 4);
  }, [stories]);

  const trendingStories = useMemo(() => {
    return [...stories].sort((a, b) => b.totalPlays - a.totalPlays).slice(0, 5);
  }, [stories]);

  const top10Stories = useMemo(() => {
    return [...stories].sort((a, b) => (a.top10Rank || 99) - (b.top10Rank || 99)).slice(0, 5);
  }, [stories]);

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedGenre('All');
    setSelectedDuration('all');
    setSelectedLanguage('All');
    setSearchQuery('');
  };

  // If in pure Home view without search query, show premium streaming sections
  const isPureHome = mode === 'home' && !searchQuery.trim() && activeFiltersCount === 0;

  if (isPureHome) {
    return (
      <div className="space-y-10 pb-20">
        <HeroCarousel stories={stories.filter((s) => s.featured)} />

        {/* Home Quick Search Bar */}
        <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-orange-950/20 border border-slate-800 p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-orange-400" />
                <span>Search & Explore Stories</span>
              </h3>
              <p className="text-xs text-slate-400">
                Filter by genre, duration, and language with instant real-time results.
              </p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, keyword (e.g. Billionaire, Horror)..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-all shadow-inner"
            />
          </div>

          {/* Quick tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
              Popular:
            </span>
            {POPULAR_SEARCH_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSearchQuery(tag)}
                className="px-3 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-medium text-slate-400 hover:text-orange-400 transition-colors shrink-0"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Writer Contest Spotlight Banner */}
        {onOpenContests && contests[0] && (
          <div
            onClick={onOpenContests}
            className="cursor-pointer group rounded-3xl bg-gradient-to-r from-orange-500/15 via-slate-900 to-amber-500/15 border border-orange-500/30 hover:border-orange-400/60 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-lg hover:shadow-orange-500/10"
          >
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                    Live Writer Contest
                  </span>
                  <span className="text-[11px] font-bold text-amber-300">
                    {contests[0].grandPrizeCoins.toLocaleString()} Coins + Publishing Deal
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white group-hover:text-orange-400 transition-colors">
                  {contests[0].title}
                </h3>
                <p className="text-xs text-slate-400">
                  {contestEntries.filter(e => e.contestId === contests[0].id).length} entries competing · {contests[0].daysLeft} days left to submit or vote
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenContests();
              }}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider shrink-0 shadow-md shadow-orange-500/20 self-start sm:self-center"
            >
              Enter or Vote →
            </button>
          </div>
        )}

        {/* Section: Continue Playing */}
        {continuePlaying.length > 0 && (
          <section className="space-y-4 px-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                  <Play className="w-4 h-4 fill-current" />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  Continue Playing
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_#f97316]" />
                </h3>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              {continuePlaying.map((story) => (
                <div key={`continue-${story.id}`} className="min-w-[280px] sm:min-w-[320px] shrink-0">
                  <StoryCard story={story} layout="ranked" rank={undefined} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section: Trailers for you */}
        <section className="space-y-4 px-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <Headphones className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                Trailers for you
                <span className="text-[10px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full font-black">
                  NEW
                </span>
              </h3>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {trailers.map((story) => (
              <div
                key={`trailer-${story.id}`}
                className="group relative min-w-[200px] sm:min-w-[240px] aspect-video rounded-2xl overflow-hidden border border-white/5 bg-slate-900 cursor-pointer shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-500/30 transition-all shrink-0"
              >
                <video
                  src={story.trailerVideoUrl}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                  muted
                  loop
                  onMouseOver={(e) => e.currentTarget.play()}
                  onMouseOut={(e) => e.currentTarget.pause()}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_5px_#06b6d4]" />
                    <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                      Cinema Teaser
                    </p>
                  </div>
                  <p className="text-sm font-bold text-white truncate drop-shadow-lg">{story.title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Emerging Stars */}
        <section className="space-y-4 px-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <Trophy className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                Emerging Stars
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              </h3>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {emergingStars.map((story) => (
              <div key={`emerging-${story.id}`} className="min-w-[160px] sm:min-w-[200px] shrink-0">
                <StoryCard story={story} />
              </div>
            ))}
          </div>
        </section>

        {/* Section: Trending Audiobooks Top Chart */}
        <section className="space-y-4 px-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                <Flame className="w-4 h-4 fill-orange-500" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                Top Trending Audiobooks
                <span className="text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full font-black">
                  POPULAR
                </span>
              </h3>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {top10Stories.map((story, idx) => (
              <StoryCard key={`home-top-${story.id}`} story={story} layout="ranked" rank={idx + 1} />
            ))}
          </div>
        </section>

        {/* Section: All Stories View (सभी कहानियाँ) */}
        <section className="space-y-6 px-1 pt-4 border-t border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-md">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                    All Stories
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-[10px] font-mono font-bold text-orange-400">
                    {stories.length} Audiobooks
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Complete collection of original novels, audio dramas, and multi-voice series
                </p>
              </div>
            </div>

            {/* Layout Toggle (Grid vs List) */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">View:</span>
              <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
                <button
                  type="button"
                  onClick={() => setHomeViewLayout('grid')}
                  className={`p-1.5 rounded-lg transition-all ${
                    homeViewLayout === 'grid'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'hover:text-white'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setHomeViewLayout('list')}
                  className={`p-1.5 rounded-lg transition-all ${
                    homeViewLayout === 'list'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'hover:text-white'
                  }`}
                  title="Compact List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Genre Category Pills for All Stories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {GENRES.map((genre) => {
              const isSelected = homeGenreFilter === genre;
              const count =
                genre === 'All'
                  ? stories.length
                  : stories.filter((s) => s.genre === genre).length;
              return (
                <button
                  key={`home-genre-tab-${genre}`}
                  type="button"
                  onClick={() => setHomeGenreFilter(genre)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 border flex items-center gap-2 ${
                    isSelected
                      ? 'bg-orange-500 border-orange-400 text-slate-950 font-black shadow-md shadow-orange-500/20'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span>{genre}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* All Stories Display */}
          {homeViewLayout === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
              {homeAllStories.map((story) => (
                <StoryCard key={`home-all-grid-${story.id}`} story={story} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {homeAllStories.map((story, idx) => (
                <StoryCard
                  key={`home-all-list-${story.id}`}
                  story={story}
                  layout="ranked"
                  rank={idx + 1}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  // Active Search / Discover Mode with Real-Time Filters
  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-300">
      {/* Header & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-2.5">
              <span>Explore Audiobooks</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 uppercase">
                Live Search
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Filter by genre, duration, and language with instant real-time results.
            </p>
          </div>

          {/* Result Counter & Reset Button */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400">
              {filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'} found
            </span>
            {(searchQuery || activeFiltersCount > 0) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-orange-400 border border-slate-800 flex items-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All</span>
              </button>
            )}
          </div>
        </div>

        {/* Real-Time Live Search Input Box */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type anything (e.g. title, author, keyword, character, or theme)..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 rounded-2xl pl-12 pr-10 py-4 text-sm text-white placeholder-slate-500 outline-none transition-all shadow-xl"
            autoFocus={mode === 'discover'}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Real-time Filters Console */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-lg">
        {/* Row 1: Genre Filter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-orange-400" />
              <span>Genre</span>
            </span>
            <span className="text-[11px] font-semibold text-orange-400">
              {selectedGenre}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {GENRES.map((genre) => {
              const isSelected = selectedGenre === genre;
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 border ${
                    isSelected
                      ? 'bg-orange-500 border-orange-400 text-slate-950 shadow-md shadow-orange-500/20 font-black'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {genre}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Duration & Language Filters (Grid on Desktop, stacked on mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-800/80">
          {/* Duration Filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Story Duration</span>
              </span>
              <span className="text-[11px] font-semibold text-cyan-400">
                {DURATION_OPTIONS.find((d) => d.id === selectedDuration)?.label}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DURATION_OPTIONS.map((opt) => {
                const isSelected = selectedDuration === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedDuration(opt.id)}
                    className={`p-2.5 rounded-xl text-center border transition-all ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow-md shadow-cyan-500/20'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{opt.label}</div>
                    <div className={`text-[9px] font-medium opacity-75 ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                      {opt.badge}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language Filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>Audio Language</span>
              </span>
              <span className="text-[11px] font-semibold text-amber-400">
                {LANGUAGE_OPTIONS.find((l) => l.id === selectedLanguage)?.native || selectedLanguage}
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {LANGUAGE_OPTIONS.map((lang) => {
                const isSelected = selectedLanguage === lang.id;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setSelectedLanguage(lang.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 border flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <span>{lang.native}</span>
                    {lang.id !== 'All' && lang.id !== lang.native && (
                      <span className={`text-[9px] font-normal ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                        ({lang.label})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Filters Pill Bar & Sort Options */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
          {/* Active Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active:</span>

            {selectedGenre !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[11px] font-bold">
                Genre: {selectedGenre}
                <button type="button" onClick={() => setSelectedGenre('All')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedDuration !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[11px] font-bold">
                Duration: {DURATION_OPTIONS.find((d) => d.id === selectedDuration)?.label}
                <button type="button" onClick={() => setSelectedDuration('all')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedLanguage !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-bold">
                Language: {selectedLanguage}
                <button type="button" onClick={() => setSelectedLanguage('All')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-white text-[11px] font-bold">
                Query: "{searchQuery}"
                <button type="button" onClick={() => setSearchQuery('')} className="hover:text-orange-400">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {activeFiltersCount === 0 && !searchQuery && (
              <span className="text-slate-500 text-[11px] italic">No filters applied (showing all)</span>
            )}
          </div>

          {/* Sort By Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sort:</span>
            <div className="flex items-center p-0.5 rounded-xl bg-slate-950 border border-slate-800">
              <button
                type="button"
                onClick={() => setSortBy('popular')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  sortBy === 'popular' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Plays
              </button>
              <button
                type="button"
                onClick={() => setSortBy('rating')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  sortBy === 'rating' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Rating
              </button>
              <button
                type="button"
                onClick={() => setSortBy('newest')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  sortBy === 'newest' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Newest
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Results Grid or Empty State */}
      {filteredStories.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span>Results</span>
              <span className="text-xs font-mono font-bold text-orange-400 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                {filteredStories.length} {filteredStories.length === 1 ? 'novel' : 'novels'}
              </span>
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
            {filteredStories.map((story) => (
              <StoryCard key={`live-search-${story.id}`} story={story} />
            ))}
          </div>
        </section>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mx-auto">
            <Search className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-white">No Audiobooks Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No stories match your current search query "{searchQuery}" with the selected genre ({selectedGenre}), duration, and language filters.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 transition-all active:scale-95"
            >
              Clear All Filters & Show All Stories
            </button>
          </div>
        </div>
      )}

      {/* Suggested Trending Stories if Search is Active */}
      {searchQuery && filteredStories.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-slate-800/80">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-bold text-slate-300 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Trending Across SGFM</span>
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {trendingStories.slice(0, 5).map((story) => (
              <StoryCard key={`search-trend-${story.id}`} story={story} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
