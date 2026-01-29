/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { Fingerprint } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { PinInput } from '../components/PinInput';
import { GhostIcon } from '../ui/Logo';

export const LockScreen: React.FC = () => {
  const { checkPin, unlock, isBiometricEnabled, walletLogEvent } = useWallet();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const PIN_LENGTH = 6;

  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      if (checkPin(pin)) {
        unlock();
        walletLogEvent('PIN_ATTEMPT', 'MOBILE', 'Wallet unlocked successfully with PIN', { success: true });
      } else {
        setError(true);
        walletLogEvent('PIN_ATTEMPT', 'MOBILE', 'Failed to unlock wallet with PIN', { success: false });
        setTimeout(() => {
          setError(false);
          setPin('');
        }, 800);
      }
    }
  }, [pin, checkPin, unlock, walletLogEvent]);

  return (
    <div className="absolute inset-0 z-[100] bg-ui-bg flex flex-col p-8">
      <header className="flex-shrink-0 flex justify-center pt-12">
        <GhostIcon className="w-12 h-12" />
      </header>

      <main className="flex-1 flex flex-col justify-center items-center text-center">
        <div>
          <h2 className="font-bold text-text-primary mb-2">Enter PIN</h2>
          <p className="text-xs text-text-secondary mb-8">
            {error ? 'Incorrect PIN. Try again.' : 'Unlock your wallet to continue.'}
          </p>
          <PinInput 
            pin={pin} 
            onPinChange={setPin} 
            pinLength={PIN_LENGTH}
            error={error}
          />
        </div>
      </main>

      <footer className="flex-shrink-0 flex justify-center pb-8">
        {isBiometricEnabled && (
          <button className="flex flex-col items-center gap-2 text-text-secondary hover:text-accent-primary transition-colors">
            <Fingerprint size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Use Biometrics</span>
          </button>
        )}
      </footer>
    </div>
  );
};