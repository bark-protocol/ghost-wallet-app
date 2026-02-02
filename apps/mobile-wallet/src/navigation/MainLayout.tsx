
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useWallet } from '../hooks/useWallet';
import { Header } from '../ui/Header';
import { BottomNavBar } from '../ui/BottomNavBar';
import { HomeScreen } from '../screens/HomeScreen';
import { DeFiScreen } from '../screens/DeFiScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { WalletTab } from '../types';
import { useTheme } from '../context/ThemeContext';

const screens: Record<WalletTab, React.ReactNode> = {
    home: <HomeScreen />,
    defi: <DeFiScreen />,
    transactions: <TransactionsScreen />,
    settings: <SettingsScreen />,
};

export const MainLayout: React.FC = () => {
    const { activeTab, isNavVisible } = useWallet();
    const { theme } = useTheme();

    return (
        <div className="flex flex-col h-full bg-ui-bg relative overflow-hidden">
            {/* Background Ambient Glows */}
            {(theme === 'moonshine' || theme === 'nebula') && (
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                     <div className="absolute -top-1/4 left-1/4 w-96 h-96 bg-accent-primary/5 rounded-full blur-[120px]" />
                     <div className="absolute -bottom-1/4 right-1/4 w-96 h-96 bg-accent-primary/10 rounded-full blur-[140px]" />
                </div>
            )}
            
            <Header />

            {/* Content Area - Added pb-24 to prevent content occlusion by floating nav */}
            <main className="flex-1 overflow-hidden min-h-0 relative z-10 pb-24">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full h-full"
                    >
                        {screens[activeTab]}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Floating Navigation Bar */}
            <AnimatePresence>
                {isNavVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="absolute bottom-0 left-0 right-0 z-50 pointer-events-none"
                    >
                        <BottomNavBar />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
