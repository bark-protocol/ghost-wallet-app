
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, X, Camera, CameraOff, AlertTriangle } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useCamera } from '../hooks/useCamera';

export const ScanScreen: React.FC = () => {
    const { setActiveView, activeTab, setPaymentRequest } = useWallet();
    const { startCamera, stopCamera, stream, error, permission } = useCamera({ autoStart: true });
    const videoRef = useRef<HTMLVideoElement>(null);

    // Attach stream to video element when available
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    // Simulate scanning a QR code after a delay (Hybrid: Real Camera + Simulated Scan)
    useEffect(() => {
        const timer = setTimeout(() => {
            // This would normally come from the QR code engine processing the video frame
            const scannedPaymentRequest = {
                total: 12.50,
                cart: [
                    { id: '1', name: 'Espresso', price: 2.5, quantity: 2, image: '☕' },
                    { id: '3', name: 'Latte', price: 3.5, quantity: 1, image: '🥛' },
                    { id: '16', name: 'Croissant', price: 4.0, quantity: 1, image: '🥐' },
                ],
                preferredMethod: 'USDC' as const
            };
            setPaymentRequest(scannedPaymentRequest);
        }, 3500); // 3.5s delay to "find" the code

        return () => clearTimeout(timer);
    }, [setPaymentRequest]);

    return (
        <div className="flex flex-col h-full bg-black text-white relative overflow-hidden">
            {/* Camera View Layer */}
            <div className="absolute inset-0 z-0 bg-black">
                {permission === 'granted' && !error ? (
                    <video 
                        ref={videoRef}
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover opacity-80"
                    />
                ) : (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white/30">
                        {error ? <CameraOff size={48} className="mb-4 text-red-500/50" /> : <div className="w-full h-full bg-gradient-to-b from-black/80 to-black/40" />}
                    </div>
                )}
            </div>
            
            {/* UI Overlay */}
            <div className="absolute inset-0 z-10 flex flex-col">
                <header className="flex items-center justify-between p-6">
                    <button 
                        onClick={() => setActiveView(activeTab)} 
                        className="p-3 text-white hover:text-white bg-black/40 rounded-full backdrop-blur-md ring-1 ring-white/10"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="font-bold text-sm uppercase tracking-widest text-white/90 bg-black/40 px-4 py-2 rounded-full backdrop-blur-md ring-1 ring-white/10">Scan to Pay</h1>
                    <div className="w-11" /> {/* Spacer */}
                </header>
                
                <main className="flex-1 flex flex-col items-center justify-center relative p-6">
                    {/* Darkened overlay except for viewfinder */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] mask-viewfinder" style={{ clipPath: 'polygon(0% 0%, 0% 100%, 25% 100%, 25% 25%, 75% 25%, 75% 75%, 25% 75%, 25% 100%, 100% 100%, 100% 0%)' }}></div>
                    </div>

                    <div className="w-[280px] h-[280px] relative z-20 flex items-center justify-center">
                        {/* Viewfinder Frame */}
                        <div className="absolute top-0 left-0 w-10 h-10 border-l-4 border-t-4 border-ghost-gold rounded-tl-2xl shadow-[0_0_15px_rgba(197,168,128,0.5)]" />
                        <div className="absolute top-0 right-0 w-10 h-10 border-r-4 border-t-4 border-ghost-gold rounded-tr-2xl shadow-[0_0_15px_rgba(197,168,128,0.5)]" />
                        <div className="absolute bottom-0 left-0 w-10 h-10 border-l-4 border-b-4 border-ghost-gold rounded-bl-2xl shadow-[0_0_15px_rgba(197,168,128,0.5)]" />
                        <div className="absolute bottom-0 right-0 w-10 h-10 border-r-4 border-b-4 border-ghost-gold rounded-br-2xl shadow-[0_0_15px_rgba(197,168,128,0.5)]" />
                        
                        {/* Scan Laser Animation */}
                        <div className="absolute inset-4 overflow-hidden rounded-xl">
                            <motion.div 
                                className="absolute left-0 right-0 h-[2px] bg-red-500 shadow-[0_0_20px_4px_rgba(239,68,68,0.6)] z-20"
                                animate={{ top: ['0%', '100%', '0%'] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                            />
                            {/* Grid Overlay */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20" />
                        </div>
                    </div>
                    
                    {error ? (
                        <div className="mt-12 flex items-center gap-2 px-4 py-3 bg-red-500/20 backdrop-blur-md rounded-xl border border-red-500/30">
                            <AlertTriangle size={16} className="text-red-400" />
                            <span className="text-xs font-bold text-red-200">Camera Access Denied</span>
                        </div>
                    ) : (
                        <p className="mt-12 text-white/80 text-xs font-bold uppercase tracking-widest z-10 text-center bg-black/60 px-6 py-3 rounded-full backdrop-blur-md ring-1 ring-white/10">
                            Align QR code within frame
                        </p>
                    )}
                </main>
                
                <footer className="p-8 z-20 flex justify-center">
                    <button 
                        onClick={() => setActiveView(activeTab)} 
                        className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md ring-1 ring-white/20 hover:bg-white/20 transition-all shadow-xl"
                    >
                        <X size={24} />
                    </button>
                </footer>
            </div>
        </div>
    );
};
