import { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useTaskDetails, useSubTaskDetails, useReviewTaskApproval, useReviewSubTaskApproval, useDeleteSubTask, useReviewTaskCompletion } from '../hooks/useTasks';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { ArrowLeft, Clock, MapPin, User, FileText, CheckCircle, XCircle, Trash2, Flag, AlertCircle, Image, DollarSign, Package } from 'lucide-react';
import { format } from 'date-fns';
import { ROUTES } from '@/config/routes';

export function TaskDetailPage() {
    const { projectId, taskId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const isSubtask = location.pathname.includes('/subtasks/');

    const { data: taskDetails, isLoading: isTaskLoading } = useTaskDetails(!isSubtask ? taskId || null : null);
    const { data: subTaskDetails, isLoading: isSubtaskLoading } = useSubTaskDetails(isSubtask ? taskId || null : null);

    const data = isSubtask ? subTaskDetails : taskDetails;
    const isLoading = isSubtask ? isSubtaskLoading : isTaskLoading;

    const [reviewNote, setReviewNote] = useState('');
    const [completionNote, setCompletionNote] = useState('');
    const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);

    const { reviewTaskApproval, isReviewing: isReviewingTask } = useReviewTaskApproval();
    const { reviewSubTaskApproval, isReviewing: isReviewingSubTask } = useReviewSubTaskApproval();
    const { deleteSubTask, isDeletingSubTask } = useDeleteSubTask();
    const { reviewTaskCompletion, isReviewingCompletion } = useReviewTaskCompletion();

    const isReviewing = isReviewingTask || isReviewingSubTask;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Loading details...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                    <p className="text-red-500 font-medium">Task not found.</p>
                </div>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'info'> = {
            pending: 'warning',
            in_progress: 'info',
            review: 'info',
            completed: 'success',
            cancelled: 'destructive',
        };
        return <Badge variant={variants[status] || 'default'}>{status?.replace(/_/g, ' ')}</Badge>;
    };

    const getApprovalBadge = (decision: string) => {
        if (decision === 'pending') return <Badge variant="warning">Pending Approval</Badge>;
        if (decision === 'approved') return <Badge variant="success">Approved</Badge>;
        if (decision === 'rejected') return <Badge variant="destructive">Rejected</Badge>;
        return null;
    };

    const handleApprove = async () => {
        if (!taskId) return;
        try {
            if (isSubtask) {
                await reviewSubTaskApproval(taskId, { reviewDecision: 'approved', reviewDescription: reviewNote || undefined });
            } else {
                await reviewTaskApproval(taskId, { reviewDecision: 'approved', reviewDescription: reviewNote || undefined });
            }
            setReviewNote('');
        } catch (err) { console.error(err); }
    };

    const handleReject = async () => {
        if (!taskId) return;
        try {
            if (isSubtask) {
                await reviewSubTaskApproval(taskId, { reviewDecision: 'rejected', reviewDescription: reviewNote || undefined });
            } else {
                await reviewTaskApproval(taskId, { reviewDecision: 'rejected', reviewDescription: reviewNote || undefined });
            }
            setReviewNote('');
        } catch (err) { console.error(err); }
    };

    const handleDelete = async () => {
        if (!taskId || !isSubtask) return;
        try {
            await deleteSubTask(taskId);
            navigate(projectId ? `/projects/${projectId}` : ROUTES.PROJECTS);
        } catch (err) { console.error(err); }
    };

    const handleApproveCompletion = async () => {
        if (!taskId || isSubtask) return;
        try {
            await reviewTaskCompletion(taskId, { reviewDecision: 'approved', reviewDescription: completionNote || undefined });
            setCompletionNote('');
        } catch (err) { console.error(err); }
    };

    const handleRejectCompletion = async () => {
        if (!taskId || isSubtask) return;
        try {
            await reviewTaskCompletion(taskId, { reviewDecision: 'rejected', reviewDescription: completionNote || undefined });
            setCompletionNote('');
        } catch (err) { console.error(err); }
    };

    const normalizedStatus = String(data.status ?? data.task?.status ?? '').toLowerCase().trim();
    const approvalDecision = data.approvalDecision ?? data.task?.approvalDecision;
    const normalizedApprovalDecision = String(approvalDecision ?? '').toLowerCase().trim();
    const isPendingApproval = normalizedApprovalDecision === 'pending';
    const isApproved = normalizedApprovalDecision === 'approved';
    const isAwaitingCompletionReview = !isSubtask && normalizedStatus === 'review';
    const canReviewCompletion = isAwaitingCompletionReview;
    const isCompleted = normalizedStatus === 'completed';

    const reports = data.reports ?? [];
    const expenses = data.expenses ?? [];
    const inventories = data.inventories ?? [];
    const instructions = data.instructions ?? [];
    const units = data.taskUnits || data.subTaskUnits || data.units || [];

    return (
        <div className="max-w-5xl mx-auto pb-16 space-y-5">

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4 pt-1">
                <Button variant="outline" className="flex items-center gap-2" onClick={() => navigate(projectId ? `/projects/${projectId}` : ROUTES.PROJECTS)}>
                    <ArrowLeft className="w-4 h-4" /> Back to Project
                </Button>
                {isSubtask && (
                    !isDeleteConfirm ? (
                        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-2" onClick={() => setIsDeleteConfirm(true)}>
                            <Trash2 className="w-4 h-4" /> Delete Subtask
                        </Button>
                    ) : (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                            <span className="text-sm text-red-700 font-medium">Confirm delete?</span>
                            <Button className="bg-red-600 hover:bg-red-700 text-white text-xs h-7 px-3" onClick={handleDelete} disabled={isDeletingSubTask}>
                                {isDeletingSubTask ? 'Deleting...' : 'Yes, Delete'}
                            </Button>
                            <Button variant="outline" className="text-xs h-7 px-3" onClick={() => setIsDeleteConfirm(false)}>Cancel</Button>
                        </div>
                    )
                )}
            </div>

            {/* Header Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start gap-3 mb-5 flex-wrap">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{data.title}</h1>
                        <p className="text-gray-500 text-sm">{data.description || 'No description provided.'}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {getStatusBadge(data.status)}
                        {isSubtask && <Badge variant="default" className="bg-purple-100 text-purple-700">Subtask</Badge>}
                        {getApprovalBadge(approvalDecision)}
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 py-4 border-y border-gray-100">
                    <div>
                        <div className="text-xs text-gray-400 mb-1 flex items-center gap-1"><User className="w-3 h-3" /> Assigned To</div>
                        <div className="font-medium text-sm text-gray-800">
                            {isSubtask
                                ? (data.taskAssignee?.user?.fullName || data.taskAssignee?.user?.name || 'Unassigned')
                                : (data.taskAssignees?.[0]?.user?.fullName || data.taskAssignees?.[0]?.user?.name || 'Unassigned')}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Due Date</div>
                        <div className="font-medium text-sm text-gray-800">{data.dueDate ? format(new Date(data.dueDate), 'MMM d, yyyy') : 'No date'}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Estimated</div>
                        <div className="font-medium text-sm text-gray-800">{data.estimatedHours ? `${data.estimatedHours} hrs` : data.task?.estimatedHours ? `${data.task.estimatedHours} hrs` : '-'}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-400 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Priority</div>
                        <div className="font-medium text-sm text-gray-800 capitalize">{data.priority?.toLowerCase() || 'Normal'}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-400 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</div>
                        <div className="flex flex-wrap gap-1">
                            {units.length > 0 ? units.map((tu: any) => (
                                <Badge key={tu.id || tu.unit?.id} variant="secondary" className="bg-purple-50 text-purple-700 border-purple-100 text-[10px] px-1.5 py-0 whitespace-nowrap">
                                    {tu.unit?.floor?.name || tu.floor?.name || 'Floor'} - {tu.unit?.name || tu.name || 'Unit'}
                                </Badge>
                            )) : <span className="text-gray-400 text-sm">No location</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Step 2: Completion Review */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-indigo-100">
                <div className="flex items-center gap-2 mb-4"><Flag className="w-5 h-5 text-indigo-500" /><h2 className="font-bold text-gray-900 text-lg">Completion Review</h2></div>
                <div className={`${canReviewCompletion ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-200'} border rounded-xl p-4 mb-4`}>
                    <p className={`font-semibold text-sm ${canReviewCompletion ? 'text-indigo-800' : 'text-gray-700'}`}>
                        {canReviewCompletion ? 'Worker submitted this task for completion review' : 'Completion review is not available for this status'}
                    </p>
                    <p className={`text-sm mt-0.5 ${canReviewCompletion ? 'text-indigo-600' : 'text-gray-500'}`}>
                        {canReviewCompletion ? 'Review the submitted work below and approve or request revision.' : 'Buttons stay visible here, but they unlock only when task status is review.'}
                    </p>
                </div>
                <textarea
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 text-sm mb-4 resize-none disabled:bg-gray-50 disabled:text-gray-400"
                    rows={3}
                    placeholder="Add review notes (optional)..."
                    value={completionNote}
                    onChange={(e) => setCompletionNote(e.target.value)}
                    disabled={!canReviewCompletion || isReviewingCompletion}
                />
                <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50 font-semibold disabled:opacity-60" onClick={handleRejectCompletion} disabled={!canReviewCompletion || isReviewingCompletion}>
                        <XCircle className="w-4 h-4 mr-2" />{isReviewingCompletion ? 'Processing...' : 'Revision'}
                    </Button>
                    <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:opacity-60" onClick={handleApproveCompletion} disabled={!canReviewCompletion || isReviewingCompletion}>
                        <CheckCircle className="w-4 h-4 mr-2" />{isReviewingCompletion ? 'Processing...' : 'Approve Completion'}
                    </Button>
                </div>
            </div>

            {/* Step 1: Creation Approval */}
            {isPendingApproval && !isAwaitingCompletionReview && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100">
                    <div className="flex items-center gap-2 mb-4"><span className="text-xl">&#x23F3;</span><h2 className="font-bold text-gray-900 text-lg">Approval Required</h2></div>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                        <p className="font-semibold text-amber-800 text-sm">This {isSubtask ? 'subtask' : 'task'} is waiting for your approval</p>
                        <p className="text-sm text-amber-600 mt-0.5">Worker cannot start until you approve it.</p>
                    </div>
                    <textarea className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 text-sm mb-4 resize-none" rows={3} placeholder="Add notes (optional)..." value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} />
                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50 font-semibold" onClick={handleReject} disabled={isReviewing}>
                            <XCircle className="w-4 h-4 mr-2" />{isReviewing ? 'Processing...' : 'Reject'}
                        </Button>
                        <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold" onClick={handleApprove} disabled={isReviewing}>
                            <CheckCircle className="w-4 h-4 mr-2" />{isReviewing ? 'Processing...' : 'Approve - Allow to Start'}
                        </Button>
                    </div>
                </div>
            )}

            {/* Status banners */}
            {isCompleted && !isAwaitingCompletionReview && (
                <div className="bg-green-50 rounded-2xl p-5 border border-green-200 flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-green-500 shrink-0" />
                    <div><p className="font-semibold text-green-800">Task Completed</p><p className="text-sm text-green-600">This task has been approved and marked as complete.</p></div>
                </div>
            )}
            {isApproved && !isCompleted && !isAwaitingCompletionReview && (
                <div className="bg-green-50 rounded-2xl p-4 border border-green-200 flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
                    <p className="text-green-700 font-medium text-sm">Approved - Worker can now start this {isSubtask ? 'subtask' : 'task'}.</p>
                </div>
            )}
            {approvalDecision === 'rejected' && (
                <div className="bg-red-50 rounded-2xl p-4 border border-red-200 flex items-center gap-3">
                    <XCircle className="w-6 h-6 text-red-500 shrink-0" />
                    <p className="text-red-700 font-medium text-sm">This {isSubtask ? 'subtask' : 'task'} was rejected.</p>
                </div>
            )}

            {/* Instructions - always shown */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Task Instructions</h2>
                {instructions.length > 0 ? (
                    <div className="space-y-3">
                        {instructions.map((inst: any, idx: number) => (
                            <div key={idx} className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">{idx + 1}</div>
                                <p className="text-gray-700 text-sm pt-0.5">{inst}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 text-sm">No specific instructions provided.</p>
                )}
            </div>

            {/* Reports & Photos - always shown */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Image className="w-5 h-5 text-gray-400" /> Reports &amp; Photos
                </h2>
                {reports.length > 0 ? (
                    <div className="space-y-6">
                        {reports.map((report: any) => (
                            <div key={report.id} className="border border-gray-100 rounded-xl overflow-hidden">
                                {report.notes && (
                                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-600">Report Notes</p>
                                        <p className="text-sm text-gray-500 mt-0.5">{report.notes}</p>
                                    </div>
                                )}
                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-medium text-gray-400 mb-2">Before Photo</p>
                                        {report.beforePhotoUrl
                                            ? <img src={report.beforePhotoUrl} alt="Before" className="w-full h-56 object-cover rounded-lg border border-gray-100" />
                                            : <div className="w-full h-56 bg-gray-50 rounded-lg flex items-center justify-center text-gray-300 text-sm border border-dashed border-gray-200">No photo</div>}
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-400 mb-2">After Photo</p>
                                        {report.afterPhotoUrl
                                            ? <img src={report.afterPhotoUrl} alt="After" className="w-full h-56 object-cover rounded-lg border border-gray-100" />
                                            : <div className="w-full h-56 bg-gray-50 rounded-lg flex items-center justify-center text-gray-300 text-sm border border-dashed border-gray-200">No photo</div>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">No reports submitted yet.</p>
                    </div>
                )}
            </div>

            {/* Financials - always shown */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-gray-400" /> Task Expenses
                </h2>
                {expenses.length > 0 ? (
                    <div className="space-y-3">
                        {expenses.map((expense: any) => (
                            <div key={expense.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex justify-between items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-semibold text-sm text-gray-900">{expense.description}</span>
                                        <Badge variant="success" className="text-[10px] py-0">{expense.status}</Badge>
                                    </div>
                                    <div className="text-xs text-gray-400">{expense.category} - {format(new Date(expense.date), 'MMM d, yyyy')}</div>
                                </div>
                                <div className="text-lg font-bold text-blue-600 shrink-0">${expense.amount?.toFixed(2)}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 text-sm">No expenses recorded for this task.</p>
                )}
            </div>

            {/* Inventory - always shown */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-gray-400" /> Inventory Used
                </h2>
                {inventories.length > 0 ? (
                    <div className="overflow-hidden border border-gray-100 rounded-xl">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 font-medium text-gray-600">Item</th>
                                    <th className="px-4 py-3 font-medium text-gray-600">Quantity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {inventories.map((inv: any, idx: number) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-3 text-gray-800">{inv.label}</td>
                                        <td className="px-4 py-3 font-medium text-gray-800">{inv.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-400 text-sm">No inventory used for this task.</p>
                )}
            </div>

        </div>
    );
}
