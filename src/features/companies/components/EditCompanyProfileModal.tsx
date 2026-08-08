import React from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Label } from '@/shared/components/ui/Label';
import { Textarea } from '@/shared/components/ui/Textarea';
import { Building2, Save } from 'lucide-react';
import { Company } from '@/shared/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/Avatar';
import { getFullUrl } from '@/shared/utils';

interface EditCompanyProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    company: Company;
    onSave: (data: {
        name: string;
        industry: string;
        description: string;
        phone: string;
        email: string;
        website: string;
        address: string;
        annualRevenue?: number;
        logoFile?: File | null;
    }) => Promise<void> | void;
    isSubmitting?: boolean;
}

export function EditCompanyProfileModal({ isOpen, onClose, company, onSave, isSubmitting }: EditCompanyProfileModalProps) {
    const [logoFile, setLogoFile] = React.useState<File | null>(null);
    const [logoPreview, setLogoPreview] = React.useState(getFullUrl(company.logo));

    React.useEffect(() => {
        if (!isOpen) return;
        setLogoFile(null);
        setLogoPreview(getFullUrl(company.logo));
    }, [company.logo, isOpen]);

    React.useEffect(() => {
        if (!logoFile) {
            setLogoPreview(getFullUrl(company.logo));
            return;
        }

        const objectUrl = URL.createObjectURL(logoFile);
        setLogoPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [company.logo, logoFile]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const annualRevenueValue = String(formData.get('annualRevenue') || '').trim();

        await onSave({
            name: String(formData.get('name') || '').trim(),
            industry: String(formData.get('industry') || '').trim(),
            description: String(formData.get('description') || '').trim(),
            phone: String(formData.get('phone') || '').trim(),
            email: String(formData.get('email') || '').trim(),
            website: String(formData.get('website') || '').trim(),
            address: String(formData.get('address') || '').trim(),
            annualRevenue: annualRevenueValue ? Number(annualRevenueValue) : undefined,
            logoFile,
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Company Profile"
            maxWidth="2xl"
            className="overflow-hidden p-0"
        >
            <div className="-mx-6 -mt-6 mb-6 bg-[#1D4F6D] p-8 text-white">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                        <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Company Profile</h2>
                        <p className="text-blue-100/70">Update official information for {company.name}.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-h-[60vh] space-y-8 overflow-y-auto pr-4">
                <div className="flex flex-col items-center gap-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 sm:flex-row sm:items-center">
                    <Avatar className="h-24 w-24 rounded-2xl border-4 border-white shadow-xl">
                        <AvatarImage src={logoPreview} />
                        <AvatarFallback className="bg-blue-50 text-2xl font-black text-blue-600">
                            {company.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="text-center sm:text-left">
                        <p className="text-sm font-black text-gray-900">Company Logo</p>
                        <p className="text-xs text-gray-500">Upload a new logo to update the company profile in one save.</p>
                        <div className="mt-3">
                            <Label htmlFor="logo" className="sr-only">Company logo</Label>
                            <Input
                                id="logo"
                                name="logo"
                                type="file"
                                accept="image/*"
                                onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)}
                                className="h-11 rounded-xl border-gray-100 bg-white font-medium"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-gray-400">Company Name</Label>
                        <Input id="name" name="name" defaultValue={company.name} className="h-12 rounded-xl border-gray-100 bg-gray-50 font-medium transition-all focus:bg-white" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="industry" className="text-xs font-bold uppercase tracking-widest text-gray-400">Industry</Label>
                        <Input id="industry" name="industry" defaultValue={company.industry || ''} className="h-12 rounded-xl border-gray-100 bg-gray-50 font-medium transition-all focus:bg-white" required />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-gray-400">Description</Label>
                        <Textarea id="description" name="description" defaultValue={company.description || ''} className="min-h-[120px] resize-none rounded-xl border-gray-100 bg-gray-50 font-medium leading-relaxed transition-all focus:bg-white" required />
                    </div>
                </div>

                <div className="space-y-6 border-t border-gray-100 pt-6">
                    <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[#1D4F6D]">Contact Details</h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-gray-400">Phone</Label>
                            <Input id="phone" name="phone" defaultValue={company.contact.phone || ''} className="h-12 rounded-xl border-gray-100 bg-gray-50 font-medium transition-all focus:bg-white" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-gray-400">Email</Label>
                            <Input id="email" name="email" type="email" defaultValue={company.contact.email || ''} className="h-12 rounded-xl border-gray-100 bg-gray-50 font-medium transition-all focus:bg-white" />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="website" className="text-xs font-bold uppercase tracking-widest text-gray-400">Website</Label>
                            <Input
                                id="website"
                                name="website"
                                type="text"
                                inputMode="url"
                                placeholder="example.com or https://example.com"
                                defaultValue={company.publicLink?.url || ''}
                                className="h-12 rounded-xl border-gray-100 bg-gray-50 font-medium transition-all focus:bg-white"
                            />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="address" className="text-xs font-bold uppercase tracking-widest text-gray-400">Office Address</Label>
                            <Input id="address" name="address" defaultValue={company.address || ''} className="h-12 rounded-xl border-gray-100 bg-gray-50 font-medium transition-all focus:bg-white" />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="annualRevenue" className="text-xs font-bold uppercase tracking-widest text-gray-400">Annual Revenue</Label>
                            <Input
                                id="annualRevenue"
                                name="annualRevenue"
                                type="number"
                                min="0"
                                step="0.01"
                                defaultValue={company.annualRevenue ?? ''}
                                className="h-12 rounded-xl border-gray-100 bg-gray-50 font-medium transition-all focus:bg-white"
                            />
                        </div>
                    </div>
                </div>

                <div className="sticky bottom-0 mt-4 flex justify-end gap-3 border-t border-gray-100 bg-white pb-2 pt-6">
                    <Button type="button" variant="ghost" onClick={onClose} className="px-6 font-bold text-gray-400 hover:text-gray-600">
                        Cancel
                    </Button>
                    <Button type="submit" className="gap-2 bg-[#1D4F6D] px-10 font-bold text-white shadow-xl transition-all hover:bg-[#163a50]" disabled={isSubmitting}>
                        <Save className="h-4 w-4" />
                        {isSubmitting ? 'Saving...' : 'Save Profile'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
