
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Wifi, Disc } from 'lucide-react';
import { GhostIcon } from '../ui/Logo';

interface AnimatedCreditCardProps {
    provider: 'stripe' | 'moonpay';
    last4: string;
    expiry: string;
    holder: string;
}

export const AnimatedCreditCard: React.FC<AnimatedCreditCardProps> = ({ provider, last4, expiry, holder }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useTransform(y, [0, 200], [10, -10]);
    const rotateY = useTransform(x, [0, 300], [-10, 10]);

    function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
        const rect = event.currentTarget.getBoundingClientRect();
        x.set(event.clientX - rect.left);
        y.set(event.clientY - rect.top);
    }

    return (
        <motion.div
            style={{ perspective: 1000 }}
            className="w-full h-56 cursor-pointer group select-none py-2"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { x.set(150); y.set(100); }} // Reset to center
        >
            <motion.div
                style={{ rotateX, rotateY }}
                className="relative w-full h-full rounded-[24px] bg-gradient-to-br from-accent-primary to-accent-secondary shadow-2xl overflow-hidden border border-white/10"
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                {/* Holographic Glare */}
                <div 
                    className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20" 
                    style={{ mixBlendMode: 'overlay' }} 
                />
                
                {/* Noise Texture */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] z-0 mix-blend-overlay" />

                {/* Card Content */}
                <div className="relative z-10 p-6 flex flex-col justify-between h-full text-ui-bg">
                    <div className="flex justify-between items-start">
                        {/* Chip */}
                        <div className="w-11 h-8 bg-gradient-to-br from-yellow-200 to-yellow-500 rounded-lg border border-yellow-600/30 relative overflow-hidden shadow-sm">
                            <div className="absolute inset-0 border-[0.5px] border-black/10 opacity-50 rounded-lg" />
                            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black/10" />
                            <div className="absolute left-1/3 top-0 w-[1px] h-full bg-black/10" />
                            <div className="absolute right-1/3 top-0 w-[1px] h-full bg-black/10" />
                        </div>
                        
                        {/* Contactless Symbol */}
                        <div className="flex items-center gap-2">
                             <Wifi className="rotate-90 opacity-80" size={24} />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-xl font-mono tracking-widest drop-shadow-sm opacity-90">
                            <span>••••</span>
                            <span>••••</span>
                            <span>••••</span>
                            <span>{last4}</span>
                        </div>

                        <div className="flex justify-between items-end">
                            <div className="flex flex-col">
                                <span className="text-[7px] uppercase opacity-70 tracking-[0.2em] mb-1 font-bold">Card Holder</span>
                                <span className="text-xs font-black uppercase tracking-widest text-shadow-sm">{holder}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[7px] uppercase opacity-70 tracking-[0.2em] mb-1 font-bold">Expires</span>
                                <span className="text-xs font-mono font-bold">{expiry}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Branding Watermark */}
                <div className="absolute -bottom-8 -right-8 opacity-10 pointer-events-none rotate-12">
                    <GhostIcon className="w-48 h-48 text-white" />
                </div>
                
                {/* Provider Tag */}
                <div className="absolute top-6 right-6">
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-60 bg-black/20 px-2 py-1 rounded-md text-white border border-white/10">
                        {provider === 'stripe' ? 'STRIPE' : 'MOONPAY'}
                    </span>
                </div>
            </motion.div>
        </motion.div>
    );
};
