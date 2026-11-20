import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import { Story, Episode, User, CoinTransaction, PlayerViewMode, SleepTimerOption, VoiceProfile, ActiveSpeakerInfo, VoiceCastConfig, VoiceRole, BgmMood, AudioMixerState, DownloadedEpisode, EpisodeComment, ChapterBookmark, WriterContest, ContestEntry, Genre, AmbientSoundscapeId } from '../types';
import { INITIAL_STORIES } from '../data/initialStories';
import { VOICE_PROFILES, HINDI_VOICES, DEFAULT_HINDI_VOICE } from '../data/voiceData';
import { globalAudioEngine, DEFAULT_VOICE_CAST, detectLanguageFromText } from '../utils/audioEngine';
import { generateVisualScenesFromText } from '../utils/sceneGenerator';

interface AppContextType {
  // User & Auth
  user: User;
  isLoggedIn: boolean;
  login: (provider: 'phone', payload: { phone: string; name?: string }) => void;
  logout: () => void;
  toggleUserMode: () => void;
  savedLibraryStories: Story[];
  toggleSaveLibrary: (storyId: string) => void;
  isSavedInLibrary: (storyId: string) => boolean;

  // Chapter Bookmarks & Progress Resuming
  chapterBookmarks: ChapterBookmark[];
  saveChapterBookmark: (story: Story, episode: Episode, progressSeconds?: number, mode?: 'audio' | 'reading', note?: string) => void;
  removeChapterBookmark: (storyId: string, episodeId: string) => void;
  isChapterBookmarked: (storyId: string, episodeId: string) => boolean;
  getChapterBookmark: (storyId: string, episodeId: string) => ChapterBookmark | undefined;
  resumeChapterBookmark: (bookmark: ChapterBookmark) => void;

  // Offline Storage Manager & Offline Mode
  downloadedEpisodes: DownloadedEpisode[];
  downloadingEpisodeIds: string[];
  downloadEpisode: (story: Story, episode: Episode) => Promise<void>;
  removeDownloadedEpisode: (episodeId: string) => void;
  clearAllDownloads: () => void;
  isEpisodeDownloaded: (episodeId: string) => boolean;
  isOfflineMode: boolean;
  toggleOfflineMode: () => void;
  totalStorageUsedMb: number;

  // Episode Comments & Time-stamped Community Interactions
  getEpisodeComments: (episodeId: string) => EpisodeComment[];
  addCommentToEpisode: (episodeId: string, text: string, audioTimestampSeconds?: number) => void;
  likeComment: (episodeId: string, commentId: string) => void;
  deleteComment: (episodeId: string, commentId: string) => void;

  // Coins & Monetization
  coinBalance: number;
  transactions: CoinTransaction[];
  rechargeCoins: (coins: number, bonus: number, priceInr: number) => void;
  unlockEpisodeWithCoins: (episode: Episode, story: Story) => boolean;
  unlockEpisodeWithAd: (episode: Episode, story: Story) => void;
  isEpisodeUnlocked: (episode: Episode) => boolean;

  // Daily Login Reward System
  dailyRewardInfo: {
    canClaim: boolean;
    streakDays: number;
    hoursUntilNext: number;
    rewardCoins: number;
  };
  claimDailyReward: () => void;

  // Stories & Author Dashboard
  stories: Story[];
  createNewStory: (story: Omit<Story, 'id' | 'totalPlays' | 'rating' | 'episodes'>) => Story;
  addEpisodeToStory: (storyId: string, episode: Omit<Episode, 'id' | 'storyId' | 'playsCount'>) => Episode;

  // Writer Contests
  contests: WriterContest[];
  contestEntries: ContestEntry[];
  votedContestEntryIds: string[];
  submitContestEntry: (payload: {
    contestId: string;
    existingStoryId?: string;
    newStory?: {
      title: string;
      genre: Genre;
      description: string;
      chapterTitle: string;
      chapterContent: string;
      coverUrl: string;
      authorName: string;
    };
    pitchNote: string;
  }) => ContestEntry | null;
  toggleVoteContestEntry: (entryId: string) => void;
  hasVotedContestEntry: (entryId: string) => boolean;

  // Audio Player State
  currentStory: Story | null;
  currentEpisode: Episode | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  sleepTimer: SleepTimerOption;
  sleepTimerRemaining: number | null;
  viewMode: PlayerViewMode;
  isExpandedPlayer: boolean;
  isEpisodeDrawerOpen: boolean;
  currentSpokenSentence: string;
  highlightCharIndex: number;
  ambientBgmEnabled: boolean;
  activeSpeakerInfo: ActiveSpeakerInfo | null;

  // Audio Mixer & Dynamic BGM + Ambient Soundscape Layering
  mixerState: AudioMixerState;
  setVoiceVolume: (vol: number) => void;
  setBgmVolume: (vol: number) => void;
  setBgmMood: (mood: BgmMood) => void;
  setDuckingEnabled: (enabled: boolean) => void;
  setAmbientSoundscape: (id: AmbientSoundscapeId) => void;
  setAmbientVolume: (vol: number) => void;
  playSfx: (type: 'heartbeat' | 'thunder' | 'suspense_hit' | 'chime') => void;

  // Player Actions
  playEpisode: (story: Story, episode: Episode, forceStart?: boolean) => void;
  togglePlayPause: () => void;
  seekPlayer: (seconds: number) => void;
  skipPlayer: (deltaSeconds: number) => void;
  setPlayerRate: (rate: number) => void;
  setSleepTimerOption: (option: SleepTimerOption) => void;
  setPlayerViewMode: (mode: PlayerViewMode) => void;
  setIsExpandedPlayer: (expanded: boolean) => void;
  setIsEpisodeDrawerOpen: (open: boolean) => void;
  toggleAmbientBgm: () => void;
  playNextEpisode: () => void;
  playPrevEpisode: () => void;

  // Voice Settings (70+ Voices) & Multi-Voice Cast
  selectedVoiceProfile: VoiceProfile;
  setSelectedVoiceProfile: (voice: VoiceProfile) => void;
  previewVoice: (voice: VoiceProfile) => void;
  activePreviewVoiceId: string | null;
  voiceCast: VoiceCastConfig;
  setVoiceCast: (cast: VoiceCastConfig) => void;
  previewMultiVoiceCast: (cast: VoiceCastConfig) => void;

  // Modals & Navigation
  activeModal: 'none' | 'auth' | 'wallet' | 'unlock' | 'story_detail' | 'new_story' | 'new_episode';
  modalStory: Story | null;
  modalEpisode: Episode | null;
  openStoryDetail: (story: Story) => void;
  openUnlockPrompt: (episode: Episode, story: Story) => void;
  openWallet: () => void;
  openAuth: () => void;
  openNewStoryModal: () => void;
  openNewEpisodeModal: (story: Story) => void;
  closeModal: () => void;

  // Notification Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const STORAGE_KEYS = {
  STORIES: 'aura_stories_v1',
  USER: 'aura_user_v1',
  TX: 'aura_transactions_v1',
  DOWNLOADS: 'aura_downloads_v1',
  COMMENTS: 'aura_comments_v1',
  OFFLINE_MODE: 'aura_offline_mode_v1',
  BOOKMARKS: 'aura_bookmarks_v1',
  CONTEST_ENTRIES: 'aura_contest_entries_v1',
  CONTEST_VOTES: 'aura_contest_votes_v1'
};

const INITIAL_CONTESTS: WriterContest[] = [
  {
    id: 'contest-golden-quill-2026',
    title: 'SGFM Golden Quill Audio-Novel Award 2026',
    subtitle: 'Flagship Annual Storytelling & AI Voice-Drama Championship',
    themePrompt: 'Shadows & Second Chances — Stories where one fateful midnight choice rewrites destiny.',
    prizePoolText: '₹1,00,000 Contract + 50,000 Coins + Full Multi-Voice Studio Production',
    grandPrizeCoins: 50000,
    status: 'live',
    daysLeft: 12,
    deadlineLabel: 'Closes Nov 25, 2026',
    eligibleGenres: ['All'],
    minWords: 120,
    rules: [
      'Original fiction serialized on SGFM with at least one full chapter.',
      'Must support immersive dialogue or narrative pacing suited for audio drama.',
      'Community votes count for 30%; Editorial Jury accounts for 70% of final score.'
    ],
    judgingCriteria: [
      { label: 'Plot & Hook Originality', weight: '40%' },
      { label: 'Dialogue & Voice Pacing', weight: '30%' },
      { label: 'Reader & Listener Votes', weight: '30%' }
    ],
    entryBonusCoins: 25
  },
  {
    id: 'contest-midnight-thrill-2026',
    title: 'Midnight Horror & Thriller Sprint',
    subtitle: 'Spine-Chilling Suspense & Supernatural Audio Tales',
    themePrompt: 'An unexplainable signal, locked door, or whispered warning after 12:00 AM.',
    prizePoolText: '₹45,000 Cash + 20,000 Coins + Featured Home Carousel Slot',
    grandPrizeCoins: 20000,
    status: 'live',
    daysLeft: 7,
    deadlineLabel: 'Closes Nov 20, 2026',
    eligibleGenres: ['Horror', 'Thriller', 'Sci-Fi'],
    minWords: 100,
    rules: [
      'Open exclusively to Horror, Thriller, and Dark Sci-Fi stories.',
      'Use atmospheric sound cues or tension-building dialogue pacing.',
      'Each entry earns an instant Author Sprint Coin reward.'
    ],
    judgingCriteria: [
      { label: 'Atmosphere & Tension', weight: '45%' },
      { label: 'Twist & Climax Impact', weight: '30%' },
      { label: 'Community Votes', weight: '25%' }
    ],
    entryBonusCoins: 20
  },
  {
    id: 'contest-romance-royale-2026',
    title: 'Dil Se Romance & Royal Drama Cup',
    subtitle: 'Heartfelt Chemistry, Rivals-to-Lovers & Emotional Monologues',
    themePrompt: 'An impossible promise sealed between two guarded hearts.',
    prizePoolText: '₹60,000 Deal + 30,000 Coins + Custom AI Poster & Trailer',
    grandPrizeCoins: 30000,
    status: 'upcoming',
    daysLeft: 21,
    deadlineLabel: 'Early Entries Open · Dec 4, 2026',
    eligibleGenres: ['Romance', 'Drama', 'Fantasy'],
    minWords: 100,
    rules: [
      'Romance, Drama, and Romantic Fantasy entries welcome.',
      'Multi-voice [Male] & [Female] dialogue tags strongly encouraged.',
      'Early submissions qualify for Featured Rising Star spotlight.'
    ],
    judgingCriteria: [
      { label: 'Emotional Chemistry', weight: '40%' },
      { label: 'Character Voice Depth', weight: '35%' },
      { label: 'Listener Engagement', weight: '25%' }
    ],
    entryBonusCoins: 25
  }
];

const INITIAL_CONTEST_ENTRIES: ContestEntry[] = [
  {
    id: 'ce-1',
    contestId: 'contest-golden-quill-2026',
    storyId: 'story-1',
    authorId: 'author-eleanor',
    authorName: 'Eleanor Reed',
    pitchNote: 'A high-stakes midnight contract turns an icy corporate merger into a slow-burn obsession.',
    votes: 1482,
    submittedAt: '3 days ago'
  },
  {
    id: 'ce-2',
    contestId: 'contest-golden-quill-2026',
    storyId: 'story-2',
    authorId: 'author-malakor',
    authorName: 'Malakor Thorne',
    pitchNote: 'Ancient Nether runes awaken beneath the citadel as an outcast mage reclaims his birthright.',
    votes: 1294,
    submittedAt: '4 days ago'
  },
  {
    id: 'ce-3',
    contestId: 'contest-golden-quill-2026',
    storyId: 'story-4',
    authorId: 'author-kairos',
    authorName: 'Kairos Vance',
    pitchNote: 'In 2099, a rogue neural courier uncovers erased memories inside the Quantum Grid.',
    votes: 1065,
    submittedAt: '5 days ago'
  },
  {
    id: 'ce-4',
    contestId: 'contest-midnight-thrill-2026',
    storyId: 'story-3',
    authorId: 'author-damian',
    authorName: 'Damian Cross',
    pitchNote: 'A 911 dispatcher receives a distress call from an abandoned asylum sealed since 1974.',
    votes: 940,
    submittedAt: '2 days ago'
  },
  {
    id: 'ce-5',
    contestId: 'contest-romance-royale-2026',
    storyId: 'story-5',
    authorId: 'author-eleanor-v',
    authorName: 'Eleanor Vance',
    pitchNote: 'Behind gilded ballroom doors, every whispered secret carries a royal price.',
    votes: 618,
    submittedAt: '1 day ago'
  }
];

const INITIAL_BOOKMARKS: ChapterBookmark[] = [
  {
    id: 'bm-story-1-ep-1-1',
    storyId: 'story-1',
    episodeId: 'ep-1-1',
    storyTitle: "The Billionaire's Temptation",
    storyCoverUrl: '/src/assets/images/novel_dark_romance_cover_1793427621801.jpg',
    episodeTitle: 'Episode 1: The Midnight Contract',
    episodeNumber: 1,
    progressSeconds: 85,
    formattedProgress: '01:25',
    totalDurationSeconds: 195,
    mode: 'audio',
    savedAt: 'Today, 02:40 PM',
    note: 'Balcony conversation with Julian'
  },
  {
    id: 'bm-story-2-ep-2-1',
    storyId: 'story-2',
    episodeId: 'ep-2-1',
    storyTitle: "The Void's Harbinger",
    storyCoverUrl: '/src/assets/images/novel_urban_fantasy_cover_1793427621890.jpg',
    episodeTitle: 'Episode 1: Awakening of the Nether Runes',
    episodeNumber: 1,
    progressSeconds: 140,
    formattedProgress: '02:20',
    totalDurationSeconds: 210,
    mode: 'reading',
    savedAt: 'Yesterday, 09:15 PM',
    note: 'Ancient staff discovery in the catacombs'
  }
];

const INITIAL_DOWNLOADS: DownloadedEpisode[] = [
  {
    storyId: 'story-1',
    episodeId: 'ep-1-1',
    storyTitle: "The Billionaire's Temptation",
    episodeTitle: 'Episode 1: The Midnight Contract',
    episodeNumber: 1,
    coverUrl: '/src/assets/images/novel_dark_romance_cover_1793427621801.jpg',
    author: 'Eleanor Reed',
    genre: 'Romance',
    durationSeconds: 195,
    sizeMb: 1.4,
    downloadedAt: '2026-11-05T09:30:00.000Z',
    content: INITIAL_STORIES[0].episodes[0].content
  }
];

const INITIAL_COMMENTS: Record<string, EpisodeComment[]> = {
  'ep-1-1': [
    {
      id: 'c-101',
      episodeId: 'ep-1-1',
      userId: 'author-eleanor',
      userName: 'Eleanor Reed',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eleanor',
      text: 'Welcome to Chapter 1! Note the tension at 00:45 when Julian mentions the contract clause.',
      timestamp: '2 days ago',
      audioTimestampSeconds: 45,
      formattedAudioTimestamp: '00:45',
      isCreator: true,
      likes: 184
    },
    {
      id: 'c-102',
      episodeId: 'ep-1-1',
      userId: 'user-rohit',
      userName: 'Rohit K.',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohit',
      text: 'The voice switch when Julian started speaking gave me chills! Incredible sound design 🔥',
      timestamp: '1 day ago',
      audioTimestampSeconds: 78,
      formattedAudioTimestamp: '01:18',
      isCreator: false,
      likes: 67
    },
    {
      id: 'c-103',
      episodeId: 'ep-1-1',
      userId: 'user-priya',
      userName: 'Priya Sen',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
      text: 'That background rain soundscape during the balcony dialogue is so atmospheric ❤️',
      timestamp: '14 hours ago',
      audioTimestampSeconds: 110,
      formattedAudioTimestamp: '01:50',
      isCreator: false,
      likes: 42
    }
  ],
  'ep-1-2': [
    {
      id: 'c-201',
      episodeId: 'ep-1-2',
      userId: 'user-aditi',
      userName: 'Aditi V.',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aditi',
      text: 'The suspense in this chapter escalated so fast! Did not expect that phone call revelation at 00:30.',
      timestamp: '3 days ago',
      audioTimestampSeconds: 30,
      formattedAudioTimestamp: '00:30',
      isCreator: false,
      likes: 53
    }
  ]
};

const DEFAULT_USER: User = {
  id: 'user-vip-101',
  name: 'Aryan Sharma',
  email: 'aryan.sharma@aurastories.com',
  phone: '+91 98765 43210',
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aryan&backgroundColor=b6e3f4',
  coinBalance: 45,
  unlockedEpisodeIds: ['ep-1-3'],
  savedLibraryIds: ['story-1', 'story-2'],
  history: [
    {
      storyId: 'story-1',
      episodeId: 'ep-1-1',
      progressSeconds: 120,
      lastPlayedAt: new Date().toISOString()
    }
  ],
  mode: 'listener',
  createdStoryIds: [],
  loginStreakDays: 5,
  lastDailyRewardClaimedAt: undefined
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stories, setStories] = useState<Story[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STORIES);
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return INITIAL_STORIES;
  });

  const [user, setUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return DEFAULT_USER;
  });

  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const [transactions, setTransactions] = useState<CoinTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TX);
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return [
      {
        id: 'tx-1',
        type: 'credit',
        amount: 50,
        description: 'Welcome Bonus Gift',
        timestamp: '2026-10-25 10:30 AM'
      },
      {
        id: 'tx-2',
        type: 'debit',
        amount: 10,
        description: 'Unlocked Episode 3 - The Billionaire\'s Temptation',
        timestamp: '2026-10-28 08:15 PM'
      },
      {
        id: 'tx-3',
        type: 'credit',
        amount: 5,
        description: 'Daily Listening Streak Reward',
        timestamp: '2026-10-30 09:00 AM'
      }
    ];
  });

  const [currentStory, setCurrentStory] = useState<Story | null>(INITIAL_STORIES[0]);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(INITIAL_STORIES[0].episodes[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(INITIAL_STORIES[0].episodes[0].durationSeconds);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [sleepTimer, setSleepTimer] = useState<SleepTimerOption>(0);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<PlayerViewMode>('audio');
  const [isExpandedPlayer, setIsExpandedPlayer] = useState<boolean>(false);
  const [isEpisodeDrawerOpen, setIsEpisodeDrawerOpen] = useState<boolean>(false);
  const [currentSpokenSentence, setCurrentSpokenSentence] = useState<string>('');
  const [highlightCharIndex, setHighlightCharIndex] = useState<number>(0);
  const [ambientBgmEnabled, setAmbientBgmEnabled] = useState<boolean>(true);
  const [activeSpeakerInfo, setActiveSpeakerInfo] = useState<ActiveSpeakerInfo | null>(null);
  const [mixerState, setMixerState] = useState<AudioMixerState>(() => globalAudioEngine.getMixerState());

  const [selectedVoiceProfile, setSelectedVoiceProfileState] = useState<VoiceProfile>(DEFAULT_HINDI_VOICE);
  const [activePreviewVoiceId, setActivePreviewVoiceId] = useState<string | null>(null);
  const [voiceCast, setVoiceCastState] = useState<VoiceCastConfig>(DEFAULT_VOICE_CAST);

  const [activeModal, setActiveModal] = useState<'none' | 'auth' | 'wallet' | 'unlock' | 'story_detail' | 'new_story' | 'new_episode'>('none');
  const [modalStory, setModalStory] = useState<Story | null>(null);
  const [modalEpisode, setModalEpisode] = useState<Episode | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [downloadedEpisodes, setDownloadedEpisodes] = useState<DownloadedEpisode[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DOWNLOADS);
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return INITIAL_DOWNLOADS;
  });

  const [downloadingEpisodeIds, setDownloadingEpisodeIds] = useState<string[]>([]);

  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OFFLINE_MODE);
      if (saved !== null) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return false;
  });

  const [commentsMap, setCommentsMap] = useState<Record<string, EpisodeComment[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMMENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return INITIAL_COMMENTS;
  });

  const [chapterBookmarks, setChapterBookmarks] = useState<ChapterBookmark[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return INITIAL_BOOKMARKS;
  });

  const [contests] = useState<WriterContest[]>(INITIAL_CONTESTS);

  const [contestEntries, setContestEntries] = useState<ContestEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONTEST_ENTRIES);
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return INITIAL_CONTEST_ENTRIES;
  });

  const [votedContestEntryIds, setVotedContestEntryIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONTEST_VOTES);
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(stories));
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.TX, JSON.stringify(transactions));
      localStorage.setItem(STORAGE_KEYS.DOWNLOADS, JSON.stringify(downloadedEpisodes));
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(commentsMap));
      localStorage.setItem(STORAGE_KEYS.OFFLINE_MODE, JSON.stringify(isOfflineMode));
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(chapterBookmarks));
      localStorage.setItem(STORAGE_KEYS.CONTEST_ENTRIES, JSON.stringify(contestEntries));
      localStorage.setItem(STORAGE_KEYS.CONTEST_VOTES, JSON.stringify(votedContestEntryIds));
    } catch (e) { /* ignore */ }
  }, [stories, user, transactions, downloadedEpisodes, commentsMap, isOfflineMode, chapterBookmarks, contestEntries, votedContestEntryIds]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3200);
  }, []);

  useEffect(() => {
    globalAudioEngine.setCallbacks(
      (charIdx, _total, sentence) => {
        setHighlightCharIndex(charIdx);
        if (sentence) setCurrentSpokenSentence(sentence);
      },
      (curTime, totalDur) => {
        setCurrentTime(curTime);
        if (totalDur > 0) setDuration(totalDur);
      },
      (playing, ended) => {
        setIsPlaying(playing);
        if (ended) handleEpisodeEnded();
      },
      (speaker) => {
        setActiveSpeakerInfo(speaker);
      },
      (mood, isAuto) => {
        setMixerState(prev => ({
          ...prev,
          activeBgmMood: mood,
          detectedMood: mood
        }));
        if (isAuto) {
          showToast(`✦ Auto-BGM Matched: ${mood.toUpperCase()} Soundscape`);
        }
      },
      (newMixer) => {
        setMixerState(newMixer);
      }
    );
  }, [currentStory, currentEpisode, showToast]);

  const setVoiceVolume = useCallback((vol: number) => {
    globalAudioEngine.setVoiceVolume(vol);
  }, []);

  const setBgmVolume = useCallback((vol: number) => {
    globalAudioEngine.setBgmVolume(vol);
  }, []);

  const setBgmMood = useCallback((mood: BgmMood) => {
    globalAudioEngine.setBgmMood(mood);
    showToast(mood === 'auto' ? '✦ BGM: Auto-Mood Match Active' : `BGM: ${mood.toUpperCase()} Soundtrack Active`);
  }, [showToast]);

  const setDuckingEnabled = useCallback((enabled: boolean) => {
    globalAudioEngine.setDuckingEnabled(enabled);
    showToast(enabled ? 'Voice Clarity Ducking: ON' : 'Voice Clarity Ducking: OFF');
  }, [showToast]);

  const setAmbientSoundscape = useCallback((id: AmbientSoundscapeId) => {
    globalAudioEngine.setAmbientSoundscape(id);
    if (id === 'none') {
      showToast('Ambient Soundscape Layer: OFF');
    } else {
      const labelMap: Record<AmbientSoundscapeId, string> = {
        none: 'Off',
        rain: '🌧️ Rain',
        cafe: '☕ Cafe',
        cyberpunk: '🌆 Cyberpunk City',
        forest: '🌲 Night Forest',
        fireplace: '🔥 Fireplace',
        ocean: '🌊 Ocean Waves'
      };
      showToast(`Soundscape Layered: ${labelMap[id]} Ambience`);
    }
  }, [showToast]);

  const setAmbientVolume = useCallback((vol: number) => {
    globalAudioEngine.setAmbientVolume(vol);
  }, []);

  const playSfx = useCallback((type: 'heartbeat' | 'thunder' | 'suspense_hit' | 'chime') => {
    globalAudioEngine.playSfx(type);
    showToast(`SFX: ${type.replace('_', ' ').toUpperCase()}`);
  }, [showToast]);

  useEffect(() => {
    if (sleepTimerRemaining === null || sleepTimerRemaining <= 0) return;
    const interval = setInterval(() => {
      setSleepTimerRemaining(prev => {
        if (prev === null || prev <= 1) {
          globalAudioEngine.pause();
          setIsPlaying(false);
          showToast('Sleep timer finished. Playback paused.');
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [sleepTimerRemaining, showToast]);

  const handleEpisodeEnded = useCallback(() => {
    if (!currentStory || !currentEpisode) return;
    const currentIdx = currentStory.episodes.findIndex(e => e.id === currentEpisode.id);
    if (currentIdx !== -1 && currentIdx < currentStory.episodes.length - 1) {
      const nextEp = currentStory.episodes[currentIdx + 1];
      if (nextEp.isFree || user.unlockedEpisodeIds.includes(nextEp.id)) {
        showToast(`Playing Next: Episode ${nextEp.episodeNumber}`);
        playEpisodeInternal(currentStory, nextEp, true);
      } else {
        setIsPlaying(false);
        openUnlockPrompt(nextEp, currentStory);
      }
    } else {
      setIsPlaying(false);
    }
  }, [currentStory, currentEpisode, user.unlockedEpisodeIds]);

  const isEpisodeUnlocked = useCallback((episode: Episode) => {
    if (episode.isFree) return true;
    return user.unlockedEpisodeIds.includes(episode.id);
  }, [user.unlockedEpisodeIds]);

  const setVoiceCast = useCallback((cast: VoiceCastConfig) => {
    setVoiceCastState(cast);
    globalAudioEngine.setVoiceCast(cast);
    showToast(`Voice Cast Updated: Narrator (${cast.narrator.name}), Male (${cast.maleLead.name}), Female (${cast.femaleLead.name})`);
  }, [showToast]);

  const previewMultiVoiceCast = useCallback((cast: VoiceCastConfig) => {
    showToast('🎙️ Starting Multi-Voice Cast Demonstration...');
    globalAudioEngine.previewMultiVoiceDialogue(
      cast,
      (role: VoiceRole, voice: VoiceProfile) => {
        showToast(`Speaking: [${role}] ${voice.name} (${voice.gender})`);
      },
      () => {
        showToast('✓ Multi-Voice demonstration complete');
      }
    );
  }, [showToast]);

  const playEpisodeInternal = useCallback((story: Story, episode: Episode, forceStart: boolean = true) => {
    setCurrentStory(story);
    setCurrentEpisode(episode);
    setDuration(episode.durationSeconds);
    setCurrentTime(0);

    setUser(prev => {
      const filtered = prev.history.filter(h => h.storyId !== story.id);
      return {
        ...prev,
        history: [
          {
            storyId: story.id,
            episodeId: episode.id,
            progressSeconds: 0,
            lastPlayedAt: new Date().toISOString()
          },
          ...filtered
        ]
      };
    });

    const detectedLang = detectLanguageFromText(episode.content);
    const defaultLangVoice = VOICE_PROFILES.find(v => v.language === detectedLang) || DEFAULT_HINDI_VOICE;

    const epNarrator = (episode.narratorVoiceId && VOICE_PROFILES.find(v => v.id === episode.narratorVoiceId))
      || (episode.voiceProfileId && VOICE_PROFILES.find(v => v.id === episode.voiceProfileId))
      || (selectedVoiceProfile.language === detectedLang ? selectedVoiceProfile : defaultLangVoice);

    const epMale = (episode.maleVoiceId && VOICE_PROFILES.find(v => v.id === episode.maleVoiceId))
      || voiceCast.maleLead;

    const epFemale = (episode.femaleVoiceId && VOICE_PROFILES.find(v => v.id === episode.femaleVoiceId))
      || voiceCast.femaleLead;

    const resolvedCast: VoiceCastConfig = {
      narrator: epNarrator,
      maleLead: epMale,
      femaleLead: epFemale
    };

    if (epNarrator) setSelectedVoiceProfileState(epNarrator);

    if (forceStart) {
      globalAudioEngine.playEpisodeText(
        episode.content,
        episode.durationSeconds,
        0,
        ambientBgmEnabled,
        epNarrator,
        resolvedCast,
        episode.bgmMood || 'auto',
        story.genre
      );
      setIsPlaying(true);
    }
  }, [ambientBgmEnabled, selectedVoiceProfile, voiceCast]);

  const setSelectedVoiceProfile = useCallback((voice: VoiceProfile) => {
    setSelectedVoiceProfileState(voice);
    globalAudioEngine.setVoiceProfile(voice);
    if (isPlaying && currentEpisode) {
      globalAudioEngine.playEpisodeText(currentEpisode.content, duration, currentTime, ambientBgmEnabled, voice);
    }
    showToast(`Voice: ${voice.name} (${voice.gender}, ${voice.language})`);
  }, [isPlaying, currentEpisode, duration, currentTime, ambientBgmEnabled, showToast]);

  const previewVoice = useCallback((voice: VoiceProfile) => {
    setActivePreviewVoiceId(voice.id);
    globalAudioEngine.previewVoice(
      voice,
      () => showToast(`🎙️ Testing Voice: ${voice.name} (${voice.gender})`),
      () => setActivePreviewVoiceId(null)
    );
  }, [showToast]);

  const isEpisodeDownloaded = useCallback((episodeId: string) => {
    return downloadedEpisodes.some(d => d.episodeId === episodeId);
  }, [downloadedEpisodes]);

  const downloadEpisode = useCallback(async (story: Story, episode: Episode) => {
    if (downloadedEpisodes.some(d => d.episodeId === episode.id)) {
      showToast(`Episode ${episode.episodeNumber} is already stored offline.`);
      return;
    }
    setDownloadingEpisodeIds(prev => [...prev, episode.id]);
    showToast(`Downloading "${episode.title}" for offline playback...`);

    // Simulate network transfer and offline caching
    await new Promise(res => setTimeout(res, 850));

    const estSizeMb = Math.max(0.8, Math.round(((episode.content.length * 1.6 + episode.durationSeconds * 12) / 1024) * 10) / 10);
    const newDownload: DownloadedEpisode = {
      storyId: story.id,
      episodeId: episode.id,
      storyTitle: story.title,
      episodeTitle: episode.title,
      episodeNumber: episode.episodeNumber,
      coverUrl: story.coverUrl,
      author: story.author,
      genre: story.genre,
      durationSeconds: episode.durationSeconds,
      sizeMb: estSizeMb,
      downloadedAt: new Date().toISOString(),
      content: episode.content
    };

    setDownloadedEpisodes(prev => [newDownload, ...prev]);
    setDownloadingEpisodeIds(prev => prev.filter(id => id !== episode.id));
    globalAudioEngine.playCoinChime();
    confetti({ particleCount: 30, spread: 45, origin: { y: 0.7 } });
    showToast(`✓ Downloaded Episode ${episode.episodeNumber}! (${estSizeMb} MB cached offline)`);
  }, [downloadedEpisodes, showToast]);

  const removeDownloadedEpisode = useCallback((episodeId: string) => {
    setDownloadedEpisodes(prev => prev.filter(d => d.episodeId !== episodeId));
    showToast('Episode removed from offline storage');
  }, [showToast]);

  const clearAllDownloads = useCallback(() => {
    setDownloadedEpisodes([]);
    showToast('All offline downloads cleared');
  }, [showToast]);

  const toggleOfflineMode = useCallback(() => {
    setIsOfflineMode(prev => {
      const next = !prev;
      setUser(u => ({ ...u, isOfflineModeEnabled: next }));
      showToast(next ? '⚡ Offline Mode: ON (Using local downloads only)' : '🌐 Offline Mode: OFF (Online streaming restored)');
      return next;
    });
  }, [showToast]);

  const totalStorageUsedMb = Math.round(downloadedEpisodes.reduce((acc, d) => acc + d.sizeMb, 0) * 10) / 10;

  const closeModal = useCallback(() => { setActiveModal('none'); setModalStory(null); setModalEpisode(null); }, []);
  const openStoryDetail = useCallback((story: Story) => { setModalStory(story); setActiveModal('story_detail'); }, []);
  const openUnlockPrompt = useCallback((episode: Episode, story: Story) => { setModalEpisode(episode); setModalStory(story); setActiveModal('unlock'); }, []);
  const openWallet = useCallback(() => setActiveModal('wallet'), []);
  const openAuth = useCallback(() => setActiveModal('auth'), []);
  const openNewStoryModal = useCallback(() => setActiveModal('new_story'), []);
  const openNewEpisodeModal = useCallback((story: Story) => { setModalStory(story); setActiveModal('new_episode'); }, []);

  const playEpisode = useCallback((story: Story, episode: Episode, forceStart: boolean = true) => {
    if (isOfflineMode && !downloadedEpisodes.some(d => d.episodeId === episode.id)) {
      showToast(`⚡ Offline Mode: "${episode.title}" is not downloaded. Please download it first or disable Offline Mode.`);
      return;
    }
    if (!isEpisodeUnlocked(episode)) {
      openUnlockPrompt(episode, story);
      return;
    }
    if (isOfflineMode) {
      showToast(`⚡ Playing "${episode.title}" from Offline Local Storage`);
    }
    playEpisodeInternal(story, episode, forceStart);
  }, [isOfflineMode, downloadedEpisodes, isEpisodeUnlocked, playEpisodeInternal, showToast, openUnlockPrompt]);

  const getEpisodeComments = useCallback((episodeId: string): EpisodeComment[] => {
    return commentsMap[episodeId] || [];
  }, [commentsMap]);

  const addCommentToEpisode = useCallback((episodeId: string, text: string, audioTimestampSeconds?: number) => {
    const formattedAudioTimestamp = audioTimestampSeconds !== undefined && audioTimestampSeconds >= 0
      ? `${String(Math.floor(audioTimestampSeconds / 60)).padStart(2, '0')}:${String(Math.floor(audioTimestampSeconds % 60)).padStart(2, '0')}`
      : undefined;

    const newComment: EpisodeComment = {
      id: `c-${Date.now()}`,
      episodeId,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      text: text.trim(),
      timestamp: 'Just now',
      audioTimestampSeconds,
      formattedAudioTimestamp,
      isCreator: user.id === modalStory?.authorId || user.mode === 'creator',
      likes: 0
    };

    setCommentsMap(prev => {
      const existing = prev[episodeId] || [];
      return { ...prev, [episodeId]: [newComment, ...existing] };
    });

    showToast(formattedAudioTimestamp ? `Comment posted with timestamp [${formattedAudioTimestamp}]!` : 'Comment posted!');
  }, [user, modalStory, showToast]);

  const likeComment = useCallback((episodeId: string, commentId: string) => {
    setCommentsMap(prev => {
      const existing = prev[episodeId] || [];
      const updated = existing.map(c => c.id === commentId ? { ...c, likes: c.likes + 1 } : c);
      return { ...prev, [episodeId]: updated };
    });
  }, []);

  const deleteComment = useCallback((episodeId: string, commentId: string) => {
    setCommentsMap(prev => {
      const existing = prev[episodeId] || [];
      const updated = existing.filter(c => c.id !== commentId);
      return { ...prev, [episodeId]: updated };
    });
    showToast('Comment deleted');
  }, [showToast]);

  const togglePlayPause = useCallback(() => {
    if (!currentEpisode || !currentStory) return;
    if (isPlaying) globalAudioEngine.pause();
    else {
      if (currentTime >= duration - 2) globalAudioEngine.seek(0);
      globalAudioEngine.resume();
    }
  }, [isPlaying, currentEpisode, currentStory, currentTime, duration]);

  const seekPlayer = useCallback((seconds: number) => {
    setCurrentTime(seconds);
    globalAudioEngine.seek(seconds);
  }, []);

  const skipPlayer = useCallback((deltaSeconds: number) => {
    const target = Math.max(0, Math.min(duration, currentTime + deltaSeconds));
    seekPlayer(target);
  }, [currentTime, duration, seekPlayer]);

  const setPlayerRate = useCallback((rate: number) => {
    setPlaybackRate(rate);
    globalAudioEngine.setRate(rate);
    showToast(`Speed set to ${rate}x`);
  }, [showToast]);

  const setSleepTimerOption = useCallback((option: SleepTimerOption) => {
    setSleepTimer(option);
    if (option === 0) {
      setSleepTimerRemaining(null);
      showToast('Sleep timer turned off');
    } else if (option === -1) {
      const remainingSecs = Math.max(10, Math.floor(duration - currentTime));
      setSleepTimerRemaining(remainingSecs);
      showToast(`Sleep timer set to end of episode (${Math.ceil(remainingSecs / 60)}m)`);
    } else {
      setSleepTimerRemaining(option);
      showToast(`Sleep timer set for ${Math.floor(option / 60)} minutes`);
    }
  }, [duration, currentTime, showToast]);

  const toggleAmbientBgm = useCallback(() => {
    const next = !ambientBgmEnabled;
    setAmbientBgmEnabled(next);
    if (next) {
      globalAudioEngine.startAmbientSoundscape();
      showToast('Cinematic Audio Ambiance: ON');
    } else {
      globalAudioEngine.stopAmbientSoundscape();
      showToast('Cinematic Audio Ambiance: OFF');
    }
  }, [ambientBgmEnabled, showToast]);

  const playNextEpisode = useCallback(() => {
    if (!currentStory || !currentEpisode) return;
    const curIdx = currentStory.episodes.findIndex(e => e.id === currentEpisode.id);
    if (curIdx < currentStory.episodes.length - 1) playEpisode(currentStory, currentStory.episodes[curIdx + 1], true);
    else showToast('You are on the latest episode of this story');
  }, [currentStory, currentEpisode, playEpisode, showToast]);

  const playPrevEpisode = useCallback(() => {
    if (!currentStory || !currentEpisode) return;
    const curIdx = currentStory.episodes.findIndex(e => e.id === currentEpisode.id);
    if (curIdx > 0) playEpisode(currentStory, currentStory.episodes[curIdx - 1], true);
    else showToast('You are on the first episode');
  }, [currentStory, currentEpisode, playEpisode, showToast]);

  const toggleSaveLibrary = useCallback((storyId: string) => {
    setUser(prev => {
      const isSaved = prev.savedLibraryIds.includes(storyId);
      const updated = isSaved ? prev.savedLibraryIds.filter(id => id !== storyId) : [...prev.savedLibraryIds, storyId];
      showToast(isSaved ? 'Removed from your Library' : 'Added to your Library');
      return { ...prev, savedLibraryIds: updated };
    });
  }, [showToast]);

  const isSavedInLibrary = useCallback((storyId: string) => user.savedLibraryIds.includes(storyId), [user.savedLibraryIds]);
  const savedLibraryStories = stories.filter(s => user.savedLibraryIds.includes(s.id));

  const isChapterBookmarked = useCallback((storyId: string, episodeId: string) => {
    return chapterBookmarks.some(b => b.storyId === storyId && b.episodeId === episodeId);
  }, [chapterBookmarks]);

  const getChapterBookmark = useCallback((storyId: string, episodeId: string) => {
    return chapterBookmarks.find(b => b.storyId === storyId && b.episodeId === episodeId);
  }, [chapterBookmarks]);

  const saveChapterBookmark = useCallback((
    story: Story,
    episode: Episode,
    progressSeconds?: number,
    mode: 'audio' | 'reading' = 'audio',
    note?: string
  ) => {
    const prog = typeof progressSeconds === 'number'
      ? Math.max(0, Math.min(episode.durationSeconds, progressSeconds))
      : (currentStory?.id === story.id && currentEpisode?.id === episode.id ? currentTime : 0);

    const mins = Math.floor(prog / 60);
    const secs = Math.floor(prog % 60);
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const newBookmark: ChapterBookmark = {
      id: `bm-${story.id}-${episode.id}`,
      storyId: story.id,
      episodeId: episode.id,
      storyTitle: story.title,
      storyCoverUrl: story.coverUrl,
      episodeTitle: episode.title,
      episodeNumber: episode.episodeNumber,
      progressSeconds: Math.floor(prog),
      formattedProgress: formatted,
      totalDurationSeconds: episode.durationSeconds,
      mode,
      savedAt: 'Just now',
      note: note || (mode === 'reading' ? `Saved reading position at ${formatted}` : `Saved audio timestamp at ${formatted}`)
    };

    setChapterBookmarks(prev => {
      const filtered = prev.filter(b => !(b.storyId === story.id && b.episodeId === episode.id));
      return [newBookmark, ...filtered];
    });

    setUser(prev => {
      const existing = prev.chapterBookmarks || [];
      const filtered = existing.filter(b => !(b.storyId === story.id && b.episodeId === episode.id));
      return { ...prev, chapterBookmarks: [newBookmark, ...filtered] };
    });

    confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
    showToast(`🔖 Bookmarked Episode ${episode.episodeNumber} at [${formatted}] (${mode === 'reading' ? 'Reading' : 'Audio'})`);
  }, [currentStory, currentEpisode, currentTime, showToast]);

  const removeChapterBookmark = useCallback((storyId: string, episodeId: string) => {
    setChapterBookmarks(prev => prev.filter(b => !(b.storyId === storyId && b.episodeId === episodeId)));
    setUser(prev => {
      const existing = prev.chapterBookmarks || [];
      return { ...prev, chapterBookmarks: existing.filter(b => !(b.storyId === storyId && b.episodeId === episodeId)) };
    });
    showToast('Bookmark removed');
  }, [showToast]);

  const resumeChapterBookmark = useCallback((bookmark: ChapterBookmark) => {
    const targetStory = stories.find(s => s.id === bookmark.storyId);
    if (!targetStory) {
      showToast('Story not found');
      return;
    }
    const targetEp = targetStory.episodes.find(e => e.id === bookmark.episodeId);
    if (!targetEp) {
      showToast('Episode not found');
      return;
    }

    if (bookmark.mode === 'reading') {
      setViewMode('reader');
      openStoryDetail(targetStory);
      showToast(`📖 Resuming reading: Episode ${targetEp.episodeNumber} [${bookmark.formattedProgress}]`);
    } else {
      setViewMode('audio');
      playEpisode(targetStory, targetEp, true);
      if (bookmark.progressSeconds > 0) {
        setTimeout(() => {
          seekPlayer(bookmark.progressSeconds);
        }, 150);
      }
      setIsExpandedPlayer(true);
      showToast(`🎧 Resuming playback from ${bookmark.formattedProgress}`);
    }
  }, [stories, playEpisode, seekPlayer, openStoryDetail, showToast]);

  const rechargeCoins = useCallback((coins: number, bonus: number, priceInr: number) => {
    const totalAdded = coins + bonus;
    setUser(prev => ({ ...prev, coinBalance: prev.coinBalance + totalAdded }));
    const newTx: CoinTransaction = {
      id: `tx-${Date.now()}`,
      type: 'credit',
      amount: totalAdded,
      description: `Recharge ₹${priceInr} (${coins} + ${bonus} Bonus Coins)`,
      timestamp: new Date().toLocaleString()
    };
    setTransactions(prev => [newTx, ...prev]);
    globalAudioEngine.playCoinChime();
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    showToast(`+${totalAdded} Coins added to your wallet!`);
  }, [showToast]);

  const unlockEpisodeWithCoins = useCallback((episode: Episode, story: Story) => {
    if (user.coinBalance < episode.coinPrice) {
      showToast('Insufficient coin balance. Please recharge.');
      setActiveModal('wallet');
      return false;
    }
    setUser(prev => ({ ...prev, coinBalance: prev.coinBalance - episode.coinPrice, unlockedEpisodeIds: [...prev.unlockedEpisodeIds, episode.id] }));
    const newTx: CoinTransaction = {
      id: `tx-${Date.now()}`,
      type: 'debit',
      amount: episode.coinPrice,
      description: `Unlocked Episode ${episode.episodeNumber} - ${story.title}`,
      timestamp: new Date().toLocaleString()
    };
    setTransactions(prev => [newTx, ...prev]);
    globalAudioEngine.playCoinChime();
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.5 } });
    showToast(`Unlocked Episode ${episode.episodeNumber}! Enjoy listening.`);
    closeModal();
    playEpisodeInternal(story, episode, true);
    return true;
  }, [user.coinBalance, playEpisodeInternal, showToast]);


  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const TWO_DAYS_MS = 48 * 60 * 60 * 1000;
  const DAILY_REWARD_COINS = 10;

  const claimDailyReward = useCallback((isAuto: boolean = false) => {
    const lastClaim = user.lastDailyRewardClaimedAt ? new Date(user.lastDailyRewardClaimedAt).getTime() : 0;
    const currentTime = Date.now();
    const elapsed = currentTime - lastClaim;
    if (lastClaim > 0 && elapsed < ONE_DAY_MS) {
      if (!isAuto) {
        const remainingHours = Math.max(1, Math.ceil((ONE_DAY_MS - elapsed) / (60 * 60 * 1000)));
        showToast(`Next daily reward in ${remainingHours}h. Keep your streak going!`);
      }
      return;
    }
    let nextStreak = lastClaim > 0 ? (elapsed <= TWO_DAYS_MS ? (user.loginStreakDays || 1) + 1 : 1) : (user.loginStreakDays || 0) + 1;
    setUser(prev => ({ ...prev, coinBalance: prev.coinBalance + DAILY_REWARD_COINS, lastDailyRewardClaimedAt: new Date(currentTime).toISOString(), loginStreakDays: nextStreak }));
    const newTx: CoinTransaction = { id: `tx-daily-${currentTime}`, type: 'credit', amount: DAILY_REWARD_COINS, description: `Daily Login Reward (Day ${nextStreak} Streak)`, timestamp: new Date().toLocaleString() };
    setTransactions(prev => [newTx, ...prev]);
    globalAudioEngine.playCoinChime();
    confetti({ particleCount: 55, spread: 60, origin: { y: 0.15 } });
    showToast(`🎉 Daily Login Reward! +${DAILY_REWARD_COINS} Free Coins added (Day ${nextStreak} Streak)`);
  }, [user.lastDailyRewardClaimedAt, user.loginStreakDays, showToast]);

  useEffect(() => {
    const lastClaim = user.lastDailyRewardClaimedAt ? new Date(user.lastDailyRewardClaimedAt).getTime() : 0;
    const elapsed = Date.now() - lastClaim;
    if (!lastClaim || elapsed >= ONE_DAY_MS) {
      const timer = setTimeout(() => claimDailyReward(true), 800);
      return () => clearTimeout(timer);
    }
  }, [user.lastDailyRewardClaimedAt, claimDailyReward]);

  const toggleUserMode = useCallback(() => {
    setUser(prev => {
      const nextMode = prev.mode === 'listener' ? 'creator' : 'listener';
      showToast(`Switched to ${nextMode === 'creator' ? 'Author Dashboard' : 'Listener Mode'}`);
      return { ...prev, mode: nextMode };
    });
  }, [showToast]);

  const login = useCallback((_provider: 'phone', payload: { phone: string; name?: string }) => {
    setUser(prev => ({ ...prev, name: payload.name || prev.name, phone: payload.phone || prev.phone }));
    setIsLoggedIn(true);
    closeModal();
    showToast('Signed in successfully! Welcome back.');
  }, [showToast]);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    showToast('Signed out of SGFM.');
  }, [showToast]);

  const createNewStory = useCallback((storyData: Omit<Story, 'id' | 'totalPlays' | 'rating' | 'episodes'>) => {
    const newStory: Story = { ...storyData, id: `story-custom-${Date.now()}`, rating: 5.0, totalPlays: 1, totalEpisodes: 1, followerCount: 0, episodes: [{ id: `ep-custom-${Date.now()}-1`, storyId: `story-custom-${Date.now()}`, episodeNumber: 1, title: 'Episode 1: The Prologue', summary: 'The inaugural chapter of this original novel.', content: `${storyData.description}\n\nThe journey began where the shadows ended. Every step forward was a step deeper into the untold mysteries of this world.`, durationSeconds: 180, isFree: true, coinPrice: 0, publishedAt: new Date().toISOString().split('T')[0], playsCount: 1 }] };
    setStories(prev => [newStory, ...prev]);
    setUser(prev => ({ ...prev, createdStoryIds: [...prev.createdStoryIds, newStory.id] }));
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    showToast(`Story "${newStory.title}" published to SGFM!`);
    closeModal();
    return newStory;
  }, [showToast]);

  const addEpisodeToStory = useCallback((storyId: string, episodeData: Omit<Episode, 'id' | 'storyId' | 'playsCount'>) => {
    const newEpisode: Episode = { ...episodeData, id: `ep-${Date.now()}`, storyId, playsCount: 0 };
    setStories(prev => prev.map(s => s.id === storyId ? { ...s, totalEpisodes: s.episodes.length + 1, episodes: [...s.episodes, newEpisode] } : s));
    showToast(`Episode "${newEpisode.title}" published successfully!`);
    closeModal();
    return newEpisode;
  }, [showToast, closeModal]);

  const submitContestEntry = useCallback((payload: {
    contestId: string;
    existingStoryId?: string;
    newStory?: {
      title: string;
      genre: Genre;
      description: string;
      chapterTitle: string;
      chapterContent: string;
      coverUrl: string;
      authorName: string;
    };
    pitchNote: string;
  }): ContestEntry | null => {
    const contest = contests.find(c => c.id === payload.contestId);
    if (!contest) {
      showToast('Contest not found');
      return null;
    }

    let targetStoryId = payload.existingStoryId;
    let entryAuthorName = user.name;

    if (payload.newStory) {
      const storyId = `story-contest-${Date.now()}`;
      const words = payload.newStory.chapterContent.trim().split(/\s+/).length;
      const durationSeconds = Math.max(90, Math.floor((words / 140) * 60));
      const scenes = generateVisualScenesFromText(payload.newStory.chapterContent.trim(), durationSeconds, 'Cinematic');

      const createdStory: Story = {
        id: storyId,
        title: payload.newStory.title.trim(),
        author: payload.newStory.authorName.trim() || user.name,
        authorId: user.id,
        description: payload.newStory.description.trim(),
        coverUrl: payload.newStory.coverUrl,
        genre: payload.newStory.genre,
        tags: [payload.newStory.genre, 'Contest Entry', contest.title.split(' ')[1] || 'Award'],
        rating: 5.0,
        totalPlays: 1,
        totalEpisodes: 1,
        followerCount: 1,
        narratorName: `${voiceCast.narrator.name} (${voiceCast.narrator.language})`,
        episodes: [
          {
            id: `ep-contest-${Date.now()}-1`,
            storyId,
            episodeNumber: 1,
            title: payload.newStory.chapterTitle.trim() || 'Episode 1: Contest Premiere',
            summary: payload.pitchNote.trim() || payload.newStory.description.trim().slice(0, 100),
            content: payload.newStory.chapterContent.trim(),
            durationSeconds,
            isFree: true,
            coinPrice: 0,
            narratorVoice: `${voiceCast.narrator.name} (${voiceCast.narrator.language})`,
            voiceProfileId: voiceCast.narrator.id,
            narratorVoiceId: voiceCast.narrator.id,
            maleVoiceId: voiceCast.maleLead.id,
            femaleVoiceId: voiceCast.femaleLead.id,
            visualScenes: scenes,
            publishedAt: new Date().toISOString().split('T')[0],
            playsCount: 1
          }
        ]
      };
      setStories(prev => [createdStory, ...prev]);
      setUser(prev => ({ ...prev, createdStoryIds: [...prev.createdStoryIds, storyId] }));
      targetStoryId = storyId;
      entryAuthorName = createdStory.author;
    } else if (targetStoryId) {
      const existing = stories.find(s => s.id === targetStoryId);
      if (!existing) {
        showToast('Please select a valid story');
        return null;
      }
      if (contestEntries.some(e => e.contestId === contest.id && e.storyId === targetStoryId)) {
        showToast(`"${existing.title}" is already entered in this contest!`);
        return null;
      }
      entryAuthorName = existing.author;
    } else {
      showToast('Select a story or write a new entry first');
      return null;
    }

    const newEntry: ContestEntry = {
      id: `ce-${Date.now()}`,
      contestId: contest.id,
      storyId: targetStoryId!,
      authorId: user.id,
      authorName: entryAuthorName,
      pitchNote: payload.pitchNote.trim() || 'Official SGFM Writer Contest submission.',
      votes: 1,
      submittedAt: 'Just now',
      isNewSubmission: true
    };

    setContestEntries(prev => [newEntry, ...prev]);
    setVotedContestEntryIds(prev => (prev.includes(newEntry.id) ? prev : [...prev, newEntry.id]));

    const bonus = contest.entryBonusCoins || 25;
    setUser(prev => ({ ...prev, coinBalance: prev.coinBalance + bonus }));
    const bonusTx: CoinTransaction = {
      id: `tx-contest-${Date.now()}`,
      type: 'credit',
      amount: bonus,
      description: `Writer Contest Entry Bonus - ${contest.title}`,
      timestamp: new Date().toLocaleString()
    };
    setTransactions(prev => [bonusTx, ...prev]);

    globalAudioEngine.playCoinChime();
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 } });
    showToast(`🏆 Entered "${contest.title}"! +${bonus} Author Bonus Coins awarded!`);
    return newEntry;
  }, [contests, stories, contestEntries, user, voiceCast, showToast]);

  const toggleVoteContestEntry = useCallback((entryId: string) => {
    const alreadyVoted = votedContestEntryIds.includes(entryId);
    setVotedContestEntryIds(prev =>
      alreadyVoted ? prev.filter(id => id !== entryId) : [...prev, entryId]
    );
    setContestEntries(prev =>
      prev.map(entry =>
        entry.id === entryId
          ? { ...entry, votes: Math.max(0, entry.votes + (alreadyVoted ? -1 : 1)) }
          : entry
      )
    );
    if (!alreadyVoted) {
      globalAudioEngine.playCoinChime();
      showToast('🔥 Vote counted for this contest entry!');
    } else {
      showToast('Vote removed');
    }
  }, [votedContestEntryIds, showToast]);

  const hasVotedContestEntry = useCallback((entryId: string) => {
    return votedContestEntryIds.includes(entryId);
  }, [votedContestEntryIds]);

  const unlockEpisodeWithAd = useCallback((episode: Episode, story: Story) => {
    setUser(prev => ({ 
      ...prev, 
      unlockedEpisodeIds: [...prev.unlockedEpisodeIds, episode.id] 
    }));
    
    const newTx: CoinTransaction = {
      id: `tx-ad-${Date.now()}`,
      type: 'credit',
      amount: 0,
      description: `Unlocked Episode ${episode.episodeNumber} via Rewarded Ad - ${story.title}`,
      timestamp: new Date().toLocaleString()
    };
    setTransactions(prev => [newTx, ...prev]);
    
    globalAudioEngine.playCoinChime();
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.5 } });
    showToast(`Ad complete! Episode ${episode.episodeNumber} unlocked for free.`);
    closeModal();
    playEpisodeInternal(story, episode, true);
  }, [playEpisodeInternal, showToast, closeModal]);

  const lastClaimTs = user.lastDailyRewardClaimedAt ? new Date(user.lastDailyRewardClaimedAt).getTime() : 0;
  const timeSinceLast = Date.now() - lastClaimTs;
  const canClaimD = !lastClaimTs || timeSinceLast >= ONE_DAY_MS;
  const hUntilNext = canClaimD ? 0 : Math.max(1, Math.ceil((ONE_DAY_MS - timeSinceLast) / (60 * 60 * 1000)));

  return (
    <AppContext.Provider
      value={{
        user, isLoggedIn, login, logout, toggleUserMode, savedLibraryStories, toggleSaveLibrary, isSavedInLibrary,
        chapterBookmarks, saveChapterBookmark, removeChapterBookmark, isChapterBookmarked, getChapterBookmark, resumeChapterBookmark,
        downloadedEpisodes, downloadingEpisodeIds, downloadEpisode, removeDownloadedEpisode, clearAllDownloads, isEpisodeDownloaded, isOfflineMode, toggleOfflineMode, totalStorageUsedMb,
        getEpisodeComments, addCommentToEpisode, likeComment, deleteComment,
        coinBalance: user.coinBalance, transactions, rechargeCoins, unlockEpisodeWithCoins, unlockEpisodeWithAd, isEpisodeUnlocked,
        dailyRewardInfo: { canClaim: canClaimD, streakDays: user.loginStreakDays || 1, hoursUntilNext: hUntilNext, rewardCoins: DAILY_REWARD_COINS },
        claimDailyReward: () => claimDailyReward(false),
        stories, createNewStory, addEpisodeToStory,
        contests, contestEntries, votedContestEntryIds, submitContestEntry, toggleVoteContestEntry, hasVotedContestEntry,
        currentStory, currentEpisode, isPlaying, currentTime, duration, playbackRate, sleepTimer, sleepTimerRemaining, viewMode, isExpandedPlayer, isEpisodeDrawerOpen, currentSpokenSentence, highlightCharIndex, ambientBgmEnabled, activeSpeakerInfo,
        mixerState, setVoiceVolume, setBgmVolume, setBgmMood, setDuckingEnabled, setAmbientSoundscape, setAmbientVolume, playSfx,
        playEpisode, togglePlayPause, seekPlayer, skipPlayer, setPlayerRate, setSleepTimerOption, setPlayerViewMode: setViewMode, setIsExpandedPlayer, setIsEpisodeDrawerOpen, toggleAmbientBgm, playNextEpisode, playPrevEpisode,
        selectedVoiceProfile, setSelectedVoiceProfile, previewVoice, activePreviewVoiceId, voiceCast, setVoiceCast, previewMultiVoiceCast,
        activeModal, modalStory, modalEpisode, openStoryDetail, openUnlockPrompt, openWallet, openAuth, openNewStoryModal, openNewEpisodeModal, closeModal,
        toastMessage, showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
