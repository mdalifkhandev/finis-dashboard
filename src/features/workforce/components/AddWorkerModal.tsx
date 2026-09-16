import { useState } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { Mail, Phone } from 'lucide-react';
import { useSendInviteMutation } from '@/store/teamManagementApi';

interface AddWorkerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AddWorkerModal({
    isOpen,
    onClose,
}: AddWorkerModalProps) {
    const [inviteMethod, setInviteMethod] = useState<'email' | 'phone'>('email');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [sendInvite, { isLoading }] = useSendInviteMutation();

    const handleInvite = async () => {
        setErrorMsg('');
        setSuccessMsg('');
        try {
            await sendInvite({
                ...(inviteMethod === 'email' ? { email: email.trim() } : { phone: phone.trim() }),
                role: 'worker',
            }).unwrap();
            setSuccessMsg('Worker invitation sent successfully!');
            setTimeout(() => {
                setEmail('');
                setPhone('');
                setErrorMsg('');
                setSuccessMsg('');
                onClose();
            }, 800);
        } catch (err: any) {
            console.error('Invite worker failed:', err);
            setErrorMsg(err?.data?.message || err?.message || 'Failed to send invitation. Please try again.');
        }
    };

    const handleClose = () => {
        setErrorMsg('');
        setSuccessMsg('');
        onClose();
    };

    const isDisabled =
        isLoading || (inviteMethod === 'email' ? !email.trim() : !phone.trim());

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Invite Worker">
            <div className="space-y-4">
                {/* Invite Method */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Invitation Method
                    </label>
                    <div className="flex gap-4">
                        <Button
                            variant={inviteMethod === 'email' ? 'default' : 'outline'}
                            onClick={() => {
                                setInviteMethod('email');
                                setErrorMsg('');
                            }}
                            className="flex-1"
                        >
                            <Mail className="w-4 h-4 mr-2" />
                            Email
                        </Button>
                        <Button
                            variant={inviteMethod === 'phone' ? 'default' : 'outline'}
                            onClick={() => {
                                setInviteMethod('phone');
                                setErrorMsg('');
                            }}
                            className="flex-1"
                        >
                            <Phone className="w-4 h-4 mr-2" />
                            Phone
                        </Button>
                    </div>
                </div>

                {/* Email or Phone */}
                {inviteMethod === 'email' ? (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Worker Email Address
                        </label>
                        <Input
                            type="email"
                            placeholder="worker@example.com"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (errorMsg) setErrorMsg('');
                            }}
                        />
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Worker Phone Number
                        </label>
                        <Input
                            type="tel"
                            placeholder="+1-XXX-XXX-XXXX"
                            value={phone}
                            onChange={(e) => {
                                setPhone(e.target.value);
                                if (errorMsg) setErrorMsg('');
                            }}
                        />
                    </div>
                )}

                {errorMsg && (
                    <div className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                        {errorMsg}
                    </div>
                )}

                {successMsg && (
                    <div className="text-sm font-medium text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                        {successMsg}
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleInvite} disabled={isDisabled}>
                        {isLoading ? 'Sending...' : 'Send Invitation'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}