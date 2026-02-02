
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useState, useEffect, useCallback } from 'react';
import { Token } from '../types';
import { ASSET_DATA } from '../constants';
import { useWallet } from './useWallet';

// In a real app, this would be fetched from a trusted source like Jupiter's token list API
const JUPITER_TOKEN_LIST_URL = 'https://token.jup.ag/strict';

interface TokenInfo {
  address: string;
  chainId: number;
  decimals: number;
  name: string;
  symbol: string;
  logoURI: string;
}

/**
 * A hook for managing token lists and balances.
 * In this simulation, it uses the hardcoded ASSET_DATA, but it's
 * structured to be easily replaced with a real API call.
 */
export const useTokens = () => {
  const { balances, prices } = useWallet();
  const [tokenList, setTokenList] = useState<TokenInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTokenList = useCallback(async () => {
    setIsLoading(true);
    // In a real app, you would fetch from JUPITER_TOKEN_LIST_URL
    // For this demo, we'll transform our existing ASSET_DATA
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate fetch

    const simulatedList: TokenInfo[] = (Object.keys(ASSET_DATA) as Token[]).map(token => ({
      address: ASSET_DATA[token].mint || `unknown-mint-${token}`,
      chainId: 101, // Solana Mainnet-beta
      decimals: ASSET_DATA[token].decimals || 0,
      name: ASSET_DATA[token].name,
      symbol: ASSET_DATA[token].ticker,
      logoURI: `https://example.com/logo/${token}.png`, // Placeholder
    }));
    
    setTokenList(simulatedList);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchTokenList();
  }, [fetchTokenList]);

  const getTokenBalance = (tokenSymbol: Token) => balances[tokenSymbol] || 0;
  const getTokenPrice = (tokenSymbol: Token) => prices[tokenSymbol] || 0;
  const getTokenUsdValue = (tokenSymbol: Token) => getTokenBalance(tokenSymbol) * getTokenPrice(tokenSymbol);

  return {
    tokenList,
    isLoading,
    getTokenBalance,
    getTokenPrice,
    getTokenUsdValue,
    refresh: fetchTokenList,
  };
};
