import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { Card, CardContent } from '@/shared/components/ui/Card';
import { DamageReport } from '@/shared/types/entities';
import { format } from 'date-fns';
import { User, MapPin, AlertCircle, ImageIcon } from 'lucide-react';

interface DamageLogViewProps {
    reports: DamageReport[];
    onResolve: (id: string) => void;
}

export function DamageLogView({ reports, onResolve }: DamageLogViewProps) {
    return (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reports.map((report) => (
                <Card key={report.id} className="border-gray-100 shadow-sm overflow-hidden hover:border-red-200 transition-all group">
                    <CardContent className="p-0 flex flex-col sm:flex-row h-full">
                        {/* Image Preview */}
                        <div className="w-full sm:w-48 h-48 sm:h-auto bg-gray-100 relative shrink-0">
                            {report.photoUrl ? (
                                <img src={report.photoUrl} alt={report.itemName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                                    <ImageIcon className="h-8 w-8" />
                                    <span className="text-[10px] font-bold uppercase">No Image</span>
                                </div>
                            )}
                            <div className="absolute top-3 left-3">
                                <Badge variant="destructive" className="font-black uppercase text-[10px] tracking-widest shadow-lg">
                                    {report.status}
                                </Badge>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 p-5 flex flex-col">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-lg font-black text-gray-900 leading-tight">{report.itemName}</h4>
                                    <div className="flex items-center gap-1.5 mt-1 text-red-600 font-bold text-sm">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>{report.quantity} Units Damaged</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 space-y-2">
                                <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                    {report.projectName || 'General'}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                                    <User className="h-3.5 w-3.5 text-gray-400" />
                                    Reported by: <span className="text-gray-900">{report.reportedByName}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                                    <AlertCircle className="h-3.5 w-3.5 text-orange-500" />
                                    Accountable: <span className="text-gray-900">{report.accountability}</span>
                                </div>
                            </div>

                            <p className="mt-4 text-sm text-gray-600 font-medium line-clamp-2 italic">
                                "{report.notes}"
                            </p>

                            <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                                    {format(new Date(report.timestamp), 'MMM dd, yyyy')}
                                </span>
                                <Button
                                    size="sm"
                                    className="h-8 bg-gray-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest px-4 disabled:opacity-50"
                                    onClick={() => onResolve(report.id)}
                                    disabled={report.status === 'resolved'}
                                >
                                    {report.status === 'resolved' ? 'Resolved' : 'Resolve'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
            {reports.length === 0 && (
                <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                    <p className="text-gray-400 font-bold">No active damage reports.</p>
                </div>
            )}
        </div>
    );
}
