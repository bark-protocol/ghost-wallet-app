/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { motion } from 'framer-motion';
import { SavedPrompt } from '../../../../../../types/prompts';

interface Props {
  prompts: SavedPrompt[];
  onSelect: (prompt: SavedPrompt) => void;
}

export const Prompts: React.FC<Props> = ({ prompts, onSelect }) => {
  return (
    <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 mask-linear-fade">
      {prompts.map((item, idx) => (
        <motion.button
          key={item.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.05 }}
          whileHover={{ y: -2, backgroundColor: 'rgba(197, 168, 128, 0.1)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(item)}
          className="whitespace-nowrap px-4 py-2 bg-ui-card border border-ui-border rounded-xl text-[10px] font-bold uppercase tracking-widest text-text-secondary hover:text-accent-primary hover:border-accent-primary/50 transition-all shadow-sm"
        >
          {item.text}
        </motion.button>
      ))}
      {prompts.length === 0 && (
        <p className="text-[9px] font-mono text-text-secondary/40 py-2 px-1">No saved queries in this category.</p>
      )}
    </div>
  );
};