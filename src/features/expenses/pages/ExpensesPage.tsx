import { useState } from 'react';
import { CheckCircle, XCircle, DollarSign, FileText, Search, ExternalLink } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Badge } from '@/shared/components/ui/Badge';
import { Table } from '@/shared/components/ui/Table';
import { Select } from '@/shared/components/ui/Select';
import { Modal } from '@/shared/components/ui/Modal';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/Avatar';
import { mockExpenses, mockProjects, mockTasks } from '@/services/mock/mockData';
import { Expense } from '@/shared/types';
import { getStatusColor } from '@/shared/utils';

export function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Local state for modal editing
    const [editProjectId, setEditProjectId] = useState('');
    const [editTaskId, setEditTaskId] = useState('');

    const filteredExpenses = expenses.filter(expense => {
        const matchesSearch = expense.workerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            expense.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleApprove = () => {
        if (!selectedExpense) return;

        const project = mockProjects.find(p => p.id === editProjectId);

        setExpenses(expenses.map(e =>
            e.id === selectedExpense.id ? {
                ...e,
                status: 'approved' as const,
                projectId: editProjectId || e.projectId,
                projectName: project?.name || e.projectName,
                taskId: editTaskId || e.taskId
            } : e
        ));
        setShowDetailModal(false);
    };

    const handleReject = (reason: string) => {
        if (!selectedExpense) return;
        setExpenses(expenses.map(e =>
            e.id === selectedExpense.id ? { ...e, status: 'rejected' as const, rejectionReason: reason } : e
        ));
        setShowDetailModal(false);
    };

    const openDetailModal = (expense: Expense) => {
        setSelectedExpense(expense);
        setEditProjectId(expense.projectId || '');
        setEditTaskId(expense.taskId || '');
        setShowDetailModal(true);
    };


    const pendingAmount = filteredExpenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <PageHeader
                title="Expense & Receipt Management"
                description="Review and approve worker expense submissions"
                icon={DollarSign}
            >
                <Button>Export Report</Button>
            </PageHeader>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-600">Pending Approval</div>
                            <div className="text-3xl font-bold text-yellow-600 mt-2">
                                {expenses.filter(e => e.status === 'pending').length}
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                            <FileText className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-600">Pending Amount</div>
                            <div className="text-2xl font-bold text-gray-900 mt-2">
                                ${pendingAmount.toFixed(2)}
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-600">Approved</div>
                            <div className="text-3xl font-bold text-green-600 mt-2">
                                {expenses.filter(e => e.status === 'approved').length}
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-600">Rejected</div>
                            <div className="text-3xl font-bold text-red-600 mt-2">
                                {expenses.filter(e => e.status === 'rejected').length}
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <XCircle className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card className="p-6">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Search by worker or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            startIcon={<Search className="w-4 h-4" />}
                        />
                    </div>
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-48"
                        options={[
                            { value: 'all', label: 'All Status' },
                            { value: 'pending', label: 'Pending' },
                            { value: 'approved', label: 'Approved' },
                            { value: 'rejected', label: 'Rejected' }
                        ]}
                    />
                </div>
            </Card>

            {/* Expenses Table */}
            <Card>
                <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold">Expense Submissions</h3>
                </div>
                <Table
                    data={filteredExpenses}
                    columns={[
                        {
                            key: 'workerName',
                            header: 'Worker Profile',
                            render: (expense) => (
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9 border border-gray-100 shadow-sm">
                                        <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(expense.workerName)}&background=random`} />
                                        <AvatarFallback className="bg-orange-50 text-orange-700 font-bold">
                                            {expense.workerName.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="font-bold text-gray-900">{expense.workerName}</span>
                                </div>
                            )
                        },
                        {
                            key: 'description',
                            header: 'Description',
                            render: (expense) => <span className="text-gray-600 truncate max-w-[200px] block">{expense.description}</span>
                        },
                        {
                            key: 'category',
                            header: 'Category',
                            render: (expense) => <Badge variant="secondary">{expense.category}</Badge>
                        },
                        {
                            key: 'amount',
                            header: 'Amount',
                            render: (expense) => <span className="font-semibold">${expense.amount.toFixed(2)}</span>
                        },
                        {
                            key: 'projectName',
                            header: 'Project',
                            render: (expense) => <span className="text-sm text-gray-600">{expense.projectName || '-'}</span>
                        },
                        {
                            key: 'date',
                            header: 'Date',
                            render: (expense) => <span className="text-sm">{new Date(expense.date).toLocaleDateString()}</span>
                        },
                        {
                            key: 'status',
                            header: 'Status',
                            render: (expense) => (
                                <Badge className={getStatusColor(expense.status)}>
                                    {expense.status}
                                </Badge>
                            )
                        },
                        {
                            key: 'actions',
                            header: 'Actions',
                            render: (expense) => (
                                <div className="flex items-center gap-2">
                                    <Button size="sm" variant="outline" onClick={() => openDetailModal(expense)}>
                                        View & Edit
                                    </Button>
                                </div>
                            )
                        }
                    ]}
                />
            </Card>

            {/* Expense Detail Modal */}
            {selectedExpense && (
                <Modal
                    isOpen={showDetailModal}
                    onClose={() => setShowDetailModal(false)}
                    title="Expense Details"
                >
                    <div className="space-y-6">
                        {/* Receipt Image */}
                        <div className="bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative group">
                            <img
                                src={selectedExpense.receiptUrl}
                                alt="Receipt"
                                className="w-full h-64 object-contain"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button variant="secondary" onClick={() => window.open(selectedExpense.receiptUrl, '_blank')}>
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Open Original
                                </Button>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-gray-600">Worker</div>
                                <div className="font-semibold">{selectedExpense.workerName}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Amount</div>
                                <div className="font-semibold text-lg text-gray-900">${selectedExpense.amount.toFixed(2)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Category</div>
                                <div className="font-semibold">{selectedExpense.category}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Date</div>
                                <div className="font-semibold">{new Date(selectedExpense.date).toLocaleDateString()}</div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <div className="text-sm text-gray-600 mb-1">Description</div>
                            <p className="text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-100">
                                {selectedExpense.description}
                            </p>
                        </div>

                        {/* Project & Task Assignment */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Project</label>
                                <Select
                                    value={editProjectId}
                                    onChange={(e) => setEditProjectId(e.target.value)}
                                    options={[
                                        { value: '', label: 'Select Project...' },
                                        ...(mockProjects || []).map(p => ({ value: p.id, label: p.name }))
                                    ]}
                                    disabled={selectedExpense.status !== 'pending'}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Linked Task</label>
                                <Select
                                    value={editTaskId}
                                    onChange={(e) => setEditTaskId(e.target.value)}
                                    options={[
                                        { value: '', label: 'Select Task...' },
                                        ...(mockTasks || []).map(t => ({ value: t.id, label: t.name }))
                                    ]}
                                    disabled={selectedExpense.status !== 'pending'}
                                />
                            </div>
                        </div>

                        {selectedExpense.status === 'rejected' && selectedExpense.rejectionReason && (
                            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                                <div className="text-sm font-medium text-red-800 mb-1">Rejection Reason</div>
                                <p className="text-red-700">{selectedExpense.rejectionReason}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                                Close
                            </Button>
                            {selectedExpense.status === 'pending' && (
                                <>
                                    <Button variant="destructive" onClick={() => handleReject('Not approved')}>
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Reject
                                    </Button>
                                    <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Approve
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
