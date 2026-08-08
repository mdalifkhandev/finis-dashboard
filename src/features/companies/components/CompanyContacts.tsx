import { Plus, Mail, Phone, ShieldCheck, UserRound } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Card, CardContent } from '@/shared/components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/Avatar';
import { Badge } from '@/shared/components/ui/Badge';

interface CompanyContactItem {
    id: string;
    fullName: string;
    role?: string | null;
    email?: string | null;
    phone?: string | null;
    avatarUrl?: string | null;
    isPrimary?: boolean;
}

interface CompanyContactsProps {
    contacts?: CompanyContactItem[];
    companyEmail?: string | null;
}

const openMailClient = (email?: string | null) => {
    if (!email) return;
    window.location.href = `mailto:${email}`;
};

export function CompanyContacts({ contacts = [], companyEmail }: CompanyContactsProps) {
    if (contacts.length === 0) {
        return (
            <Card className="border-dashed border-gray-200 bg-white/80">
                <CardContent className="py-12 text-center">
                    <p className="text-sm font-semibold text-gray-900">No company contacts available</p>
                    <p className="mt-1 text-sm text-gray-500">Add a company contact in the backend profile data to show it here.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white/80 px-5 py-4 shadow-sm">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Company Contacts</h3>
                    <p className="text-sm text-gray-500">All members under this company and its projects</p>
                </div>
                <Button size="sm" className="gap-2 rounded-xl" variant="outline">
                    <Plus className="h-4 w-4" />
                    Add Contact
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {contacts.map((contact) => {
                    const emailTarget = contact.email || companyEmail;
                    const initials = contact.fullName.slice(0, 2).toUpperCase();
                    const roleLabel = contact.role || 'Company Contact';
                    const isOwner = contact.isPrimary;

                    return (
                        <Card key={contact.id} className="group overflow-hidden border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                            <CardContent className="p-0">
                                <div className="h-20 bg-gradient-to-r from-slate-50 via-blue-50 to-cyan-50" />
                                <div className="px-6 pb-6">
                                    <div className="flex items-end justify-between -mt-10">
                                        <Avatar className="h-20 w-20 rounded-2xl border-4 border-white shadow-lg ring-1 ring-gray-100">
                                        <AvatarImage src={contact.avatarUrl || undefined} />
                                            <AvatarFallback className="rounded-2xl bg-[#1D4F6D] text-white">{initials}</AvatarFallback>
                                        </Avatar>
                                        {isOwner && (
                                            <Badge variant="secondary" className="mb-2 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 border-emerald-100">
                                                <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                                                Primary
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="mt-4 space-y-2">
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-900">{contact.fullName}</h4>
                                            <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                                <UserRound className="h-3.5 w-3.5" />
                                                {roleLabel}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-5 space-y-3 rounded-2xl bg-gray-50/80 p-4">
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <Mail className="h-4 w-4 text-[#1D4F6D]" />
                                            <span className="truncate">{contact.email || emailTarget || 'Email unavailable'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <Phone className="h-4 w-4 text-[#1D4F6D]" />
                                            <span>{contact.phone || 'Phone unavailable'}</span>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex gap-2">
                                        <Button
                                            variant="outline"
                                            className="flex-1 gap-2 rounded-xl border-gray-200 text-xs font-semibold"
                                            size="sm"
                                            disabled={!emailTarget}
                                            onClick={() => openMailClient(emailTarget)}
                                        >
                                            <Mail className="h-3.5 w-3.5" />
                                            Email
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex-1 gap-2 rounded-xl border-gray-200 text-xs font-semibold"
                                            size="sm"
                                            disabled={!contact.phone}
                                            onClick={() => {
                                                if (contact.phone) window.location.href = `tel:${contact.phone}`;
                                            }}
                                        >
                                            <Phone className="h-3.5 w-3.5" />
                                            Call
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
