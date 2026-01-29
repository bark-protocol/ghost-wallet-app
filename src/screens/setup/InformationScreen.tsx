/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Shield, Loader2, CheckCircle, Scale } from 'lucide-react';

// Placeholder for a function that would check for the Seeker Genesis Token
async function detectSeekerToken(userAddress: string): Promise<boolean> {
  console.log(`Simulating Seeker Genesis Token check for address: ${userAddress}`);
  await new Promise(resolve => setTimeout(resolve, 2000));
  return Math.random() > 0.7; // 30% chance of "finding" the token
}

interface InformationScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export const InformationScreen: React.FC<InformationScreenProps> = ({ onNext, onBack }) => {
    const [isCheckingSeeker, setIsCheckingSeeker] = useState(true);
    const [isSeekerFound, setIsSeekerFound] = useState(false);

    useEffect(() => {
        const dummyAddress = "DEMO_USER_ADDRESS_SEEKER_CHECK";
        detectSeekerToken(dummyAddress).then(found => {
            setIsSeekerFound(found);
            setIsCheckingSeeker(false);
        });
    }, []);

    return (
        <div className="flex flex-col h-full bg-ui-bg text-text-primary p-6">
            <header className="flex items-center shrink-0 pt-4 pb-2 relative">
                <button onClick={onBack} className="absolute left-0 p-2 text-text-secondary hover:text-text-primary bg-ui-card-secondary rounded-full transition-colors">
                    <ArrowLeft size={18} />
                </button>
                <h1 className="flex-1 text-center font-black text-[10px] uppercase tracking-[0.3em]">Protocol Audit</h1>
            </header>

            <main className="flex-1 flex flex-col overflow-hidden min-h-0 py-6">
                <div className="flex-shrink-0 text-center mb-8">
                    <div className="w-16 h-16 bg-accent-primary/10 border border-accent-primary/20 rounded-[24px] flex items-center justify-center mx-auto mb-4 text-accent-primary shadow-lg shadow-accent-primary/5">
                        <Scale size={32} />
                    </div>
                    <h2 className="font-black text-xl uppercase tracking-tighter">Legal Oversight</h2>
                    <p className="text-[10px] text-text-secondary uppercase tracking-widest font-mono">Terms of Service & Privacy</p>
                </div>
                
                <div className="flex-1 bg-ui-card border border-ui-border rounded-3xl p-6 overflow-y-auto custom-scrollbar text-[11px] text-text-secondary space-y-4">
                    <p className="leading-relaxed">
                        This is a <span className="text-text-primary font-bold">non-production demonstration</span> of the Ghost Protocol Layer-2 infrastructure. All features, assets, and transaction finality metrics are simulated for the purpose of technical evaluation.
                    </p>
                    <p className="leading-relaxed">
                        By proceeding, you agree that this environment is restricted to synthetic data. <span className="text-accent-primary font-bold underline">DO NOT enter real private keys</span> or personal financial identifiers. Ghost Protocol Labs assumes no liability for data security in this sandbox.
                    </p>
                    <div className="pt-2 border-t border-ui-border">
                        <h3 className="font-black text-text-primary uppercase tracking-widest text-[9px] mb-2">Zero-Knowledge Data Sovereignty</h3>
                        <p className="leading-relaxed opacity-70">
                            We utilize ephemeral local storage. No user data is transmitted or persisted on external databases. Your session is entirely self-contained.
                        </p>
                    </div>
                </div>

                {/* Seeker Token Check UI */}
                <div className="mt-6 p-5 bg-ui-card border border-ui-border rounded-3xl flex items-center gap-4 shadow-sm">
                    {isCheckingSeeker ? (
                        <>
                            <div className="p-2 bg-accent-primary/10 rounded-xl">
                                <Loader2 size={20} className="text-accent-primary animate-spin" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-text-primary leading-none mb-1">Identity Sync</h4>
                                <p className="text-[9px] text-text-secondary uppercase font-mono">Checking Seeker Genesis...</p>
                            </div>
                        </>
                    ) : isSeekerFound ? (
                        <>
                            <div className="p-2 bg-green-500/10 rounded-xl">
                                <CheckCircle size={20} className="text-green-500" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-green-500 leading-none mb-1">Seeker Verified</h4>
                                <p className="text-[9px] text-text-secondary uppercase font-mono">Early access perks unlocked</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="p-2 bg-ui-card-secondary rounded-xl">
                                <Shield size={20} className="text-text-secondary opacity-50" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-text-primary leading-none mb-1">Standard Node</h4>
                                <p className="text-[9px] text-text-secondary uppercase font-mono">No specialized identity found</p>
                            </div>
                        </>
                    )}
                </div>
            </main>

            <footer className="flex-shrink-0 z-10 flex flex-col items-center gap-3 pt-4 pb-8">
                <motion.button 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    onClick={onNext}
                    disabled={isCheckingSeeker}
                    className="w-full py-5 bg-accent-primary text-accent-secondary rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-accent-primary/10"
                >
                    {isCheckingSeeker ? 'Analyzing Identity...' : 'Accept & Proceed'}
                </motion.button>
            </footer>
        </div>
    );
};