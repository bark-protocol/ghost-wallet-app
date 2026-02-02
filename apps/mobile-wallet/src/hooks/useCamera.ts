
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useState, useEffect, useCallback, useRef } from 'react';
import { CameraState, CameraPermissionStatus } from '../types/cameras';

interface UseCameraOptions {
    autoStart?: boolean;
    facingMode?: 'user' | 'environment';
    onScan?: (data: string) => void; 
}

export const useCamera = (options: UseCameraOptions = {}) => {
    const { autoStart = false, facingMode = 'environment' } = options;
    
    const [state, setState] = useState<CameraState>({
        stream: null,
        permission: 'unknown',
        error: null,
        activeDeviceId: null,
        isScanning: false,
    });

    const videoRef = useRef<HTMLVideoElement | null>(null);

    const startCamera = useCallback(async () => {
        try {
            if (state.stream) return; 

            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Your browser or device context does not support camera access. Ensure you are using HTTPS.");
            }

            const constraints: MediaStreamConstraints = {
                video: {
                    facingMode: facingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            setState(s => ({
                ...s,
                stream,
                permission: 'granted',
                error: null,
                isScanning: true
            }));

        } catch (error: any) {
            let errorMsg = "Camera access failed";
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                errorMsg = "Camera permission denied. Please enable camera access in your browser settings.";
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                errorMsg = "No camera hardware detected on this device.";
            } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
                errorMsg = "Camera is already in use by another application.";
            }

            console.error(`[GHOST_OS] ${errorMsg}:`, error);
            
            setState(s => ({
                ...s,
                permission: 'denied',
                error: new Error(errorMsg),
                isScanning: false
            }));
        }
    }, [facingMode, state.stream]);

    const stopCamera = useCallback(() => {
        if (state.stream) {
            state.stream.getTracks().forEach(track => track.stop());
            setState(s => ({
                ...s,
                stream: null,
                isScanning: false
            }));
        }
    }, [state.stream]);

    useEffect(() => {
        if (autoStart) {
            startCamera();
        }
        return () => {
            stopCamera();
        };
    }, [autoStart, startCamera, stopCamera]);

    return {
        ...state,
        startCamera,
        stopCamera,
        videoRef
    };
};
