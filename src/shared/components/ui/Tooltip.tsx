import React, { useState } from 'react';
import { cn } from '@/shared/utils';
interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}
export function Tooltip({
  content,
  children,
  position = 'top',
  className
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };
  return <div className="relative inline-block" onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
      {children}
      {isVisible && <div className={cn('absolute z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded shadow-sm whitespace-nowrap animate-in fade-in zoom-in-95 duration-200', positions[position], className)}>
          {content}
          <div className={cn('absolute w-2 h-2 bg-gray-900 rotate-45', position === 'top' && 'bottom-[-4px] left-1/2 -translate-x-1/2', position === 'bottom' && 'top-[-4px] left-1/2 -translate-x-1/2', position === 'left' && 'right-[-4px] top-1/2 -translate-y-1/2', position === 'right' && 'left-[-4px] top-1/2 -translate-y-1/2')} />
        </div>}
    </div>;
}