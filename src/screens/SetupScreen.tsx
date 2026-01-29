/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GetStartedScreen } from './setup/GetStartedScreen';
import { InformationScreen } from './setup/InformationScreen';
import { GenerateWalletScreen } from './setup/GenerateWalletScreen';
import { useWallet } from '../hooks/useWallet';
import { CreatePinScreen } from './setup/CreatePinScreen';
import { ImportWalletScreen } from './setup/ImportWalletScreen';

type SetupStep = 'start' | 'info' | 'pin' | 'generate' | 'import';

export const SetupScreen: React.FC = () => {
    const [step, setStep] = useState<SetupStep>('start');
    const { completeOnboarding, setPin } = useWallet();

    const handlePinCreated = (pin: string) => {
        setPin(pin);
        setStep('generate');
    };

    const renderStep = () => {
        switch (step) {
            case 'start':
                return <GetStartedScreen onNext={() => setStep('info')} onImport={() => setStep('import')} />;
            case 'info':
                return <InformationScreen onNext={() => setStep('pin')} onBack={() => setStep('start')} />;
            case 'pin':
                return <CreatePinScreen onPinCreated={handlePinCreated} />;
            case 'generate':
                return <GenerateWalletScreen onComplete={completeOnboarding} />;
            case 'import':
                return <ImportWalletScreen onImported={() => setStep('pin')} onBack={() => setStep('start')} />;
            default:
                return <GetStartedScreen onNext={() => setStep('info')} onImport={() => setStep('import')} />;
        }
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
            >
                {renderStep()}
            </motion.div>
        </AnimatePresence>
    );
};