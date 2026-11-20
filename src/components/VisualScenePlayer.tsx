import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VisualScene } from '../types';

interface VisualScenePlayerProps {
  currentTime: number;
  scenes: VisualScene[];
  isPlaying: boolean;
}

export const VisualScenePlayer: React.FC<VisualScenePlayerProps> = ({
  currentTime,
  scenes,
  isPlaying
}) => {
  const [activeScene, setActiveScene] = useState<VisualScene | null>(null);

  useEffect(() => {
    const scene = scenes.find(s => currentTime >= s.startTime && currentTime < s.endTime);
    if (scene && scene.id !== activeScene?.id) {
      setActiveScene(scene);
    } else if (!scene && scenes.length > 0 && !activeScene) {
      setActiveScene(scenes[0]);
    }
  }, [currentTime, scenes, activeScene]);

  // Mood-based color filters
  const moodFilter = useMemo(() => {
    if (!activeScene) return '';
    
    switch (activeScene.mood) {
      case 'romance':
        return 'after:bg-orange-500/20 after:mix-blend-overlay saturate-[1.2] sepia-[0.1]';
      case 'horror':
      case 'thriller':
        return 'after:bg-slate-950/40 after:mix-blend-multiply contrast-[1.1] brightness-[0.8] grayscale-[0.2]';
      case 'action':
        return 'after:bg-cyan-500/10 after:mix-blend-screen contrast-[1.3] saturate-[1.4]';
      case 'rain':
        return 'after:bg-blue-900/20 after:mix-blend-color brightness-[0.9]';
      default:
        return '';
    }
  }, [activeScene]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950">
      <AnimatePresence mode="wait">
        {activeScene && (
          <motion.div
            key={activeScene.id}
            initial={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0"
          >
            {activeScene.videoUrl ? (
              <video
                src={activeScene.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className={`w-full h-full object-cover scale-110 transform ${moodFilter} after:absolute after:inset-0`}
              />
            ) : (
              <motion.div 
                animate={{ 
                  scale: isPlaying ? [1.05, 1.15] : 1.1,
                  x: isPlaying ? [-5, 5] : 0,
                  y: isPlaying ? [-5, 5] : 0
                }}
                transition={{ 
                  duration: 20, 
                  repeat: Infinity, 
                  repeatType: "reverse",
                  ease: "linear"
                }}
                className={`w-full h-full relative ${moodFilter} after:absolute after:inset-0`}
              >
                <img
                  src={activeScene.imageUrl}
                  alt={activeScene.description}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dark Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-slate-950/20 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.6)]" />
    </div>
  );
};

