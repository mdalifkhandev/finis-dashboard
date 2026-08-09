import { useState } from 'react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Tabs } from '@/shared/components/ui/Tabs';
import { PayrollDashboard } from '../components/PayrollDashboard';
import { PayrollReportList } from '../components/PayrollReportList';
import { PayrollSettingsForm } from '../components/PayrollSettingsForm';
import { Calculator } from 'lucide-react';

export function PayrollPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll Management"
        description="Manage Canadian payroll formulas, view summaries, and export reports."
        icon={Calculator}
      />

      <Tabs
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'reports', label: 'Reports & Export' },
          { id: 'settings', label: 'Deduction Rates' },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="mt-6">
        {activeTab === 'overview' && <PayrollDashboard />}
        {activeTab === 'reports' && <PayrollReportList />}
        {activeTab === 'settings' && <PayrollSettingsForm />}
      </div>
    </div>
  );
}
