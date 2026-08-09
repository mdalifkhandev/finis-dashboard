import { useEffect, useState } from 'react';
import { useGetPayrollConfigQuery, useUpdatePayrollConfigMutation } from '@/store/payrollApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Save } from 'lucide-react';

export function PayrollSettingsForm() {
  const { data: config, isLoading } = useGetPayrollConfigQuery();
  const [updateConfig, { isLoading: isUpdating }] = useUpdatePayrollConfigMutation();

  const [formData, setFormData] = useState({
    cppEmployeeRate: 0,
    cppEmployerRate: 0,
    eiEmployeeRate: 0,
    eiEmployerRate: 0,
    federalTaxRate: 0,
    provincialTaxRate: 0,
    wsibRate: 0,
    vacationPayRate: 0,
  });

  useEffect(() => {
    if (config) {
      setFormData({
        cppEmployeeRate: config.employeeDeductions?.cppEmployeeRate || 0,
        cppEmployerRate: config.employerContributions?.cppEmployerRate || 0,
        eiEmployeeRate: config.employeeDeductions?.eiEmployeeRate || 0,
        eiEmployerRate: config.employerContributions?.eiEmployerRate || 0,
        federalTaxRate: config.employeeDeductions?.federalTaxRate || 0,
        provincialTaxRate: config.employeeDeductions?.provincialTaxRate || 0,
        wsibRate: config.employerContributions?.wsibRate || 0,
        vacationPayRate: config.employerContributions?.vacationPayRate || 0,
      });
    }
  }, [config]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // The API expects UpdatePayrollConfigDto with optional flat properties representing percentages
      await updateConfig({
        cppEmployeeRate: formData.cppEmployeeRate, 
        cppEmployerRate: formData.cppEmployerRate,
        eiEmployeeRate: formData.eiEmployeeRate,
        eiEmployerRate: formData.eiEmployerRate,
        federalTaxRate: formData.federalTaxRate,
        provincialTaxRate: formData.provincialTaxRate,
        wsibRate: formData.wsibRate,
        vacationPayRate: formData.vacationPayRate,
      }).unwrap();
      alert('Payroll configuration updated successfully!');
    } catch (err: any) {
      alert('Failed to update config: ' + (err.message || 'Unknown error'));
    }
  };

  if (isLoading) return <div>Loading config...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Canadian Payroll Deduction Rates</CardTitle>
        <CardDescription>Update the federal and provincial tax rates, CPP, EI, WSIB, and vacation pay percentages annually.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">CPP Employee Rate (%)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.cppEmployeeRate}
                onChange={(e) => handleChange('cppEmployeeRate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">CPP Employer Rate (%)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.cppEmployerRate}
                onChange={(e) => handleChange('cppEmployerRate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">EI Employee Rate (%)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.eiEmployeeRate}
                onChange={(e) => handleChange('eiEmployeeRate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">EI Employer Rate (%)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.eiEmployerRate}
                onChange={(e) => handleChange('eiEmployerRate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Federal Tax Rate (%)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.federalTaxRate}
                onChange={(e) => handleChange('federalTaxRate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Provincial Tax Rate (%)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.provincialTaxRate}
                onChange={(e) => handleChange('provincialTaxRate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">WSIB Rate (%)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.wsibRate}
                onChange={(e) => handleChange('wsibRate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Vacation Pay Rate (%)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.vacationPayRate}
                onChange={(e) => handleChange('vacationPayRate', e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" disabled={isUpdating} className="w-full md:w-auto">
            <Save className="mr-2 h-4 w-4" />
            {isUpdating ? 'Saving...' : 'Save Configuration'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
