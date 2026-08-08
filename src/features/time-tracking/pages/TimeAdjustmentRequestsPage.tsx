import { useState } from 'react';
import { CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Table } from '@/shared/components/ui/Table';
import { Modal } from '@/shared/components/ui/Modal';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/Avatar';
import { mockTimeAdjustments } from '@/services/mock/mockData';
import { TimeAdjustmentRequest } from '@/shared/types';
import { getStatusColor } from '@/shared/utils';

export function TimeAdjustmentRequestsPage() {
    const [requests, setRequests] = useState<TimeAdjustmentRequest[]>(mockTimeAdjustments);
    const [selectedRequest, setSelectedRequest] = useState<TimeAdjustmentRequest | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const handleApprove = (requestId: string) => {
        setRequests(requests.map(r =>
            r.id === requestId ? { ...r, status: 'approved' as const } : r
        ));
        setShowDetailModal(false);
    };

    const handleDeny = (requestId: string) => {
        setRequests(requests.map(r =>
            r.id === requestId ? { ...r, status: 'denied' as const } : r
        ));
        setShowDetailModal(false);
    };

    const openDetailModal = (request: TimeAdjustmentRequest) => {
        setSelectedRequest(request);
        setShowDetailModal(true);
    };

    const pendingRequests = requests.filter(r => r.status === 'pending');
    const processedRequests = requests.filter(r => r.status !== 'pending');

    const pendingColumns = [
        {
            key: 'workerName',
            header: 'Worker Profile',
            render: (record: TimeAdjustmentRequest) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-gray-100 shadow-sm">
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(record.workerName)}&background=random`} />
                        <AvatarFallback className="bg-blue-50 text-blue-700 font-bold">
                            {record.workerName.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <span className="font-bold text-gray-900">{record.workerName}</span>
                </div>
            )
        },
        {
            key: 'date',
            header: 'Date',
            render: (record: TimeAdjustmentRequest) => new Date(record.date).toLocaleDateString()
        },
        {
            key: 'requestType',
            header: 'Type',
            render: (record: TimeAdjustmentRequest) => (
                <Badge variant="secondary">
                    {record.requestType.replace('_', '-')}
                </Badge>
            )
        },
        {
            key: 'originalTime',
            header: 'Original Time',
            render: (record: TimeAdjustmentRequest) => (
                <span className="font-mono">{record.originalTime}</span>
            )
        },
        {
            key: 'requestedTime',
            header: 'Requested Time',
            render: (record: TimeAdjustmentRequest) => (
                <span className="font-mono font-semibold text-blue-600">{record.requestedTime}</span>
            )
        },
        {
            key: 'createdAt',
            header: 'Submitted',
            render: (record: TimeAdjustmentRequest) => (
                <span className="text-sm text-gray-500">
                    {new Date(record.createdAt).toLocaleDateString()}
                </span>
            )
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (record: TimeAdjustmentRequest) => (
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => openDetailModal(record)}>
                        View Details
                    </Button>
                    <Button size="sm" onClick={() => handleApprove(record.id)}>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeny(record.id)}>
                        <XCircle className="w-4 h-4 mr-1" />
                        Deny
                    </Button>
                </div>
            )
        }
    ];

    const historyColumns = [
        {
            key: 'workerName',
            header: 'Worker Profile',
            render: (record: TimeAdjustmentRequest) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-gray-100 shadow-sm">
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(record.workerName)}&background=random`} />
                        <AvatarFallback className="bg-blue-50 text-blue-700 font-bold">
                            {record.workerName.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <span className="font-bold text-gray-900">{record.workerName}</span>
                </div>
            )
        },
        {
            key: 'date',
            header: 'Date',
            render: (record: TimeAdjustmentRequest) => new Date(record.date).toLocaleDateString()
        },
        {
            key: 'requestType',
            header: 'Type',
            render: (record: TimeAdjustmentRequest) => (
                <Badge variant="secondary">
                    {record.requestType.replace('_', '-')}
                </Badge>
            )
        },
        {
            key: 'adjustment',
            header: 'Adjustment',
            render: (record: TimeAdjustmentRequest) => (
                <>
                    <span className="font-mono text-gray-500">{record.originalTime}</span>
                    {' → '}
                    <span className="font-mono font-semibold">{record.requestedTime}</span>
                </>
            )
        },
        {
            key: 'status',
            header: 'Status',
            render: (record: TimeAdjustmentRequest) => (
                <Badge className={getStatusColor(record.status)}>
                    {record.status}
                </Badge>
            )
        },
        {
            key: 'reviewedAt',
            header: 'Reviewed',
            render: (record: TimeAdjustmentRequest) => (
                <span className="text-sm text-gray-500">
                    {record.reviewedAt ? new Date(record.reviewedAt).toLocaleDateString() : '-'}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Time Adjustment Requests</h1>
                    <p className="mt-1 text-gray-600">Review and approve worker time adjustment requests</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-600">Pending</div>
                            <div className="text-3xl font-bold text-yellow-600 mt-2">{pendingRequests.length}</div>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </Card>
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-600">Approved</div>
                            <div className="text-3xl font-bold text-green-600 mt-2">
                                {requests.filter(r => r.status === 'approved').length}
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
                            <div className="text-sm text-gray-600">Denied</div>
                            <div className="text-3xl font-bold text-red-600 mt-2">
                                {requests.filter(r => r.status === 'denied').length}
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <XCircle className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </Card>
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-600">Total Requests</div>
                            <div className="text-3xl font-bold text-gray-900 mt-2">{requests.length}</div>
                        </div>
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-gray-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
                <Card>
                    <div className="p-6 border-b">
                        <h3 className="text-lg font-semibold">Pending Requests</h3>
                    </div>
                    <Table data={pendingRequests} columns={pendingColumns} />
                </Card>
            )}

            {/* Processed Requests */}
            {processedRequests.length > 0 && (
                <Card>
                    <div className="p-6 border-b">
                        <h3 className="text-lg font-semibold">Request History</h3>
                    </div>
                    <Table data={processedRequests} columns={historyColumns} />
                </Card>
            )}

            {/* Detail Modal */}
            {selectedRequest && (
                <Modal
                    isOpen={showDetailModal}
                    onClose={() => setShowDetailModal(false)}
                    title="Time Adjustment Request Details"
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-gray-600">Worker</div>
                                <div className="font-semibold">{selectedRequest.workerName}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Date</div>
                                <div className="font-semibold">{new Date(selectedRequest.date).toLocaleDateString()}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Request Type</div>
                                <div className="font-semibold capitalize">{selectedRequest.requestType.replace('_', ' ')}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Submitted</div>
                                <div className="font-semibold">{new Date(selectedRequest.createdAt).toLocaleDateString()}</div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-600 mb-2">Time Adjustment</div>
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-lg text-gray-500">{selectedRequest.originalTime}</span>
                                <span className="text-gray-400">→</span>
                                <span className="font-mono text-lg font-bold text-blue-600">{selectedRequest.requestedTime}</span>
                            </div>
                        </div>

                        <div>
                            <div className="text-sm text-gray-600 mb-2">Reason</div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-gray-700">{selectedRequest.reason}</p>
                            </div>
                        </div>

                        {selectedRequest.status === 'pending' && (
                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                                <Button variant="outline" onClick={() => setShowDetailModal(false)}>Cancel</Button>
                                <Button variant="outline" onClick={() => handleDeny(selectedRequest.id)}>
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Deny
                                </Button>
                                <Button onClick={() => handleApprove(selectedRequest.id)}>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve
                                </Button>
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
}
