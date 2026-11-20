import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Award,
  Flame,
  Clock,
  Sparkles,
  BookOpen,
  Play,
  PenTool,
  CheckCircle2,
  Coins,
  Users,
  X,
  Plus,
  ScrollText,
  Crown,
  ThumbsUp,
  Headphones,
  ArrowRight
} from 'lucide-react';
import { Genre, WriterContest } from '../types';
import { PRESET_COVERS } from '../data/initialStories';
import { useApp } from '../context/AppContext';

interface WriterContestViewProps {
  onNavigateToWriter?: () => void;
}

const GENRE_FILTERS: ('All' | Genre)[] = ['All', 'Romance', 'Fantasy', 'Horror', 'Sci-Fi', 'Drama', 'Thriller'];

export const WriterContestView: React.FC<WriterContestViewProps> = ({ onNavigateToWriter }) => {
  const {
    user,
    stories,
    contests,
    contestEntries,
    submitContestEntry,
    toggleVoteContestEntry,
    hasVotedContestEntry,
    openStoryDetail,
    playEpisode,
    showToast
  } = useApp();

  const [selectedContestId, setSelectedContestId] = useState<string>(contests[0]?.id || '');
  const [sortBy, setSortBy] = useState<'votes' | 'plays' | 'newest'>('votes');
  const [genreFilter, setGenreFilter] = useState<'All' | Genre>('All');
  const [showRulesModal, setShowRulesModal] = useState(false);

  // Submission Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitMode, setSubmitMode] = useState<'new' | 'existing'>('new');
  const [existingStoryId, setExistingStoryId] = useState<string>(stories[0]?.id || '');
  const [pitchNote, setPitchNote] = useState('');

  // New Story Contest Entry Fields
  const [newTitle, setNewTitle] = useState('');
  const [newAuthorName, setNewAuthorName] = useState(user.name || 'Aryan Sharma');
  const [newGenre, setNewGenre] = useState<Genre>('Romance');
  const [newCoverUrl, setNewCoverUrl] = useState(PRESET_COVERS[0].url);
  const [newDescription, setNewDescription] = useState('');
  const [newChapterTitle, setNewChapterTitle] = useState('Episode 1: The Midnight Choice');
  const [newChapterContent, setNewChapterContent] = useState('');

  const activeContest: WriterContest = useMemo(
    () => contests.find(c => c.id === selectedContestId) || contests[0],
    [contests, selectedContestId]
  );

  const openSubmitForContest = (contest: WriterContest) => {
    setSelectedContestId(contest.id);
    const defaultGenre =
      contest.eligibleGenres[0] === 'All' ? 'Romance' : (contest.eligibleGenres[0] as Genre);
    setNewGenre(defaultGenre);
    setIsSubmitModalOpen(true);
  };

  const entriesWithStory = useMemo(() => {
    return contestEntries
      .filter(entry => entry.contestId === activeContest.id)
      .map(entry => {
        const story = stories.find(s => s.id === entry.storyId);
        return { entry, story };
      })
      .filter((item): item is { entry: typeof item.entry; story: NonNullable<typeof item.story> } => Boolean(item.story))
      .filter(item => genreFilter === 'All' || item.story.genre === genreFilter)
      .sort((a, b) => {
        if (sortBy === 'votes') return b.entry.votes - a.entry.votes;
        if (sortBy === 'plays') return b.story.totalPlays - a.story.totalPlays;
        return b.entry.id.localeCompare(a.entry.id);
      });
  }, [contestEntries, activeContest.id, stories, genreFilter, sortBy]);

  const totalVotesInContest = useMemo(
    () =>
      contestEntries
        .filter(e => e.contestId === activeContest.id)
        .reduce((acc, e) => acc + e.votes, 0),
    [contestEntries, activeContest.id]
  );

  const totalEntriesCount = useMemo(
    () => contestEntries.filter(e => e.contestId === activeContest.id).length,
    [contestEntries, activeContest.id]
  );

  const wordCount = useMemo(
    () => (newChapterContent.trim() ? newChapterContent.trim().split(/\s+/).length : 0),
    [newChapterContent]
  );

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (submitMode === 'existing') {
      if (!existingStoryId) {
        showToast('Please select a story to submit');
        return;
      }
      const chosenStory = stories.find(s => s.id === existingStoryId);
      if (
        chosenStory &&
        !activeContest.eligibleGenres.includes('All') &&
        !activeContest.eligibleGenres.includes(chosenStory.genre)
      ) {
        showToast(
          `This contest accepts ${activeContest.eligibleGenres.join(', ')} stories only.`
        );
        return;
      }
      const created = submitContestEntry({
        contestId: activeContest.id,
        existingStoryId,
        pitchNote
      });
      if (created) {
        setIsSubmitModalOpen(false);
        setPitchNote('');
      }
      return;
    }

    if (!newTitle.trim() || !newDescription.trim() || !newChapterContent.trim()) {
      showToast('Please fill in the story title, synopsis, and opening chapter text');
      return;
    }

    if (wordCount < Math.min(30, activeContest.minWords)) {
      showToast(`Write at least ${Math.min(30, activeContest.minWords)} words for your opening chapter`);
      return;
    }

    const created = submitContestEntry({
      contestId: activeContest.id,
      newStory: {
        title: newTitle,
        genre: newGenre,
        description: newDescription,
        chapterTitle: newChapterTitle,
        chapterContent: newChapterContent,
        coverUrl: newCoverUrl,
        authorName: newAuthorName
      },
      pitchNote
    });

    if (created) {
      setIsSubmitModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      setNewChapterContent('');
      setPitchNote('');
    }
  };

  return (
    <div className="space-y-8 pb-28 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Contest Selector Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {contests.map(contest => {
          const isSelected = contest.id === activeContest.id;
          const entryCount = contestEntries.filter(e => e.contestId === contest.id).length;

          return (
            <button
              key={contest.id}
              type="button"
              onClick={() => {
                setSelectedContestId(contest.id);
                setGenreFilter('All');
              }}
              className={`p-4 rounded-2xl text-left transition-all border relative overflow-hidden group ${
                isSelected
                  ? 'bg-gradient-to-br from-orange-500/15 via-slate-900 to-amber-500/10 border-orange-500/60 shadow-xl shadow-orange-500/10'
                  : 'bg-slate-900/70 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    contest.status === 'live'
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                  }`}
                >
                  {contest.status === 'live' ? '● Live Now' : 'Early Entry Open'}
                </span>
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-orange-400" />
                  {contest.daysLeft}d left
                </span>
              </div>

              <h3 className={`text-sm font-black line-clamp-1 ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                {contest.title}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{contest.subtitle}</p>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-bold">
                <span className="text-amber-300 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  {contest.grandPrizeCoins.toLocaleString()} Coins
                </span>
                <span className="text-slate-400">{entryCount} Entries</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Featured Contest Showcase Banner */}
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-orange-950/30 border border-orange-500/25 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500 text-slate-950 text-[10px] font-black uppercase tracking-widest">
                <Trophy className="w-3.5 h-3.5" />
                <span>SGFM Writer Contest</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-950/70 border border-slate-800 text-slate-300 text-[10px] font-bold uppercase tracking-wider">
                {activeContest.deadlineLabel}
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                +{activeContest.entryBonusCoins} Coins Entry Bonus
              </span>
            </div>

            <div>
              <h1 className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight">
                {activeContest.title}
              </h1>
              <p className="text-sm text-slate-300 mt-1.5">{activeContest.prizePoolText}</p>
            </div>

            {/* Theme Prompt Box */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-orange-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Official Theme Prompt</span>
              </div>
              <p className="text-sm text-slate-200 font-serif italic">"{activeContest.themePrompt}"</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => openSubmitForContest(activeContest)}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
              >
                <PenTool className="w-4 h-4" />
                <span>Submit Your Story</span>
              </button>

              <button
                type="button"
                onClick={() => setShowRulesModal(prev => !prev)}
                className="px-4 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-colors"
              >
                <ScrollText className="w-4 h-4 text-orange-400" />
                <span>{showRulesModal ? 'Hide Rules & Rubric' : 'Rules & Judging Criteria'}</span>
              </button>

              {onNavigateToWriter && (
                <button
                  type="button"
                  onClick={onNavigateToWriter}
                  className="px-4 py-3 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 border border-slate-800 transition-colors"
                >
                  <span>Open Author Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Contest Stats Summary Card */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Grand Prize</span>
              <div className="text-xl font-black text-amber-400 tabular-nums">
                {activeContest.grandPrizeCoins.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-500">Coins + Contract</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Time Left</span>
              <div className="text-xl font-black text-white tabular-nums">{activeContest.daysLeft} Days</div>
              <span className="text-[10px] text-emerald-400 font-semibold">Submissions Open</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Entries</span>
              <div className="text-xl font-black text-white tabular-nums">{totalEntriesCount}</div>
              <span className="text-[10px] text-slate-500">Competing Novels</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Votes</span>
              <div className="text-xl font-black text-orange-400 tabular-nums">
                {totalVotesInContest.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-500">Community Ballot</span>
            </div>
          </div>
        </div>

        {/* Collapsible Rules & Judging Criteria */}
        {showRulesModal && (
          <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                <ScrollText className="w-4 h-4" />
                <span>Contest Rules & Eligibility</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Eligible Genres:{' '}
                    <strong className="text-white">{activeContest.eligibleGenres.join(', ')}</strong> · Min opening chapter:{' '}
                    <strong className="text-white">{activeContest.minWords} words</strong>
                  </span>
                </li>
                {activeContest.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                <span>Judging Breakdown</span>
              </h4>
              <div className="space-y-2.5">
                {activeContest.judgingCriteria.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-slate-200">{item.label}</span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-orange-500/15 text-orange-400 font-black tabular-nums">
                      {item.weight}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Leaderboard & Voting Controls */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <span>Contest Entries & Live Leaderboard</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Listen, read, and vote for your favorite writers to boost their ranking
            </p>
          </div>

          {/* Sort Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
            {([
              { id: 'votes', label: 'Top Voted' },
              { id: 'plays', label: 'Most Listened' },
              { id: 'newest', label: 'Newest' }
            ] as const).map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSortBy(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  sortBy === opt.id
                    ? 'bg-orange-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Genre Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {GENRE_FILTERS.map(g => (
            <button
              key={g}
              type="button"
              onClick={() => setGenreFilter(g)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 border transition-all ${
                genreFilter === g
                  ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Entries List */}
        {entriesWithStory.length === 0 ? (
          <div className="py-16 text-center rounded-3xl bg-slate-900/50 border border-slate-800 space-y-3">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No entries match this filter yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Be the first to submit a story in this category and claim +{activeContest.entryBonusCoins} bonus coins!
            </p>
            <button
              type="button"
              onClick={() => openSubmitForContest(activeContest)}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Submit First Entry</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {entriesWithStory.map(({ entry, story }, idx) => {
              const rank = idx + 1;
              const voted = hasVotedContestEntry(entry.id);
              const isMine = entry.authorId === user.id;
              const rankBadgeStyle =
                rank === 1
                  ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/25'
                  : rank === 2
                  ? 'bg-slate-200 text-slate-950'
                  : rank === 3
                  ? 'bg-orange-700 text-white'
                  : 'bg-slate-800 text-slate-300';

              return (
                <div
                  key={entry.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isMine
                      ? 'bg-gradient-to-r from-orange-500/10 via-slate-900 to-slate-900 border-orange-500/40'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                    {/* Rank Badge */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${rankBadgeStyle}`}
                    >
                      #{rank}
                    </div>

                    {/* Cover */}
                    <img
                      src={story.coverUrl}
                      alt={story.title}
                      referrerPolicy="no-referrer"
                      onClick={() => openStoryDetail(story)}
                      className="w-16 h-22 rounded-xl object-cover shrink-0 bg-slate-800 border border-white/10 cursor-pointer hover:scale-105 transition-transform"
                    />

                    {/* Story & Entry Info */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-orange-400 text-[10px] font-black uppercase tracking-wider">
                          {story.genre}
                        </span>
                        {isMine && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase">
                            Your Entry
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500">{entry.submittedAt}</span>
                      </div>

                      <h3
                        onClick={() => openStoryDetail(story)}
                        className="text-base sm:text-lg font-bold text-white hover:text-orange-400 cursor-pointer truncate transition-colors"
                      >
                        {story.title}
                      </h3>

                      <p className="text-xs text-slate-400">
                        By <strong className="text-slate-200">{entry.authorName}</strong> ·{' '}
                        <span className="text-slate-400">{(story.totalPlays / 1000).toFixed(1)}K plays</span> ·{' '}
                        <span>{story.episodes.length} ch</span>
                      </p>

                      <p className="text-xs text-slate-400 italic line-clamp-2 pt-0.5">
                        "{entry.pitchNote}"
                      </p>
                    </div>
                  </div>

                  {/* Right Actions: Listen, Read & Vote */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                    {story.episodes[0] && (
                      <button
                        type="button"
                        onClick={() => playEpisode(story, story.episodes[0], true)}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors"
                        title="Listen to Episode 1"
                      >
                        <Headphones className="w-3.5 h-3.5 text-orange-400" />
                        <span>Listen</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => openStoryDetail(story)}
                      className="px-3.5 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-slate-800 transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Details</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleVoteContestEntry(entry.id)}
                      className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 border transition-all active:scale-95 ${
                        voted
                          ? 'bg-orange-500 text-slate-950 border-orange-400 shadow-lg shadow-orange-500/20'
                          : 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border-orange-500/30'
                      }`}
                    >
                      {voted ? (
                        <Flame className="w-4 h-4 fill-slate-950" />
                      ) : (
                        <ThumbsUp className="w-3.5 h-3.5" />
                      )}
                      <span className="tabular-nums">{entry.votes.toLocaleString()}</span>
                      <span>{voted ? 'Voted' : 'Vote'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Submit Contest Entry Modal */}
      {isSubmitModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200">
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-orange-950/20">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-black text-white truncate">
                    Submit Entry: {activeContest.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Win {activeContest.grandPrizeCoins.toLocaleString()} Coins & earn +{activeContest.entryBonusCoins} Coins instantly
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Mode Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-950 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setSubmitMode('new')}
                  className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    submitMode === 'new'
                      ? 'bg-orange-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Write New Contest Story
                </button>
                <button
                  type="button"
                  onClick={() => setSubmitMode('existing')}
                  className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    submitMode === 'existing'
                      ? 'bg-orange-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Enter Existing Story
                </button>
              </div>

              {submitMode === 'existing' ? (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-300">
                    Choose one of your SGFM stories (Eligible: {activeContest.eligibleGenres.join(', ')})
                  </label>
                  <select
                    value={existingStoryId}
                    onChange={(e) => setExistingStoryId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                  >
                    {stories.map(st => (
                      <option key={st.id} value={st.id}>
                        {st.title} ({st.genre} · By {st.author})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Story Title *</label>
                      <input
                        type="text"
                        required
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="e.g. The Midnight Alibi"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Author Pen Name *</label>
                      <input
                        type="text"
                        required
                        value={newAuthorName}
                        onChange={(e) => setNewAuthorName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Genre *</label>
                      <select
                        value={newGenre}
                        onChange={(e) => setNewGenre(e.target.value as Genre)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                      >
                        {(activeContest.eligibleGenres[0] === 'All'
                          ? (['Romance', 'Fantasy', 'Horror', 'Sci-Fi', 'Drama', 'Thriller'] as Genre[])
                          : (activeContest.eligibleGenres as Genre[])
                        ).map(g => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Opening Chapter Title</label>
                      <input
                        type="text"
                        value={newChapterTitle}
                        onChange={(e) => setNewChapterTitle(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                      />
                    </div>
                  </div>

                  {/* Cover Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Select Book Cover</label>
                    <div className="flex gap-2.5 overflow-x-auto pb-1">
                      {PRESET_COVERS.map((cov, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setNewCoverUrl(cov.url)}
                          className={`relative w-14 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                            newCoverUrl === cov.url
                              ? 'border-orange-500 scale-105 shadow-lg shadow-orange-500/20'
                              : 'border-slate-800 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={cov.url} alt={cov.title} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Story Synopsis *</label>
                    <textarea
                      rows={2}
                      required
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Brief hook explaining the conflict and characters..."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl p-3 text-sm text-white outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300">Opening Chapter Manuscript *</label>
                      <span
                        className={`text-[11px] font-bold tabular-nums ${
                          wordCount >= Math.min(30, activeContest.minWords) ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {wordCount} words (min {Math.min(30, activeContest.minWords)} to enter)
                      </span>
                    </div>
                    <textarea
                      rows={5}
                      required
                      value={newChapterContent}
                      onChange={(e) => setNewChapterContent(e.target.value)}
                      placeholder="Write your opening chapter... Tip: Use [Male] and [Female] dialogue tags for automatic multi-voice acting!"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl p-3.5 text-sm text-white outline-none font-serif leading-relaxed"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Contest Pitch / Author Note</label>
                <input
                  type="text"
                  value={pitchNote}
                  onChange={(e) => setPitchNote(e.target.value)}
                  placeholder="Why should listeners vote for your story?"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-orange-500/20"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Submit to Contest (+{activeContest.entryBonusCoins} Coins)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
