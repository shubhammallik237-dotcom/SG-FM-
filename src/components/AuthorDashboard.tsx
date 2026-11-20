import React, { useState } from 'react';
import {
  PenTool,
  BookPlus,
  Mic,
  Coins,
  Sparkles,
  Play,
  Volume2,
  Lock,
  Unlock,
  Image as ImageIcon,
  CheckCircle,
  TrendingUp,
  Headphones,
  Sliders,
  PlusCircle,
  FileText,
  Save,
  Music,
  Radio,
  Globe,
  Trophy
} from 'lucide-react';
import { generateVisualScenesFromText } from '../utils/sceneGenerator';
import { VisualScene, Genre, Story, VoiceProfile, VoiceCastConfig, BgmMood, VisualArtStyle } from '../types';

import { PRESET_COVERS } from '../data/initialStories';
import { VOICE_PROFILES, DEFAULT_HINDI_VOICE } from '../data/voiceData';
import { BGM_TRACKS } from '../data/bgmTracks';
import { useApp } from '../context/AppContext';
import { globalAudioEngine } from '../utils/audioEngine';
import { VoiceSelector } from './VoiceSelector';
import { AiCoverPosterGenerator } from './AiCoverPosterGenerator';
import { VoiceCastSetupPanel } from './VoiceCastSetupPanel';
import { VoiceToTextNarrator } from './VoiceToTextNarrator';
import { WriterContestView } from './WriterContestView';

export const AuthorDashboard: React.FC = () => {
  const {
    stories,
    createNewStory,
    addEpisodeToStory,
    showToast,
    openStoryDetail,
    previewVoice,
    activePreviewVoiceId,
    voiceCast,
    setVoiceCast,
    setBgmMood,
    playSfx
  } = useApp();

  const [activeTab, setActiveTab] = useState<'novels' | 'new_story' | 'new_chapter' | 'dictate' | 'contests' | 'analytics'>('novels');
  const [selectedStoryId, setSelectedStoryId] = useState<string>(stories[0]?.id || '');
  const [showVoiceNarratorInline, setShowVoiceNarratorInline] = useState(true);
  const [showSynopsisVoice, setShowSynopsisVoice] = useState(false);

  // New Story Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState<Genre>('Romance');
  const [tagsInput, setTagsInput] = useState('Billionaire, Drama, Mystery');
  const [authorName, setAuthorName] = useState('Aryan Sharma');
  const [narratorName, setNarratorName] = useState('Kabir Verma (Premium Hindi)');
  const [coverUrl, setCoverUrl] = useState(PRESET_COVERS[0].url);
  const [customCoverInput, setCustomCoverInput] = useState('');
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);

  // Chapter Editor & Multi-Voice Production State
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterContent, setChapterContent] = useState('');
  const [chapterSummary, setChapterSummary] = useState('');
  const [isFreeEpisode, setIsFreeEpisode] = useState(false);
  const [coinPrice, setCoinPrice] = useState(10);
  const [selectedChapterVoice, setSelectedChapterVoice] = useState<VoiceProfile>(DEFAULT_HINDI_VOICE);
  const [voiceRate, setVoiceRate] = useState(1.0);
  const [voicePitch, setVoicePitch] = useState(1.0);
  const [chapterCast, setChapterCast] = useState<VoiceCastConfig>(voiceCast);
  const [selectedBgmMood, setSelectedBgmMood] = useState<BgmMood>('auto');
  const [selectedArtStyle, setSelectedArtStyle] = useState<VisualArtStyle>('Cinematic');
  const [generatedScenes, setGeneratedScenes] = useState<VisualScene[]>([]);
  const [previewSceneIndex, setPreviewSceneIndex] = useState(0);

  const artStyles: VisualArtStyle[] = ['Cinematic', '2D Anime', '3D Pixar Style', 'Webtoon Comic'];

  // Auto-tag quotes as [Male] and [Female], narrative as [Narrator]
  const handleAutoTagQuotes = () => {
    if (!chapterContent.trim()) {
      showToast('Please enter chapter text first');
      return;
    }
    const paras = chapterContent.split('\n\n').filter(p => p.trim().length > 0);
    let isMaleTurn = true;
    const tagged = paras.map(para => {
      if (para.startsWith('[')) return para;
      if (para.includes('"') || para.includes('“')) {
        const tag = isMaleTurn ? `[Male: ${chapterCast.maleLead.name}]` : `[Female: ${chapterCast.femaleLead.name}]`;
        isMaleTurn = !isMaleTurn;
        return `${tag}\n${para}`;
      } else {
        return `[Narrator]\n${para}`;
      }
    });
    setChapterContent(tagged.join('\n\n'));
    showToast('✓ Auto-tagged dialogues into [Male], [Female], and [Narrator] scenes!');
  };

  const handleInsertTag = (tag: string) => {
    setChapterContent(prev => {
      if (!prev) return `${tag}\n`;
      return `${prev}\n\n${tag}\n`;
    });
    showToast(`Inserted ${tag.trim()}`);
  };

  const handleCreateNovel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('Please provide a title and synopsis for your novel');
      return;
    }
    const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0);
    const finalCover = customCoverInput.trim() || coverUrl;
    const newStory = createNewStory({
      title: title.trim(),
      description: description.trim(),
      author: authorName.trim() || 'SGFM Author',
      authorId: `author-${Date.now()}`,
      genre,
      tags: tags.length > 0 ? tags : [genre, 'Novel'],
      coverUrl: finalCover,
      narratorName: narratorName.trim() || 'SGFM AI Voice',
      totalEpisodes: 1,
      followerCount: 0
    });
    setSelectedStoryId(newStory.id);
    setActiveTab('novels');
    setTitle('');
    setDescription('');
    setCustomCoverInput('');
  };

  const handlePublishChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStoryId) {
      showToast('Please select a novel first');
      return;
    }
    if (!chapterTitle.trim() || !chapterContent.trim()) {
      showToast('Please enter both chapter title and content');
      return;
    }
    const targetStory = stories.find(s => s.id === selectedStoryId);
    if (!targetStory) return;
    const wordCount = chapterContent.trim().split(/\s+/).length;
    const durationSeconds = Math.max(60, Math.floor((wordCount / 140) * 60));

    // Auto-generate visual scenes if missing
    let finalScenes = generatedScenes;
    if (finalScenes.length === 0) {
      finalScenes = generateVisualScenesFromText(chapterContent.trim(), durationSeconds, selectedArtStyle);
    }

    addEpisodeToStory(selectedStoryId, {
      episodeNumber: targetStory.episodes.length + 1,
      title: chapterTitle.trim(),
      summary: chapterSummary.trim() || `Chapter ${targetStory.episodes.length + 1} of ${targetStory.title}`,
      content: chapterContent.trim(),
      durationSeconds,
      isFree: isFreeEpisode,
      coinPrice: isFreeEpisode ? 0 : coinPrice,
      narratorVoice: `${chapterCast.narrator.name} (${chapterCast.narrator.language})`,
      voiceProfileId: chapterCast.narrator.id,
      narratorVoiceId: chapterCast.narrator.id,
      maleVoiceId: chapterCast.maleLead.id,
      femaleVoiceId: chapterCast.femaleLead.id,
      bgmMood: selectedBgmMood,
      visualScenes: finalScenes,
      publishedAt: new Date().toISOString().split('T')[0]
    });

    setChapterTitle('');
    setChapterContent('');
    setChapterSummary('');
    setGeneratedScenes([]);
    setActiveTab('novels');
  };

  const totalChapters = stories.reduce((acc, s) => acc + s.episodes.length, 0);
  const totalPlays = stories.reduce((acc, s) => acc + s.totalPlays, 0);
  const estimatedCoinsEarned = Math.floor(totalPlays * 0.05) + 420;

  return (
    <div className="space-y-8 pb-32 max-w-6xl mx-auto">
      {/* Author Dashboard Header & Stats */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-orange-950/20 border border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500">
              <PenTool className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
                Author Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Manage your original novels, track performance, and produce high-end AI audio stories
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('dictate')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500/20 to-amber-500/20 hover:from-orange-500/30 hover:to-amber-500/30 text-orange-400 font-bold text-xs flex items-center gap-2 transition-all border border-orange-500/30 shadow-md shadow-orange-500/10"
            >
              <Mic className="w-4 h-4 text-orange-400 animate-pulse" />
              <span>Voice Dictate</span>
            </button>
            <button
              onClick={() => setActiveTab('new_story')}
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-orange-500/20"
            >
              <BookPlus className="w-4 h-4" />
              <span>New Novel</span>
            </button>
            <button
              onClick={() => setActiveTab('new_chapter')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 transition-colors border border-slate-700"
            >
              <PlusCircle className="w-4 h-4 text-orange-500" />
              <span>Add Episode</span>
            </button>
            <button
              onClick={() => setActiveTab('contests')}
              className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-bold text-xs flex items-center gap-2 transition-all border border-amber-500/30"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Writer Contest</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 transition-colors border border-slate-700"
            >
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Analytics</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-850">
            <span className="text-xs text-slate-400 font-medium">Stories</span>
            <div className="text-xl sm:text-2xl font-bold text-white mt-1 tabular-nums">
              {stories.length}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-850">
            <span className="text-xs text-slate-400 font-medium">Total Episodes</span>
            <div className="text-xl sm:text-2xl font-bold text-orange-400 mt-1 tabular-nums">
              {totalChapters}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-850">
            <span className="text-xs text-slate-400 font-medium">Total Plays</span>
            <div className="text-xl sm:text-2xl font-bold text-cyan-400 mt-1 tabular-nums">
              {(totalPlays / 1000).toFixed(1)}K
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-850">
            <span className="text-xs text-slate-400 font-medium">Coin Royalties</span>
            <div className="text-xl sm:text-2xl font-bold text-orange-400 mt-1 flex items-center gap-1 tabular-nums">
              <Coins className="w-4 h-4 text-orange-400" />
              {estimatedCoinsEarned}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-2xl border border-slate-800 max-w-3xl overflow-x-auto scrollbar-none">
        {(['novels', 'new_story', 'new_chapter', 'dictate', 'contests', 'analytics'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 min-w-[110px] py-2.5 px-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 ${
              activeTab === tab
                ? 'bg-orange-500 text-white shadow-lg'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab === 'dictate' && <Mic className="w-3.5 h-3.5" />}
            {tab === 'contests' && <Trophy className="w-3.5 h-3.5 text-amber-400" />}
            <span>
              {tab === 'novels'
                ? 'My Novels'
                : tab === 'new_story'
                ? 'Create Novel'
                : tab === 'new_chapter'
                ? 'Voice Production'
                : tab === 'dictate'
                ? 'Voice-to-Text'
                : tab === 'contests'
                ? 'Writer Contest'
                : 'Analytics'}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'novels' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-display font-bold text-white">My Novels Catalog</h2>
            <span className="text-xs text-slate-400">{stories.length} stories published</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stories.map(story => (
              <div key={`author-story-${story.id}`} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex gap-4 hover:border-slate-700 transition-all">
                <div className="w-24 h-32 rounded-xl overflow-hidden shrink-0 border border-slate-800">
                  <img src={story.coverUrl} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-orange-400 uppercase mb-1">
                      <span>{story.genre}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-600" />
                      <span className="text-slate-400">{story.totalEpisodes} Episodes</span>
                    </div>
                    <h3 className="text-lg font-bold text-white truncate">{story.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{story.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setSelectedStoryId(story.id); setActiveTab('new_chapter'); }}
                      className="px-4 py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 text-xs font-bold transition-all"
                    >
                      Add Episode
                    </button>
                    <button
                      onClick={() => openStoryDetail(story)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold transition-all"
                    >
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'new_story' && (
        <form onSubmit={handleCreateNovel} className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Publish New Audiobook</h2>
              <p className="text-xs text-slate-500 mt-1">Set up your series metadata and high-fidelity cover art.</p>
            </div>
            <PenTool className="w-8 h-8 text-orange-500 opacity-20" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Novel Title *</label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter an eye-catching title..." className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-4 py-3 text-sm text-white outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Genre *</label>
              <select value={genre} onChange={e => setGenre(e.target.value as Genre)} className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-4 py-3 text-sm text-white outline-none appearance-none">
                <option value="Romance">Romance</option>
                <option value="Fantasy">Fantasy</option>
                <option value="Horror">Horror</option>
                <option value="Sci-Fi">Sci-Fi</option>
                <option value="Drama">Drama</option>
                <option value="Thriller">Thriller</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Synopsis & Hook *</label>
              <button
                type="button"
                onClick={() => setShowSynopsisVoice(prev => !prev)}
                className="text-[10px] font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 uppercase transition-colors"
              >
                <Mic className="w-3 h-3" />
                <span>{showSynopsisVoice ? 'Hide Mic' : '🎙️ Dictate Synopsis'}</span>
              </button>
            </div>
            {showSynopsisVoice && (
              <VoiceToTextNarrator
                onInsertText={(text, mode) => {
                  setDescription(prev => mode === 'replace' ? text : (prev ? `${prev} ${text}` : text));
                }}
                currentScriptLength={description.length}
                initialRole="None"
                className="mb-2"
              />
            )}
            <textarea required rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="Write an enticing summary that hooks listeners..." className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-4 py-3 text-sm text-white outline-none resize-none" />
          </div>

          <div className="space-y-4">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cover Art (3:4 Ratio)</label>
              <button type="button" onClick={() => setIsCoverModalOpen(true)} className="px-4 py-2 rounded-xl bg-orange-500 text-white font-bold text-[10px] uppercase flex items-center gap-1.5 shadow-lg shadow-orange-500/20 active:scale-95 transition-all">
                <Sparkles className="w-3.5 h-3.5" />
                AI Cover Generator
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {PRESET_COVERS.map(cover => (
                <div key={cover.url} onClick={() => { setCoverUrl(cover.url); setCustomCoverInput(''); }} className={`aspect-[3/4] rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${coverUrl === cover.url ? 'border-orange-500 scale-105 shadow-lg shadow-orange-500/10' : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-700'}`}>
                  <img src={cover.url} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-800">
            <button type="button" onClick={() => setActiveTab('novels')} className="px-6 py-2 text-xs font-bold text-slate-500 hover:text-white uppercase tracking-widest">Cancel</button>
            <button type="submit" className="px-8 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all">Publish Novel</button>
          </div>
        </form>
      )}

      {activeTab === 'new_chapter' && (
        <form onSubmit={handlePublishChapter} className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Voice Production Dashboard</h2>
              <p className="text-xs text-slate-500 mt-1">Multi-voice orchestration with dynamic background music.</p>
            </div>
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-bold text-slate-500 uppercase">Select Novel:</span>
               <select value={selectedStoryId} onChange={e => setSelectedStoryId(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-orange-400 font-bold outline-none">
                 {stories.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
               </select>
            </div>
          </div>

          <VoiceCastSetupPanel cast={chapterCast} onUpdateCast={setChapterCast} onInsertTag={handleInsertTag} />

          <div className="space-y-4">
              <div className="flex flex-col gap-4 p-5 rounded-2xl bg-orange-500/5 border border-orange-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-500" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Video Cartoon Style</h4>
                  </div>
                  <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                    {artStyles.map(style => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setSelectedArtStyle(style)}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${selectedArtStyle === style ? 'bg-orange-500 text-white' : 'text-slate-600 hover:text-slate-400'}`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-white">Chapter Text & Dialogue Tags</label>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowVoiceNarratorInline(prev => !prev)}
                      className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 ${
                        showVoiceNarratorInline
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black border-orange-400 shadow-md shadow-orange-500/20'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>{showVoiceNarratorInline ? 'Hide Voice Dictator' : '🎙️ Voice Dictation'}</span>
                    </button>
                    <button type="button" onClick={handleAutoTagQuotes} className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold uppercase hover:bg-indigo-500/20 transition-all">Auto-Tag Dialogues</button>
                    <button type="button" onClick={() => {
                       if (!chapterContent.trim()) {
                         showToast('Please enter chapter text first');
                         return;
                       }
                       const wordCount = chapterContent.trim().split(/\s+/).length;
                       const duration = Math.max(60, Math.floor((wordCount / 140) * 60));
                       setGeneratedScenes(generateVisualScenesFromText(chapterContent, duration, selectedArtStyle));
                       showToast(`✓ AI ${selectedArtStyle} Visual Scenes Generated!`);
                    }} className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-slate-950 text-[10px] font-black uppercase transition-all flex items-center gap-1.5 shadow-lg shadow-orange-500/10">
                      <ImageIcon className="w-3.5 h-3.5" />
                      Generate AI {selectedArtStyle.split(' ')[0]} Video
                    </button>
                  </div>
                </div>
              </div>

              {showVoiceNarratorInline && (
                <VoiceToTextNarrator
                  onInsertText={(text, mode) => {
                    if (mode === 'replace') {
                      setChapterContent(text);
                    } else {
                      setChapterContent(prev => prev ? `${prev}\n\n${text}` : text);
                    }
                  }}
                  currentScriptLength={chapterContent.length}
                  maleLeadName={chapterCast.maleLead.name}
                  femaleLeadName={chapterCast.femaleLead.name}
                  className="mb-2"
                />
              )}

              <textarea required rows={10} value={chapterContent} onChange={e => setChapterContent(e.target.value)} placeholder="Paste or narrate your story here. Use [Male] or [Female] tags to switch voices..." className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-2xl p-5 text-sm text-slate-300 outline-none font-serif leading-relaxed" />
              
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-600 uppercase tracking-widest px-1">
                <span>Real-time Ducking: 65% Reduction Active</span>
                <span>{chapterContent.split(/\s+/).filter(Boolean).length} Words • ~{Math.ceil(chapterContent.split(/\s+/).filter(Boolean).length / 140)} Min</span>
              </div>

              {/* Cartoon Tap Timeline Editor */}
              {generatedScenes.length > 0 && (
                <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-orange-500">
                      <Radio className="w-4 h-4 animate-pulse" />
                      <h4 className="text-xs font-black uppercase tracking-widest">Cartoon Tap Timeline Editor</h4>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{generatedScenes.length} Automated Frames</span>
                  </div>

                  <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                    {generatedScenes.map((scene, idx) => (
                      <div 
                        key={scene.id} 
                        onClick={() => setPreviewSceneIndex(idx)}
                        className={`min-w-[140px] aspect-video rounded-xl overflow-hidden cursor-pointer border-2 transition-all relative group ${previewSceneIndex === idx ? 'border-orange-500 scale-105 z-10 shadow-xl' : 'border-slate-800 opacity-60 hover:opacity-100'}`}
                      >
                        <img src={scene.imageUrl} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-6 h-6 text-white fill-current" />
                        </div>
                        <div className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-bold text-white">
                          {Math.floor(scene.startTime)}s
                        </div>
                      </div>
                    ))}
                  </div>

                  {generatedScenes[previewSceneIndex] && (
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-slate-900">
                      <img src={generatedScenes[previewSceneIndex].imageUrl} className="w-full h-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Preview Frame {previewSceneIndex + 1} · {generatedScenes[previewSceneIndex].mood}</div>
                        <p className="text-xs text-white font-medium line-clamp-1">{generatedScenes[previewSceneIndex].description}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
          </div>

          <div className="p-5 rounded-2xl bg-indigo-950/10 border border-indigo-500/20 space-y-4">
             <div className="flex items-center gap-3">
                <Music className="w-5 h-5 text-indigo-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Ambient Soundtrack & Sentiment Match</h4>
             </div>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
               {BGM_TRACKS.map(track => (
                 <button key={track.id} type="button" onClick={() => { setSelectedBgmMood(track.id); setBgmMood(track.id); }} className={`p-3 rounded-xl border text-center transition-all ${selectedBgmMood === track.id ? 'bg-indigo-500 text-white border-indigo-400 shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}>
                    <div className="text-[10px] font-black uppercase mb-0.5">{track.name.split(' ')[0]}</div>
                    <div className="text-[9px] opacity-60 font-bold">{track.badge}</div>
                 </button>
               ))}
             </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-800">
             <div className="flex-1 flex items-center gap-4">
                <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800">
                   <button type="button" onClick={() => setIsFreeEpisode(true)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${isFreeEpisode ? 'bg-emerald-500 text-white' : 'text-slate-600 hover:text-slate-400'}`}>Free</button>
                   <button type="button" onClick={() => setIsFreeEpisode(false)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${!isFreeEpisode ? 'bg-orange-500 text-white' : 'text-slate-600 hover:text-slate-400'}`}>Locked</button>
                </div>
                {!isFreeEpisode && (
                  <div className="flex items-center gap-2">
                    {[5, 10, 15].map(p => <button key={p} type="button" onClick={() => setCoinPrice(p)} className={`w-8 h-8 rounded-lg text-[10px] font-bold border transition-all ${coinPrice === p ? 'bg-orange-500 border-orange-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>{p}</button>)}
                  </div>
                )}
             </div>
             <button type="submit" className="px-8 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all">Publish Episode</button>
          </div>
        </form>
      )}

      {/* Dedicated Voice-to-Text Recording Studio Tab */}
      {activeTab === 'dictate' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-lg shadow-orange-500/10">
                  <Mic className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <span>Voice-to-Text Recording Studio</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    Speak or narrate your chapters live. SGFM transcribes your vocal delivery into production-ready scripts.
                  </p>
                </div>
              </div>

              {/* Target Novel Selector */}
              <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase px-2">Novel:</span>
                <select
                  value={selectedStoryId}
                  onChange={(e) => setSelectedStoryId(e.target.value)}
                  className="bg-slate-900 text-xs font-bold text-white px-3 py-1.5 rounded-xl border border-slate-700 outline-none focus:border-orange-500"
                >
                  {stories.map((story) => (
                    <option key={`dictate-sel-${story.id}`} value={story.id}>
                      {story.title} ({story.genre})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Target Story & Chapter Metadata Mini-Bar */}
            {(() => {
              const currentNovel = stories.find((s) => s.id === selectedStoryId) || stories[0];
              return (
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentNovel?.coverUrl}
                      alt=""
                      className="w-12 h-16 rounded-lg object-cover border border-slate-800 shrink-0"
                    />
                    <div>
                      <div className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                        {currentNovel?.genre} • Next: Episode {(currentNovel?.episodes.length || 0) + 1}
                      </div>
                      <h4 className="text-sm font-bold text-white">{currentNovel?.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-1">{currentNovel?.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Episode Title</label>
                      <input
                        type="text"
                        value={chapterTitle}
                        onChange={(e) => setChapterTitle(e.target.value)}
                        placeholder={`Episode ${(currentNovel?.episodes.length || 0) + 1}: The Revelations`}
                        className="bg-slate-900 border border-slate-800 text-xs text-white px-3 py-2 rounded-xl outline-none focus:border-orange-500 w-56"
                      />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Voice-to-Text Narrator Console */}
            <VoiceToTextNarrator
              onInsertText={(text, mode) => {
                if (mode === 'replace') {
                  setChapterContent(text);
                } else {
                  setChapterContent((prev) => (prev ? `${prev}\n\n${text}` : text));
                }
              }}
              currentScriptLength={chapterContent.length}
              maleLeadName={chapterCast.maleLead.name}
              femaleLeadName={chapterCast.femaleLead.name}
            />

            {/* Script Editor Preview */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-400" />
                  <span>Current Chapter Script Buffer</span>
                </label>
                <span className="text-xs text-slate-500 font-mono">
                  {chapterContent.split(/\s+/).filter(Boolean).length} words • ~{Math.ceil(chapterContent.split(/\s+/).filter(Boolean).length / 140)} min audio
                </span>
              </div>

              <textarea
                rows={7}
                value={chapterContent}
                onChange={(e) => setChapterContent(e.target.value)}
                placeholder="Transcribed voice text will appear here. You can also edit and fine-tune your script manually..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-2xl p-4 text-sm text-slate-200 outline-none font-serif leading-relaxed"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAutoTagQuotes}
                    disabled={!chapterContent.trim()}
                    className="px-3.5 py-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold hover:bg-indigo-500/20 transition-all disabled:opacity-40"
                  >
                    Auto-Tag Dialogues
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setChapterContent('');
                      showToast('Script buffer cleared');
                    }}
                    disabled={!chapterContent.trim()}
                    className="px-3 py-2 rounded-xl bg-slate-900 text-slate-400 hover:text-rose-400 border border-slate-800 text-xs font-bold transition-all disabled:opacity-40"
                  >
                    Clear Buffer
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (!chapterContent.trim()) {
                        showToast('Please dictate or enter some script text first');
                        return;
                      }
                      setActiveTab('new_chapter');
                      showToast('Transferred script to Voice Production & Scene generator!');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider border border-slate-700 transition-all shadow-md"
                  >
                    Send to Voice Production →
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handlePublishChapter(e as any)}
                    disabled={!chapterContent.trim()}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-40"
                  >
                    Publish Episode Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'contests' && (
        <WriterContestView onNavigateToWriter={() => setActiveTab('new_story')} />
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
                <span>Performance Insights</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">Real-time audience tracking and revenue analytics.</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Feed
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
               <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400"><Headphones className="w-6 h-6" /></div>
               <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Streams</div>
                  <div className="text-3xl font-bold text-white tabular-nums">{(totalPlays / 1000).toFixed(1)}K</div>
               </div>
            </div>
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
               <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500"><Coins className="w-6 h-6" /></div>
               <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Revenue</div>
                  <div className="text-3xl font-bold text-white tabular-nums">₹{(estimatedCoinsEarned * 0.8).toLocaleString()}</div>
               </div>
            </div>
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
               <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500"><PlusCircle className="w-6 h-6" /></div>
               <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Library Saves</div>
                  <div className="text-3xl font-bold text-white tabular-nums">{Math.floor(totalPlays / 120).toLocaleString()}</div>
               </div>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="px-6 py-4 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Story Breakdown</span>
              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Top Performers</span>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-bold text-slate-600 uppercase tracking-widest border-b border-slate-800/50">
                      <th className="px-6 py-4">Novel</th>
                      <th className="px-6 py-4">Plays</th>
                      <th className="px-6 py-4">Earnings</th>
                      <th className="px-6 py-4">Followers</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {stories.map(story => (
                      <tr key={`stat-${story.id}`} className="hover:bg-slate-850/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-sm text-white">{story.title}</td>
                        <td className="px-6 py-4 text-xs text-slate-400">{(story.totalPlays / 1000).toFixed(1)}K</td>
                        <td className="px-6 py-4 text-xs text-orange-400 font-bold tabular-nums">{(story.totalPlays * 0.05).toFixed(0)}</td>
                        <td className="px-6 py-4 text-xs text-slate-300 font-bold">{(story.followerCount || Math.floor(story.totalPlays / 15)).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        </div>
      )}

      <AiCoverPosterGenerator
        isOpen={isCoverModalOpen}
        onClose={() => setIsCoverModalOpen(false)}
        initialTitle={title || 'Untitled Novel'}
        initialGenre={genre}
        initialSynopsis={description}
        initialAuthor={authorName}
        onSelectCover={(generatedCoverUrl) => {
          setCoverUrl(generatedCoverUrl);
          setCustomCoverInput(generatedCoverUrl);
          showToast('✓ AI Generated Cover Applied!');
        }}
      />
    </div>
  );
};
