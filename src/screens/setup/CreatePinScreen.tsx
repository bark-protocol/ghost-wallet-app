/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PinInput } from '../../components/PinInput';
import { useWallet } from '../../hooks/useWallet';

interface CreatePinScreenProps {
  onPinCreated: (pin: string) => void;
}

type PinStep = 'create' | 'confirm';

export const CreatePinScreen: React.FC<CreatePinScreenProps> = ({ onPinCreated }) => {
  const [step, setStep] = useState<PinStep>('create');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState(false);
  const PIN_LENGTH = 6;
  const { walletLogEvent } = useWallet();

  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      setTimeout(() => setStep('confirm'), 200);
    }
  }, [pin]);

  useEffect(() => {
    if (confirmPin.length === PIN_LENGTH) {
      if (pin === confirmPin) {
        onPinCreated(pin);
        walletLogEvent('PIN_CREATED', 'MOBILE', 'New wallet PIN created successfully');
      } else {
        setError(true);
        walletLogEvent('PIN_ATTEMPT', 'MOBILE', 'PIN creation failed: mismatch', { success: false });
        setTimeout(() => {
          setError(false);
          setPin('');
          setConfirmPin('');
          setStep('create');
        }, 800);
      }
    }
  }, [confirmPin, pin, onPinCreated, walletLogEvent]);
  
  return (
    <div className="flex flex-col h-full bg-ui-bg text-text-primary p-8 justify-center">
        <AnimatePresence mode="wait">
            <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center text-center"
            >
                <div>
                    <h2 className="text-xl font-bold mb-2">
                        {step === 'create' ? 'Create a PIN' : 'Confirm Your PIN'}
                    </h2>
                    <p className="text-xs text-text-secondary mb-8">
                        {error ? 'PINs did not match. Please try again.' : 'Secure your wallet with a 6-digit PIN.'}
                    </p>
                    {step === 'create' ? (
                        <PinInput 
                            pin={pin} 
                            onPinChange={setPin} 
                            pinLength={PIN_LENGTH} 
                            error={error}
                        />
                    ) : (
                        <PinInput 
                            pin={confirmPin} 
                            onPinChange={setConfirmPin} 
                            pinLength={PIN_LENGTH} 
                            error={error}
                        />
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    </div>
  );
};