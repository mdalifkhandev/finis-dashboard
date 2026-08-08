import { useState } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { Select } from '@/shared/components/ui/Select';
import { DatePicker } from '@/shared/components/ui/DatePicker';
import { Upload } from 'lucide-react';
interface AddWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export function AddWorkerModal({
  isOpen,
  onClose
}: AddWorkerModalProps) {
  const [startDate, setStartDate] = useState<Date | undefined>();

  return <Modal isOpen={isOpen} onClose={onClose} title="Add New Worker" className="max-w-2xl">
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 hover:bg-gray-100 cursor-pointer transition-colors">
          <Upload className="h-6 w-6 mb-1" />
          <span className="text-xs">Upload Photo</span>
        </div>
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                First Name
              </label>
              <Input placeholder="John" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Last Name
              </label>
              <Input placeholder="Doe" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Role</label>
          <Select placeholder="Select role" options={[{
            label: 'Site Manager',
            value: 'manager'
          }, {
            label: 'Engineer',
            value: 'engineer'
          }, {
            label: 'Electrician',
            value: 'electrician'
          }, {
            label: 'Carpenter',
            value: 'carpenter'
          }, {
            label: 'Laborer',
            value: 'laborer'
          }]} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Department
          </label>
          <Select placeholder="Select department" options={[{
            label: 'Construction',
            value: 'construction'
          }, {
            label: 'Electrical',
            value: 'electrical'
          }, {
            label: 'Plumbing',
            value: 'plumbing'
          }, {
            label: 'Management',
            value: 'management'
          }]} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <Input type="email" placeholder="john.doe@company.com" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Phone</label>
          <Input placeholder="+1 (555) 000-0000" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Address</label>
        <Input placeholder="123 Street Name, City, State" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Start Date
          </label>
          <DatePicker
            date={startDate}
            setDate={setStartDate}
            placeholder="Select start date"
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Hourly Rate
          </label>
          <Input type="number" placeholder="$0.00" />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onClose}>Add Worker</Button>
      </div>
    </div>
  </Modal>;
}