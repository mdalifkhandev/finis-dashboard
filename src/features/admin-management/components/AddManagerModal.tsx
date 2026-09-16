import { useEffect, useState } from 'react';
import { Mail, Phone, User, Building2, Briefcase } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { apiClient, API_ENDPOINTS } from '@/services';

interface AddManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface OptionItem {
    id: string;
    name: string;
}

export function AddManagerModal({ isOpen, onClose }: AddManagerModalProps) {
    const [companies, setCompanies] = useState<OptionItem[]>([]);
    const [projects, setProjects] = useState<OptionItem[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        companies: [] as string[],
        projects: [] as string[]
    });

    useEffect(() => {
        if (!isOpen) return;
        void (async () => {
            try {
                const resComp = await apiClient.get<any>(API_ENDPOINTS.COMPANIES.LIST);
                const compList = Array.isArray(resComp?.data) ? resComp.data : (Array.isArray(resComp) ? resComp : []);
                setCompanies(compList.map((c: any) => ({ id: c.id, name: c.name })));
            } catch {
                setCompanies([]);
            }

            try {
                const resProj = await apiClient.get<any>(API_ENDPOINTS.PROJECTS.LIST);
                const projList = Array.isArray(resProj?.data) ? resProj.data : (Array.isArray(resProj) ? resProj : []);
                setProjects(projList.map((p: any) => ({ id: p.id, name: p.name })));
            } catch {
                setProjects([]);
            }
        })();
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
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
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Assigned Company</label>
                        <Select
                            placeholder="Select company"
                            value={formData.companies[0] || ''}
                            onChange={(e) => setFormData({ ...formData, companies: [e.target.value] })}
                            startIcon={<Building2 className="h-4 w-4" />}
                            options={[
                                { label: 'Select Company', value: '' },
                                ...companies.map(c => ({ label: c.name, value: c.id }))
                            ]}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Primary Project</label>
                        <Select
                            placeholder="Select project"
                            value={formData.projects[0] || ''}
                            onChange={(e) => setFormData({ ...formData, projects: [e.target.value] })}
                            startIcon={<Briefcase className="h-4 w-4" />}
                            options={[
                                { label: 'Select Project', value: '' },
                                ...projects.map(p => ({ label: p.name, value: p.id }))
                            ]}
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
