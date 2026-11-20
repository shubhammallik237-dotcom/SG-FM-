export type Genre = 'Romance' | 'Horror' | 'Thriller' | 'Fantasy' | 'Sci-Fi' | 'Drama';
export type VisualArtStyle = 'Cinematic' | '2D Anime' | '3D Pixar Style' | 'Webtoon Comic';

export type VoiceGender = 'Male' | 'Female';
export type VoiceAgeGroup = 'Young Adult' | 'Adult' | 'Mature' | 'Elderly';
export type VoiceTone =
  | 'Suspense & Thriller'
  | 'Romantic & Soft'
  | 'Royal & Historical'
  | 'Dark & Gritty'
  | 'Mystical & Arcane'
  | 'Warm Narrative'
  | 'High Energy & Action'
  | 'Poetic & Melancholic';

export interface VoiceProfile {
  id: string;
  name: string;
  nativeName: string;
  language: string;
  gender: VoiceGender;
  ageGroup: VoiceAgeGroup;
  tone: VoiceTone;
  description: string;
  accentRegion: string;
  pitch: number;
  rate: number;
  audioFilter?: 'deep' | 'warm' | 'bright' | 'reverb' | 'vintage' | 'normal';
  sampleDialogue: string;
  sampleEnglishDialogue: string;
  recommendedFor: string;
}

export type VoiceRole = 'Narrator' | 'Male' | 'Female';

export interface VoiceCastConfig {
  narrator: VoiceProfile;
  maleLead: VoiceProfile;
  femaleLead: VoiceProfile;
}

export interface DialogueSegment {
  speakerRole: VoiceRole;
  speakerName: string;
  text: string;
  voiceProfile: VoiceProfile;
  startCharIndex: number;
  endCharIndex: number;
  bgmTrigger?: BgmMood;
  sfxTrigger?: string;
}

export interface ActiveSpeakerInfo {
  role: VoiceRole;
  name: string;
  gender: VoiceGender;
  voiceProfile: VoiceProfile;
  segmentIndex: number;
  totalSegments: number;
}

export type BgmMood =
  | 'auto'
  | 'romance'
  | 'horror'
  | 'thriller'
  | 'sad'
  | 'action'
  | 'mystical'
  | 'rain'
  | 'peaceful';

export interface BgmTrack {
  id: BgmMood;
  name: string;
  genre: string;
  description: string;
  badge: string;
  color: string;
}

export type AmbientSoundscapeId =
  | 'none'
  | 'rain'
  | 'cafe'
  | 'cyberpunk'
  | 'forest'
  | 'fireplace'
  | 'ocean';

export interface AmbientSoundscapeOption {
  id: AmbientSoundscapeId;
  name: string;
  shortLabel: string;
  description: string;
  badge: string;
  color: string;
}

export interface AudioMixerState {
  voiceVolume: number;
  bgmVolume: number;
  activeBgmMood: BgmMood;
  autoMatchingEnabled: boolean;
  duckingEnabled: boolean;
  detectedMood: BgmMood;
  ambientSoundscape: AmbientSoundscapeId;
  ambientVolume: number;
}

export interface VisualScene {
  id: string;
  startTime: number;
  endTime: number;
  imageUrl: string;
  videoUrl?: string;
  mood: BgmMood;
  description: string;
  artStyle?: VisualArtStyle;
}

export interface EpisodeComment {
  id: string;
  episodeId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
  audioTimestampSeconds?: number;
  formattedAudioTimestamp?: string;
  isCreator: boolean;
  likes: number;
  replies?: EpisodeComment[];
}

export interface DownloadedEpisode {
  storyId: string;
  episodeId: string;
  storyTitle: string;
  episodeTitle: string;
  episodeNumber: number;
  coverUrl: string;
  author: string;
  genre: Genre;
  durationSeconds: number;
  sizeMb: number;
  downloadedAt: string;
  content: string;
}

export type ReactionType = 'heart' | 'fire' | 'clapping' | 'surprised' | 'laugh';

export interface EpisodeReaction {
  type: ReactionType;
  count: number;
}

export type BeatEmotionType =
  | 'opening'
  | 'romance'
  | 'tension'
  | 'twist'
  | 'climax'
  | 'sorrow'
  | 'revelation'
  | 'dread'
  | 'calm';

export interface ChapterPlotBeat {
  id: string;
  index: number;
  timestampSeconds: number;
  formattedTime: string;
  percent: number;
  title: string;
  excerpt: string;
  beatType: BeatEmotionType;
  emotionLabel: string;
  mood: BgmMood;
  speaker?: string;
  intensity: number;
}

export interface Episode {
  id: string;
  storyId: string;
  episodeNumber: number;
  title: string;
  summary: string;
  content: string;
  durationSeconds: number;
  isFree: boolean;
  coinPrice: number;
  narratorVoice?: string;
  voiceProfileId?: string;
  narratorVoiceId?: string;
  maleVoiceId?: string;
  femaleVoiceId?: string;
  bgmMood?: BgmMood;
  publishedAt: string;
  playsCount: number;
  visualScenes?: VisualScene[];
  plotBeats?: ChapterPlotBeat[];
  reactions?: EpisodeReaction[];
  authorLocked?: boolean;
}

export interface Story {
  id: string;
  title: string;
  author: string;
  authorId: string;
  coverUrl: string;
  trailerVideoUrl?: string;
  description: string;
  genre: Genre;
  tags: string[];
  rating: number;
  totalPlays: number;
  totalEpisodes: number;
  narratorName: string;
  language?: string;
  featured?: boolean;
  trendingRank?: number;
  top10Rank?: number;
  newlyAdded?: boolean;
  isEmergingStar?: boolean;
  followerCount: number;
  episodes: Episode[];
}

export interface UserHistoryItem {
  storyId: string;
  episodeId: string;
  progressSeconds: number;
  lastPlayedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  coinBalance: number;
  unlockedEpisodeIds: string[];
  savedLibraryIds: string[];
  history: UserHistoryItem[];
  mode: 'listener' | 'creator';
  createdStoryIds: string[];
  lastDailyRewardClaimedAt?: string;
  loginStreakDays?: number;
  isOfflineModeEnabled?: boolean;
  chapterBookmarks?: ChapterBookmark[];
}

export interface ChapterBookmark {
  id: string;
  storyId: string;
  episodeId: string;
  storyTitle: string;
  storyCoverUrl: string;
  episodeTitle: string;
  episodeNumber: number;
  progressSeconds: number;
  formattedProgress: string;
  totalDurationSeconds: number;
  mode: 'audio' | 'reading';
  savedAt: string;
  note?: string;
}

export interface CoinPack {
  id: string;
  coins: number;
  bonusCoins: number;
  priceInr: number;
  tag?: string;
  popular?: boolean;
}

export interface CoinTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  timestamp: string;
}

export type PlayerViewMode = 'audio' | 'reader';
export type SleepTimerOption = 0 | 300 | 900 | 1800 | 2700 | -1; // -1 for end of chapter

export type ContestStatus = 'live' | 'upcoming' | 'judging';

export interface WriterContest {
  id: string;
  title: string;
  subtitle: string;
  themePrompt: string;
  prizePoolText: string;
  grandPrizeCoins: number;
  status: ContestStatus;
  daysLeft: number;
  deadlineLabel: string;
  eligibleGenres: ('All' | Genre)[];
  minWords: number;
  rules: string[];
  judgingCriteria: { label: string; weight: string }[];
  entryBonusCoins: number;
}

export interface ContestEntry {
  id: string;
  contestId: string;
  storyId: string;
  authorId: string;
  authorName: string;
  pitchNote: string;
  votes: number;
  submittedAt: string;
  isNewSubmission?: boolean;
}
