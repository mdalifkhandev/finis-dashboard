import React from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Label } from '@/shared/components/ui/Label';
import { Textarea } from '@/shared/components/ui/Textarea';
import { Mail, Send } from 'lucide-react';
import { useContactCompanyMutation } from '@/store/companiesApi';

interface ContactCompanyModalProps {
    isOpen: boolean;
    onClose: () => void;
    companyId: string;
    companyName: string;
    contactEmail?: string | null;
}

export function ContactCompanyModal({ isOpen, onClose, companyId, companyName, contactEmail }: ContactCompanyModalProps) {
    const [contactCompany, { isLoading }] = useContactCompanyMutation();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const subject = String(formData.get('subject') || '').trim();
        const message = String(formData.get('message') || '').trim();

        await contactCompany({ id: companyId, subject, message }).unwrap();
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Contact ${companyName}`}
            maxWidth="lg"
            className="overflow-hidden p-0"
        >
            <div className="-mx-6 -mt-6 mb-6 bg-[#1D4F6D] p-8 text-white">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                    <Mail className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold">Get in Touch</h2>
                <p className="mt-2 text-blue-100/70">
                    Send a direct message to {companyName}'s primary contact.
                </p>
                <p className="mt-3 text-xs text-blue-100/70">
                    {contactEmail ? `Message will be sent to ${contactEmail}` : 'No company email is available for this profile.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="subject" className="text-sm font-bold uppercase tracking-wider text-gray-700">Subject</Label>
                        <Input
                            id="subject"
                            name="subject"
                            placeholder="What is this regarding?"
                            className="h-11 rounded-lg border-gray-100 bg-gray-50 transition-all focus:bg-white"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message" className="text-sm font-bold uppercase tracking-wider text-gray-700">Message</Label>
                        <Textarea
                            id="message"
                            name="message"
                            placeholder="Type your message here..."
                            className="min-h-[150px] resize-none rounded-lg border-gray-100 bg-gray-50 transition-all focus:bg-white"
                            required
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-50 pt-4">
                    <Button type="button" variant="ghost" onClick={onClose} className="px-6 font-bold text-gray-400 hover:text-gray-600">
                        Cancel
                    </Button>
                    <Button type="submit" className="gap-2 bg-[#1D4F6D] px-8 text-white shadow-lg transition-all hover:bg-[#163a50]" disabled={isLoading || !contactEmail}>
                        <Send className="h-4 w-4" />
                        {isLoading ? 'Sending...' : 'Send Message'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
