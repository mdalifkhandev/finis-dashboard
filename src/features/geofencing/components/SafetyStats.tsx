import type React from 'react';
import { AlertTriangle, AlertCircle, ShieldCheck, Award } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/Card';
import { cn } from '@/shared/utils';
interface StatCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon: React.ElementType;
  color: 'red' | 'orange' | 'green' | 'blue';
}
function StatCard({
  title,
  value,
  trend,
  icon: Icon,
  color
}: StatCardProps) {
  const colorStyles = {
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600'
  };
  return <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className={cn('rounded-xl p-3', colorStyles[color])}>
          <Icon className="h-6 w-6" />
        </div>
        {trend !== undefined && <span className={cn('text-xs font-medium px-2 py-1 rounded-full', trend >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700')}>
          {trend > 0 ? '+' : ''}
          {trend}%
        </span>}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
      </div>
    </CardContent>
  </Card>;
}
export function SafetyStats() {
  return <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
    <StatCard title="Total Incidents" value="12" trend={-5} icon={AlertTriangle} color="orange" />
    <StatCard title="Open Incidents" value="3" trend={0} icon={AlertCircle} color="red" />
    <StatCard title="Compliance Rate" value="98.5%" trend={1.2} icon={ShieldCheck} color="green" />
    <StatCard title="Expiring Certs" value="8" trend={2} icon={Award} color="blue" />
  </div>;
}
