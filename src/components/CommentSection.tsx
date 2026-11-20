import React, { useState } from 'react';
import { Heart, Send, MessageSquare, Trash2, UserCheck, Clock, Play } from 'lucide-react';
import { EpisodeComment } from '../types';
import { useApp } from '../context/AppContext';

interface CommentSectionProps {
  episodeId: string;
  authorId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ episodeId, authorId }) => {
  const { 
    user, 
    showToast, 
    getEpisodeComments, 
    addCommentToEpisode, 
    likeComment, 
    deleteComment,
    currentTime,
    seekPlayer
  } = useApp();

  const comments = getEpisodeComments(episodeId);
  const [newComment, setNewComment] = useState('');
  const [includeTimestamp, setIncludeTimestamp] = useState(false);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentSeconds = Math.floor(currentTime);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    addCommentToEpisode(
      episodeId,
      newComment.trim(),
      includeTimestamp ? currentSeconds : undefined
    );

    setNewComment('');
    setIncludeTimestamp(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/40 border-l border-white/5 overflow-hidden">
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/40">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-orange-500" />
          <span>Episode Comments</span>
        </h3>
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{comments.length} Comments</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
        {comments.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-700 mx-auto" />
            <p className="text-xs text-slate-400">No comments yet on this episode.</p>
            <p className="text-[11px] text-slate-600">Be the first to leave a time-stamped note!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="space-y-2 group animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <img src={comment.userAvatar} className="w-8 h-8 rounded-full border border-white/10 shrink-0" alt="" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-200">{comment.userName}</span>
                      {comment.isCreator && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[9px] font-black uppercase tracking-tighter">
                          <UserCheck className="w-2.5 h-2.5" />
                          Author
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500">{comment.timestamp}</span>

                      {comment.formattedAudioTimestamp && (
                        <button
                          onClick={() => {
                            if (comment.audioTimestampSeconds !== undefined) {
                              seekPlayer(comment.audioTimestampSeconds);
                              showToast(`Jumped to [${comment.formattedAudioTimestamp}]`);
                            }
                          }}
                          className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-orange-500/15 hover:bg-orange-500/30 border border-orange-500/30 text-orange-400 text-[9px] font-mono font-bold transition-all"
                          title="Seek audio to this moment"
                        >
                          <Play className="w-2 h-2 fill-current" />
                          <span>{comment.formattedAudioTimestamp}</span>
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed mt-1">{comment.text}</p>
                  </div>
                </div>
                
                {comment.userId === user.id && (
                  <button 
                    onClick={() => deleteComment(comment.episodeId, comment.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-600 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete comment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-4 pl-11">
                <button 
                  onClick={() => likeComment(comment.episodeId, comment.id)}
                  className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-orange-400 font-bold transition-colors"
                >
                  <Heart className="w-3 h-3 text-rose-500" />
                  <span>{comment.likes}</span>
                </button>
                <button 
                  onClick={() => setNewComment(`@${comment.userName} `)}
                  className="text-[10px] text-slate-500 hover:text-white font-bold transition-colors"
                >
                  Reply
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-3 bg-slate-900/80 border-t border-white/5 space-y-2">
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={() => setIncludeTimestamp(!includeTimestamp)}
            className={`text-[10px] font-bold flex items-center gap-1 px-2 py-0.5 rounded-lg border transition-all ${
              includeTimestamp
                ? 'bg-orange-500 text-slate-950 border-orange-400'
                : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
            }`}
          >
            <Clock className="w-2.5 h-2.5" />
            <span>{includeTimestamp ? `Timestamp [${formatTime(currentSeconds)}]` : '+ Attach Timestamp'}</span>
          </button>
          {includeTimestamp && (
            <span className="text-[10px] text-orange-400 font-mono">Current: {formatTime(currentSeconds)}</span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full bg-slate-950 border border-white/5 focus:border-orange-500/50 rounded-xl pl-3 pr-12 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="absolute right-1.5 top-1.5 w-8 h-8 rounded-lg bg-orange-500 hover:bg-orange-400 text-slate-950 flex items-center justify-center transition-all active:scale-95 disabled:opacity-30 disabled:grayscale"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

