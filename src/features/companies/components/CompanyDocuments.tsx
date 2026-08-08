import { useMemo, useRef, useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { FileText, Download, Eye, Trash2, Search, Filter, ShieldCheck } from 'lucide-react';
import { Input } from '@/shared/components/ui/Input';
import type { CompanyDocumentResponse } from '@/store/companiesApi';
import { mapBackendDocumentToView } from '@/store/companiesApi';
import { useDeleteCompanyDocumentMutation, useUploadCompanyDocumentMutation } from '@/store/companiesApi';
import { getFullUrl } from '@/shared/utils';

interface CompanyDocumentsProps {
    documents?: CompanyDocumentResponse[];
    companyId: string;
}

export function CompanyDocuments({ documents, companyId }: CompanyDocumentsProps) {
    const docs = documents?.map(mapBackendDocumentToView) ?? [];
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadCompanyDocument, { isLoading: isUploading }] = useUploadCompanyDocumentMutation();
    const [deleteCompanyDocument, { isLoading: isDeleting }] = useDeleteCompanyDocumentMutation();
    const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const formatUploadedAt = (value?: string | null) => {
        if (!value) return '—';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        }).format(date);
    };

    const filteredDocs = useMemo(() => {
        return docs.filter((doc) => {
            const fields = [doc.name, doc.category, doc.author]
                .filter(Boolean)
                .map((value) => value.toLowerCase());
            const matchesSearch =
                searchTerm.trim().length === 0 ||
                fields.some((value) => value.includes(searchTerm.toLowerCase()));
            const matchesCategory =
                categoryFilter === 'all' || doc.category.toLowerCase() === categoryFilter.toLowerCase();
            return matchesSearch && matchesCategory;
        });
    }, [docs, searchTerm, categoryFilter]);

    const availableCategories = useMemo(
        () => Array.from(new Set(docs.map((doc) => doc.category).filter(Boolean))),
        [docs],
    );

    const openDocument = (url?: string | null) => {
        if (!url) return;
        const finalUrl = getFullUrl(url);
        window.open(finalUrl, '_blank', 'noopener,noreferrer');
    };

    const downloadDocument = (url?: string | null, fileName?: string) => {
        if (!url) return;
        const finalUrl = getFullUrl(url);
        fetch(finalUrl)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Download failed');
                }
                return response.blob();
            })
            .then((blob) => {
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = fileName || 'document';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
            })
            .catch(() => {
                window.open(finalUrl, '_blank', 'noopener,noreferrer');
            });
    };

    const handleUpload = async () => {
        const file = fileInputRef.current?.files?.[0];
        if (!file) return;
        await uploadCompanyDocument({ companyId, file }).unwrap();
        setSelectedFileName(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDelete = async (documentId: string) => {
        const confirmed = window.confirm('Are you sure you want to delete this document?');
        if (!confirmed) return;
        await deleteCompanyDocument({ companyId, documentId }).unwrap();
    };

    const FilterPanel = (
        <Card className="border-gray-100 bg-white/90 p-4 shadow-sm">
            <div className="grid gap-3 md:grid-cols-2">
                <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Category
                    </label>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#1D4F6D]"
                    >
                        <option value="all">All categories</option>
                        {availableCategories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex items-end">
                    <Button
                        variant="outline"
                        className="h-10 border-gray-200 text-gray-600 hover:text-gray-900"
                        onClick={() => {
                            setSearchTerm('');
                            setCategoryFilter('all');
                        }}
                    >
                        Reset filters
                    </Button>
                </div>
            </div>
        </Card>
    );

    const Header = (
        <div className="flex flex-col gap-4 justify-between md:flex-row md:items-center">
            <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search company documents..."
                    className="h-10 border-gray-200 pl-10"
                />
            </div>
            <div className="flex w-full gap-2 md:w-auto">
                <Button
                    variant="outline"
                    className="h-10 gap-2 border-gray-200 text-gray-600 hover:text-gray-900"
                    onClick={() => setIsFilterOpen((open) => !open)}
                >
                    <Filter className="h-4 w-4" />
                    Filter
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => setSelectedFileName(e.target.files?.[0]?.name ?? null)}
                />
                <Button
                    className="flex-1 gap-2 bg-[#1D4F6D] text-white shadow-md hover:bg-[#163a50] md:flex-none h-10"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <FileText className="h-4 w-4" />
                    {selectedFileName ? selectedFileName : 'Upload Document'}
                </Button>
                <Button
                    variant="outline"
                    className="h-10 border-gray-200 text-gray-600 hover:text-gray-900"
                    disabled={!selectedFileName || isUploading}
                    onClick={handleUpload}
                >
                    {isUploading ? 'Uploading...' : 'Save'}
                </Button>
            </div>
        </div>
    );

    if (docs.length === 0) {
        return (
            <div className="space-y-6">
                {Header}
                {isFilterOpen && FilterPanel}
                <Card className="border-dashed border-gray-200 bg-white/80">
                    <div className="px-6 py-12 text-center">
                        <FileText className="mx-auto h-10 w-10 text-gray-300" />
                        <p className="mt-4 text-sm font-semibold text-gray-900">No company documents found</p>
                        <p className="mt-1 text-sm text-gray-500">Upload a document to populate this tab with real files.</p>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {Header}
            {isFilterOpen && FilterPanel}

            <Card className="overflow-hidden rounded-xl border-gray-100 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Document Name</th>
                                <th className="hidden px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 md:table-cell">Category</th>
                                <th className="hidden px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 sm:table-cell">Author</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Upload Date</th>
                                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {filteredDocs.map((doc) => (
                                <tr key={doc.id} className="group transition-colors hover:bg-gray-50/50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-gray-50 p-2 transition-colors group-hover:bg-blue-50">
                                                <FileText className="h-5 w-5 text-gray-400 group-hover:text-[#1D4F6D]" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold leading-tight text-gray-900">{doc.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="hidden px-6 py-4 md:table-cell">
                                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-[#1D4F6D]">
                                            {doc.category}
                                        </span>
                                    </td>
                                    <td className="hidden px-6 py-4 sm:table-cell">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-gray-100">
                                                <ShieldCheck className="h-3 w-3 text-gray-400" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-600">{doc.author}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-500">{formatUploadedAt(doc.date)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-gray-400 hover:bg-blue-50 hover:text-[#1D4F6D]"
                                                disabled={!doc.url}
                                                onClick={() => openDocument(doc.url)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-gray-400 hover:bg-green-50 hover:text-green-600"
                                                disabled={!doc.url}
                                                onClick={() => downloadDocument(doc.url, doc.name)}
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-gray-400 hover:bg-red-50 hover:text-red-600"
                                                disabled={isDeleting}
                                                onClick={() => handleDelete(doc.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredDocs.length === 0 && (
                                <tr>
                                    <td className="px-6 py-10 text-center text-sm text-gray-500" colSpan={5}>
                                        No documents match the current filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
