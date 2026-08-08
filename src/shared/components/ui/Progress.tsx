import React, { forwardRef, ComponentPropsWithoutRef } from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/shared/utils';
const Progress = forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>>(({
  className,
  value,
  ...props
}, ref) => <ProgressPrimitive.Root ref={ref} className={cn('relative h-2 w-full overflow-hidden rounded-full bg-secondary/20', className)} {...props}>
    <ProgressPrimitive.Indicator className="h-full w-full flex-1 bg-primary transition-all" style={{
      transform: `translateX(-${100 - (value || 0)}%)`
    }} />
  </ProgressPrimitive.Root>);
Progress.displayName = ProgressPrimitive.Root.displayName;
interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  children?: React.ReactNode;
  className?: string;
}
const CircularProgress = ({
  value,
  size = 120,
  strokeWidth = 10,
  color = 'text-primary',
  trackColor = 'text-gray-100',
  children,
  className
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - value / 100 * circumference;
  return <div className={cn('relative inline-flex items-center justify-center', className)}>
    <svg width={size} height={size} className="transform -rotate-90">
      <circle className={trackColor} strokeWidth={strokeWidth} stroke="currentColor" fill="transparent" r={radius} cx={size / 2} cy={size / 2} />
      <circle className={cn('transition-all duration-1000 ease-out', color)} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" stroke="currentColor" fill="transparent" r={radius} cx={size / 2} cy={size / 2} />
    </svg>
    {children && <div className="absolute inset-0 flex items-center justify-center">
      {children}
    </div>}
  </div>;
};
export { Progress, CircularProgress };