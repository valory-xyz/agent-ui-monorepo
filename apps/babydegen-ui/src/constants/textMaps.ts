import { SelectedProtocol } from '../types';

export const TRADING_TYPE_MAP = {
  risky: 'Risky',
  balanced: 'Balanced',
} as const;

/**
 * `velodrome` and `aerodrome` are legacy positions opened before the two DEXes
 * merged into Aero (2026-10-21); `aero` is a position in the merged protocol.
 */
export const PROTOCOL_IMAGE_MAP: Record<SelectedProtocol, string> = {
  balancerPool: '/logos/protocols/balancer.png',
  sturdy: '/logos/protocols/sturdy.png',
  velodrome: '/logos/protocols/velodrome.png',
  uniswapV3: '/logos/protocols/uniswapV3.png',
  aerodrome: '/logos/protocols/aerodrome.png',
  aero: '/logos/protocols/aero.png',
} as const;

export const PROTOCOLS_MAP: Record<SelectedProtocol, Record<'name' | 'logo', string>> = {
  balancerPool: {
    name: 'Balancer',
    logo: '/logos/protocols/balancer.png',
  },
  sturdy: {
    name: 'Sturdy',
    logo: '/logos/protocols/sturdy.png',
  },
  velodrome: {
    name: 'Velodrome',
    logo: '/logos/protocols/velodrome.png',
  },
  uniswapV3: {
    name: 'Uniswap V3',
    logo: '/logos/protocols/uniswapV3.png',
  },
  aerodrome: {
    name: 'Aerodrome',
    logo: '/logos/protocols/aerodrome.png',
  },
  aero: {
    name: 'Aero',
    logo: '/logos/protocols/aero.png',
  },
} as const;
