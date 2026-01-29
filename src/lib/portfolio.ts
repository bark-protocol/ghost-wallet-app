
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { Token } from "../../../../types";

export interface PortfolioSummary {
    totalValueUsd: number;
    totalValueSol: number;
    assetAllocation: { token: Token; value: number; percentage: number }[];
    topMover: { token: Token; change: number };
}

export const calculatePortfolio = (
    balances: Record<Token, number>,
    prices: Record<Token, number>
): PortfolioSummary => {
    let totalValueUsd = 0;
    const allocation: { token: Token; value: number; percentage: number }[] = [];

    // 1. Calculate individual values and total
    (Object.keys(balances) as Token[]).forEach(token => {
        const balance = balances[token] || 0;
        const price = prices[token] || 0;
        const value = balance * price;
        
        if (value > 0.01) { // Filter dust
            totalValueUsd += value;
            allocation.push({ token, value, percentage: 0 });
        }
    });

    // 2. Calculate percentages
    if (totalValueUsd > 0) {
        allocation.forEach(item => {
            item.percentage = (item.value / totalValueUsd) * 100;
        });
    }

    // 3. Sort by value descending
    allocation.sort((a, b) => b.value - a.value);

    // 4. Calculate SOL equivalent
    const solPrice = prices['SOL'] || 1;
    const totalValueSol = totalValueUsd / solPrice;

    // 5. Mock Top Mover (Random for simulation, in real app would use 24h delta from API)
    const tokens = Object.keys(prices) as Token[];
    const randomToken = tokens[Math.floor(Math.random() * tokens.length)];
    
    return {
        totalValueUsd,
        totalValueSol,
        assetAllocation: allocation,
        topMover: {
            token: randomToken,
            change: (Math.random() * 10) - 4 // Random % between -4 and +6
        }
    };
};
