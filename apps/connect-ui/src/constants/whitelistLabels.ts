/**
 * Human-readable labels for well-known whitelisted contracts. The settings
 * API exposes only chain -> addresses; anything not mapped here falls back to
 * a truncated address. Keys are lowercase (the backend normalizes addresses
 * to lowercase).
 */

const OLAS_MARKETPLACE = {
  name: 'Olas Marketplace',
  description: 'Connects your agent to the marketplace with various services.',
};

// Mech Marketplace — addresses from mech_client/configs/mechs.json, which is
// what pearl-connect's default_whitelist() is built from.
export const WHITELIST_LABELS: Record<string, { name: string; description: string }> = {
  '0x735faab1c4ec41128c367afb5c3bac73509f70bb': OLAS_MARKETPLACE, // gnosis
  '0xf24ee42eda0fc9b33b7d41b06ee8ccd2ef7c5020': OLAS_MARKETPLACE, // base
  '0x343f2b005cf6d70ba610cd9f1f1927049414b582': OLAS_MARKETPLACE, // polygon
  '0x46c0d07f55d4f9b5eed2fc9680b5953e5fd7b461': OLAS_MARKETPLACE, // optimism
};
