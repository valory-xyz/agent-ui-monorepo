import { SelectedProtocol } from '../types';

export const TRADING_TYPE_MAP = {
  risky: 'Risky',
  balanced: 'Balanced',
} as const;

export const PROTOCOL_IMAGE_MAP: Record<SelectedProtocol, string> = {
  balancerPool: '/logos/protocols/balancer.png',
  sturdy: '/logos/protocols/sturdy.png',
  velodrome: '/logos/protocols/velodrome.png',
} as const;

export const PROTOCOLS_MAP: Record<SelectedProtocol, Record<string, string>> = {
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
} as const;
