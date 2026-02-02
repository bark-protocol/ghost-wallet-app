/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Sparkles, Bot, User, Loader2, Info } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { getAIChatClient } from '../../../../../lib/ai';
import { MarkdownText } from '../../../../../components/AIAgentConsultant';
import { SavedPromptsManager } from '../components/ai/SavedPromptsManager';

interface Message {
    id: string;
    role: 'user' | 'ai';
    text: string;
    thinking?: string;
    timestamp: Date;
}

const STATIC_SUGGESTIONS = [
    "What's the current network status?",
    "Analyze recent transaction patterns.",
];

export const AIChatScreen: React.FC = () => {
    const { setActiveView, activeTab, balances, transactions, walletLogEvent } = useWallet();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'initial',
            role: 'ai',
            text: 'Greetings. I am GhostGuard, your personal protocol assistant. How can I secure or optimize your assets today?',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async (textOverride?: string) => {
        const text = textOverride || input.trim();
        if (!text || isTyping) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: text,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);
        walletLogEvent('AI_ACTION', 'MOBILE', `User query to GhostGuard: ${text.slice(0, 30)}...`);

        try {
            const client = getAIChatClient('gemini-3-flash-preview');
            const context = {
                balances,
                txCount: transactions.length,
                recentTx: transactions.slice(0, 3).map(t => ({ id: t.id, amount: t.amount, token: t.token }))
            };

            const response = await client.sendMessage(text, context);

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                text: response.text,
                thinking: response.thinking,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error("AI Assistant Error:", error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                text: "My apologies. I encountered a protocol synchronization error. Please check your network connection.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-ui-bg text-text-primary overflow-hidden">
            <header className="flex items-center p-6 shrink-0 border-b border-ui-border bg-ui-card/30 backdrop-blur-md z-20">
                <button onClick={() => setActiveView(activeTab)} className="p-2 text-text-secondary hover:text-text-primary bg-ui-card-secondary rounded-full transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1 text-center flex flex-col items-center">
                    <h1 className="font-black text-xs uppercase tracking-[0.3em]">GhostGuard AI</h1>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[8px] font-mono text-text-secondary uppercase tracking-widest">Neural Link Active</span>
                    </div>
                </div>
                <button className="p-2 text-text-secondary hover:text-text-primary bg-ui-card-secondary rounded-full transition-colors">
                    <Info size={18} />
                </button>
            </header>

            <main 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-ui-bg to-ui-card-secondary/20 pb-32"
            >
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                                msg.role === 'user' 
                                ? 'bg-ui-card border-ui-border text-text-secondary' 
                                : 'bg-accent-primary/10 border-accent-primary/20 text-accent-primary'
                            }`}>
                                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                            </div>
                            <div className="space-y-2">
                                {msg.thinking && (
                                    <div className="p-3 bg-accent-primary/5 rounded-xl border border-dashed border-accent-primary/10">
                                        <p className="text-[9px] italic text-accent-primary/60 leading-relaxed font-mono">
                                            {msg.thinking}
                                        </p>
                                    </div>
                                )}
                                <div className={`p-4 rounded-[20px] shadow-sm ${
                                    msg.role === 'user'
                                    ? 'bg-accent-primary text-accent-secondary rounded-tr-none'
                                    : 'bg-ui-card border border-ui-border text-text-primary rounded-tl-none'
                                }`}>
                                    <MarkdownText text={msg.text} />
                                </div>
                                <span className="text-[7px] font-mono text-text-secondary uppercase opacity-50 block px-1">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="flex gap-3 items-center bg-ui-card border border-ui-border p-4 rounded-[20px] rounded-tl-none shadow-sm">
                            <Loader2 size={12} className="text-accent-primary animate-spin" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-primary animate-pulse">Processing...</span>
                        </div>
                    </div>
                )}
            </main>

            <footer className="p-6 bg-ui-bg border-t border-ui-border">
                <div className="mb-6 space-y-4">
                    {/* Static Suggestions */}
                    <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                        {STATIC_SUGGESTIONS.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => handleSend(s)}
                                disabled={isTyping}
                                className="whitespace-nowrap px-3 py-1.5 bg-ui-card-secondary border border-ui-border rounded-lg hover:text-accent-primary transition-all text-[9px] font-bold uppercase tracking-widest text-text-secondary"
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* Modular Saved Prompts */}
                    <div>
                        <h4 className="text-[8px] font-black uppercase tracking-[0.2em] text-text-secondary/40 mb-3 px-1">Dynamic Prompt Library</h4>
                        <SavedPromptsManager onSend={handleSend} />
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-ui-card border border-ui-border rounded-2xl p-1.5 shadow-inner">
                    <input 
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask about your protocol state..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-3 text-text-primary placeholder:text-text-secondary/30"
                    />
                    <button 
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isTyping}
                        className="w-10 h-10 bg-accent-primary text-accent-secondary rounded-xl flex items-center justify-center hover:brightness-110 active:scale-95 transition-all disabled:opacity-30 shadow-lg shadow-accent-primary/20"
                    >
                        <Send size={16} />
                    </button>
                </div>
                <div className="mt-3 text-center flex items-center justify-center gap-2 opacity-30">
                    <Sparkles size={10} className="text-accent-primary" />
                    <span className="text-[7px] font-mono uppercase tracking-[0.4em]">Autonomous Intelligence Shield</span>
                </div>
            </footer>
        </div>
    );
};
