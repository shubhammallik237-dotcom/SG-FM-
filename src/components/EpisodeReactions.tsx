import React, { useState } from 'react';
import { ReactionType } from '../types';

interface EpisodeReactionsProps {
  episodeId: string;
}

export const EpisodeReactions: React.FC<EpisodeReactionsProps> = ({ episodeId }) => {
  const [reactions, setReactions] = useState<{ type: ReactionType; count: number; active: boolean }[]>([
    { type: 'heart', count: 1205, active: false },
    { type: 'fire', count: 850, active: false },
    { type: 'clapping', count: 432, active: false },
    { type: 'surprised', count: 120, active: false },
    { type: 'laugh', count: 95, active: false }
  ]);

  const toggleReaction = (type: ReactionType) => {
    setReactions(reactions.map(r => {
      if (r.type === type) {
        return {
          ...r,
          count: r.active ? r.count - 1 : r.count + 1,
          active: !r.active
        };
      }
      return r;
    }));
  };

  const getEmoji = (type: ReactionType) => {
    switch (type) {
      case 'heart': return '❤️';
      case 'fire': return '🔥';
      case 'clapping': return '👏';
      case 'surprised': return '😲';
      case 'laugh': return '😂';
      default: return '';
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      {reactions.map((reaction) => (
        <button
          key={reaction.type}
          onClick={() => toggleReaction(reaction.type)}
          className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border transition-all active:scale-90 ${
            reaction.active
              ? 'bg-orange-500/20 border-orange-500 text-orange-300'
              : 'bg-slate-900 border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-200'
          }`}
        >
          <span className="text-sm">{getEmoji(reaction.type)}</span>
          <span className="text-[10px] font-bold tabular-nums">{reaction.count.toLocaleString()}</span>
        </button>
      ))}
    </div>
  );
};
