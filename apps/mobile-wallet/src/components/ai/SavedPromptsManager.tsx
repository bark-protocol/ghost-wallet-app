/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Send, X, Sparkles } from 'lucide-react';
import { useSavedPrompts } from '../../../../../../hooks/useSavedPrompts';
import { Prompts } from './Prompts';
import { PromptCategory } from '../../../../../../types/prompts';

interface Props {
  onSend: (text: string) => void;
}

const CATEGORIES: PromptCategory[] = ['wallet', 'swap', 'nft', 'payments', 'general'];

export const SavedPromptsManager: React.FC<Props> = ({ onSend }) => {
  const { addPrompt, getPromptsByCategory } = useSavedPrompts();
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory>('general');
  const [newPrompt, setNewPrompt] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const categoryPrompts = getPromptsByCategory(selectedCategory);

  const handleAdd = () => {
    if (newPrompt.trim()) {
      addPrompt(selectedCategory, newPrompt.trim());
      setNewPrompt('');
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex gap-1 bg-ui-card p-1 rounded-xl border border-ui-border overflow-x-auto custom-scrollbar">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              selectedCategory === cat 
                ? 'bg-accent-primary text-accent-secondary shadow-md' 
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Prompts List */}
      <div className="relative">
        <Prompts prompts={categoryPrompts} onSelect={p => onSend(p.text)} />
      </div>

      {/* Add New Prompt Action */}
      <div className="pt-1">
        <AnimatePresence mode="wait">
          {!isAdding ? (
            <motion.button 
              key="add-button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-text-secondary hover:text-accent-primary transition-colors px-1 group"
            >
              <div className="p-1 rounded-md bg-ui-card border border-ui-border group-hover:border-accent-primary/50">
                <Plus size={10} />
              </div>
              Add Custom Query
            </motion.button>
          ) : (
            <motion.div 
              key="add-input"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="flex gap-2"
            >
              <div className="flex-1 bg-ui-card border border-ui-border rounded-xl px-3 py-2 flex items-center gap-2 ring-1 ring-accent-primary/20">
                <Sparkles size={10} className="text-accent-primary opacity-50" />
                <input
                  autoFocus
                  placeholder="New AI prompt..."
                  value={newPrompt}
                  onChange={e => setNewPrompt(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-xs text-text-primary placeholder:text-text-secondary/30"
                />
                <button onClick={() => setIsAdding(false)} className="text-text-secondary hover:text-red-500 transition-colors">
                  <X size={14} />
                </button>
              </div>
              <button 
                onClick={handleAdd}
                disabled={!newPrompt.trim()}
                className="px-4 bg-accent-primary text-accent-secondary rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-30 shadow-lg shadow-accent-primary/20"
              >
                Save
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};