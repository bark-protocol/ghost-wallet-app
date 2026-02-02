/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Cpu, Loader } from 'lucide-react';

interface GenerateWalletScreenProps {
  onComplete: () => void;
}

export const GenerateWalletScreen: React.FC<GenerateWalletScreenProps> = ({ onComplete }) => {
    const [status, setStatus] = useState<'processing' | 'success'>('processing');

    useEffect(() => {
        const timer = setTimeout(() => {
            setStatus('success');
        }, 3000); // Simulate generation time

        const completeTimer = setTimeout(() => {
            onComplete();
        }, 4500); // Wait a bit on success screen before completing

        return () => {
            clearTimeout(timer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    return (
        <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-ui-bg text-text-primary">
            <AnimatePresence mode="wait">
                {status === 'processing' ? (
                     <motion.div 
                        key="processing" 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }} 
                        className="flex flex-col items-center"
                     >
                        <div className="relative mb-6">
                            <Cpu size={48} className="text-accent-primary" />
                             <motion.div 
                                className="absolute inset-0"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                             >
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent-primary rounded-full" style={{transform: 'translateY(-20px)'}} />
                            </motion.div>
                        </div>
                        <h3 className="font-bold text-text-primary mb-2">Creating Secure Vault...</h3>
                        <p className="text-xs text-text-secondary">Encrypting keys and establishing secure enclave.</p>
                    </motion.div>
                ) : (
                     <motion.div 
                        key="success" 
                        initial={{ opacity: 0, scale: 0.8 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        className="flex flex-col items-center"
                     >
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6 border-2 border-green-500/20">
                            <Check size={32} className="text-green-500" />
                        </div>
                        <h3 className="font-bold text-text-primary mb-2">Vault Created Successfully!</h3>
                        <p className="text-xs text-text-secondary">Welcome to Ghost Wallet.</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};