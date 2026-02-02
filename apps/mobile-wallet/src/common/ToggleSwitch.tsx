/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { motion } from 'framer-motion';

interface ToggleSwitchProps {
  isOn: boolean;
  onToggle: () => void;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isOn, onToggle }) => {
  return (
    <div
      onClick={onToggle}
      className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
        isOn ? 'bg-accent-primary justify-end' : 'bg-ui-card-secondary justify-start'
      }`}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 700, damping: 30 }}
        className="w-4 h-4 bg-white rounded-full shadow-md"
      />
    </div>
  );
};
