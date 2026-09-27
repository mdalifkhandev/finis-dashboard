import { useState, useEffect } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    projects: { id: string; name: string }[];
    onAdd: (item: { projectId: string; name: string; category?: string; location?: string; currentQty?: number; minStockQty?: number; unit?: string }) => void;
}

export function AddProductModal({ isOpen, onClose, onAdd, projects }: AddProductModalProps) {
    const [projectId, setProjectId] = useState('');
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unitType, setUnitType] = useState('Units');
    const [threshold, setThreshold] = useState('5');

    // Auto-select if there is only 1 project
    useEffect(() => {
        if (projects.length === 1 && (!projectId || !projects.some(p => p.id === projectId))) {
            setProjectId(projects[0].id);
        }
    }, [projects, projectId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            projectId,
            name,
            category,
            currentQty: Number(quantity),
            unit: unitType,
            minStockQty: Number(threshold),
        });
        // Reset
        setProjectId('');
        setName('');
        setCategory('');
        setQuantity('');
        setUnitType('Units');
        setThreshold('5');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Product">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Project</label>
                    <select
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        required
                        className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-400"
                    >
                        {projects.length === 0 ? (
                            <option value="">No projects found</option>
                        ) : (
                            <option value="">Select a project</option>
                        )}
                        {projects.map((project) => (
                            <option key={project.id} value={project.id}>
                                {project.name}
                            </option>
                        ))}
                    </select>
                    {projects.length === 0 && (
                        <p className="text-xs text-amber-600 mt-1">
                            No projects found for your company. Please create a project first.
                        </p>
                    )}
                </div>
                <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Product Name</label>
                    <Input
                        placeholder="e.g. Concrete Mix, Steel Bars"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Category</label>
                    <Input
                        placeholder="e.g. Structural, Finishing"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-bold text-gray-700 block mb-1">Initial Quantity</label>
                        <Input
                            type="number"
                            placeholder="0"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-700 block mb-1">Unit Type</label>
                        <Input
                            placeholder="e.g. Pkgs, Ltrs, Units"
                            value={unitType}
                            onChange={(e) => setUnitType(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Reorder Threshold</label>
                    <Input
                        type="number"
                        placeholder="5"
                        value={threshold}
                        onChange={(e) => setThreshold(e.target.value)}
                        required
                    />
                    <p className="text-[10px] text-gray-400 mt-1 font-medium">System will alert you when stock falls below this level.</p>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8">Add Product</Button>
                </div>
            </form>
        </Modal>
    );
}
