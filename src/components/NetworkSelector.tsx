/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Globe, Server, Zap } from 'lucide-react';
import { useCluster } from '../hooks/useCluster';
import { Chain, Network, RpcProvider } from '../types';
import { useWallet } from '../hooks/useWallet';

const DropdownItem: React.FC<{ label: string; value: string; selectedValue: string; onSelect: () => void; }> = ({ label, value, selectedValue, onSelect }) => (
    <button
        onClick={onSelect}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-left hover:bg-ui-card-secondary/50 transition-colors rounded"
    >
        <span className="uppercase tracking-wider">{label}</span>
        {value === selectedValue && <Check size={14} className="text-accent-primary" />}
    </button>
);

export const NetworkSelector: React.FC = () => {
    const { chain, setChain, network, setNetwork, rpcProvider, setRpcProvider } = useCluster();
    const { walletLogEvent } = useWallet();
    const [isOpen, setIsOpen] = useState(false);

    const CHAINS: { id: Chain, label: string }[] = [{ id: 'solana', label: 'Solana' }, { id: 'sui', label: 'Sui' }];
    const NETWORKS: { id: Network, label: string }[] = [{ id: 'mainnet', label: 'Mainnet' }, { id: 'devnet', label: 'Devnet' }];
    const RPCS: { id: RpcProvider, label: string }[] = [{ id: 'default', label: 'Default' }, { id: 'helius', label: 'Helius' }];

    const currentChainLabel = CHAINS.find(c => c.id === chain)?.label;
    const currentNetworkLabel = NETWORKS.find(n => n.id === network)?.label;
    const currentRpcLabel = RPCS.find(r => r.id === rpcProvider)?.label || 'Default';

    const handleSetChain = (newChain: Chain) => {
        setChain(newChain);
        walletLogEvent('SETTINGS_CHANGE', 'MOBILE', `Chain changed to ${newChain}`, { setting: 'chain', value: newChain });
    };

    const handleSetNetwork = (newNetwork: Network) => {
        setNetwork(newNetwork);
        walletLogEvent('SETTINGS_CHANGE', 'MOBILE', `Network changed to ${newNetwork}`, { setting: 'network', value: newNetwork });
    };

    const handleSetRpcProvider = (newRpc: RpcProvider) => {
        setRpcProvider(newRpc);
        walletLogEvent('SETTINGS_CHANGE', 'MOBILE', `RPC provider changed to ${newRpc}`, { setting: 'rpc_provider', value: newRpc });
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-ui-card ring-1 ring-ui-border rounded-2xl text-left"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${network === 'mainnet' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <div className="flex flex-col">
                        <span className="text-sm font-bold capitalize text-text-primary">{currentChainLabel} {currentNetworkLabel}</span>
                        <span className="text-[10px] text-text-secondary font-mono">{currentRpcLabel} RPC</span>
                    </div>
                </div>
                <ChevronDown size={16} className={`text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full mt-2 w-full bg-ui-card ring-1 ring-ui-border rounded-2xl shadow-lg p-3 z-10 space-y-3"
                    >
                        {/* Chain Selection */}
                        <div className="p-2 bg-ui-card-secondary rounded-lg">
                             <h4 className="text-[9px] font-bold text-text-secondary px-2 pb-1 uppercase tracking-widest flex items-center gap-2"><Globe size={10}/> Chain</h4>
                            {CHAINS.map(c => <DropdownItem key={c.id} label={c.label} value={c.id} selectedValue={chain} onSelect={() => handleSetChain(c.id)} />)}
                        </div>

                        {/* Network Selection */}
                        <div className="p-2 bg-ui-card-secondary rounded-lg">
                            <h4 className="text-[9px] font-bold text-text-secondary px-2 pb-1 uppercase tracking-widest flex items-center gap-2"><Server size={10}/> Network</h4>
                            {NETWORKS.map(n => <DropdownItem key={n.id} label={n.label} value={n.id} selectedValue={network} onSelect={() => handleSetNetwork(n.id)} />)}
                        </div>

                        {/* RPC Selection */}
                        {chain === 'solana' && (
                             <div className="p-2 bg-ui-card-secondary rounded-lg">
                                <h4 className="text-[9px] font-bold text-text-secondary px-2 pb-1 uppercase tracking-widest flex items-center gap-2"><Zap size={10}/> RPC Provider</h4>
                                {RPCS.map(r => <DropdownItem key={r.id} label={r.label} value={r.id} selectedValue={rpcProvider} onSelect={() => handleSetRpcProvider(r.id)} />)}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};