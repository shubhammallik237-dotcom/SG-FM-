import React, { useState } from 'react';
import { Play, Star, Bookmark, Lock, BookOpen } from 'lucide-react';
import { Story } from '../types';
import { useApp } from '../context/AppContext';

interface StoryCardProps {
  story: Story;
  layout?: 'portrait' | 'horizontal' | 'compact' | 'ranked';
  rank?: number;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  layout = 'portrait',
  rank
}) => {
  const {
    playEpisode,
    openStoryDetail,
    toggleSaveLibrary,
    isSavedInLibrary,
    currentStory,
    isPlaying
  } = useApp();

  const [imgError, setImgError] = useState(false);
  const isSaved = isSavedInLibrary(story.id);
  const isCurrentlyPlayingThis = currentStory?.id === story.id && isPlaying;

  const handleCardClick = () => openStoryDetail(story);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (story.episodes.length > 0) playEpisode(story, story.episodes[0], true);
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSaveLibrary(story.id);
  };

  const formatPlays = (plays: number) => {
    if (plays >= 1000000) return `${(plays / 1000000).toFixed(1)}M`;
    if (plays >= 1000) return `${Math.floor(plays / 1000)}K`;
    return `${plays}`;
  };

  if (layout === 'ranked') {
    return (
      <div
        onClick={handleCardClick}
        className="group relative flex items-center gap-4 p-3 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/60 hover:border-orange-500/30 transition-all cursor-pointer shadow-lg"
      >
        <div className="w-10 flex items-center justify-center font-display font-black text-4xl text-slate-800 group-hover:text-orange-500/20 transition-colors tabular-nums">
          {rank}
        </div>
        <div className="relative w-20 h-28 rounded-xl overflow-hidden shrink-0 bg-slate-800 shadow-md">
          <img
            src={story.coverUrl}
            alt={story.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {isCurrentlyPlayingThis && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
               <div className="flex items-center gap-1 h-5">
                  <span className="w-1 bg-orange-500 h-3 animate-audio-bar-1 rounded-full" />
                  <span className="w-1 bg-orange-500 h-5 animate-audio-bar-2 rounded-full" />
                  <span className="w-1 bg-orange-500 h-3 animate-audio-bar-3 rounded-full" />
               </div>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold text-orange-400 uppercase mb-1 tracking-widest">{story.genre}</div>
          <h4 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors truncate">{story.title}</h4>
          <p className="text-xs text-slate-500 truncate mt-0.5">By {story.author}</p>
          <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            <span className="flex items-center gap-1 text-orange-400"><Star className="w-3 h-3 fill-orange-500" /> {story.rating}</span>
            <span>·</span>
            <span>{formatPlays(story.totalPlays)} Plays</span>
          </div>
        </div>
        <button onClick={handlePlayClick} className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-orange-500 text-slate-500 group-hover:text-white flex items-center justify-center transition-all shadow-md">
          <Play className="w-4 h-4 fill-current ml-0.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col rounded-2xl bg-slate-900/50 hover:bg-slate-900/90 border border-slate-800/80 hover:border-orange-500/50 transition-all overflow-hidden cursor-pointer shadow-lg hover:shadow-[0_0_25px_rgba(249,115,22,0.15)] transform hover:-translate-y-1 duration-300"
    >
      <div className="relative aspect-[3/4] w-full bg-slate-900 overflow-hidden">
        <img
          src={story.coverUrl}
          alt={story.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
          {story.language && (
            <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[9px] font-black uppercase text-amber-300 border border-white/10">
              {story.language}
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3 z-10">
          <button onClick={handleBookmarkClick} className={`w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${isSaved ? 'bg-orange-500 text-white' : 'bg-black/40 text-white hover:bg-black/60'}`}>
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <button onClick={handlePlayClick} className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-xl pointer-events-auto transform translate-y-2 group-hover:translate-y-0 transition-all">
            {isCurrentlyPlayingThis ? (
               <div className="flex items-center gap-1 h-5">
                  <span className="w-1 bg-white h-3 animate-audio-bar-1 rounded-full" />
                  <span className="w-1 bg-white h-5 animate-audio-bar-2 rounded-full" />
                  <span className="w-1 bg-white h-3 animate-audio-bar-3 rounded-full" />
               </div>
            ) : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
          <span className="text-[10px] font-black tracking-widest uppercase text-orange-400 drop-shadow-lg">{story.genre}</span>
          <span className="flex items-center gap-1 font-black text-[10px] text-white drop-shadow-lg"><Star className="w-3 h-3 fill-orange-500 text-orange-500" /> {story.rating}</span>
        </div>
      </div>
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-1">
        <div>
          <h3 className="font-bold text-sm text-white group-hover:text-orange-400 transition-colors line-clamp-1">{story.title}</h3>
          <p className="text-[11px] text-slate-500 truncate">By {story.author}</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest pt-2 border-t border-slate-800/60 mt-1">
          <span>{story.totalEpisodes} Eps</span>
          <span>·</span>
          <span>{formatPlays(story.totalPlays)} Plays</span>
        </div>
      </div>
    </div>
  );
};
