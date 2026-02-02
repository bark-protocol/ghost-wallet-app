/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useWallet } from './useWallet';

/**
 * A hook to determine if the user has access to the Ghost Portal.
 * Access is granted if the user holds >= 3 SOL or the Genesis NFT.
 */
export function useGhostPortal() {
  const { balances, hasGenesisNft } = useWallet();

  const solBalance = balances.SOL || 0;

  return {
    hasAccess: solBalance >= 3 || hasGenesisNft
  };
}