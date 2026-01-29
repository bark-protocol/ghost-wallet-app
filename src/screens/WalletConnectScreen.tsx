

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { ArrowLeft, Scan, Link } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { Button } from '../common/Button';
import QRCode from 'react-qr-code';

export const WalletConnectScreen: React.FC = () => {
    const { setActiveView, activeTab } = useWallet();

    return (
        <div className="flex flex-col h-full bg-black text-white">
            <header className="flex items-center p-4 shrink-0 ring-1 ring-white/10">
                <button 
                    onClick={() => setActiveView(activeTab)} 
                    className="p-2 text-white/60 hover:text-white"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="flex-1 text-center font-bold text-sm uppercase tracking-widest">WalletConnect</h1>
                <div className="w-9" /> {/* Spacer */}
            </header>

            <main className="flex-1 p-6 flex flex-col items-center justify-center gap-8">
                <div className="w-full max-w-[200px] aspect-square bg-white p-4 rounded-2xl">
                     <QRCode value={"wc:dummy-uri"} size={256} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
                </div>
                
                <p className="text-center text-white/60 text-sm">
                    Scan the QR code from a dApp to connect your wallet.
                </p>

                <div className="w-full mt-auto space-y-4">
                    <div className="relative">
                        <input 
                            type="text"
                            placeholder="Enter connection URI"
                            className="w-full bg-[#1C1C1E] ring-1 ring-white/10 rounded-xl p-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-ghost-gold"
                        />
                        <Link size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    </div>
                    <Button variant="secondary">
                        Connect Manually
                    </Button>
                </div>
            </main>
        </div>
    );
};