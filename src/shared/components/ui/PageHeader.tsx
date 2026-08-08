import { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/utils';
import { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    description: string;
    icon: LucideIcon;
    children?: ReactNode;
    className?: string;
}

export function PageHeader({
    title,
    description,
    icon: Icon,
    children,
    className
}: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm", className)}>
            <div className="flex-1">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-[#1D4F6D] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/10 shrink-0">
                        <Icon className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none">
                            {title}
                        </h2>
                        <p className="text-gray-500 font-medium text-sm mt-2">
                            {description}
                        </p>
                    </div>
                </div>
            </div>

            {children && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full md:w-auto">
                    {children}
                </div>
            )}
        </div>
    );
}
