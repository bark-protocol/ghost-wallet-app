/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { ASSET_DATA } from '../../../../constants';
import { Token } from '../../../../types';

export interface TokenMetadata {
    symbol: Token;
    name: string;
    decimals: number;
    mint: string;
    icon?: React.ReactNode;
    color?: string;
}

export const getTokenMetadata = (token: string): TokenMetadata | null => {
    // Check local registry first
    const asset = ASSET_DATA[token as Token];
    if (asset) {
        return {
            symbol: asset.ticker as Token,
            name: asset.name,
            decimals: asset.decimals || 9,
            mint: asset.mint || '',
            icon: asset.icon,
            color: asset.color
        };
    }
    return null;
};

export const formatTokenAmount = (amount: number, token: Token): string => {
    const meta = getTokenMetadata(token);
    const decimals = meta?.decimals || 2;
    
    // Smart formatting: show more decimals for small amounts
    const fractionDigits = amount < 1 ? Math.min(decimals, 6) : 2;
    
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    }).format(amount);
};

export const formatUsdValue = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value);
};

export const isNativeToken = (token: Token): boolean => {
    return token === 'SOL' || token === 'SUI';
};