import { useQuery } from '@tanstack/react-query';

import { COINGECKO_OLAS_IN_USD_PRICE_URL } from '../constants/urls';

const OLAS_ADDRESS = '0xce11e14225575945b8e6dc0d4f2dd4c570f79d9f';

type CoingeckoResponse = {
  [OLAS_ADDRESS]: { usd: number };
};

/**
 *
 * @returns Price in USD for 1 OLAS in wei representation
 */
export const useOlasInUsdPrice = () => {
  const { data, isLoading, isError } = useQuery<bigint | null>({
    queryKey: ['olasInUsd'],
    queryFn: async () => {
      const response = await fetch(COINGECKO_OLAS_IN_USD_PRICE_URL);
      if (!response.ok) throw new Error('Failed to fetch OLAS price');

      const result = await response.json();
      if (result) {
        const priceInEth = (result as CoingeckoResponse)[OLAS_ADDRESS]?.usd || 0;
        return BigInt(Math.floor(Number(priceInEth) * 1e18));
      }
      return null;
    },
  });

  return {
    data,
    isLoading,
    isError,
  };
};
