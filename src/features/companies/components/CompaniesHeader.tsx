import { Building2, Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { DateRangeFilter } from '@/features/dashboard/components/DateRangeFilter';

interface CompaniesHeaderProps {
    onFilterChange: (filter: string) => void;
    onCustomDateChange: (start: Date, end: Date) => void;
    onCreateCompany: () => void;
}

export function CompaniesHeader({ onFilterChange, onCustomDateChange, onCreateCompany }: CompaniesHeaderProps) {
    return (
        <PageHeader
            title="Companies"
            description="Manage your contractors, suppliers, and partners"
            icon={Building2}
        >
            <DateRangeFilter
                onFilterChange={onFilterChange}
                onCustomDateChange={onCustomDateChange}
            />

            <Button
                onClick={onCreateCompany}
                className="gap-2 shadow-lg shadow-blue-100 h-10 bg-[#1D4F6D] hover:bg-[#0f2331] rounded-xl"
            >
                <Plus className="h-4 w-4" />
                Add Company
            </Button>
        </PageHeader>
    );
}
