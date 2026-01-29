/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { GhostIcon, GhostWalletLogo } from '../../ui/Logo';
import { useTranslation } from '../../hooks/useTranslation';

interface GetStartedScreenProps {
  onNext: () => void;
  onImport: () => void;
}

export const GetStartedScreen: React.FC<GetStartedScreenProps> = ({ onNext, onImport }) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col h-full bg-ui-bg text-text-primary p-6 md:p-8 relative overflow-hidden justify-between">
            <div className="absolute -top-1/4 -right-1/4 w-96 h-96 bg-accent-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-1/4 -left-1/4 w-96 h-96 bg-accent-primary/5 rounded-full blur-[140px] pointer-events-none" />
            <GhostIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 text-text-primary opacity-5 z-0" />
            
            <header className="flex-shrink-0 z-10 h-8" />

            <main className="flex-1 flex flex-col justify-center items-center text-center z-10 py-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                    className="flex flex-col items-center"
                >
                    <div className="mb-10">
                        <GhostWalletLogo 
                            iconClassName="w-16 h-16"
                            textClassName="text-5xl"
                            subtextClassName="text-lg"
                            vertical={true}
                        />
                    </div>

                    <p className="text-text-secondary max-w-xs leading-relaxed px-4 font-medium text-sm">
                        {t('onboarding.subtitle')}
                    </p>
                </motion.div>
            </main>

            <footer className="flex-shrink-0 z-10 flex flex-col items-center gap-3 pb-8 md:pb-12 w-full max-w-sm mx-auto">
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.5, duration: 0.5 }} 
                    className="w-full space-y-3"
                 >
                    <button 
                        onClick={onNext}
                        className="w-full py-4 bg-accent-primary text-accent-secondary rounded-xl text-sm font-bold uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent-primary/20"
                    >
                        {t('onboarding.create_button')} <ArrowRight size={16} />
                    </button>
                    <button
                        onClick={onImport}
                        className="w-full py-3 text-text-secondary text-xs font-bold uppercase tracking-widest hover:text-text-primary transition-colors"
                    >
                        {t('onboarding.import_button')}
                    </button>
                </motion.div>
            </footer>

            {/* Version Tag */}
            <div className="absolute bottom-4 left-0 right-0 text-center opacity-30 pointer-events-none">
                <span className="text-[8px] font-mono uppercase tracking-[0.4em] text-text-secondary">Version 1.0 Demo</span>
            </div>
        </div>
    );
};