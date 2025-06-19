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

export type Activity = {
  type: 'heart' | 'summon' | 'unleash' | 'collect' | 'purge';
  timestamp: number;
  postId: number | null;
  token: {
    nonce: number;
    address: `0x${string}` | null;
    symbol: string;
  };
};
