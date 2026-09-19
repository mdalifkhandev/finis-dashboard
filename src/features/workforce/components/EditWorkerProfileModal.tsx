import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Label } from '@/shared/components/ui/Label';
import { User, Save, Upload, Loader2 } from 'lucide-react';
import { Worker } from '@/shared/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/Avatar';
import { useState } from 'react';
import { apiClient } from '@/services';

interface EditWorkerProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    worker: Worker;
}

export function EditWorkerProfileModal({ isOpen, onClose, worker }: EditWorkerProfileModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const form = e.currentTarget;
        const fullName = (form.querySelector('#name') as HTMLInputElement).value;
        const role = (form.querySelector('#role') as HTMLInputElement).value;
        const phone = (form.querySelector('#phone') as HTMLInputElement).value;
        const hourlyRate = (form.querySelector('#hourlyRate') as HTMLInputElement).value;

        try {
            const userIdToUpdate = (worker as any).id || (worker as any).memberId;
            await apiClient.patch(`/super_admin/team/users/${userIdToUpdate}`, {
                fullName,
                role,
                phone,
                hourlyRate
            });
            // Force a reload to reflect new data
            window.location.reload();
        } catch (error) {
            console.error('Failed to update worker profile', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Worker Profile"
            maxWidth="2xl"
            className="p-0 overflow-hidden"
        >
            <div className="bg-[#1D4F6D] p-8 text-white -mt-6 -mx-6 mb-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Worker Profile</h2>
                        <p className="text-blue-100/70">Update personal and professional details for {worker.name}.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 max-h-[60vh] overflow-y-auto px-1 pr-4">
                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Avatar className="h-20 w-20 rounded-2xl border-4 border-white shadow-xl">
                        <AvatarImage src={worker.avatar} />
                        <AvatarFallback className="text-xl font-black bg-blue-50 text-blue-600">
                            {worker.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 text-center sm:text-left">
                        <p className="text-sm font-black text-gray-900">Profile Photo</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">PNG, JPG up to 5MB</p>
                        <div className="pt-2 flex gap-2 justify-center sm:justify-start">
                            <Button type="button" size="sm" variant="outline" className="h-9 gap-2 border-gray-200 font-bold bg-white rounded-lg">
                                <Upload className="h-3.5 w-3.5" />
                                Change
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</Label>
                        <Input
                            id="name"
                            defaultValue={worker.name}
                            className="h-12 border-gray-100 bg-gray-50 focus:bg-white transition-all rounded-xl font-medium"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role" className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Job Role</Label>
                        <Input
                            id="role"
                            defaultValue={worker.role}
                            className="h-12 border-gray-100 bg-gray-50 focus:bg-white transition-all rounded-xl font-medium"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            defaultValue={worker.email}
                            className="h-12 border-gray-100 bg-gray-50 focus:bg-white transition-all rounded-xl font-medium"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</Label>
                        <Input
                            id="phone"
                            defaultValue={worker.phone}
                            className="h-12 border-gray-100 bg-gray-50 focus:bg-white transition-all rounded-xl font-medium"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-black text-[#1D4F6D] uppercase tracking-widest flex items-center gap-2">
                        Professional Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="hourlyRate" className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hourly Rate ($)</Label>
                            <Input
                                id="hourlyRate"
                                type="number"
                                defaultValue={worker.hourlyRate}
                                className="h-12 border-gray-100 bg-gray-50 focus:bg-white transition-all rounded-xl font-medium"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="project" className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assigned Project</Label>
                            <Input
                                id="project"
                                defaultValue={worker.assignedProject || ''}
                                className="h-12 border-gray-100 bg-gray-50 focus:bg-white transition-all rounded-xl font-medium"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                    <Button type="button" variant="outline" onClick={onClose} className="h-12 px-6 rounded-xl font-bold">
                        Cancel
                    </Button>
                    <Button type="submit" className="h-12 px-8 rounded-xl bg-[#1D4F6D] hover:bg-[#1D4F6D]/90 text-white font-bold gap-2" disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
