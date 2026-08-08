import { InventoryLog } from '@/shared/types/entities';
import { ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface UsageLogTableProps {
    logs: InventoryLog[];
    searchQuery: string;
}

export function UsageLogTable({ logs, searchQuery }: UsageLogTableProps) {
    const filteredLogs = logs.filter(log =>
        log.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.handledByName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Type / Date</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Product</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Qty Change</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Project / Task</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Handled By</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Notes</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-blue-50/30 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${log.type === 'usage' ? 'bg-orange-50 text-orange-600' :
                                        log.type === 'restock' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                                        }`}>
                                        {log.type === 'usage' ? <ArrowDownRight className="h-4 w-4" /> :
                                            log.type === 'restock' ? <ArrowUpRight className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-gray-900 uppercase tracking-tight">
                                            {log.type}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">
                                            {format(new Date(log.timestamp), 'MMM dd, HH:mm')}
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-gray-900">{log.itemName}</td>
                            <td className="px-6 py-4">
                                <span className={`text-sm font-black ${log.quantityMoved < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {log.quantityMoved > 0 ? `+${log.quantityMoved}` : log.quantityMoved}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{log.projectName || 'General'}</p>
                                    <p className="text-xs text-gray-400 font-medium">{log.taskName || 'N/A'}</p>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 border border-gray-200">
                                        {log.handledByName.charAt(0)}
                                    </div>
                                    <span className="text-sm font-bold text-gray-700">{log.handledByName}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-xs text-gray-500 italic max-w-xs truncate">{log.notes}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
