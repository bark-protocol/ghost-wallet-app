/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Delete } from 'lucide-react';

interface PinInputProps {
  pin: string;
  onPinChange: (pin: string) => void;
  pinLength?: number;
  error?: boolean;
}

const NumpadButton: React.FC<{ value: string; onClick: (v: string) => void }> = ({ value, onClick }) => (
  <motion.button
    whileTap={{ scale: 0.9, backgroundColor: 'hsl(var(--ui-card-secondary))' }}
    onClick={() => onClick(value)}
    className="w-16 h-16 rounded-full text-2xl font-bold text-text-primary focus:outline-none"
    aria-label={`Digit ${value}`}
  >
    {value}
  </motion.button>
);

export const PinInput: React.FC<PinInputProps> = ({ pin, onPinChange, pinLength = 6, error = false }) => {
  const handleNumpadClick = (value: string) => {
    if (pin.length < pinLength) {
      onPinChange(pin + value);
    }
  };

  const handleDelete = () => {
    onPinChange(pin.slice(0, -1));
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key >= '0' && event.key <= '9') {
        handleNumpadClick(event.key);
      } else if (event.key === 'Backspace') {
        handleDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [pin, onPinChange, pinLength]);

  const shakeVariants = {
    initial: { x: 0 },
    shake: {
      x: [-10, 10, -10, 10, 0],
      transition: { duration: 0.4 },
    },
  };

  return (
    <motion.div
      className="flex flex-col items-center gap-8"
      variants={shakeVariants}
      animate={error ? 'shake' : 'initial'}
    >
      {/* PIN Dots */}
      <div className="flex gap-4">
        {[...Array(pinLength)].map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-colors ${
              error
                ? 'border-red-500'
                : i < pin.length
                ? 'border-accent-primary'
                : 'border-text-secondary'
            } ${
              i < pin.length ? (error ? 'bg-red-500/50' : 'bg-accent-primary') : ''
            } ${
              i === pin.length - 1 && !error ? 'animate-pulse' : ''
            }`}
          />
        ))}
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-6">
        {[...Array(9)].map((_, i) => (
          <NumpadButton key={i + 1} value={String(i + 1)} onClick={handleNumpadClick} />
        ))}
        <div /> {/* Spacer */}
        <NumpadButton value="0" onClick={handleNumpadClick} />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleDelete}
          className="w-16 h-16 flex items-center justify-center text-text-secondary focus:outline-none"
          aria-label="Delete last digit"
        >
          <Delete size={24} />
        </motion.button>
      </div>
    </motion.div>
  );
};