/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
};

export const Avatar: React.FC<AvatarProps> = ({ src, size = 'md', className = '' }) => {
  return (
    <div
      className={`relative flex items-center justify-center rounded-full bg-ui-card-secondary border border-ui-border overflow-hidden ${sizeClasses[size]} ${className}`}
    >
      {src ? (
        <img src={src} alt="User Avatar" className="w-full h-full object-cover" />
      ) : (
        <User size="50%" className="text-text-secondary" />
      )}
    </div>
  );
};