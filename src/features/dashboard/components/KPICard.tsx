import type React from 'react';
import { Card, CardContent } from '@/shared/components/ui/Card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/shared/utils';

interface KPICardProps {
  title: string;
  value: string;
  trend: number;
  trendLabel?: string;
  icon: React.ElementType;
  color?: 'blue' | 'primary' | 'green' | 'purple';
}
const colorStyles = {
  blue: 'bg-blue-50 text-blue-600',
  primary: 'bg-blue-50 text-[#1D4F6D]',
  green: 'bg-green-50 text-green-600',
  purple: 'bg-purple-50 text-purple-600'
};
export function KPICard({
  title,
  value,
  trend,
  trendLabel = 'vs last month',
  icon: Icon,
  color = 'blue'
}: KPICardProps) {
  const isPositive = trend >= 0;
  return <Card className="overflow-hidden transition-all hover:shadow-md">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className={cn('rounded-xl p-3', colorStyles[color])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900 tracking-tight">
            {value}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className={cn('flex items-center gap-1 font-medium rounded-full px-2 py-0.5 text-xs', isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700')}>
            {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trend)}%
          </span>
          <span className="text-gray-400 text-xs">{trendLabel}</span>
        </div>
      </div>
    </CardContent>
  </Card>;
}