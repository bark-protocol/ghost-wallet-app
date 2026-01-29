/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useState } from 'react';
import { ArrowLeft, Code, Globe, Zap, Airplay, RefreshCw, ExternalLink, Palette, FileUp, CheckCircle, UploadCloud, MessageSquare } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { NetworkSelector } from '../components/NetworkSelector';
import { useTheme } from '../context/ThemeContext';
import { ListItem } from '../common/ListItem';
import { trpc } from '../../../../../lib/trpc';

const Section: React.FC<{ icon: React.ElementType, title: string, children: React.ReactNode }> = ({ icon: Icon, title, children }) => (
    <div>
        <h3 className="px-4 text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
            <Icon size={10}/> {title}
        </h3>
        {children}
    </div>
);

const ThemeSwatch: React.FC<{ colorVar: string, name: string }> = ({ colorVar, name }) => (
    <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-md ring-1 ring-ui-border" style={{ backgroundColor: `hsl(var(${colorVar}))` }} />
        <div className="flex flex-col">
            <span className="text-xs font-bold text-text-primary">{name}</span>
            <span className="text-[10px] font-mono text-text-secondary">var({colorVar})</span>
        </div>
    </div>
);

const fileToBase64 = (file: File): Promise<string> => 
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });


export const DeveloperScreen: React.FC = () => {
    const { setActiveView, activeTab, walletLogEvent } = useWallet();
    const { theme } = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadResult, setUploadResult] = useState<{ usersAdded: number } | null>(null);
    const [memo, setMemo] = useState('Ghost Protocol test memo');

    const sendMemoMutation = trpc.wallet.memo.useMutation({
        onSuccess: (data) => {
            alert(`tRPC Memo Sent! Signature: ${data.signature.slice(0, 20)}...`);
            walletLogEvent('PAYMENT_CONFIRMED', 'MOBILE', `Memo sent via tRPC: ${data.message}`, { signature: data.signature });
        },
        onError: (error) => {
            alert(`tRPC Error: ${error.message}`);
        }
    });

    const uploadWhitelistMutation = trpc.admin.uploadWhitelistCsv.useMutation({
        onSuccess: (data) => {
            setUploadResult(data);
            setTimeout(() => setUploadResult(null), 3000); // Reset after 3s
        },
        onError: (error) => {
            alert('Upload failed via tRPC.');
        }
    });

    const handleSendMemo = () => {
        sendMemoMutation.mutate({ message: memo });
    };

    const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        walletLogEvent('SETTINGS_CHANGE', 'MOBILE', 'Admin initiated CSV whitelist upload');
        
        try {
            const fileContent = await fileToBase64(file);
            uploadWhitelistMutation.mutate({ fileContent });
        } catch (e) {
            alert('Failed to read file.');
        }
    };

    const handleAirdrop = () => {
        alert("Simulated: Airdropped 1 DEV SOL.");
        walletLogEvent('SETTINGS_CHANGE', 'MOBILE', 'Simulated Airdrop Devnet SOL', { action: 'airdrop_sol_devnet' });
    };
    const handleReset = () => {
        if (confirm("Are you sure you want to reset local balances?")) {
            alert("Simulated: Balances have been reset.");
            walletLogEvent('SETTINGS_CHANGE', 'MOBILE', 'Simulated Reset Local Balances', { action: 'reset_local_balances' });
        }
    };
    
    const themeColors = [
        { name: 'Background', var: '--ui-bg' },
        { name: 'Card', var: '--ui-card' },
        { name: 'Border', var: '--ui-border' },
        { name: 'Primary Text', var: '--text-primary' },
        { name: 'Secondary Text', var: '--text-secondary' },
        { name: 'Accent', var: '--accent-primary' },
    ];

    return (
        <div className="flex flex-col h-full bg-ui-bg text-text-primary theme-oled">
             <header className="flex items-center p-4 shrink-0 ring-1 ring-ui-border">
                <button 
                    onClick={() => setActiveView(activeTab)} 
                    className="p-2 text-text-secondary hover:text-text-primary"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="flex-1 text-center font-bold text-sm uppercase tracking-widest">Developer Settings</h1>
                <div className="w-9" />
            </header>
            
            <main className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                <Section icon={Code} title="tRPC Actions">
                     <div className="bg-ui-card ring-1 ring-ui-border rounded-2xl p-4 space-y-3">
                        <input
                            type="text"
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                            className="w-full bg-ui-bg border border-ui-border rounded-lg p-3 text-xs font-mono"
                        />
                        <button onClick={handleSendMemo} disabled={sendMemoMutation.isPending} className="w-full flex items-center justify-center gap-2 p-3 bg-accent-primary/10 text-accent-primary rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-accent-primary/20 transition-colors">
                            <MessageSquare size={14} /> Send Memo (via tRPC)
                        </button>
                    </div>
                </Section>
                <Section icon={Globe} title="Network Configuration">
                    <NetworkSelector />
                </Section>
                <Section icon={Code} title="Admin Controls">
                    <div className="bg-ui-card ring-1 ring-ui-border rounded-2xl p-4">
                        <input type="file" ref={fileInputRef} onChange={handleCsvUpload} className="hidden" accept=".csv" />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadWhitelistMutation.isPending}
                            className="w-full flex items-center justify-center gap-3 p-4 bg-ui-card-secondary border border-dashed border-ui-border rounded-xl text-text-secondary hover:border-accent-primary hover:text-accent-primary transition-colors disabled:opacity-50"
                        >
                            {uploadWhitelistMutation.isPending ? <><UploadCloud size={16} className="animate-pulse" /> <span className="text-xs font-bold uppercase tracking-wider">Processing...</span></>
                            : uploadResult ? <><CheckCircle size={16} className="text-green-500" /> <span className="text-xs font-bold uppercase tracking-wider text-green-500">Added {uploadResult?.usersAdded} Users</span></>
                            : <><FileUp size={16} /> <span className="text-xs font-bold uppercase tracking-wider">Upload Whitelist CSV</span></>
                            }
                        </button>
                    </div>
                </Section>

                <Section icon={Zap} title="Solana Actions">
                    <div className="bg-ui-card ring-1 ring-ui-border rounded-2xl">
                        <ListItem icon={Airplay} label="Airdrop Devnet SOL" onClick={handleAirdrop} accessory="none" />
                        <ListItem icon={RefreshCw} label="Reset Local Balances" onClick={handleReset} accessory="none" isLast />
                    </div>
                </Section>
                
                <Section icon={ExternalLink} title="Quick Links">
                    <div className="bg-ui-card ring-1 ring-ui-border rounded-2xl">
                        <ListItem icon={ExternalLink} label="Solana Explorer" accessory="chevron" isLast={false} onClick={() => walletLogEvent('SETTINGS_CHANGE', 'MOBILE', 'Navigated to Solana Explorer')} />
                        <ListItem icon={ExternalLink} label="Sui Explorer" accessory="chevron" isLast={false} onClick={() => walletLogEvent('SETTINGS_CHANGE', 'MOBILE', 'Navigated to Sui Explorer')} />
                         <ListItem icon={Code} label="Ghost Protocol Docs" accessory="chevron" isLast onClick={() => walletLogEvent('SETTINGS_CHANGE', 'MOBILE', 'Navigated to Ghost Protocol Docs')} />
                    </div>
                </Section>

                <Section icon={Palette} title="Theme Inspector">
                    <div className="bg-ui-card ring-1 ring-ui-border rounded-2xl p-4">
                        <p className="text-xs font-bold mb-4">
                            Active Theme: <span className="font-mono text-accent-primary uppercase">{theme}</span>
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            {themeColors.map(c => <ThemeSwatch key={c.var} colorVar={c.var} name={c.name} />)}
                        </div>
                    </div>
                </Section>
            </main>
        </div>
    );
};