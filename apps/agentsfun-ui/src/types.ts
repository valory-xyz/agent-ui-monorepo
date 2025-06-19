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

export type MemecoinActivity = {
  type: 'heart' | 'summon' | 'unleash' | 'collect' | 'purge';
  timestamp: number;
  postId: string | null;
  token: {
    address: `0x${string}` | null;
    nonce: number;
    symbol: string;
  };
};
