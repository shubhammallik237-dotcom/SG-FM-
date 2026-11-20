import { BgmTrack, BgmMood, Genre, AmbientSoundscapeOption } from '../types';

export const AMBIENT_SOUNDSCAPES: AmbientSoundscapeOption[] = [
  {
    id: 'none',
    name: 'Off (Story Audio Only)',
    shortLabel: 'Off',
    description: 'Clean story voice & soundtrack without extra ambient layering.',
    badge: 'Clean',
    color: 'from-slate-700 to-slate-800'
  },
  {
    id: 'rain',
    name: 'Rain',
    shortLabel: 'Rain',
    description: 'Steady soothing rainfall against glass with soft pitter-patter texture.',
    badge: 'Cozy & Noir',
    color: 'from-cyan-500 to-blue-700'
  },
  {
    id: 'cafe',
    name: 'Cafe',
    shortLabel: 'Cafe',
    description: 'Warm coffeehouse murmur, soft room acoustics, and gentle ceramic clinks.',
    badge: 'Focus & Romance',
    color: 'from-amber-600 to-orange-800'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk City',
    shortLabel: 'Cyberpunk City',
    description: 'Neon-soaked street rain, futuristic sub-city hum, and synth skyline shimmer.',
    badge: 'Sci-Fi & Thriller',
    color: 'from-fuchsia-600 to-cyan-600'
  },
  {
    id: 'forest',
    name: 'Night Forest',
    shortLabel: 'Night Forest',
    description: 'Cool midnight breeze rustling through pines with distant crickets.',
    badge: 'Mystery & Fantasy',
    color: 'from-emerald-600 to-teal-900'
  },
  {
    id: 'fireplace',
    name: 'Fireplace',
    shortLabel: 'Fireplace',
    description: 'Crackling hearth embers and deep comforting cabin warmth.',
    badge: 'Cozy Hearth',
    color: 'from-orange-500 to-red-800'
  },
  {
    id: 'ocean',
    name: 'Ocean Waves',
    shortLabel: 'Ocean',
    description: 'Slow rolling coastal tides washing gently onto a moonlit shore.',
    badge: 'Deep Calm',
    color: 'from-sky-500 to-indigo-800'
  }
];

export const BGM_TRACKS: BgmTrack[] = [
  {
    id: 'auto',
    name: 'Auto-Matched to Story Mood',
    genre: 'Dynamic AI',
    description: 'System automatically analyzes chapter text and scene tags to select the optimal cinematic score in real time.',
    badge: '✦ AI Smart Match',
    color: 'from-amber-500 to-indigo-500'
  },
  {
    id: 'romance',
    name: 'Velvet Romance (Warm Piano & Pad)',
    genre: 'Romance & Drama',
    description: 'Sensual warm electric piano chords, intimate sub-bass, and gentle harmonic shimmer for emotional dialogue.',
    badge: 'Romantic',
    color: 'from-rose-500 to-amber-500'
  },
  {
    id: 'horror',
    name: 'Midnight Shadows (Dissonant Drone & Wind)',
    genre: 'Horror & Paranormal',
    description: 'Dark sub-bass rumble, dissonant cluster intervals, and howling spectral wind noise for psychological dread.',
    badge: 'Dark & Eerie',
    color: 'from-emerald-600 to-slate-900'
  },
  {
    id: 'thriller',
    name: 'Pulse of Suspense (Heartbeat & Clockwork)',
    genre: 'Thriller & Mystery',
    description: 'Tense 60 BPM visceral heartbeat pulse, ticking clock filter resonance, and rising anticipation drones.',
    badge: 'Heart-Pounding',
    color: 'from-amber-600 to-red-950'
  },
  {
    id: 'sad',
    name: 'Melancholy Tears (Cello Drone & Minor Pad)',
    genre: 'Poetic & Emotional',
    description: 'Mournful cello-like minor drones, weeping string pads, and sorrowful resonance for tragic confessions.',
    badge: 'Tears & Sorrow',
    color: 'from-blue-600 to-slate-800'
  },
  {
    id: 'action',
    name: 'Adrenaline Surge (Driving Pulse & Synth Arp)',
    genre: 'Action & Sci-Fi',
    description: 'Fast driving 120 BPM synthesizer bassline, rhythmic filter sweeps, and high-energy cinematic tension.',
    badge: 'High Energy',
    color: 'from-cyan-500 to-blue-600'
  },
  {
    id: 'mystical',
    name: 'Celestial Realms (Crystal Shimmer & Arcane Pad)',
    genre: 'Fantasy & Mystical',
    description: 'Glistening bell harmonics, ethereal 5th chord sweeps, and enchanted starlight ambience.',
    badge: 'Enchanted',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'rain',
    name: 'Midnight Rain & Thunder (Nature Ambiance)',
    genre: 'Atmospheric FX',
    description: 'Continuous soothing rain on window glass with occasional distant low-rumbling thunder claps.',
    badge: 'Nature FX',
    color: 'from-slate-600 to-cyan-900'
  },
  {
    id: 'peaceful',
    name: 'Quiet Hearth (Soft Warm Drone & Vinyl)',
    genre: 'Cozy & Folk',
    description: 'Warm soothing analog hum, gentle sub-frequencies, and comforting campfire-like peace.',
    badge: 'Cozy & Calm',
    color: 'from-amber-700 to-orange-950'
  }
];

/**
 * Intelligent Scene Mood & BGM Detection Algorithm
 * 1. Checks explicit writer tags e.g. [BGM: Horror], [Music: Thriller], [Mood: Romance]
 * 2. Scans text content for emotional sentiment keywords in English and Hindi
 * 3. Falls back cleanly to story Genre
 */
export function detectMoodFromText(text: string, fallbackGenre?: Genre | string): BgmMood {
  if (!text) return 'romance';

  // 1. Direct explicit tag detection
  const tagMatch = text.match(/\[(?:BGM|Music|Mood):\s*([a-zA-Z_-]+)\]/i);
  if (tagMatch) {
    const raw = tagMatch[1].toLowerCase();
    if (['romance', 'love'].includes(raw)) return 'romance';
    if (['horror', 'spooky', 'scary', 'ghost'].includes(raw)) return 'horror';
    if (['thriller', 'suspense', 'mystery', 'crime'].includes(raw)) return 'thriller';
    if (['sad', 'sorrow', 'crying', 'tragedy', 'grief'].includes(raw)) return 'sad';
    if (['action', 'fight', 'battle', 'war'].includes(raw)) return 'action';
    if (['mystical', 'magic', 'fantasy', 'celestial'].includes(raw)) return 'mystical';
    if (['rain', 'storm', 'thunder'].includes(raw)) return 'rain';
    if (['peaceful', 'calm', 'cozy'].includes(raw)) return 'peaceful';
  }

  // 2. Keyword frequency scoring
  const lower = text.toLowerCase();

  const scores: Record<BgmMood, number> = {
    auto: 0,
    romance: 0,
    horror: 0,
    thriller: 0,
    sad: 0,
    action: 0,
    mystical: 0,
    rain: 0,
    peaceful: 0
  };

  const horrorKeywords = [
    'ghost', 'scream', 'blood', 'demon', 'killer', 'terror', 'death', 'murder',
    'haunted', 'crypt', 'nightmare', 'chill', 'graveyard', 'corpse', 'skeleton',
    'चुड़ैल', 'भूत', 'खौफ', 'अंधेरा', 'चीख', 'डर', 'लाश', 'कब्र'
  ];
  for (const kw of horrorKeywords) {
    if (lower.includes(kw)) scores.horror += 2;
  }

  const romanceKeywords = [
    'love', 'lips', 'kiss', 'breath', 'touch', 'desire', 'bride', 'gaze',
    'embrace', 'blush', 'tender', 'passion', 'heartbeat', 'gorgeous', 'handsome',
    'प्यार', 'मोहब्बत', 'दिल', 'निगाहें', 'सांसें', 'बाहें', 'सनम', 'इश्क'
  ];
  for (const kw of romanceKeywords) {
    if (lower.includes(kw)) scores.romance += 2;
  }

  const thrillerKeywords = [
    'gun', 'detective', 'crime', 'secret', 'poison', 'betrayal', 'vault',
    'suspect', 'contract', 'chase', 'clock', 'titanium', 'evidence', 'investigation',
    'षड्यंत्र', 'जासूस', 'रिवाल्वर', 'रहस्य', 'पुलिस', 'खतरा', 'सौदा', 'सबूत'
  ];
  for (const kw of thrillerKeywords) {
    if (lower.includes(kw)) scores.thriller += 2;
  }

  const sadKeywords = [
    'crying', 'tears', 'grief', 'weep', 'funeral', 'goodbye', 'broken',
    'alone', 'lost', 'agony', 'sorrow', 'mourn', 'hopeless', 'pain',
    'दर्द', 'आंसू', 'विदाई', 'तन्हा', 'जुदाई', 'रोना', 'जुदा', 'मातम'
  ];
  for (const kw of sadKeywords) {
    if (lower.includes(kw)) scores.sad += 2;
  }

  const actionKeywords = [
    'fight', 'strike', 'blade', 'explosion', 'blast', 'punch', 'war',
    'combat', 'sword', 'attack', 'bullet', 'sniper', 'shield', 'clash',
    'हमला', 'तलवार', 'जंग', 'विस्फोट', 'आग', 'सिपाही', 'वार'
  ];
  for (const kw of actionKeywords) {
    if (lower.includes(kw)) scores.action += 2;
  }

  const rainKeywords = [
    'rain', 'thunder', 'storm', 'lightning', 'downpour', 'puddle', 'raindrops',
    'बारिश', 'तूफान', 'बिजली', 'बूंदें'
  ];
  for (const kw of rainKeywords) {
    if (lower.includes(kw)) scores.rain += 2;
  }

  // Find highest scoring mood
  let maxMood: BgmMood = 'romance';
  let maxScore = 0;

  for (const [mood, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      maxMood = mood as BgmMood;
    }
  }

  if (maxScore >= 4) {
    return maxMood;
  }

  // 3. Fallback to Genre
  if (fallbackGenre) {
    const genreLower = fallbackGenre.toLowerCase();
    if (genreLower.includes('romance')) return 'romance';
    if (genreLower.includes('horror')) return 'horror';
    if (genreLower.includes('thriller')) return 'thriller';
    if (genreLower.includes('drama')) return scores.sad > scores.romance ? 'sad' : 'romance';
    if (genreLower.includes('sci-fi') || genreLower.includes('scifi')) return 'action';
    if (genreLower.includes('fantasy')) return 'mystical';
  }

  return 'romance';
}
