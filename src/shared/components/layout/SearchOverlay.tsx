import { Search, Building2, Users, HardHat, FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
    id: string;
    title: string;
    category: 'Project' | 'Company' | 'Worker' | 'Report';
    path: string;
}

interface SearchOverlayProps {
    query: string;
    results: SearchResult[];
    onClose: () => void;
}

export function SearchOverlay({ query, results, onClose }: SearchOverlayProps) {
    const navigate = useNavigate();

    const getIcon = (category: SearchResult['category']) => {
        switch (category) {
            case 'Project': return <Building2 className="h-4 w-4 text-blue-600" />;
            case 'Company': return <Users className="h-4 w-4 text-purple-600" />;
            case 'Worker': return <HardHat className="h-4 w-4 text-emerald-600" />;
            default: return <FileText className="h-4 w-4 text-[#1D4F6D]" />;
        }
    };

    const handleClick = (path: string) => {
        navigate(path);
        onClose();
    };

    if (!query) return null;

    return (
        <div className="absolute left-0 top-[calc(100%+8px)] w-full bg-white rounded-2xl shadow-[0_24px_64px_-16px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 z-[100]">
            <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-[#1D4F6D] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/10">
                        <Search className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-[13px] font-black text-gray-900 leading-none">Global Discovery</p>
                        <p className="text-[9px] text-gray-400 font-bold mt-1">Found matching data for "{query}"</p>
                    </div>
                </div>
                <div className="px-2 py-0.5 rounded-md bg-blue-50 text-[#1D4F6D] font-bold text-[9px]">{results.length} total found</div>
            </div>

            <div className="max-h-[340px] overflow-y-auto divide-y divide-gray-50 custom-scrollbar p-1.5 flex flex-col gap-0.5">
                {results.length === 0 ? (
                    <div className="p-10 text-center">
                        <div className="h-14 w-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Search className="h-5 w-5 text-gray-300" />
                        </div>
                        <p className="text-[11px] font-bold text-gray-400">No records matching "{query}"</p>
                    </div>
                ) : (
                    results.map((result) => (
                        <div
                            key={result.id}
                            onClick={() => handleClick(result.path)}
                            className="p-3 flex items-center justify-between cursor-pointer transition-all hover:bg-gray-50 rounded-xl group relative overflow-hidden"
                        >
                            {/* Brand Navy Indicator */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-[#1D4F6D] rounded-r-full transition-all group-hover:h-8" />

                            <div className="flex items-center gap-4 pl-1">
                                <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center border border-transparent group-hover:bg-white transition-colors">
                                    {getIcon(result.category)}
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <p className="text-[12px] font-black text-gray-900 group-hover:text-[#1D4F6D] transition-colors">{result.title}</p>
                                    <p className="text-[9px] text-gray-400 font-bold group-hover:text-gray-500 transition-colors">{result.category}</p>
                                </div>
                            </div>
                            <div className="h-8 w-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-[#1D4F6D]/5 transform translate-x-1 group-hover:translate-x-0">
                                <ArrowRight className="h-3.5 w-3.5 text-[#1D4F6D]" />
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-3 bg-[#1D4F6D] flex items-center justify-center">
                <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em] leading-none">Press Enter to list all entries</span>
            </div>
        </div>
    );
}
