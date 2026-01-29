
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useContext } from 'react';
import { FeeContext } from '../context/FeeContext';

export const useFees = () => {
    const context = useContext(FeeContext);
    if (context === undefined) {
        throw new Error('useFees must be used within a FeeProvider');
    }
    return context;
};