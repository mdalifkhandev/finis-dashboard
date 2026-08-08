import type React from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { DatePicker } from '@/shared/components/ui/DatePicker';
interface ReportIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export function ReportIncidentModal({
  isOpen,
  onClose
}: ReportIncidentModalProps) {
  return <Modal isOpen={isOpen} onClose={onClose} title="Report Safety Incident" className="max-w-2xl">
    <div className="space-y-6 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Date & Time
          </label>
          <DatePicker />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Location
          </label>
          <Input placeholder="e.g., Site A - Zone 3" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Severity
          </label>
          <Select options={[{
            value: 'critical',
            label: 'Critical'
          }, {
            value: 'high',
            label: 'High'
          }, {
            value: 'medium',
            label: 'Medium'
          }, {
            value: 'low',
            label: 'Low'
          }]} placeholder="Select severity" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Type</label>
          <Select options={[{
            value: 'injury',
            label: 'Injury'
          }, {
            value: 'near-miss',
            label: 'Near Miss'
          }, {
            value: 'property',
            label: 'Property Damage'
          }, {
            value: 'environmental',
            label: 'Environmental'
          }, {
            value: 'other',
            label: 'Other'
          }]} placeholder="Select type" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="Describe what happened..." />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Immediate Actions Taken
        </label>
        <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="Describe actions taken immediately after the incident..." />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onClose}>Submit Report</Button>
      </div>
    </div>
  </Modal>;
}