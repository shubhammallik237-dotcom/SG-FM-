import { VisualScene, BgmMood, VisualArtStyle, Episode, Genre, ChapterPlotBeat, BeatEmotionType } from '../types';
import { detectMoodFromText } from '../data/bgmTracks';

const STYLE_KEYWORDS: Record<VisualArtStyle, string> = {
  'Cinematic': 'cinematic photography, realistic, high detail, 8k',
  '2D Anime': 'anime style, 2d animation, studio ghibli inspired, vibrant colors',
  '3D Pixar Style': '3d render, disney pixar style, cute characters, soft lighting, octane render',
  'Webtoon Comic': 'webtoon style, manhwa art, comic book, sharp lines, cel shaded'
};

const SCENE_KEYWORDS: Record<BgmMood, string[]> = {
  romance: ['sunset', 'candlelight', 'bedroom', 'ballroom', 'dance', 'embrace', 'kiss', 'rose', 'penthouse', 'luxury'],
  horror: ['asylum', 'dark corridor', 'foggy forest', 'abandoned', 'blood', 'scary', 'ghost', 'mirror', 'shadowy'],
  thriller: ['chase', 'rainy street', 'city lights', 'investigation', 'locked door', 'gun', 'noir', 'tension'],
  sad: ['rainy window', 'empty room', 'autumn leaves', 'crying', 'lonely', 'funeral', 'hospital'],
  action: ['explosion', 'fight', 'speeding car', 'battlefield', 'superhero', 'fire', 'laser'],
  mystical: ['magic circle', 'portal', 'crystal ball', 'floating island', 'wizard', 'nebula', 'ancient ruins'],
  rain: ['heavy rain', 'stormy sea', 'wet pavement', 'umbrella', 'thunder'],
  peaceful: ['library', 'garden', 'coffee shop', 'mountain view', 'beach', 'sunrise', 'cozy fire'],
  auto: []
};

const UNSPLASH_BASE = 'https://images.unsplash.com';

function getUnsplashUrl(query: string) {
  // Use a query-based Unsplash URL for more variety with styles
  return `${UNSPLASH_BASE}/featured/?${encodeURIComponent(query)}&sig=${Math.random()}`;
}

// Map keywords to specific high-quality Unsplash IDs for consistency (Cinematic fallback)
const MOOD_IMAGE_MAPPING: Record<BgmMood, string[]> = {
  romance: [
    'https://images.unsplash.com/photo-1514565131-fce0801e5785', // Manhattan night
    'https://images.unsplash.com/photo-1520004434532-668416a08753', // Rain penthouse
    'https://images.unsplash.com/photo-1501901642052-9642bf52467b', // Sunset beach
  ],
  horror: [
    'https://images.unsplash.com/photo-1478720568477-152d9b164e26', // Creepy hall
    'https://images.unsplash.com/photo-1505630285033-a0f83683a34a', // Dark woods
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23', // Haunted house
  ],
  thriller: [
    'https://images.unsplash.com/photo-1500673922987-e212871fec22', // Moody mountain
    'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3', // Space/Tech
    'https://images.unsplash.com/photo-1549492423-400259a2e574', // Luxury interior
  ],
  sad: [
    'https://images.unsplash.com/photo-1444491741275-3747c53c99b4', // Rainy street
    'https://images.unsplash.com/photo-1493238792000-8113da705763', // Grey clouds
  ],
  action: [
    'https://images.unsplash.com/photo-1469033011394-03d16f959373', // Action city
    'https://images.unsplash.com/photo-1534447677768-be436bb09401', // Fire/Energy
  ],
  mystical: [
    'https://images.unsplash.com/photo-1464802686167-b939a67e06a1', // Stars
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23', // Magic castle
  ],
  rain: [
    'https://images.unsplash.com/photo-1438449805896-28a666819a20', // Rain drops
  ],
  peaceful: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c', // Modern office
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2', // Clean hall
  ],
  auto: []
};

const MOOD_VIDEO_MAPPING: Record<BgmMood, string[]> = {
  romance: ['https://assets.mixkit.co/videos/preview/mixkit-manhattan-skyline-at-night-2570-large.mp4'],
  horror: ['https://assets.mixkit.co/videos/preview/mixkit-smoke-in-the-dark-34442-large.mp4'],
  thriller: ['https://assets.mixkit.co/videos/preview/mixkit-driving-in-a-dark-tunnel-2105-large.mp4'],
  sad: ['https://assets.mixkit.co/videos/preview/mixkit-rain-drops-on-a-window-1558-large.mp4'],
  action: ['https://assets.mixkit.co/videos/preview/mixkit-explosion-of-colors-in-water-34404-large.mp4'],
  mystical: ['https://assets.mixkit.co/videos/preview/mixkit-stars-and-galaxy-in-the-night-sky-4007-large.mp4'],
  rain: ['https://assets.mixkit.co/videos/preview/mixkit-rain-falling-on-a-green-leaf-1554-large.mp4'],
  peaceful: ['https://assets.mixkit.co/videos/preview/mixkit-potted-plants-in-a-sunny-room-1555-large.mp4'],
  auto: []
};

/**
 * Automatically generates a set of visual scenes with images/videos based on chapter text and art style.
 */
export function generateVisualScenesFromText(
  text: string, 
  durationSeconds: number,
  artStyle: VisualArtStyle = 'Cinematic'
): VisualScene[] {
  const paragraphs = text.split('\n\n').filter(p => p.trim().length > 20);
  const totalParagraphs = paragraphs.length;
  
  if (totalParagraphs === 0) return [];

  const scenes: VisualScene[] = [];
  const sceneCount = Math.min(Math.max(3, Math.floor(durationSeconds / 45)), 8);
  const interval = durationSeconds / sceneCount;

  for (let i = 0; i < sceneCount; i++) {
    const startTime = i * interval;
    const endTime = (i + 1) * interval;
    
    // Pick a paragraph representative of this time slice
    const paraIndex = Math.floor((i / sceneCount) * totalParagraphs);
    const paraText = paragraphs[paraIndex];
    
    const mood = detectMoodFromText(paraText, 'Auto');
    const stylePrompt = STYLE_KEYWORDS[artStyle];
    
    let imageUrl = '';
    if (artStyle === 'Cinematic') {
       const imagePool = MOOD_IMAGE_MAPPING[mood] || MOOD_IMAGE_MAPPING.peaceful;
       imageUrl = imagePool[Math.floor(Math.random() * imagePool.length)] + '?auto=format&fit=crop&q=80&w=1200';
    } else {
       // Use query-based Unsplash for cartoon styles (simulated)
       const keywords = SCENE_KEYWORDS[mood] || SCENE_KEYWORDS.peaceful;
       const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
       imageUrl = getUnsplashUrl(`${randomKeyword}, ${stylePrompt}`);
    }

    const videoPool = MOOD_VIDEO_MAPPING[mood] || MOOD_VIDEO_MAPPING.peaceful;
    const videoUrl = Math.random() > 0.6 ? videoPool[Math.floor(Math.random() * videoPool.length)] : undefined;

    scenes.push({
      id: `generated-scene-${i}-${Date.now()}`,
      startTime,
      endTime,
      imageUrl,
      videoUrl,
      mood,
      description: `AI Generated ${artStyle} ${mood} scene for: ${paraText.slice(0, 30)}...`,
      artStyle
    });
  }

  return scenes;
}

function formatBeatTimestamp(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

interface ParsedParagraph {
  raw: string;
  clean: string;
  speaker?: string;
  dramaScore: number;
  startChar: number;
}

const PLOT_RULES: {
  beatType: BeatEmotionType;
  emotionLabel: string;
  keywords: string[];
  titles: string[];
  baseIntensity: number;
}[] = [
  {
    beatType: 'twist',
    emotionLabel: 'Plot Twist',
    keywords: ['contract', 'secret', 'betray', 'truth', 'trap', 'revealed', 'instead', 'actually', 'lock', 'locked doors', 'blackmail', 'deal', 'ultimatum', 'रहस्य', 'षड्यंत्र', 'सौदा'],
    titles: ['Unexpected Turn', 'Hidden Truth Surfaces', 'The Turning Point'],
    baseIntensity: 84
  },
  {
    beatType: 'climax',
    emotionLabel: 'Climax',
    keywords: ['explosion', 'gun', 'sword', 'strike', 'blast', 'attack', 'fight', 'crash', 'blood', 'escape', 'fire', 'sniper', 'clash', 'विस्फोट', 'हमला', 'तलवार'],
    titles: ['High-Stakes Clash', 'Breaking Point', 'Crucial Confrontation'],
    baseIntensity: 95
  },
  {
    beatType: 'dread',
    emotionLabel: 'Suspense & Dread',
    keywords: ['ghost', 'scream', 'shadow', 'dark', 'demon', 'murder', 'killer', 'nightmare', 'crypt', 'chill', 'breathless', 'danger', 'खौफ', 'डर', 'चीख'],
    titles: ['Shadowy Threat', 'Spine-Chilling Moment', 'Creeping Dread'],
    baseIntensity: 86
  },
  {
    beatType: 'romance',
    emotionLabel: 'Intimate Spark',
    keywords: ['whisper', 'lips', 'kiss', 'desire', 'heartbeat', 'embrace', 'breath', 'gaze', 'smirk', 'blush', 'touch', 'tender', 'scent', 'प्यार', 'दिल', 'इश्क', 'निगाहें'],
    titles: ['Charged Encounter', 'Heart-Racing Spark', 'Intimate Confession'],
    baseIntensity: 76
  },
  {
    beatType: 'tension',
    emotionLabel: 'Rising Tension',
    keywords: ['refused', 'tremble', 'warning', 'owes', 'million', 'negotiate', 'stare', 'predatory', 'cold', 'suspect', 'silent', 'confront', 'deadline', 'खतरा'],
    titles: ['Stakes Escalate', 'Tense Exchange', 'Mounting Pressure'],
    baseIntensity: 70
  },
  {
    beatType: 'sorrow',
    emotionLabel: 'Emotional Weight',
    keywords: ['tears', 'crying', 'broken', 'goodbye', 'grief', 'lonely', 'pain', 'lost', 'regret', 'mourn', 'sorrow', 'आंसू', 'दर्द', 'विदाई'],
    titles: ['Heartbreak Beat', 'Quiet Vulnerability', 'Weight of Loss'],
    baseIntensity: 66
  },
  {
    beatType: 'revelation',
    emotionLabel: 'Discovery',
    keywords: ['portal', 'ancient', 'discover', 'evidence', 'clue', 'note', 'artifact', 'glow', 'magic', 'memory', 'signal', 'decoded', 'सबूत'],
    titles: ['Key Discovery', 'Clue Uncovered', 'Fateful Revelation'],
    baseIntensity: 78
  }
];

function classifyBeat(
  rawText: string,
  cleanText: string,
  mood: BgmMood,
  indexInStory: number,
  totalSelected: number,
  speaker?: string
): {
  beatType: BeatEmotionType;
  emotionLabel: string;
  title: string;
  intensity: number;
} {
  const lower = `${rawText} ${cleanText}`.toLowerCase();

  if (indexInStory === 0) {
    return {
      beatType: 'opening',
      emotionLabel: 'Scene Setup',
      title: speaker ? `${speaker} Enters` : 'Opening Atmosphere',
      intensity: 34
    };
  }

  let bestRule: typeof PLOT_RULES[number] | null = null;
  let bestHits = 0;

  for (const rule of PLOT_RULES) {
    let hits = 0;
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) hits += 1;
    }
    if (hits > bestHits) {
      bestHits = hits;
      bestRule = rule;
    }
  }

  const isFinalBeat = indexInStory === totalSelected - 1;

  if (bestRule && bestHits > 0) {
    const titleVariant = bestRule.titles[indexInStory % bestRule.titles.length];
    const speakerFirst = speaker ? speaker.split(' ')[0] : '';
    const title = isFinalBeat
      ? bestRule.beatType === 'twist' || bestRule.beatType === 'romance'
        ? `Closing Hook · ${titleVariant}`
        : `Chapter Climax · ${titleVariant}`
      : speakerFirst && !titleVariant.includes(speakerFirst) && indexInStory % 2 === 1
      ? `${speakerFirst}'s ${bestRule.beatType === 'romance' ? 'Spark' : bestRule.beatType === 'twist' ? 'Gambit' : 'Move'}`
      : titleVariant;

    return {
      beatType: bestRule.beatType,
      emotionLabel: bestRule.emotionLabel,
      title,
      intensity: Math.min(98, bestRule.baseIntensity + (isFinalBeat ? 8 : 0))
    };
  }

  // Fallback classification based on BgmMood & chapter arc position
  if (isFinalBeat) {
    return {
      beatType: mood === 'horror' ? 'dread' : mood === 'sad' ? 'sorrow' : 'climax',
      emotionLabel: mood === 'romance' ? 'Cliffhanger' : 'Chapter Peak',
      title: speaker ? `${speaker.split(' ')[0]}'s Final Moment` : 'Closing Cliffhanger',
      intensity: 90
    };
  }

  switch (mood) {
    case 'romance':
      return {
        beatType: 'romance',
        emotionLabel: 'Emotional Beat',
        title: speaker ? `Moment with ${speaker.split(' ')[0]}` : 'Tender Shift',
        intensity: 64
      };
    case 'horror':
      return {
        beatType: 'dread',
        emotionLabel: 'Eerie Shift',
        title: 'Dark Premonition',
        intensity: 74
      };
    case 'thriller':
      return {
        beatType: 'tension',
        emotionLabel: 'Suspense Beat',
        title: speaker ? `${speaker.split(' ')[0]}'s Challenge` : 'Rising Intrigue',
        intensity: 72
      };
    case 'action':
      return {
        beatType: 'climax',
        emotionLabel: 'Action Surge',
        title: 'Pulse Quickens',
        intensity: 84
      };
    case 'sad':
      return {
        beatType: 'sorrow',
        emotionLabel: 'Melancholy',
        title: 'Reflective Turn',
        intensity: 58
      };
    case 'mystical':
      return {
        beatType: 'revelation',
        emotionLabel: 'Arcane Shift',
        title: 'Unseen Forces',
        intensity: 70
      };
    default:
      return {
        beatType: 'calm',
        emotionLabel: 'Story Beat',
        title: speaker ? `${speaker.split(' ')[0]} Speaks` : 'Narrative Shift',
        intensity: 48
      };
  }
}

/**
 * Generates visual plot-event and emotional-beat timeline markers for an episode.
 */
export function generateChapterProgressBeats(
  episode: Episode,
  fallbackGenre?: Genre | string
): ChapterPlotBeat[] {
  const duration = Math.max(30, episode.durationSeconds || 180);

  if (episode.plotBeats && episode.plotBeats.length > 0) {
    return [...episode.plotBeats]
      .sort((a, b) => a.timestampSeconds - b.timestampSeconds)
      .map((beat, idx) => ({
        ...beat,
        index: idx,
        formattedTime: beat.formattedTime || formatBeatTimestamp(beat.timestampSeconds),
        percent: Math.min(96, Math.max(2, (beat.timestampSeconds / duration) * 100))
      }));
  }

  const rawBlocks = (episode.content || '')
    .split(/\n\s*\n/)
    .map(b => b.trim())
    .filter(Boolean);

  // Merge standalone speaker tag lines like "[Male: Julian]" with the following dialogue paragraph if needed
  const mergedBlocks: string[] = [];
  for (let i = 0; i < rawBlocks.length; i++) {
    const block = rawBlocks[i];
    const isStandaloneTag = /^\[(Narrator|Male(?::[^\]]+)?|Female(?::[^\]]+)?|BGM:[^\]]+|SFX:[^\]]+)\]$/i.test(block);
    if (isStandaloneTag && i + 1 < rawBlocks.length) {
      mergedBlocks.push(`${block}\n${rawBlocks[i + 1]}`);
      i += 1;
    } else {
      mergedBlocks.push(block);
    }
  }

  const parsed: ParsedParagraph[] = [];
  let totalCleanChars = 0;

  for (const raw of mergedBlocks) {
    const speakerMatch = raw.match(/\[(?:Male|Female):\s*([^\]]+)\]/i);
    const speaker = speakerMatch ? speakerMatch[1].trim() : undefined;
    const clean = raw
      .replace(/\[(?:Narrator|Male(?::[^\]]+)?|Female(?::[^\]]+)?|BGM:[^\]]+|SFX:[^\]]+|Music:[^\]]+|Mood:[^\]]+)\]/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (clean.length < 12) continue;

    let dramaScore = clean.includes('?') || clean.includes('!') ? 1 : 0;
    if (speaker) dramaScore += 1;
    const lower = `${raw} ${clean}`.toLowerCase();
    for (const rule of PLOT_RULES) {
      for (const kw of rule.keywords) {
        if (lower.includes(kw)) dramaScore += 2;
      }
    }

    parsed.push({
      raw,
      clean,
      speaker,
      dramaScore,
      startChar: totalCleanChars
    });
    totalCleanChars += clean.length;
  }

  // Fallback to visualScenes or summary if content is empty
  if (parsed.length === 0) {
    if (episode.visualScenes && episode.visualScenes.length > 0) {
      return episode.visualScenes.map((scene, idx) => {
        const ts = Math.min(duration - 5, Math.max(0, scene.startTime));
        const info = classifyBeat(scene.description, scene.description, scene.mood, idx, episode.visualScenes!.length);
        return {
          id: `beat-${episode.id}-${idx}`,
          index: idx,
          timestampSeconds: ts,
          formattedTime: formatBeatTimestamp(ts),
          percent: Math.min(94, Math.max(2, (ts / duration) * 100)),
          title: info.title,
          excerpt: scene.description,
          beatType: info.beatType,
          emotionLabel: info.emotionLabel,
          mood: scene.mood,
          intensity: info.intensity
        };
      });
    }

    return [
      {
        id: `beat-${episode.id}-0`,
        index: 0,
        timestampSeconds: 0,
        formattedTime: '0:00',
        percent: 2,
        title: 'Chapter Opening',
        excerpt: episode.summary || episode.title,
        beatType: 'opening',
        emotionLabel: 'Scene Setup',
        mood: episode.bgmMood || detectMoodFromText(episode.summary || '', fallbackGenre),
        intensity: 36
      },
      {
        id: `beat-${episode.id}-1`,
        index: 1,
        timestampSeconds: Math.round(duration * 0.45),
        formattedTime: formatBeatTimestamp(duration * 0.45),
        percent: 45,
        title: 'Turning Point',
        excerpt: episode.summary || episode.title,
        beatType: 'tension',
        emotionLabel: 'Rising Stakes',
        mood: episode.bgmMood || detectMoodFromText(episode.summary || '', fallbackGenre),
        intensity: 72
      },
      {
        id: `beat-${episode.id}-2`,
        index: 2,
        timestampSeconds: Math.round(duration * 0.82),
        formattedTime: formatBeatTimestamp(duration * 0.82),
        percent: 82,
        title: 'Chapter Climax',
        excerpt: episode.summary || episode.title,
        beatType: 'climax',
        emotionLabel: 'Peak Moment',
        mood: episode.bgmMood || detectMoodFromText(episode.summary || '', fallbackGenre),
        intensity: 90
      }
    ];
  }

  const targetCount = Math.min(parsed.length, parsed.length >= 7 ? 6 : Math.max(3, parsed.length));
  const selectedIndices: number[] = [];

  if (parsed.length <= targetCount) {
    for (let i = 0; i < parsed.length; i++) selectedIndices.push(i);
  } else {
    selectedIndices.push(0);
    const middleSlots = targetCount - 2;
    const span = (parsed.length - 2) / middleSlots;
    for (let s = 0; s < middleSlots; s++) {
      const startIdx = Math.max(1, Math.floor(1 + s * span));
      const endIdx = Math.min(parsed.length - 2, Math.floor(1 + (s + 1) * span));
      let bestIdx = startIdx;
      let bestScore = -1;
      for (let k = startIdx; k <= endIdx; k++) {
        if (!selectedIndices.includes(k) && parsed[k].dramaScore > bestScore) {
          bestScore = parsed[k].dramaScore;
          bestIdx = k;
        }
      }
      if (!selectedIndices.includes(bestIdx)) {
        selectedIndices.push(bestIdx);
      }
    }
    selectedIndices.push(parsed.length - 1);
  }

  selectedIndices.sort((a, b) => a - b);

  return selectedIndices.map((paraIdx, beatIdx) => {
    const item = parsed[paraIdx];
    const ratio = totalCleanChars > 0 ? item.startChar / totalCleanChars : beatIdx / Math.max(1, selectedIndices.length);
    // Keep final beat around 84%-90% so clicking it plays the closing sequence rather than immediate end-of-track
    const rawTs = beatIdx === 0 ? 0 : Math.min(duration * 0.9, Math.max(4, Math.round(ratio * duration)));
    const matchingScene = episode.visualScenes?.find(sc => rawTs >= sc.startTime && rawTs <= sc.endTime);
    const mood = matchingScene?.mood || detectMoodFromText(item.raw, fallbackGenre);
    const classified = classifyBeat(item.raw, item.clean, mood, beatIdx, selectedIndices.length, item.speaker);

    const excerpt = item.clean.length > 92 ? `${item.clean.slice(0, 89).trimEnd()}...` : item.clean;

    return {
      id: `beat-${episode.id}-${beatIdx}`,
      index: beatIdx,
      timestampSeconds: rawTs,
      formattedTime: formatBeatTimestamp(rawTs),
      percent: Math.min(92, Math.max(2, (rawTs / duration) * 100)),
      title: classified.title,
      excerpt,
      beatType: classified.beatType,
      emotionLabel: classified.emotionLabel,
      mood,
      speaker: item.speaker,
      intensity: classified.intensity
    };
  });
}

