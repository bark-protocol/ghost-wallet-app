
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { Token } from "../../../../types";

export interface ChartPoint {
    time: number;
    value: number;
}

/**
 * Generates a realistic-looking random walk price history for a token.
 * Used for sparklines and detail charts in the simulation.
 */
export const generateMockHistory = (
    basePrice: number, 
    points: number = 24, 
    volatility: number = 0.05
): ChartPoint[] => {
    const history: ChartPoint[] = [];
    let currentPrice = basePrice;
    const now = Date.now();
    const interval = 3600000; // 1 hour

    // Generate backwards from now
    for (let i = points - 1; i >= 0; i--) {
        history.push({
            time: now - (i * interval),
            value: currentPrice
        });
        
        // Random walk
        const change = currentPrice * (Math.random() - 0.5) * volatility;
        currentPrice += change;
    }

    // Since we generated backwards, reverse to get chronological order
    // But actually, the logic above pushes [now - 23h, ..., now], so it's already sorted by time ascending if we pushed correct times.
    // The loop: i=23 (time = now - 23h), i=0 (time = now).
    // However, we updated `currentPrice` for the *next* point (which is actually the *previous* point in time if we are walking backwards).
    // To make the graph end at `basePrice`, we should walk *backwards* from `basePrice`.
    
    const correctedHistory: ChartPoint[] = [];
    let priceCursor = basePrice;
    
    // Point 0 is NOW. Point 1 is 1h ago.
    for (let i = 0; i < points; i++) {
        correctedHistory.unshift({
            time: now - (i * interval),
            value: priceCursor
        });
        const change = priceCursor * (Math.random() - 0.5) * volatility;
        priceCursor -= change; // Reverse the change to go back in time
    }

    return correctedHistory;
};

export const calculateTrend = (history: ChartPoint[]): number => {
    if (history.length < 2) return 0;
    const start = history[0].value;
    const end = history[history.length - 1].value;
    return ((end - start) / start) * 100;
};

export const getChartColor = (trend: number, theme: 'light' | 'dark'): string => {
    if (trend >= 0) return '#22c55e'; // Green
    return '#ef4444'; // Red
};
