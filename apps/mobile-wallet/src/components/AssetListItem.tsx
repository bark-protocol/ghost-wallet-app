
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { Token } from '../types';
import { ASSET_DATA } from '../constants';
import { useWallet } from '../hooks/useWallet';

interface AssetListItemProps {
    token: Token;
    balance: number;
    price: number;
    totalPortfolioValue: number;
}

export const AssetListItem: React.FC<AssetListItemProps> = ({ token, balance, price, totalPortfolioValue }) => {
    const { isBalancesHidden } = useWallet();
    const asset = ASSET_DATA[token];
    if (!asset) return null;

    const usdValue = balance * price;
    const percentage = totalPortfolioValue > 0 ? (usdValue / totalPortfolioValue) * 100 : 0;

    return (
        <div className="flex items-center justify-between p-3 bg-ui-card rounded-[20px] ring-1 ring-ui-border shadow-sm active:scale-[0.98] transition-all group hover:bg-ui-card-secondary hover:ring-accent-primary/30">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center bg-ui-bg rounded-full group-hover:scale-110 transition-transform">
                    <div className="w-5 h-5">{asset.icon}</div>
                </div>
                <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-sm tracking-tight text-text-primary leading-none">{asset.name}</span>
                    <span className="text-[10px] text-text-secondary font-mono uppercase tracking-widest">
                        {isBalancesHidden ? '••••' : balance.toFixed(2)} {asset.ticker}
                    </span>
                </div>
            </div>
            <div className="text-right flex flex-col items-end">
                <div className="font-bold text-sm text-text-primary font-mono">
                    {isBalancesHidden ? '••••' : `$${usdValue.toFixed(2)}`}
                </div>
                <div className="flex items-center gap-2 mt-1">
                    {!isBalancesHidden && <span className="text-[9px] text-text-secondary font-mono">{percentage.toFixed(2)}%</span>}
                    <div className="w-10 h-1 bg-ui-card-secondary rounded-full overflow-hidden ring-1 ring-ui-border">
                        <div 
                            className="h-full bg-accent-primary rounded-full" 
                            style={{ width: `${Math.min(percentage, 100)}%` }} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
