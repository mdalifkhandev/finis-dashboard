import { useState } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { InventoryItem } from '@/shared/types/entities';

interface LogUsageModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: InventoryItem;
    onLog: (usage: { itemId: string; quantity: number; projectId?: string; taskName?: string; notes?: string }) => void;
}

export function LogUsageModal({ isOpen, onClose, item, onLog }: LogUsageModalProps) {
    const [quantity, setQuantity] = useState('');
    const [project, setProject] = useState('');
    const [task, setTask] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLog({
            itemId: item.id,
            quantity: Number(quantity),
            projectId: project,
            taskName: task,
            notes
        });
        setQuantity('');
        setProject('');
        setTask('');
        setNotes('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Log Usage: ${item.name}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-sm font-bold text-gray-700">Quantity to Deduct</label>
                        <span className="text-[10px] font-black text-gray-400 uppercase">Available: {item.quantity} {item.unitType}</span>
                    </div>
                    <Input
                        type="number"
                        placeholder="0"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        max={item.quantity}
                        required
                    />
                </div>
                <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Link to Project (Optional)</label>
                    <Input
                        placeholder="e.g. Grand View Apartment"
                        value={project}
                        onChange={(e) => setProject(e.target.value)}
                    />
                </div>
                <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Task Name (Optional)</label>
                    <Input
                        placeholder="e.g. Wall Plastering"
                        value={task}
                        onChange={(e) => setTask(e.target.value)}
                    />
                </div>
                <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Notes</label>
                    <Input
                        placeholder="e.g. Used for 2nd floor structural work"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8">Log Usage</Button>
                </div>
            </form>
        </Modal>
    );
}

interface ReportDamageModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: InventoryItem;
    onReport: (damage: { itemId: string; quantity: number; notes: string; accountability: string }) => void;
}

export function ReportDamageModal({ isOpen, onClose, item, onReport }: ReportDamageModalProps) {
    const [quantity, setQuantity] = useState('');
    const [accountability, setAccountability] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onReport({
            itemId: item.id,
            quantity: Number(quantity),
            accountability,
            notes
        });
        setQuantity('');
        setAccountability('');
        setNotes('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Report Damage: ${item.name}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-sm font-bold text-gray-700">Quantity Damaged</label>
                        <span className="text-[10px] font-black text-gray-400 uppercase">Available: {item.quantity} {item.unitType}</span>
                    </div>
                    <Input
                        type="number"
                        placeholder="0"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        max={item.quantity}
                        required
                    />
                </div>
                <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Accountable Person</label>
                    <Input
                        placeholder="e.g. John Doe (Site Manager)"
                        value={accountability}
                        onChange={(e) => setAccountability(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Reason / Notes</label>
                    <Input
                        placeholder="e.g. Water damage during storage"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        required
                    />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold px-8">Report Damage</Button>
                </div>
            </form>
        </Modal>
    );
}
