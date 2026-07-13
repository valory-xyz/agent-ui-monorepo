/**
 * Human-readable labels for well-known whitelisted contracts. The settings
 * API exposes only chain -> addresses; anything not mapped here falls back to
 * a truncated address. Keys are lowercase (the backend normalizes addresses
 * to lowercase in Settings.from_raw).
 */
export const WHITELIST_LABELS: Record<string, { name: string; description: string }> = {
  // Mech Marketplace (Gnosis)
  '0x4554fe75c1f5576c1d7f765b2a036c199adae329': {
    name: 'Olas Marketplace',
    description: 'Connects your agent to the marketplace with various services.',
  },
};
