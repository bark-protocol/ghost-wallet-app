/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useContext } from 'react';
import { ClusterContext } from '../context/ClusterContext';
import { trpc } from '../../../../../lib/trpc';

export const useCluster = () => {
    const context = useContext(ClusterContext);
    if (context === undefined) {
        throw new Error('useCluster must be used within a ClusterProvider');
    }

    const { data: health } = trpc.core.health.useQuery(undefined, {
        refetchInterval: 30000,
    });

    return {
        ...context,
        health: health || null,
    };
};