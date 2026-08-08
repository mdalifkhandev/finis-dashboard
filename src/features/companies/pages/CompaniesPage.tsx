import { useState } from 'react';
import { LayoutGrid, Table2 } from 'lucide-react';
import {
  CompanyStats,
  CompanyFilters,
  CompanyTable,
  CompanyCard,
  CompaniesHeader,
  CreateCompanyModal
} from '../components';
import { Company } from '@/shared/types';
import { useCompanies, useCreateCompany, useCompanyStats } from '../hooks/useCompanies';
import { useDebounce } from '@/shared/hooks';
import { SEO } from '@/shared/components/seo/SEO';

export function CompaniesPage() {
  const { companies, isLoading, refetch: refetchCompanies } = useCompanies();
  const { createCompany } = useCreateCompany();
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('monthly');
  const [customDateRange, setCustomDateRange] = useState<{ start: Date; end: Date } | null>(null);
  const { stats: companyStats } = useCompanyStats(timeFilter, customDateRange);

  const handleCreateCompany = async (newCompanyData: Partial<Company>) => {
    const newCompany: Company = {
      id: `c${Date.now()}`,
      name: newCompanyData.name || 'New Company',
      description: newCompanyData.description || '',
      industry: newCompanyData.industry || 'Construction',
      status: 'active',
      annualRevenue: 0,
      location: newCompanyData.location || '',
      contact: {
        name: 'Admin',
        email: newCompanyData.contact?.email || '',
        phone: newCompanyData.contact?.phone || ''
      },
      address: newCompanyData.address || '',
      projectCount: 0,
      createdAt: new Date().toISOString(),
      logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(newCompanyData.name || 'NC')}&background=random`
    };

    await createCompany(newCompany);
    await refetchCompanies();
    setIsCreateModalOpen(false);
  };

  // Filter Logic
  const filteredCompanies = companies.filter(company => {
    // 1. Search (Debounced)
    const matchesSearch = debouncedSearchQuery === '' ||
      company.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      (company.location && company.location.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));

    // 2. Status
    const matchesStatus = statusFilter === 'all' || company.status === statusFilter;

    // 3. Industry
    const matchesIndustry = industryFilter === 'all' ||
      (company.industry && company.industry.toLowerCase() === industryFilter.toLowerCase());

    // 4. Time Filter
    let matchesTime = true;
    const now = new Date();
    const companyDate = new Date(company.createdAt);

    let filterEnd: Date | null = null;
    const today = new Date(now.setHours(0, 0, 0, 0));

    switch (timeFilter) {
      case 'daily':
        filterEnd = new Date(today);
        filterEnd.setHours(23, 59, 59, 999);
        break;
      case 'weekly':
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
        endOfWeek.setHours(23, 59, 59, 999);
        filterEnd = endOfWeek;
        break;
      case 'monthly':
        filterEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'yearly':
        filterEnd = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
      case 'custom':
        if (customDateRange) {
          filterEnd = customDateRange.end;
          filterEnd.setHours(23, 59, 59, 999);
        }
        break;
    }

    if (filterEnd) {
      matchesTime = companyDate <= filterEnd;
    }

    return matchesSearch && matchesStatus && matchesIndustry && matchesTime;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#1D4F6D] border-t-transparent" />
        <p className="text-gray-500 font-medium">Loading companies...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <SEO title="Companies Management" description="Manage and monitor all construction companies and contractors on the FinisPro platform." />
      <CompaniesHeader
        onFilterChange={(filter) => {
          setTimeFilter(filter);
          if (filter !== 'custom') setCustomDateRange(null);
        }}
        onCustomDateChange={(start, end) => {
          setCustomDateRange({ start, end });
          setTimeFilter('custom');
        }}
        onCreateCompany={() => setIsCreateModalOpen(true)}
      />

      <CompanyStats companies={filteredCompanies} stats={companyStats} />

      <CompanyFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        industryFilter={industryFilter}
        onIndustryChange={setIndustryFilter}
      >
        <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
          <button
            onClick={() => setView('grid')}
            className={`rounded-lg px-3 py-2 text-sm font-bold transition-all flex items-center gap-2 ${view === 'grid' ? 'bg-white text-[#1D4F6D] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            onClick={() => setView('table')}
            className={`rounded-lg px-3 py-2 text-sm font-bold transition-all flex items-center gap-2 ${view === 'table' ? 'bg-white text-[#1D4F6D] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <Table2 className="h-4 w-4" />
            <span className="hidden sm:inline">List</span>
          </button>
        </div>
      </CompanyFilters>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
          {filteredCompanies.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400 font-bold">No companies found matching your criteria</p>
            </div>
          )}
        </div>
      ) : (
        <CompanyTable
          data={filteredCompanies.slice(0, 10)}
          pagination={{
            currentPage: 1,
            totalPages: Math.ceil(filteredCompanies.length / 10),
            totalResults: filteredCompanies.length,
            onPageChange: (page) => console.log('Page change:', page)
          }}
        />
      )}

      <CreateCompanyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateCompany={handleCreateCompany}
      />
    </div>
  );
}