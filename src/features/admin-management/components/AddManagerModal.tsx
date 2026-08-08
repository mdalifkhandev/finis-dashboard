import { useState } from 'react';
import { Mail, Phone, User, Building2, Briefcase } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { mockProjects, mockCompanies } from '@/services/mock/mockData';

interface AddManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AddManagerModal({ isOpen, onClose }: AddManagerModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        companies: [] as string[],
        projects: [] as string[]
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Adding Manager:', formData);
        // In a real app, this would call an API
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Manager">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Full Name</label>
                        <Input
                            required
                            placeholder="e.g. John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            startIcon={<User className="h-4 w-4" />}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Email Address</label>
                            <Input
                                required
                                type="email"
                                placeholder="manager@finis.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                startIcon={<Mail className="h-4 w-4" />}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Phone Number</label>
                            <Input
                                required
                                placeholder="+1 (555) 000-0000"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                startIcon={<Phone className="h-4 w-4" />}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Assigned Companies</label>
                        <Select
                            placeholder="Select companies"
                            value={formData.companies[0] || ''}
                            onChange={(e) => setFormData({ ...formData, companies: [e.target.value] })}
                            startIcon={<Building2 className="h-4 w-4" />}
                            options={mockCompanies.map(c => ({ label: c.name, value: c.id }))}
                        />
                        <p className="mt-1 text-[10px] text-gray-400 font-medium italic">* In this demo, you can select one primary company.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Primary Project</label>
                        <Select
                            placeholder="Select project"
                            value={formData.projects[0] || ''}
                            onChange={(e) => setFormData({ ...formData, projects: [e.target.value] })}
                            startIcon={<Briefcase className="h-4 w-4" />}
                            options={mockProjects.map(p => ({ label: p.name, value: p.id }))}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button type="button" variant="outline" onClick={onClose} className="rounded-xl px-6 font-bold">
                        Cancel
                    </Button>
                    <Button type="submit" className="bg-[#1D4F6D] hover:bg-[#163a50] text-white rounded-xl px-8 font-bold shadow-lg">
                        Create Account
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
