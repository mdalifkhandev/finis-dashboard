import { ArrowRightLeft, AlertCircle, PlusCircle, Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { InventoryItem } from '@/shared/types/entities';

interface InventoryTableProps {
    items: InventoryItem[];
    searchQuery: string;
    onLogUsage: (item: InventoryItem) => void;
    onReportDamage: (item: InventoryItem) => void;
    onRestock?: (item: InventoryItem) => void;
    onEdit?: (item: InventoryItem) => void;
    onDelete?: (item: InventoryItem) => void;
}

export function InventoryTable({ items, searchQuery, onLogUsage, onReportDamage, onRestock, onEdit, onDelete }: InventoryTableProps) {
    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusStyle = (status: InventoryItem['status']) => {
        switch (status) {
            case 'in_stock':
                return 'bg-green-50 text-green-700 border-green-100 uppercase text-[10px] font-black tracking-widest';
            case 'low_stock':
                return 'bg-orange-50 text-orange-700 border-orange-100 uppercase text-[10px] font-black tracking-widest';
            case 'out_of_stock':
                return 'bg-red-50 text-red-700 border-red-100 uppercase text-[10px] font-black tracking-widest';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-100 uppercase text-[10px] font-black tracking-widest';
        }
    };

    const getStatusLabel = (status: InventoryItem['status']) => {
        return status.replace('_', ' ');
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Product / Category</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Current Stock</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Unit</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Threshold</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {filteredItems.map((item) => (
                        <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                            <td className="px-6 py-4">
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{item.name}</p>
                                    <p className="text-xs text-gray-400 font-medium">{item.category || 'Uncategorized'}</p>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`text-sm font-black ${item.quantity <= item.reorderThreshold ? 'text-orange-600' : 'text-gray-900'}`}>
                                    {item.quantity}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 font-medium">{item.unitType}</td>
                            <td className="px-6 py-4 text-sm text-gray-500 font-medium">{item.reorderThreshold}</td>
                            <td className="px-6 py-4">
                                <Badge variant="outline" className={getStatusStyle(item.status)}>
                                    {getStatusLabel(item.status)}
                                </Badge>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                                    {onRestock && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 gap-1 font-bold text-xs"
                                            title="Add Stock / Restock"
                                            onClick={() => onRestock(item)}
                                        >
                                            <PlusCircle className="h-3.5 w-3.5" /> + Stock
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-2 text-blue-600 hover:bg-blue-50 gap-1 font-bold text-xs"
                                        title="Log Usage"
                                        onClick={() => onLogUsage(item)}
                                    >
                                        <ArrowRightLeft className="h-3.5 w-3.5" /> Usage
                                    </Button>
                                    {onEdit && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 px-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 gap-1 font-bold text-xs"
                                            title="Edit Product & Quantity"
                                            onClick={() => onEdit(item)}
                                        >
                                            <Edit3 className="h-3.5 w-3.5" /> Edit
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-2 text-orange-600 hover:bg-orange-50 gap-1 font-bold text-xs"
                                        title="Report Damage"
                                        onClick={() => onReportDamage(item)}
                                    >
                                        <AlertCircle className="h-3.5 w-3.5" /> Damage
                                    </Button>
                                    {onDelete && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 px-2 text-gray-400 hover:text-red-600 hover:bg-red-50 font-bold text-xs"
                                            title="Delete Product"
                                            onClick={() => onDelete(item)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filteredItems.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-6 py-12 text-center">
                                <p className="text-gray-400 font-bold">No products found matching your search.</p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
