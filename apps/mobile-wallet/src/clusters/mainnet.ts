/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface ClusterConfig {
    name: 'mainnet' | 'devnet';
    solana: {
        rpcEndpoint: string;
        ghostPayProgramId: string;
    },
    sui: {
        rpcEndpoint: string;
        ghostPayPackageId: string;
    }
}

export const mainnetConfig: ClusterConfig = {
    name: 'mainnet',
    solana: {
        rpcEndpoint: 'https://api.mainnet-beta.solana.com',
        ghostPayProgramId: '7GhSTPsvA2beSytA3AaP2ADaDRC4Ze93b822d5a32GhS', // Fixed: Valid 44-char Base58 key
    },
    sui: {
        rpcEndpoint: 'https://fullnode.mainnet.sui.io:443',
        ghostPayPackageId: '0xSUI_GHOST_PACKAGE_MAIN',
    }
};
