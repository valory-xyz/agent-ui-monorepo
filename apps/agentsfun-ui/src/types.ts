export type AgentInfoResponse = {
  address: `0x${string}`;
  name: string;
  personaDescription: string;
  username: string;
};

export type XActivity = {
  media: string[] | null;
  postId: string;
  text: string;
  timestamp: number;
  type: 'post';
};

export type MemecoinActivityAction = 'heart' | 'summon' | 'unleash' | 'collect' | 'purge';

export type MemecoinActivity = {
  type: MemecoinActivityAction;
  timestamp: number;
  postId: string | null;
  token: {
    address: `0x${string}` | null;
    nonce: number;
    symbol: string;
  };
};

export type GeneratedMedia = {
  path: string;
  postId: string;
  type: 'image' | 'video';
};

export type ChatResponse = {
  reasoning: string;
};

export type Features = {
  isChatEnabled: boolean;
};

export type PerformanceSummary = {
  timestamp: number;
  metrics: {
    name: 'Weekly Impressions' | 'Weekly Likes';
    is_primary: boolean;
    value: string;
    description: string;
  }[];
  agent_behavior: string;
};
