
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export type CameraPermissionStatus = 'granted' | 'denied' | 'prompt' | 'unknown';

export interface CameraDevice {
    deviceId: string;
    label: string;
    kind: MediaDeviceKind;
}

export interface CameraState {
    stream: MediaStream | null;
    permission: CameraPermissionStatus;
    error: Error | null;
    activeDeviceId: string | null;
    isScanning: boolean;
}

export type BarcodeFormat = 'qr_code' | 'aztec' | 'data_matrix' | 'pdf417';

export interface ScannedCode {
    data: string;
    format: BarcodeFormat;
    timestamp: number;
    bounds?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}
