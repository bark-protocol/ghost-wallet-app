
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { ArrowLeft, Copy, Share2, Info, Check, ChevronDown } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import QRCode from 'react-qr-code';
import { ASSET_DATA } from '../constants';
import { Token } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export const DepositScreen: React.FC = () => {
    const { setActiveView, activeTab } = useWallet();
    const userAddress = "GHOST7v1...9xP2"; // Simulated user address
    const [selectedToken, setSelectedToken] = useState<Token>('SOL');
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(userAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Deposit Address',
                text: `Deposit ${selectedToken} to my Ghost Wallet: ${userAddress}`,
                url: `solana:${userAddress}`
            }).catch(console.error);
        } else {
            // Fallback
            handleCopy();
        }
    };

    const availableTokens = (Object.keys(ASSET_DATA) as Token[]).filter(t => t !== 'GHOST_OPS');

    return (
        <div className="flex flex-col h-full bg-ui-bg text-text-primary">
            <header className="flex items-center p-4 shrink-0 border-b border-ui-border">
                <button onClick={() => setActiveView(activeTab)} className="p-2 text-text-secondary hover:text-text-primary transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="flex-1 text-center font-bold text-sm uppercase tracking-widest">Deposit Assets</h1>
                <div className="w-9" />
            </header>

            <main className="flex-1 p-6 flex flex-col items-center gap-6 overflow-y-auto custom-scrollbar">
                
                {/* Token Selector */}
                <div className="w-full relative z-30">
                    <button 
                        onClick={() => setIsSelectorOpen(!isSelectorOpen)}
                        className="w-full flex items-center justify-between p-4 bg-ui-card ring-1 ring-ui-border rounded-2xl hover:bg-ui-card-secondary transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex items-center justify-center bg-ui-bg rounded-full ring-1 ring-ui-border group-hover:scale-105 transition-transform">
                                <div className="w-6 h-6">{ASSET_DATA[selectedToken]?.icon}</div>
                            </div>
                            <div className="text-left">
                                <span className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider">Asset</span>
                                <span className="block text-sm font-black uppercase text-text-primary">{ASSET_DATA[selectedToken]?.name}</span>
                            </div>
                        </div>
                        <ChevronDown size={16} className={`text-text-secondary transition-transform ${isSelectorOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isSelectorOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-ui-card/95 backdrop-blur-xl ring-1 ring-ui-border rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar z-40"
                            >
                                {availableTokens.map(token => (
                                    <button
                                        key={token}
                                        onClick={() => { setSelectedToken(token); setIsSelectorOpen(false); }}
                                        className="w-full flex items-center justify-between p-3 hover:bg-ui-card-secondary border-b border-ui-border last:border-0 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6">{ASSET_DATA[token]?.icon}</div>
                                            <span className="text-xs font-bold text-text-primary">{token}</span>
                                        </div>
                                        {selectedToken === token && <Check size={14} className="text-accent-primary" />}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* QR Card */}
                <div className="relative p-6 bg-white rounded-[32px] shadow-2xl ring-4 ring-accent-primary/10 group w-full max-w-[280px]">
                    <div className="absolute inset-0 bg-gradient-to-tr from-accent-primary/5 to-transparent pointer-events-none" />
                    <div className="p-4 rounded-[24px] bg-white ring-1 ring-black/5">
                        <QRCode 
                            value={`solana:${userAddress}?spl-token=${ASSET_DATA[selectedToken]?.mint}`}
                            size={256}
                            level="M"
                            className="w-full h-auto"
                        />
                    </div>
                    <div className="mt-4 text-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Network</p>
                        <div className="flex items-center justify-center gap-1.5 text-black">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="font-bold text-xs">Solana Mainnet</span>
                        </div>
                    </div>
                </div>

                {/* Address & Actions */}
                <div className="w-full space-y-3">
                    <div className="bg-ui-card border border-ui-border rounded-2xl p-1 pr-2 flex items-center justify-between">
                        <div className="flex-1 p-3 overflow-hidden">
                            <p className="text-[9px] font-bold text-text-secondary uppercase tracking-widest mb-0.5">Wallet Address</p>
                            <p className="text-xs font-mono text-text-primary truncate">{userAddress}</p>
                        </div>
                        <button 
                            onClick={handleCopy}
                            className="p-2.5 bg-ui-card-secondary hover:bg-accent-primary/10 hover:text-accent-primary rounded-xl text-text-secondary transition-colors"
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                {copied ? (
                                    <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                        <Check size={18} />
                                    </motion.div>
                                ) : (
                                    <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                        <Copy size={18} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    </div>

                    <button 
                        onClick={handleShare}
                        className="w-full py-4 bg-accent-primary text-accent-secondary rounded-xl text-sm font-bold uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent-primary/20"
                    >
                        <Share2 size={16} /> Share Address
                    </button>
                </div>

                {/* Warning */}
                <div className="flex items-start gap-3 p-4 bg-blue-500/5 ring-1 ring-blue-500/20 rounded-2xl w-full mt-auto">
                    <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-blue-300/80 leading-relaxed">
                        Only send <strong>{selectedToken} (SPL)</strong> assets to this address. Sending other assets or using the wrong network may result in permanent loss.
                    </p>
                </div>
            </main>
        </div>
    );
};
