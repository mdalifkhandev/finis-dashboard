import { useState, useEffect } from 'react';
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

interface RestockModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: InventoryItem;
    onRestock: (restock: { itemId: string; quantity: number; notes?: string }) => void;
}

export function RestockModal({ isOpen, onClose, item, onRestock }: RestockModalProps) {
    const [quantity, setQuantity] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const qty = Number(quantity);
        if (qty <= 0) return;
        onRestock({
            itemId: item.id,
            quantity: qty,
            notes: notes.trim() || undefined,
        });
        setQuantity('');
        setNotes('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Restock / Add Stock: ${item.name}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-emerald-800 font-bold">Current Stock Level:</span>
                    <span className="text-emerald-900 font-black text-sm">{item.quantity} {item.unitType}</span>
                </div>
                <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">
                        Quantity to Add ({item.unitType}) <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="number"
                        min="1"
                        step="any"
                        placeholder="e.g. 50"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Reason / Supplier / Notes (Optional)</label>
                    <Input
                        placeholder="e.g. Received new shipment from vendor"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8">
                        Add to Stock
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

interface EditProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: InventoryItem;
    onUpdate: (updated: {
        id: string;
        name: string;
        category?: string;
        currentQty: number;
        minStockQty: number;
        unit?: string;
    }) => void;
}

export function EditProductModal({ isOpen, onClose, item, onUpdate }: EditProductModalProps) {
    const [name, setName] = useState(item.name);
    const [category, setCategory] = useState(item.category || '');
    const [quantity, setQuantity] = useState(String(item.quantity));
    const [unitType, setUnitType] = useState(item.unitType || 'Units');
    const [threshold, setThreshold] = useState(String(item.reorderThreshold || 5));

    useEffect(() => {
        setName(item.name);
        setCategory(item.category || '');
        setQuantity(String(item.quantity));
        setUnitType(item.unitType || 'Units');
        setThreshold(String(item.reorderThreshold || 5));
    }, [item]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate({
            id: item.id,
            name: name.trim(),
            category: category.trim() || undefined,
            currentQty: Number(quantity),
            minStockQty: Number(threshold),
            unit: unitType.trim() || undefined,
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit Product: ${item.name}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Product Name</label>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Category</label>
                    <Input
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="e.g. Structural, Finishing"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-bold text-gray-700 block mb-1">Current Stock Quantity</label>
                        <Input
                            type="number"
                            min="0"
                            step="any"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-700 block mb-1">Unit</label>
                        <Input
                            value={unitType}
                            onChange={(e) => setUnitType(e.target.value)}
                            placeholder="e.g. Kg, Bags, Units"
                            required
                        />
                    </div>
                </div>
                <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Low Stock Threshold</label>
                    <Input
                        type="number"
                        min="0"
                        step="any"
                        value={threshold}
                        onChange={(e) => setThreshold(e.target.value)}
                        required
                    />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8">
                        Save Changes
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
