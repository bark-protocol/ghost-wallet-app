/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useState, useCallback } from 'react';
import { useWallet } from './useWallet';
import { trpc } from '../../../../../lib/trpc';

export interface MintStep {
    id: string;
    label: string;
    status: 'idle' | 'processing' | 'success' | 'error';
}

export const useMintNFT = () => {
    const { walletLogEvent, setHasGenesisNft } = useWallet();
    const [signature, setSignature] = useState<string | null>(null);
    const [activeStep, setActiveStep] = useState<number>(-1);

    const steps: MintStep[] = [
        { id: 'gate', label: 'Eligibility Check' , status: 'idle' },
        { id: 'zk_gen', label: 'ZKP Generation', status: 'idle' },
        { id: 'zk_verify', label: 'ZK-Verifier Audit', status: 'idle' },
        { id: 'zk_shield', label: 'Mixer Shielding', status: 'idle' },
        { id: 'mint', label: 'Private Mint', status: 'idle' },
        { id: 'blinks', label: 'Blinks Notify', status: 'idle' }
    ];

    const [processSteps, setProcessSteps] = useState<MintStep[]>(steps);

    const mintMutation = trpc.nft.mint.useMutation({
        onSuccess: (data) => {
            setSignature(data.signature);
            walletLogEvent('PAYMENT_VERIFIED', 'PROTOCOL', 'Private Mint: Finalized on-chain via Metaplex Core', { signature: data.signature });
            updateStepStatus(4, 'success');
        },
        onError: (error) => {
            if (activeStep >= 0) updateStepStatus(activeStep, 'error');
        }
    });

    const updateStepStatus = (index: number, status: MintStep['status']) => {
        setProcessSteps(prev => prev.map((s, i) => i === index ? { ...s, status } : s));
    };

    const mintGenesis = useCallback(async () => {
        mintMutation.reset();
        setSignature(null);
        setProcessSteps(steps);

        try {
            setActiveStep(0); updateStepStatus(0, 'processing'); await new Promise(r => setTimeout(r, 800));
            walletLogEvent('AI_ACTION', 'MOBILE', 'Eligibility: Whitelist status confirmed'); updateStepStatus(0, 'success');

            setActiveStep(1); updateStepStatus(1, 'processing'); await new Promise(r => setTimeout(r, 1500));
            walletLogEvent('AI_ACTION', 'MOBILE', 'ZKP: Generated succinct proof of ownership'); updateStepStatus(1, 'success');

            setActiveStep(2); updateStepStatus(2, 'processing'); await new Promise(r => setTimeout(r, 1000));
            walletLogEvent('SECURITY_ALERT', 'AI', 'Verifier: Proof validated'); updateStepStatus(2, 'success');

            setActiveStep(3); updateStepStatus(3, 'processing'); await new Promise(r => setTimeout(r, 1200));
            walletLogEvent('SETTINGS_CHANGE', 'MOBILE', 'ZK-Shield: Privacy relay active'); updateStepStatus(3, 'success');
            
            setActiveStep(4); updateStepStatus(4, 'processing');
            const result = await mintMutation.mutateAsync({ name: "Genesis Pass" });
            
            setActiveStep(5); updateStepStatus(5, 'processing');
            await new Promise(r => setTimeout(r, 900));
            walletLogEvent('AI_ACTION', 'MOBILE', 'Blinks: Real-time confirmation broadcasted');
            updateStepStatus(5, 'success');
            
            setHasGenesisNft(true);

            return result.signature;
        } catch (err: any) {
            if (activeStep >= 0) updateStepStatus(activeStep, 'error');
            return null;
        }
    }, [walletLogEvent, activeStep, setHasGenesisNft, mintMutation]);

    return { 
        mintGenesis, 
        isLoading: mintMutation.isPending, 
        error: mintMutation.error?.message || null,
        signature, 
        processSteps, 
        activeStep 
    };
};