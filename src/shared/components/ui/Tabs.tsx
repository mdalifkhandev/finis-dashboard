import React from 'react';
import { cn } from '@/shared/utils';
interface Tab {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}
interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange?: (id: string) => void;
  className?: string;
}
export function Tabs({
  tabs,
  activeTab,
  onTabChange,
  className
}: TabsProps) {
  return <div className={cn('border-b border-gray-200', className)}>
    <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return <button key={tab.id} onClick={() => onTabChange?.(tab.id)} className={cn('whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors', isActive ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700')} aria-current={isActive ? 'page' : undefined}>
          <div className="flex items-center gap-2">
            {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-900')}>
              {tab.count}
            </span>}
          </div>
        </button>;
      })}
    </nav>
  </div>;
}