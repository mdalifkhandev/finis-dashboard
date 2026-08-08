import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Label } from '@/shared/components/ui/Label';
import { Textarea } from '@/shared/components/ui/Textarea';
import { Mail, Send } from 'lucide-react';

interface MessageWorkerModalProps {
    isOpen: boolean;
    onClose: () => void;
    workerName: string;
}

export function MessageWorkerModal({ isOpen, onClose, workerName }: MessageWorkerModalProps) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Sending message to', workerName);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Message ${workerName}`}
            maxWidth="lg"
            className="p-0 overflow-hidden"
        >
            <div className="bg-[#1D4F6D] p-8 text-white -mt-6 -mx-6 mb-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Direct Message</h2>
                        <p className="text-blue-100/70">Communicate directly with {workerName}.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="subject" className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subject</Label>
                        <Input
                            id="subject"
                            placeholder="What do you want to discuss?"
                            className="h-11 border-gray-100 bg-gray-50 focus:bg-white transition-all rounded-xl"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message" className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Message</Label>
                        <Textarea
                            id="message"
                            placeholder="Type your message here..."
                            className="min-h-[150px] border-gray-100 bg-gray-50 focus:bg-white transition-all rounded-xl resize-none"
                            required
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-50">
                    <Button type="button" variant="ghost" onClick={onClose} className="px-6 font-bold text-gray-400 hover:text-gray-600">
                        Cancel
                    </Button>
                    <Button type="submit" className="px-8 bg-[#1D4F6D] hover:bg-[#163a50] text-white shadow-lg transition-all gap-2 font-bold">
                        <Send className="h-4 w-4" />
                        Send Message
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
