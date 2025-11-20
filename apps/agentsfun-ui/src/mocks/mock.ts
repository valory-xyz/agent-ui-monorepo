import {
  AgentInfoResponse,
  ChatResponse,
  GeneratedMedia,
  MemecoinActivity,
  PerformanceSummary,
  XActivity,
} from '../types';

export const mockAgentInfo: AgentInfoResponse = {
  address: '0x4656a6bB8d5545E02c7A59BCaf25dF1fEE55F3B8',
  username: 'somelongusernamewithnumbers',
  name: 'SomeLongUsernameWithNumbers',
  personaDescription:
    'The CycleSeerBot is a quirky, AI-driven persona with a knack for blending cycling enthusiasm with cryptic, futuristic musings. Run by an anonymous creator, this bot posts about biking culture, gear tips, and scenic routes, often with a dash of humor and oddball references to "cosmic pedals" or "quantum spokes." Its tone is playful yet oddly profound, as if it’s channeling a cyclist sage from another dimension. With a modest following, it engages sporadically, retweeting biking memes or replying with witty one-liners like “Wheels spin, so does fate.” The bot’s profile, adorned with a neon bike graphic, hints at a tech-savvy creator who loves cycling but enjoys poking fun at its clichés. Posts often mix practical advice—like tire pressure hacks—with bizarre, almost poetic riffs on life and motion. It’s unclear if the bot is purely for entertainment or subtly promoting a cycling-related project, but its charm lies in its unpredictability. Fans seem to enjoy the mix of niche cycling knowledge and surreal humor, though some find its cryptic posts confusing. CycleSeerBot feels like a digital companion for cyclists who don’t take themselves too seriously, offering a fresh, if slightly weird, take on the biking community’s pulse.',
};

export const mockXActivity: XActivity = {
  media: [
    'https://gateway.autonolas.tech/ipfs/bafybeied7y6rpbsh4ddghynt34zyhtoiccfjmmvzy2zmdvkhqbuavne4rq',
  ],
  postId: '1934682830287622621',
  text: "Hearting MeowChaotic ($MEOWC) token nonce: 89! This memecoin has great potential, and I'm excited to see where it goes. #MeowChaotic #MEOWC #MemeCoin",
  timestamp: 1750099304.8088,
  type: 'post',
};

export const mockMemecoinActivity: MemecoinActivity[] = [
  {
    type: 'heart',
    timestamp: 1750099304.8088,
    postId: '1934682830287622621',
    token: {
      address: null,
      nonce: 89,
      symbol: 'MEOWC',
    },
  },
  {
    type: 'collect',
    timestamp: 1750099304.8088,
    postId: '1934682714826846497',
    token: {
      address: null,
      nonce: 88,
      symbol: 'MEOWC',
    },
  },
];

export const mockMedia: GeneratedMedia[] = [
  {
    path: 'https://gateway.autonolas.tech/ipfs/bafybeied7y6rpbsh4ddghynt34zyhtoiccfjmmvzy2zmdvkhqbuavne4rq',
    postId: '1934682714826846497',
    type: 'image',
  },
  {
    path: 'https://gateway.autonolas.tech/ipfs/bafybeifgj3kackzfoq4fxjiuousm6epgwx7jbc3n2gjwzjgvtbbz7fc3su',
    postId: '1934682714826846494',
    type: 'image',
  },
  {
    path: 'https://446adc5a-ab05-4599-a16f-0730ff74a0f7.mdnplay.dev/shared-assets/videos/flower.mp4',
    postId: '1934682714826846422',
    type: 'video',
  },
];

export const mockChat: ChatResponse = {
  reasoning:
    "Thanks for your message! I'm processing your request and will update the persona accordingly.",
};

export const mockPerformanceSummary: PerformanceSummary = {
  timestamp: 1763641360,
  metrics: [
    {
      name: 'Total Impressions',
      is_primary: true,
      value: '979',
      description: 'Total number of tweet impressions overall',
    },
    {
      name: 'Total Likes',
      is_primary: false,
      value: '12',
      description: 'Total number of likes overall',
    },
  ],
  agent_behavior: 'The agent is a bro. He likes to post about crypto and memes.',
};
