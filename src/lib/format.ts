
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

/**
 * A simple date formatting utility.
 * In a production app, a robust library like date-fns would be used.
 * @param date The date to format.
 * @param formatString A string defining the format (e.g., 'MMMM d, yyyy').
 */
export const format = (date: Date, formatString: string): string => {
    const options: Intl.DateTimeFormatOptions = {};
    if (formatString.includes('MMMM')) options.month = 'long';
    if (formatString.includes('d')) options.day = 'numeric';
    if (formatString.includes('yyyy')) options.year = 'numeric';
    if (formatString.includes('h')) options.hour = 'numeric';
    if (formatString.includes('mm')) options.minute = '2-digit';
    if (formatString.includes('a')) options.hour12 = true;
    
    return new Intl.DateTimeFormat('en-US', options).format(date);
};