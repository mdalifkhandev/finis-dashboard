import { Search, Filter, FileText, Download, Eye, Trash2, Calendar, Upload } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Card } from '@/shared/components/ui/Card';

const workerDocuments = [
    { id: '1', name: 'Contract_2023.pdf', category: 'Legal', date: '2023-01-15', size: '2.4 MB', status: 'verified' },
    { id: '2', name: 'Identity_Card.png', category: 'Personal', date: '2023-01-12', size: '1.1 MB', status: 'verified' },
    { id: '3', name: 'Safety_Training_Cert.pdf', category: 'Certification', date: '2023-06-20', size: '3.5 MB', status: 'verified' },
    { id: '4', name: 'Tax_Declaration_2023.pdf', category: 'Financial', date: '2023-03-05', size: '1.8 MB', status: 'pending' },
];

export function WorkerDocuments() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#1D4F6D] transition-colors" />
                    <Input
                        placeholder="Search documents..."
                        className="pl-10 h-11 border-gray-100 bg-gray-50/50 focus:bg-white transition-all rounded-xl"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" className="gap-2 h-11 border-gray-100 text-gray-600 hover:text-gray-900 font-bold rounded-xl px-6">
                        <Filter className="h-4 w-4" />
                        Filter
                    </Button>
                    <Button className="gap-2 h-11 bg-[#1D4F6D] hover:bg-[#163a50] text-white shadow-md flex-1 md:flex-none font-bold rounded-xl px-6">
                        <Upload className="h-4 w-4" />
                        Upload New
                    </Button>
                </div>
            </div>

            <Card className="overflow-hidden border-gray-100 shadow-sm rounded-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Document</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden md:table-cell">Category</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden sm:table-cell">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {workerDocuments.map((doc) => (
                                <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-[#1D4F6D] transition-colors">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{doc.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">{doc.size}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell">
                                        <span className="inline-flex items-center rounded-lg bg-blue-50/50 px-2.5 py-1 text-xs font-bold text-[#1D4F6D] border border-blue-100/50">
                                            {doc.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 hidden sm:table-cell">
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2 w-2 rounded-full ${doc.status === 'verified' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                            <span className="text-xs font-bold text-gray-600 capitalize">{doc.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {doc.date}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-[#1D4F6D] hover:bg-blue-50 rounded-lg">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
