/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useMemo } from 'react';
import { ArrowLeft, Copy, Share2, Shield, AlertCircle, RefreshCw, Key } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import QRCode from 'react-qr-code';
import { ASSET_DATA } from '../constants';
import { Token } from '../types';
import { SIMULATED_CLIENT } from '../../../../../lib/keys';

export const ReceiveScreen: React.FC = () => {
    const { setActiveView, activeTab, prices } = useWallet();
    const mockAddress = SIMULATED_CLIENT.publicKey;
    
    const [requestAmount, setRequestAmount] = useState('');
    const [selectedToken, setSelectedToken] = useState<Token>('USDC');
    const [isUsdMode, setIsUsdMode] = useState(true);

    const qrValue = useMemo(() => {
        let url = `solana:${mockAddress}`;
        const amount = parseFloat(requestAmount);
        
        if (!isNaN(amount) && amount > 0) {
            const tokenAmount = isUsdMode 
                ? amount / (prices[selectedToken] || 1) 
                : amount;
                
            url += `?amount=${tokenAmount.toFixed(6)}`;
            
            const mint = ASSET_DATA[selectedToken]?.mint;
            if (mint && selectedToken !== 'SOL') {
                url += `&spl-token=${mint}`;
            }
            
            url += `&label=Ghost%20User`;
            url += `&message=Payment%20Request`;
        }
        
        return url;
    }, [mockAddress, requestAmount, selectedToken, isUsdMode, prices]);

    const handleCopy = () => {
        navigator.clipboard.writeText(mockAddress);
        alert("Public key copied to clipboard!");
    };

    return (
        <div className="flex flex-col h-full bg-ui-bg text-text-primary">
            <header className="flex items-center p-4 shrink-0 border-b border-ui-border">
                <button onClick={() => setActiveView(activeTab)} className="p-2 text-text-secondary hover:text-text-primary transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="flex-1 text-center font-bold text-sm uppercase tracking-widest">Receive Assets</h1>
                <div className="w-9" />
            </header>

            <main className="flex-1 p-6 flex flex-col items-center gap-6 overflow-y-auto custom-scrollbar">
                
                <div className="relative p-6 bg-white rounded-[32px] shadow-2xl ring-4 ring-accent-primary/10 group overflow-hidden w-full max-w-[280px]">
                    <div className="absolute inset-0 bg-gradient-to-tr from-accent-primary/5 to-transparent pointer-events-none" />
                    <div className="p-3 rounded-[24px] bg-white ring-1 ring-ghost-dark/5">
                        <QRCode value={qrValue} size={256} level="M" className="w-full h-auto" />
                    </div>
                    <div className="mt-4 text-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Scanning for</p>
                        <div className="flex items-center justify-center gap-2 text-black">
                            <div className="w-4 h-4">{ASSET_DATA[selectedToken]?.icon}</div>
                            <span className="font-bold text-sm">{selectedToken}</span>
                        </div>
                    </div>
                </div>

                <div className="w-full bg-ui-card border border-ui-border rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Request Amount</label>
                        <button 
                            onClick={() => setIsUsdMode(!isUsdMode)} 
                            className="flex items-center gap-1 text-[10px] font-bold text-accent-primary hover:text-accent-secondary"
                        >
                            <RefreshCw size={10} /> {isUsdMode ? 'USD' : selectedToken}
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <input 
                            type="number" 
                            value={requestAmount}
                            onChange={(e) => setRequestAmount(e.target.value)}
                            placeholder="0.00"
                            className="flex-1 bg-transparent text-2xl font-black focus:outline-none placeholder:text-text-secondary/20"
                        />
                        <select 
                            value={selectedToken}
                            onChange={(e) => setSelectedToken(e.target.value as Token)}
                            className="bg-ui-card-secondary text-text-primary text-xs font-bold py-2 px-3 rounded-xl border border-ui-border focus:outline-none"
                        >
                            {Object.keys(ASSET_DATA).filter(t => t !== 'GHOST_OPS').map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="w-full space-y-4">
                    <button 
                        onClick={handleCopy}
                        className="w-full bg-ui-card border border-ui-border rounded-2xl p-4 flex items-center justify-between group hover:border-accent-primary/30 transition-all active:scale-[0.98]"
                    >
                        <div className="text-left overflow-hidden flex items-center gap-4">
                            <div className="p-2 bg-accent-primary/10 rounded-xl text-accent-primary"><Key size={16}/></div>
                            <div>
                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Public Key</p>
                                <p className="text-xs font-mono text-text-primary truncate pr-4">{mockAddress.slice(0, 16)}...</p>
                            </div>
                        </div>
                        <div className="p-2 bg-ui-card-secondary rounded-xl text-text-secondary group-hover:text-accent-primary transition-colors">
                            <Copy size={16} />
                        </div>
                    </button>

                    <div className="flex gap-4">
                        <button className="flex-1 bg-ui-card border border-ui-border rounded-2xl p-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary hover:bg-ui-card-secondary transition-all">
                            <Share2 size={16} /> Share Link
                        </button>
                    </div>
                </div>

                <div className="flex items-start gap-2 bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                    <AlertCircle size={14} className="text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-blue-300 leading-relaxed">
                        Only send <span className="font-bold">Solana (SPL)</span> assets to this address. Sending other assets or using the wrong network (e.g. Ethereum) will result in permanent loss.
                    </p>
                </div>
            </main>
        </div>
    );
};
