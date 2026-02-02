/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { createContext, useState } from 'react';
import { Chain, Network, RpcProvider } from '../types';
import { mainnetConfig, type ClusterConfig } from '../clusters/mainnet';
import { devnetConfig } from '../clusters/devnet';

interface ClusterContextType {
    chain: Chain;
    setChain: (chain: Chain) => void;
    network: Network;
    setNetwork: (network: Network) => void;
    rpcProvider: RpcProvider;
    setRpcProvider: (rpc: RpcProvider) => void;
    config: ClusterConfig;
    availableChains: { id: Chain; label: string }[];
}

export const ClusterContext = createContext<ClusterContextType | undefined>(undefined);

export const ClusterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [chain, setChain] = useState<Chain>('solana');
    const [network, setNetwork] = useState<Network>('devnet');
    const [rpcProvider, setRpcProvider] = useState<RpcProvider>('default');

    const config = network === 'mainnet' ? mainnetConfig : devnetConfig;

    const availableChains: { id: Chain; label: string }[] = [
        { id: 'solana', label: 'Solana' },
        { id: 'sui', label: 'Sui' },
        { id: 'base', label: 'Base' },
        { id: 'ethereum', label: 'Ethereum' }
    ];

    const value = {
        chain,
        setChain,
        network,
        setNetwork,
        rpcProvider,
        setRpcProvider,
        config,
        availableChains
    };

    return (
        <ClusterContext.Provider value={value}>
            {children}
        </ClusterContext.Provider>
    );
};
