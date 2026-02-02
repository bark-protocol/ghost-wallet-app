/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useCluster } from '../hooks/useCluster';
import { Token } from '../types';

interface FeeContextType {
    fees: Record<Token, number | null>;
    isLoading: boolean;
    refreshFees: () => void;
}

export const FeeContext = createContext<FeeContextType | undefined>(undefined);

// Simulates fetching network fees, which can vary.
const fetchNetworkFees = async (cluster: string): Promise<Record<Token, number>> => {
    console.log(`Fetching fees for ${cluster}...`);
    await new Promise(res => setTimeout(res, 600)); // Simulate network delay
    const baseFee = cluster === 'mainnet' ? 0.00001 : 0.000005;
    return {
        'SOL': baseFee,
        'SUI': baseFee * 10,
        'USDC': baseFee * 100, // Higher for stablecoin transfers on some networks
        'GHOST': baseFee * 5,
        'GHST': baseFee * 2,
        'GHOST_OPS': 0,
        // FIX: Added JUP and BONK properties to satisfy Record<Token, number>.
        'JUP': baseFee,
        'BONK': baseFee,
        // FIX: Added RAY property to satisfy Record<Token, number>.
        'RAY': baseFee,
    };
};

export const FeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { config } = useCluster();
    const [fees, setFees] = useState<Record<Token, number | null>>({} as any);
    const [isLoading, setIsLoading] = useState(true);

    const refreshFees = useCallback(async () => {
        setIsLoading(true);
        const fetchedFees = await fetchNetworkFees(config.name);
        setFees(fetchedFees);
        setIsLoading(false);
    }, [config.name]);

    useEffect(() => {
        refreshFees();
    }, [refreshFees]);

    return (
        <FeeContext.Provider value={{ fees, isLoading, refreshFees }}>
            {children}
        </FeeContext.Provider>
    );
};