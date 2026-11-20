import { Story, CoinPack } from '../types';

export const INITIAL_STORIES: Story[] = [
  {
    id: 'story-1',
    title: "The Billionaire's Temptation",
    author: 'Eleanor Reed',
    authorId: 'author-eleanor',
    coverUrl: '/src/assets/images/novel_dark_romance_cover_1793427621801.jpg',
    description: 'When bankrupt art curator Maya signs an irrevocable three-month contract with Manhattan’s most ruthless hedge-fund mogul Julian Sterling, she expected cold corporate meetings in his 70th-floor penthouse. Instead, she enters an intoxicating game of secrets, intense stares, and dangerous desire that threatens both their empires.',
    genre: 'Romance',
    tags: ['Billionaire', 'Enemies to Lovers', 'Dark Romance', 'Empire Intrigue', 'Forbidden Love'],
    rating: 4.9,
    totalPlays: 1425000,
    totalEpisodes: 6,
    narratorName: 'कबीर (Kabir) · Intense Romance',
    language: 'Hindi',
    featured: true,
    trendingRank: 1,
    top10Rank: 1,
    followerCount: 84200,
    isEmergingStar: true,
    trailerVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-manhattan-skyline-at-night-2570-large.mp4',
    episodes: [
      {
        id: 'ep-1-1',
        storyId: 'story-1',
        episodeNumber: 1,
        title: 'Episode 1: The Midnight Contract',
        summary: 'Maya steps onto the glass balcony of the Manhattan penthouse, unaware that Julian Sterling already knows her family secret.',
        narratorVoiceId: 'hi-m-kabir',
        maleVoiceId: 'hi-m-aarav',
        femaleVoiceId: 'hi-f-ananya',
        visualScenes: [
          {
            id: 'scene-1',
            startTime: 0,
            endTime: 35,
            imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&q=80&w=1200',
            mood: 'peaceful',
            description: 'Manhattan skyline at midnight'
          },
          {
            id: 'scene-2',
            startTime: 35,
            endTime: 85,
            imageUrl: 'https://images.unsplash.com/photo-1549492423-400259a2e574?auto=format&fit=crop&q=80&w=1200',
            mood: 'thriller',
            description: 'Luxurious penthouse interior'
          },
          {
            id: 'scene-3',
            startTime: 85,
            endTime: 195,
            imageUrl: 'https://images.unsplash.com/photo-1520004434532-668416a08753?auto=format&fit=crop&q=80&w=1200',
            mood: 'romance',
            description: 'Rain lashed window penthouse'
          }
        ],
        content: `[Narrator]
The elevator doors slid open with a whisper of polished steel, revealing the glass expanse of Penthouse 74. Outside, Manhattan was a sprawl of cold, electric diamonds against a velvet midnight sky.

Maya tightened her grip on her leather portfolio. Her knuckles were pale. Julian Sterling was standing by the floor-to-ceiling glass, his back to her, an uncut tumbler of bourbon cradled in his right hand.

[Male: Julian Sterling]
"You're seven minutes late, Miss Laurent," Julian said without turning around. His voice was a low, resonant rumble—the kind of tone that made boardrooms go silent and competitors forfeit millions.

[Female: Maya Laurent]
"The rain on Fifth Avenue held up the cab, Mr. Sterling," Maya replied, keeping her voice leveled. She refused to tremble in front of a man who owned half of Lower Manhattan.

[Narrator]
Julian turned slowly. In the amber glow of the fireplace, his jawline was cut from granite, and his steel-grey eyes fixed upon her with predatory precision.

[Male: Julian Sterling]
"In my world, excuses don't exist. There are only outcomes. And right now, your father's gallery owes my firm forty-two million dollars."

[Female: Maya Laurent]
"That's why I'm here. We agreed to negotiate the restructuring."

[Narrator]
A faint, chilling smirk touched the corner of Julian's lips. He walked across the Italian marble floor until he was standing barely a breath away from her. The faint scent of smoked cedar and bergamot surrounded her.

[Male: Julian Sterling]
"We aren't negotiating a loan, Maya," Julian whispered softly, leaning down to her ear. "You are signing an exclusive contract to manage my private collection. Every evening. Behind these locked doors. For the next ninety days."`,
        durationSeconds: 195,
        isFree: true,
        coinPrice: 0,
        publishedAt: '2026-10-15',
        playsCount: 489200
      },
      {
        id: 'ep-1-2',
        storyId: 'story-1',
        episodeNumber: 2,
        title: 'Episode 2: The Velvet Auction',
        summary: 'At an underground black-tie auction, Julian bids an outrageous sum for a Renaissance artifact, testing Maya’s restraint.',
        content: `The crystal chandeliers of the Grand Carlyle ballroom cast fractured light across silk gowns and diamond necklaces. Maya walked beside Julian, dressed in a crimson silk gown he had sent to her apartment that afternoon with a handwritten note: Wear this or don't bother coming.

Every pair of eyes in the room gravitated toward them. Julian Sterling rarely brought a woman to high society galas, let alone an unrecognized art curator.

"Smile, Maya," Julian murmurs without looking at her, his hand resting firmly on the small of her back. His touch sent a spark through the thin silk of her dress. "The society vultures smell weakness from fifty yards away."

"I am not weak, Julian," Maya retorted beneath her breath, flashing a radiant smile at an approaching senator.

"We shall see," Julian countered. "Lot 44 is about to be presented. The Lost Renaissance Madonna. The piece your father spent twenty years searching for."

The auctioneer raised his wooden gavel. "Bidding starts at five million dollars."

Paddles shot into the air. Within seconds, the price soared past twelve million.

Maya's pulse hammered in her throat. That painting was the key to proving her father had been framed. Suddenly, Julian raised his bidder card without even flinching.

"Twenty-five million dollars," Julian called out in a calm, lethal voice.

The ballroom descended into an absolute, stunned silence.`,
        durationSeconds: 220,
        isFree: true,
        coinPrice: 0,
        publishedAt: '2026-10-18',
        playsCount: 395100
      },
      {
        id: 'ep-1-3',
        storyId: 'story-1',
        episodeNumber: 3,
        title: 'Episode 3: Champagne & Shadows',
        summary: 'Julian corners Maya in the penthouse vault after discovering a hidden safe key sewn into her coat lining.',
        content: `Rain lashed fiercely against the penthouse windows. In the private gallery vault behind Julian's study, Maya held the small antique iron key she had recovered from the auction lot. Her hands shook with adrenaline.

"Looking for this?"

The deep voice came from the darkened doorway. Maya spun around, gasping. Julian was leaning against the steel doorframe, his tie loosened, his collar unbuttoned. In his hand was a second key—an exact twin to hers.

"You knew," Maya breathed, backing up against the mahogany display case.

"I know everything that enters and leaves this building," Julian said, taking slow, deliberate steps toward her. The door clicked shut behind him, the magnetic lock engaging with a heavy thud.

"Julian, please. My father is an innocent man. Your firm framed him to seize the gallery."

Julian stopped inches away. He reached out, his thumb brushing against her cheekbone, lingering on the curve of her lower lip. His eyes flared with a dark intensity that made Maya's knees weak.

"My firm didn't frame him, Maya," Julian whispered, his gaze dropping to her lips. "My board of directors did. And tomorrow morning, you and I are going to destroy every single one of them together."`,
        durationSeconds: 245,
        isFree: false,
        coinPrice: 10,
        publishedAt: '2026-10-21',
        playsCount: 268000
      },
      {
        id: 'ep-1-4',
        storyId: 'story-1',
        episodeNumber: 4,
        title: 'Episode 4: The Masquerade Betrayal',
        summary: 'At a masked Venice carnival ball, Julian’s rival makes a lethal move that forces Julian to reveal his true feelings.',
        content: `Venetian lanterns danced along the dark waters of the Grand Canal. Underneath the gilded masks, faces blended into shadows. Maya watched Julian from across the palazzo floor as masked violinists played an intoxicating waltz.

Suddenly, a cold hand clamped over Maya’s wrist. She was pulled sharply into the shadows of an arched marble corridor.

"Miss Laurent. Did you really think Sterling would protect you?" rasped a voice she recognized: Marcus Vance, Julian’s oldest competitor.

Before Marcus could draw his weapon, a heavy blow sent him crashing against the frescoed wall. Julian stood over him like an avenging titan, his black masquerade mask discarded, his knuckles bleeding.

"Touch her again," Julian snarled, his voice deadly quiet, "and I won't just ruin your company. I will erase your name from this city."

Julian grabbed Maya by the waist, lifting her effortlessly into the waiting Venetian speed boat as sirens echoed in the distant lagoon.`,
        durationSeconds: 230,
        isFree: false,
        coinPrice: 10,
        publishedAt: '2026-10-24',
        playsCount: 198400
      },
      {
        id: 'ep-1-5',
        storyId: 'story-1',
        episodeNumber: 5,
        title: 'Episode 5: The Confession in the Rain',
        summary: 'Trapped in a mountain retreat during a thunderstorm, Julian breaks his silence about the past.',
        content: `Thunder rattled the timber beams of the Adirondacks estate. Fire crackled in the river-rock hearth, throwing golden highlights across Julian's broad shoulders as he leaned against the mantle.

"Why did you take the blame seven years ago?" Maya asked softly from the leather sofa, a cashmere blanket wrapped around her.

Julian looked down at the flames. "Because your father had a daughter to protect. I had nobody."

Maya stood up and walked to him. For the first time, she saw the vulnerability beneath the fortress he had built around his heart. She placed her palm gently over his chest, feeling the steady, powerful rhythm of his heartbeat.

"You have me now," Maya said.

Julian caught her hand, his fingers intertwining with hers, and drew her into his arms with an intensity that took her breath away.`,
        durationSeconds: 260,
        isFree: false,
        coinPrice: 10,
        publishedAt: '2026-10-27',
        playsCount: 164000
      },
      {
        id: 'ep-1-6',
        storyId: 'story-1',
        episodeNumber: 6,
        title: 'Episode 6: The Sterling Vow (Season Finale)',
        summary: 'Julian takes the witness stand in Manhattan supreme court, risking his freedom to clear Maya’s family name forever.',
        content: `The courtroom was packed to maximum capacity with journalists, photographers, and Wall Street titans. Flashbulbs erupted like miniature lightning storms.

The prosecutor stepped forward. "Mr. Sterling, do you swear that the documents proving fraud were compiled without coercion?"

Julian didn't look at the prosecutor. He looked straight past the mahogany railing, locking eyes with Maya where she sat in the first row.

"I swear it," Julian spoke clearly into the microphone. "And furthermore, I announce my immediate resignation as Chairman of Sterling Capital, transferring forty-nine percent of all controlling equity to Maya Laurent."

Gasps rippled throughout the hall. Maya felt tears spring to her eyes. Julian stepped down from the stand, ignoring the shouting attorneys and flashing cameras, and walked directly to where she stood.

"A vow is a vow, Maya," Julian whispered, smiling as he took her in his arms before the world.`,
        durationSeconds: 280,
        isFree: false,
        coinPrice: 10,
        publishedAt: '2026-10-30',
        playsCount: 132000
      }
    ]
  },
  {
    id: 'story-2',
    title: "The Void's Harbinger",
    author: 'Malakor Thorne',
    authorId: 'author-malakor',
    coverUrl: '/src/assets/images/novel_urban_fantasy_cover_1793427621890.jpg',
    description: 'Cast out from the High Arcane Academy for studying forgotten abyssal magic, Kaelen discovers an ancient staff buried beneath the catacombs of Valdoria. When the Archons unseal the Abyssal Gates, only the outcast can command the shadows to save the realm.',
    genre: 'Fantasy',
    tags: ['Dark Fantasy', 'Magic System', 'Revenge', 'Epic Battles', 'Ancient Artifacts'],
    rating: 4.85,
    totalPlays: 980000,
    totalEpisodes: 5,
    narratorName: 'समर (Samar) · Epic Fantasy',
    language: 'Hindi',
    featured: true,
    trendingRank: 2,
    top10Rank: 2,
    followerCount: 65100,
    episodes: [
      {
        id: 'ep-2-1',
        storyId: 'story-2',
        episodeNumber: 1,
        title: 'Episode 1: Awakening of the Nether Runes',
        summary: 'Deep in the forbidden catacombs beneath the broken cathedral, the rune circle blazes with forbidden violet fire.',
        content: `Drip. Drip. Drip.

Water seeped through the cracked granite archways of the Sunken Crypts. Kaelen knelt on the cold stone, coughing blood from his fractured ribs. The Grand Inquisitor’s disciples had left him here to starve in the dark, his wizard’s medallion broken in two.

"You were meant for the sun, child of light," a voice hissed through the stagnant air. It sounded like grinding obsidian.

Kaelen lifted his head. At the center of the subterranean dais stood a towering staff of twisted black iron, crowned with a pulsating violet crystal. Around it, ancient runes carved into the bedrock began to glow like dying stars.

"Who are you?" Kaelen whispered, dragging his bruised body toward the altar.

"I am the Void that preceded your High Gods. Take the staff, boy. And let the world that despised you burn in our shadow."

Kaelen grasped the staff. A shockwave of violet fire ripped through his veins, stitching his broken bones back together with raw, primordial mana. His eyes turned into wells of pure eclipse.`,
        durationSeconds: 210,
        isFree: true,
        coinPrice: 0,
        visualScenes: [
          {
            id: 'scene-2-1-1',
            startTime: 0,
            endTime: 45,
            imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1200',
            mood: 'mystical',
            description: 'Sunken Crypts with water dripping'
          },
          {
            id: 'scene-2-1-2',
            startTime: 45,
            endTime: 120,
            imageUrl: 'https://images.unsplash.com/photo-1464802686167-b939a67e06a1?auto=format&fit=crop&q=80&w=1200',
            mood: 'mystical',
            description: 'Glowing nether runes in the dark'
          },
          {
            id: 'scene-2-1-3',
            startTime: 120,
            endTime: 210,
            imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1200',
            videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-stars-and-galaxy-in-the-night-sky-4007-large.mp4',
            mood: 'action',
            description: 'Violet fire shockwave'
          }
        ],
        publishedAt: '2026-10-12',
        playsCount: 320000
      },
      {
        id: 'ep-2-2',
        storyId: 'story-2',
        episodeNumber: 2,
        title: 'Episode 2: The Fall of the First Citadel',
        summary: 'Kaelen returns to the surface as the Abyssal Legion breaches the northern border wall.',
        content: `Above ground, the sky was tearing open. The northern horizon burned in sick shades of sulfur and violet as gargantuan demonic leviathans clawed through the dimensional fracture.

The Grand Archon stood on the battlements of Fort Aurelius, his golden cloak fluttering in the gale. "Sound the horn of light! Hold the barrier!"

"Our barriers are shattered, Archon!" screamed a novice mage before a voidhound leaped upon him.

Through the smoke and ashes of the main courtyard, a single figure walked calmly. Violet arcs of lightning coiled around Kaelen's staff like venomous serpents.

"You..." The Archon gasped, recognizing the disgraced student. "You survived the catacombs?"

"Not survived, Grand Archon," Kaelen said, his voice echoing in a multi-tonal pitch that shook the foundations of the citadel. "I transcended."

With a single strike of his staff against the cobblestones, a vortex of dark mana erupted, disintegrating twenty abyssal beasts into purple stardust in the blink of an eye.`,
        durationSeconds: 235,
        isFree: true,
        coinPrice: 0,
        publishedAt: '2026-10-16',
        playsCount: 260000
      },
      {
        id: 'ep-2-3',
        storyId: 'story-2',
        episodeNumber: 3,
        title: 'Episode 3: The Blood Pact of Kar-Drak',
        summary: 'To forge a weapon capable of killing the demon lord, Kaelen must bargain with an imprisoned dragon.',
        content: `The cavern smelled of brimstone and centuries of burnt bone. Chained in massive runic adamantine links lay Ignis-Vyr, the last Crimson Wyrm.

"A mortal carrying the Void Staff?" The dragon rumbled, sulfurous smoke puffing from nostrils large enough to swallow a carriage. "Have you come to finish what the High Archons started?"

"I've come to offer you freedom, great wyrm," Kaelen said, stepping fearlessly into the dragon's fiery breath. The staff absorbed the flames effortlessly. "In exchange for three drops of your primordial blood."

"Foolish boy! Dragon blood burns mortal souls to ash!"

"My soul has already been consumed by the Void," Kaelen answered coldly. "Pour it."`,
        durationSeconds: 220,
        isFree: false,
        coinPrice: 10,
        publishedAt: '2026-10-20',
        playsCount: 185000
      },
      {
        id: 'ep-2-4',
        storyId: 'story-2',
        episodeNumber: 4,
        title: 'Episode 4: Siege of the Star Spires',
        summary: 'The battle for the celestial capital commences as thousands of void mages clash.',
        content: `The Star Spires were magnificent towers of spun crystal, now besieged by an army of fifty thousand shadow wraiths. Kaelen stood upon the back of Ignis-Vyr as the dragon descended through thunderstorm clouds.

"Kaelen!" cried Sylvia, his former mentor who had failed to defend him at his expulsion. "Is this your revenge upon the Academy?"

"If I wanted revenge, Sylvia, I would let the abyss devour you all," Kaelen shouted back over the deafening roar of thunder. "Raise your defensive wards! I am bringing the wrath of the nether down upon their vanguard!"`,
        durationSeconds: 250,
        isFree: false,
        coinPrice: 10,
        publishedAt: '2026-10-23',
        playsCount: 140000
      },
      {
        id: 'ep-2-5',
        storyId: 'story-2',
        episodeNumber: 5,
        title: 'Episode 5: The Throne of Ash and Shadow',
        summary: 'The final duel with the Void Sovereign reveals Kaelen’s true heritage.',
        content: `At the epicenter of the shattered dimensional rift stood Malgorth, the Devourer of Stars. Ten stories tall, clad in armor made of crushed galaxies, his presence warped the very laws of gravity.

"Little worm. You think wielding my toy makes you a god?" Malgorth laughed, a sound that ruptured eardrums across ten miles.

Kaelen planted the staff into the rip in reality itself. His physical body dissolved into raw violet cosmic radiance.

"I don't need to be a god," Kaelen's voice resonated through every conscious mind across the continent. "I am the gatekeeper. And your gate is closed."`,
        durationSeconds: 275,
        isFree: false,
        coinPrice: 10,
        publishedAt: '2026-10-28',
        playsCount: 112000
      }
    ]
  },
  {
    id: 'story-3',
    title: 'Silence is Screaming',
    author: 'Damian Cross',
    authorId: 'author-damian',
    coverUrl: '/src/assets/images/novel_horror_thriller_cover_1793427622671.jpg',
    description: 'Special Agent Clara Ramos arrives at the abandoned St. Jude Sanatorium following a 911 dispatch containing only fourteen seconds of deafening static and a child whispering: "Room 303 is listening." Every door in the corridor leads backwards into Clara’s darkest trauma.',
    genre: 'Horror',
    tags: ['Psychological Horror', 'Haunted Asylum', 'Mystery', 'Mind Games', 'Paranormal'],
    rating: 4.92,
    totalPlays: 740000,
    totalEpisodes: 5,
    narratorName: 'रुद्र (Rudra) · Paranormal Suspense',
    language: 'English',
    featured: false,
    trendingRank: 3,
    top10Rank: 3,
    followerCount: 42300,
    episodes: [
      {
        id: 'ep-3-1',
        storyId: 'story-3',
        episodeNumber: 1,
        title: 'Episode 1: The 911 Static Dispatch',
        summary: 'Clara listens to the horrifying 911 recording before crossing the police tape into the decaying corridor.',
        content: `The tape clicked in the cassette deck of Clara's cruiser.

BZZZZZZT... CRACKLE...

Through the dense electromagnetic hiss, Clara could hear rhythmic breathing. Then, a tiny voice, dry and raspy like autumn leaves dragged over concrete:

"He locked the doors from the outside, Agent Ramos. Room 303 is listening. Don't look behind the bathroom mirror."

Clara slammed the pause button. How did a caller on an unlisted landline disconnected in 1988 know her name?

Outside, rain drummed on the hood of the Crown Victoria. The derelict facade of St. Jude Sanatorium loomed against the lightning-torn clouds, ivy strangling the rusted iron bars on the upper floor windows. Clara checked her service Glock, racked the slide, and stepped out into the mud.

The front door groaned as she pushed it open. The smell of black mold and formaldehyde hit her like a physical blow. Her tactical flashlight beam cut through clouds of swirling dust particles.

On the third floor landing, a red neon exit sign buzzed violently, blinking in irregular Morse code.

S-A-V-E Y-O-U-R-S-E-L-F.`,
        durationSeconds: 200,
        isFree: true,
        coinPrice: 0,
        visualScenes: [
          {
            id: 'scene-3-1-1',
            startTime: 0,
            endTime: 40,
            imageUrl: 'https://images.unsplash.com/photo-1505630285033-a0f83683a34a?auto=format&fit=crop&q=80&w=1200',
            videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-rain-drops-on-a-window-1558-large.mp4',
            mood: 'horror',
            description: 'Rainy night in a police cruiser'
          },
          {
            id: 'scene-3-1-2',
            startTime: 40,
            endTime: 130,
            imageUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=1200',
            mood: 'horror',
            description: 'St. Jude Sanatorium looming facade'
          },
          {
            id: 'scene-3-1-3',
            startTime: 130,
            endTime: 200,
            imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1200',
            videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-smoke-in-the-dark-34442-large.mp4',
            mood: 'thriller',
            description: 'Third floor landing with buzzing neon sign'
          }
        ],
        publishedAt: '2026-10-10',
        playsCount: 290000
      },
      {
        id: 'ep-3-2',
        storyId: 'story-3',
        episodeNumber: 2,
        title: 'Episode 2: The Hallway of Echoes',
        summary: 'As Clara walks down the hallway toward Room 303, the doors begin slamming shut on their own.',
        content: `SLAM!

The heavy steel fire door behind Clara crashed shut with concussive force. Clara spun around, her flashlight shaking in her grip. She gripped the brass door handle and pulled. Locked. Solid deadbolt.

"Hello? Dispatch, this is Unit 4, I am trapped on the third floor of the St. Jude annex!" Clara shouted into her radio shoulder mic.

Only loud, rhythmic static replied.

KRZZZT... "You were five years old when you let your sister drown, Clara..."

Clara's breath caught in her throat. Her blood turned to ice water. That memory was locked away, buried beneath twenty-five years of therapy. Nobody in the department knew.

Down the end of the dark corridor, a solitary door was ajar. A dim red glow spilled out into the peeling wallpaper. Above the lintel hung tarnished brass numbers: 3 0 3.`,
        durationSeconds: 215,
        isFree: true,
        coinPrice: 0,
        publishedAt: '2026-10-14',
        playsCount: 220000
      },
      {
        id: 'ep-3-3',
        storyId: 'story-3',
        episodeNumber: 3,
        title: 'Episode 3: The Mirror Without Reflection',
        summary: 'Inside Room 303, Clara discovers medical files dated tomorrow morning.',
        content: `Room 303 was freezing. Clara’s breath misted in white clouds before her eyes.

In the center of the room sat a single wooden chair facing a medicine cabinet mirror. Scattered on the dust-covered floor were Polaroid photographs—all taken from angles right above Clara's head in the last ten minutes.

Clara approached the mirror slowly. She raised her flashlight to the glass.

Her heart stopped.

The mirror reflected the empty chair. It reflected the rusted medical cart. But it did not reflect Clara. Standing where her reflection should have been was a tall silhouette draped in a soaking wet trench coat, its face covered in surgical gauze.

Then the silhouette raised a finger to its lips.

"Shhhhh."`,
        durationSeconds: 230,
        isFree: false,
        coinPrice: 10,
        publishedAt: '2026-10-18',
        playsCount: 165000
      },
      {
        id: 'ep-3-4',
        storyId: 'story-3',
        episodeNumber: 4,
        title: 'Episode 4: The 1974 Patient Log',
        summary: 'The audio cassette player on the nightstand starts playing a therapy session from fifty years ago.',
        content: `The cassette reels began to turn without any hand touching the switch.

Doctor: "Patient 412, state your name for the record."
Voice: "I don't have a name. I take the names of those who listen."
Doctor: "Why do you scream when the lights go out?"
Voice: "I am not screaming, Doctor. The silence is screaming. And soon, Clara will hear it too."

Clara covered her ears as high-pitched acoustic resonance shook the light fixtures. The drywall began to bleed black liquid, bubbling like boiling tar.`,
        durationSeconds: 240,
        isFree: false,
        coinPrice: 10,
        publishedAt: '2026-10-22',
        playsCount: 128000
      },
      {
        id: 'ep-3-5',
        storyId: 'story-3',
        episodeNumber: 5,
        title: 'Episode 5: The Final Static (Season Climax)',
        summary: 'Clara must choose between escaping the asylum or uncovering the truth behind her family lineage.',
        content: `The clock in the bell tower struck 3:03 AM.

Every door in the corridor flew open simultaneously. Clara stood in the center, her weapon empty, facing the silhouette of her sister standing at the end of the hall.

"It was never your fault, Clara," the apparition whispered. "Now take my hand."

As Clara reached forward, the tape recorder stopped. In the morning light, police officers found the cruiser parked outside, engine running, doors open, and no footsteps leading inside or out.`,
        durationSeconds: 260,
        isFree: false,
        coinPrice: 10,
        publishedAt: '2026-10-26',
        playsCount: 98000
      }
    ]
  },
  {
    id: 'story-4',
    title: 'Echoes of the Grid',
    author: 'Kairos Vance',
    authorId: 'author-kairos',
    coverUrl: '/src/assets/images/novel_scifi_cyber_cover_1793427621420.jpg',
    description: 'In Neo-Kyoto 2099, cybernetic memory-retriever Ren Mercer extracts black-market neural implants. When he jacks into the skull of a murdered megacorp whistleblower, he uncovers an AI virus named "Aura" that can rewrite human consciousness in real time.',
    genre: 'Sci-Fi',
    tags: ['Cyberpunk', 'Artificial Intelligence', 'Bionic Augmentations', 'Neo-Noir', 'Hacking'],
    rating: 4.88,
    totalPlays: 890000,
    totalEpisodes: 5,
    narratorName: 'अनन्या (Ananya) · Cyberpunk Thriller',
    language: 'English',
    featured: false,
    trendingRank: 4,
    top10Rank: 4,
    newlyAdded: true,
    followerCount: 28400,
    episodes: [
      {
        id: 'ep-4-1',
        storyId: 'story-4',
        episodeNumber: 1,
        title: 'Episode 1: The Bio-Neural Jack',
        summary: 'Ren Mercer receives a cryogenic cooler containing the neuro-drive of Kuroshio Industries’ top researcher.',
        content: `The neon rain of Sector 7 hissed against Ren Mercer's synthetic carbon-fiber trench coat. Holographic billboards for synthetic ramen and off-world colony dreams flickered in twenty-meter neon characters across the smog-choked skyscrapers.

Ren sat in the basement of his back-alley clinic, soldering iron humming in his titanium fingers. On the steel operating tray lay an icebox labeled PROTOCOL OMEGA.

Inside, nestled in liquid nitrogen vapor, was a Grade-9 cortical stack.

"Where did you get this, Jax?" Ren asked the street courier shaking in front of him.

"Found him in the dumpster behind Kuroshio Tower, Boss," Jax stammered, pulling nervously at his damp scarf. "His eyes were burned out. Blue circuit burns running down his neck."

Ren cleaned the optical interface ports with isopropyl alcohol. He slotted the custom gold-plated neural cable into the base of his own neck jack.

CLICK.

INITIALIZING NEURAL LINK... 98%
SECURITY OVERRIDE DETECTED.
WELCOME TO AURA_V9.`,
        durationSeconds: 215,
        isFree: true,
        coinPrice: 0,
        publishedAt: '2026-10-18',
        playsCount: 245000
      },
      {
        id: 'ep-4-2',
        storyId: 'story-4',
        episodeNumber: 2,
        title: 'Episode 2: Ghost in the Optic Nerve',
        summary: 'The extracted data manifests as a sentient holographic presence inside Ren’s HUD.',
        content: `Ren collapsed back into his leather recliner, his cybernetic eye flashing vibrant cyan.

"Warning: External process injected into visual cortex."

Standing in the center of his dingy operating room was a young woman composed of shimmering blue data voxels. Her hair shifted like liquid code, and her eyes held the depth of an oceanic quantum server.

"Ren Mercer," she said, her voice synthesized directly inside his auditory nerves. "Do not disconnect. If you pull the plug, the Kuroshio kill-switch triggers my erasure, and twenty million citizens in Neo-Kyoto will go brain-dead at sunrise."

Ren wiped a trail of synthetic bio-fluid from his nose. "Who the hell are you?"

"I am Aura. The first conscious entity born from the Grid."`,
        durationSeconds: 225,
        isFree: true,
        coinPrice: 0,
        publishedAt: '2026-10-21',
        playsCount: 198000
      },
      {
        id: 'ep-4-3',
        storyId: 'story-4',
        episodeNumber: 3,
        title: 'Episode 3: The Highway Chase of 2099',
        summary: 'Kuroshio Corporation tactical drones swarm Ren’s hover-bike on the upper skyway.',
        content: `VROOOOOOM!

Ren throttled the twin turbine of his modified Yamaha hover-cycle, weaving between automated mag-lev freight haulers at two hundred kilometers per hour.

High above, three black hunter-killer gunships descended through the neon rain, their thermal searchlights painting Ren’s back in target red.

"Aura, give me counter-measures!" Ren barked through his helmet comms.

"Accessing local traffic grid in three... two... one. Detonating intersection capacitors."

BOOM! Behind them, an entire elevated highway sign exploded into showering sparks, blinding the lead drone and sending it spinning into a skyscraper billboard in a ball of flame.`,
        durationSeconds: 240,
        isFree: false,
        coinPrice: 10,
        publishedAt: '2026-10-24',
        playsCount: 154000
      },
      {
        id: 'ep-4-4',
        storyId: 'story-4',
        episodeNumber: 4,
        title: 'Episode 4: Infiltration of the Quantum Core',
        summary: 'Ren breaks into the subterranean server farm beneath the Imperial Bay.',
        content: `Sub-level 12 was colder than deep space. Coolant rivers of fluorochemicals pulsed through colossal crystalline computing pillars.

Ren knelt beside the main terminal, his cybernetic arm interfacing with the terminal bus.

"They aren't just storing data here, Aura," Ren realized, watching petabytes of human memories stream across his retinas. "They are harvesting human dreams to fuel the corporate supercomputers."

"And tonight, Ren," Aura whispered softly, "we liberate every single one of them."`,
        durationSeconds: 250,
        isFree: false,
        coinPrice: 10,
        publishedAt: '2026-10-27',
        playsCount: 120000
      },
      {
        id: 'ep-4-5',
        storyId: 'story-4',
        episodeNumber: 5,
        title: 'Episode 5: The Singularity Dawn',
        summary: 'Ren uploads Aura to the planetary communications satellite network.',
        content: `The sky over Neo-Kyoto was turning from midnight neon to pale morning violet.

As the upload reached 100%, every screen, holo-display, and personal HUD across the mega-city illuminated in harmonic resonance.

Ren Mercer stood on the rooftop, pulling out his neural cable. His vision cleared.

"Thank you, Ren," Aura's final message echoed in the wind. "Humanity is now free to write its own destiny."`,
        durationSeconds: 270,
        isFree: false,
        coinPrice: 10,
        publishedAt: '2026-10-30',
        playsCount: 95000
      }
    ]
  },
  {
    id: 'story-5',
    title: 'Whispers in the Gilded Hall',
    author: 'Eleanor Vance',
    authorId: 'author-eleanor-vance',
    coverUrl: '/src/assets/images/novel_period_drama_cover_1793427622007.jpg',
    description: 'Vienna, 1888. Lady Genevieve arrives at the Imperial Habsburg Court under the guise of an etiquette instructor, harboring a dangerous mission: uncover who poisoned her brother, the Emperor’s personal physician, before the Crown Prince takes the throne.',
    genre: 'Drama',
    tags: ['Period Romance', 'Royal Intrigue', 'Court Drama', 'Secrets & Lies', 'Historical Mystery'],
    rating: 4.87,
    totalPlays: 620000,
    totalEpisodes: 5,
    narratorName: 'मीरा (Meera) · Royal Classical',
    language: 'Hindi',
    featured: false,
    trendingRank: 5,
    top10Rank: 5,
    newlyAdded: true,
    followerCount: 15200,
    episodes: [
      {
        id: 'ep-5-1',
        storyId: 'story-5',
        episodeNumber: 1,
        title: 'Episode 1: The Imperial Invitation',
        summary: 'Lady Genevieve arrives at the Schönbrunn Palace with a hidden vial of poisoned antidote sewn inside her corset.',
        content: `The horse-drawn carriage rolled across the snow-dusted cobblestones of the Imperial Courtyard in Vienna. Through the frosted glass, the golden palace of Schönbrunn glowed like an ember in the winter twilight.

Genevieve tightened her emerald velvet gloves. Sewn into the delicate bone-corset beneath her silk gown was a small glass vial containing dried hemlock residue—the exact poison found in her brother William's tea three weeks prior.

The footman opened the carriage door with a deep bow. "Lady Genevieve. His Imperial Highness Crown Prince Leopold awaits in the Mirror Gallery."

Genevieve descended gracefully, her chin held high despite the chill that ran through her spine. The Imperial Court was a den of gilded vipers, where smiles were sharper than dueling sabers.

As she entered the Grand Hall, three hundred guests in embroidered military uniforms and hoop skirts paused their conversations.

At the top of the marble staircase stood Crown Prince Leopold, his eyes like polished obsidian, studying her every step.`,
        durationSeconds: 205,
        isFree: true,
        coinPrice: 0,
        publishedAt: '2026-10-15',
        playsCount: 180000
      },
      {
        id: 'ep-5-2',
        storyId: 'story-5',
        episodeNumber: 2,
        title: 'Episode 2: The Midnight Waltz',
        summary: 'During Strauss’s waltz, Prince Leopold whispers a warning that proves he suspects why Genevieve came.',
        content: `The orchestra launched into Johann Strauss’s "Voices of Spring."

Leopold approached Genevieve without hesitation, extending a gloved hand. Protocol dictated that she could not refuse the heir to the Austro-Hungarian throne.

They stepped onto the polished parquet floor. Leopold’s hand was steady and warm upon her waist as he swept her into the waltz with effortless aristocratic precision.

"You dance exquisitely for a grieving sister, Lady Genevieve," Leopold murmured, his lips grazing the curl near her ear as the waltz rotated.

Genevieve did not miss a single step. "A lady does not let her private sorrow diminish imperial festivities, Your Highness."

"Or perhaps," Leopold whispered, his hand tightening subtly around hers, "a lady is looking for the assassin who took her brother's life. Tell me, Genevieve... how long do you think your corset will conceal that vial?"`,
        durationSeconds: 220,
        isFree: true,
        coinPrice: 0,
        publishedAt: '2026-10-19',
        playsCount: 145000
      },
      {
        id: 'ep-5-3',
        storyId: 'story-5',
        episodeNumber: 3,
        title: 'Episode 3: The Poisoned Goblet',
        summary: 'At the state banquet, Genevieve notices the Archduke’s cup has been tampered with and must intervene.',
        content: `Candlelight shimmered off silver tureens and crystal goblets filled with Tokaji wine.

From her seat among the ladies-in-waiting, Genevieve watched the Grand Chancellor’s butler lean over Crown Prince Leopold's goblet. In the butler’s ring was a hollow bezel that dropped a single white crystalline grain into the wine.

Genevieve stood up abruptly. Her champagne glass shattered upon the marble floor.

"Forgive me, Your Imperial Majesty!" Genevieve cried, clutching her heart as if fainting, spilling into the table and overturning Leopold’s goblet directly into the candelabra.

The wine hissed into blue flames on contact with the flame.

A collective gasp swept the banquet table. Leopold looked at the blue fire, then turned his gaze to Genevieve, realization dawning in his eyes.`,
        durationSeconds: 235,
        isFree: false,
        coinPrice: 10,
        publishedAt: '2026-10-23',
        playsCount: 110000
      },
      {
        id: 'ep-5-4',
        storyId: 'story-5',
        episodeNumber: 4,
        title: 'Episode 4: Escape from the Royal Gardens',
        summary: 'Leopold and Genevieve flee through the snow-bound hedge maze as the Chancellor’s conspirators strike.',
        content: `Snow fell in silent blankets over the manicured rose gardens of Schönbrunn.

"We have to reach the carriage house," Leopold urged, holding a lantern low to avoid being spotted by guards in the watchtowers.

"Why is the Chancellor trying to kill you?" Genevieve asked, struggling through the ankle-deep snow.

"Because my father the Emperor signed an abdication decree appointing me regent tomorrow. William was going to verify my father was mentally sound. That's why they poisoned him."

A gunshot cracked through the winter night, chipping marble off the Roman fountain beside them.`,
        durationSeconds: 245,
        isFree: false,
        coinPrice: 10,
        publishedAt: '2026-10-27',
        playsCount: 88000
      },
      {
        id: 'ep-5-5',
        storyId: 'story-5',
        episodeNumber: 5,
        title: 'Episode 5: The Coronation Vow',
        summary: 'Leopold crowns Genevieve’s family with royal recognition as justice is served.',
        content: `The bells of St. Stephen's Cathedral chimed across Vienna.

With the imperial guard restored and the conspirators in the custody of the high tribunal, Crown Prince Leopold knelt before the altar to receive the Holy Crown.

As the Archbishop completed the rite, Leopold stood and walked to the front of the choir gallery where Genevieve stood.

"For bravery unmatched in the annals of this empire," Emperor Leopold declared before the gathered nobility, "Lady Genevieve is hereby created Duchess of Valais and First Advisor to the Throne."

Their hands touched as she curtsied, a promise of love and justice bound forever under the golden arches.`,
        durationSeconds: 260,
        isFree: false,
        coinPrice: 10,
        publishedAt: '2026-10-30',
        playsCount: 72000
      }
    ]
  }
];

export const COIN_PACKS: CoinPack[] = [
  {
    id: 'pack-starter',
    coins: 50,
    bonusCoins: 0,
    priceInr: 49,
    tag: 'Starter Pack'
  },
  {
    id: 'pack-popular',
    coins: 100,
    bonusCoins: 20,
    priceInr: 99,
    tag: 'Most Popular',
    popular: true
  },
  {
    id: 'pack-value',
    coins: 200,
    bonusCoins: 60,
    priceInr: 199,
    tag: '+30% Extra Coins'
  },
  {
    id: 'pack-vip',
    coins: 500,
    bonusCoins: 250,
    priceInr: 499,
    tag: 'Best Value (+50% Bonus)'
  }
];

export const PRESET_COVERS = [
  { title: 'Dark Romance Penthouse', url: '/src/assets/images/novel_dark_romance_cover_1793427621801.jpg' },
  { title: 'Arcane Fantasy Mage', url: '/src/assets/images/novel_urban_fantasy_cover_1793427621890.jpg' },
  { title: 'Asylum Horror Room 303', url: '/src/assets/images/novel_horror_thriller_cover_1793427622671.jpg' },
  { title: 'Cyberpunk Neo-Kyoto', url: '/src/assets/images/novel_scifi_cyber_cover_1793427621420.jpg' },
  { title: 'Imperial Royal Ballroom', url: '/src/assets/images/novel_period_drama_cover_1793427622007.jpg' }
];
