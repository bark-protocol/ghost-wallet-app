/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { ClusterConfig } from "./mainnet";

export const devnetConfig: ClusterConfig = {
    name: 'devnet',
    solana: {
        rpcEndpoint: 'https://api.devnet.solana.com',
        ghostPayProgramId: '6GhST7v1n6P2xP2A8aDRC4Ze93b822d5a32GhST7v1n6', // Fixed: Valid 44-char Base58 key
    },
    sui: {
        rpcEndpoint: 'https://fullnode.devnet.sui.io:443',
        ghostPayPackageId: '0xSUI_GHOST_PACKAGE_DEV',
    }
};
