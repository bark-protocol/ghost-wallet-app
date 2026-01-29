
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { WalletTheme } from '../types';
import { useWallet } from '../hooks/useWallet';

const THEMES: { id: WalletTheme; name: string; colors: string[] }[] = [
    { id: 'oled', name: 'OLED', colors: ['bg-[#000000]', 'bg-[#121212]', 'bg-[#C5A880]'] },
    { id: 'light', name: 'Light', colors: ['bg-[#F0F2F5]', 'bg-[#FFFFFF]', 'bg-[#a38664]'] },
    { id: 'carbon', name: 'Carbon', colors: ['bg-[#0c0c0c]', 'bg-[#1f1f1f]', 'bg-[#f97316]'] },
    { id: 'sunlight', name: 'Sunlight', colors: ['bg-[#fffbeb]', 'bg-[#ffffff]', 'bg-[#eab308]'] },
    { id: 'ghost', name: 'Ghost', colors: ['bg-[#f8f9fa]', 'bg-[#e9ecef]', 'bg-[#343a40]'] },
    { id: 'styled', name: 'Styled', colors: ['bg-[#2A1B3D]', 'bg-[#44318D]', 'bg-[#D83F87]'] },
    { id: 'slate', name: 'Slate', colors: ['bg-[#1c2532]', 'bg-[#253141]', 'bg-[#63B3ED]'] },
    { id: 'moonshine', name: 'Moonshine', colors: ['bg-[#1a1928]', 'bg-[#2a2842]', 'bg-[#a899ff]'] },
    { id: 'nebula', name: 'Nebula', colors: ['bg-[#15171c]', 'bg-[#20232b]', 'bg-[#a691e6]'] },
    { id: 'tidal', name: 'Tidal', colors: ['bg-[#0f1e1e]', 'bg-[#1f2929]', 'bg-[#00e6a4]'] },
];

export const ThemeSelector: React.FC = () => {
    const { theme, setTheme } = useTheme();
    const { walletLogEvent } = useWallet();

    const handleSetTheme = (newThemeId: WalletTheme) => {
        setTheme(newThemeId);
        const themeName = THEMES.find(t => t.id === newThemeId)?.name || newThemeId;
        walletLogEvent('SETTINGS_CHANGE', 'MOBILE', `Wallet theme changed to ${themeName}`, { setting: 'theme', value: newThemeId });
    };

    return (
        <div className="bg-ui-card ring-1 ring-ui-border rounded-2xl p-3">
            <div className="grid grid-cols-4 gap-2">
                {THEMES.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => handleSetTheme(t.id)}
                        className="flex flex-col items-center justify-center gap-1.5 relative group bg-ui-card-secondary p-1.5 rounded-xl aspect-square ring-2 ring-transparent hover:ring-accent-primary/50 transition-colors"
                    >
                        <div className={`w-full flex-1 rounded-lg flex items-center justify-center p-0.5 transition-all ring-1 ${theme === t.id ? 'ring-accent-primary' : 'ring-ui-border'}`}>
                             <div className="w-full h-full rounded-md flex items-center justify-center overflow-hidden relative">
                                <div className={`absolute w-full h-full ${t.colors[0]}`} />
                                <div className={`absolute w-1/2 h-1/2 rounded-full ${t.colors[1]}`} />
                                <div className={`absolute w-1/4 h-1/4 rounded-full ${t.colors[2]}`} />
                             </div>
                        </div>
                        <AnimatePresence>
                        {theme === t.id && (
                            <motion.div
                                layoutId="theme-check"
                                className="absolute top-1 right-1 w-3.5 h-3.5 bg-accent-primary rounded-full flex items-center justify-center ring-2 ring-ui-bg z-10"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                            >
                                <Check size={8} className="text-accent-secondary" />
                            </motion.div>
                        )}
                        </AnimatePresence>
                        <span className={`text-[7px] font-bold uppercase tracking-wider ${theme === t.id ? 'text-text-primary' : 'text-text-secondary'}`}>
                            {t.name}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};
