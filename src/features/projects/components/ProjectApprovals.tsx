import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { CheckCircle2, Clock3, XCircle, FileText, User2, ShieldCheck, Image as ImageIcon, MapPin } from 'lucide-react';

type ApprovalDecision = 'approved' | 'rejected' | 'pending';

interface ApprovalItem {
    id: string;
    taskId: string;
    taskTitle: string;
    taskStatus: string;
    floor?: { id: string; name: string; floorNumber?: number | null } | null;
    room?: { id: string; name: string; number?: string | null } | null;
    worker?: { id: string; fullName: string; avatarUrl?: string | null } | null;
    reviewDecision: ApprovalDecision;
    reviewDescription?: string | null;
    notes?: string | null;
    beforePhotoUrl?: string | null;
    afterPhotoUrl?: string | null;
    receiptUrl?: string | null;
    submittedAt?: string;
    reviewedAt?: string | null;
}

interface ProjectApprovalsData {
    summary?: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
    };
    recentApprovals?: ApprovalItem[];
}

interface ProjectApprovalsProps {
    approvals?: ProjectApprovalsData | null;
}

const decisionMeta: Record<ApprovalDecision, { label: string; color: string; icon: typeof CheckCircle2; ring: string }> = {
    approved: { label: 'Approved', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: CheckCircle2, ring: 'from-emerald-50 to-white' },
    rejected: { label: 'Rejected', color: 'bg-rose-50 text-rose-700 border-rose-100', icon: XCircle, ring: 'from-rose-50 to-white' },
    pending: { label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-100', icon: Clock3, ring: 'from-amber-50 to-white' },
};

const formatDateTime = (value?: string | null) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
};

function StatCard({
    label,
    value,
    accent,
}: {
    label: string;
    value: number;
    accent: string;
}) {
    return (
        <Card className="overflow-hidden border border-white/60 bg-white/80 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.45)] backdrop-blur">
            <div className={`h-1.5 bg-gradient-to-r ${accent}`} />
            <CardContent className="p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">{label}</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
            </CardContent>
        </Card>
    );
}

export function ProjectApprovals({ approvals }: ProjectApprovalsProps) {
    const summary = approvals?.summary ?? { total: 0, pending: 0, approved: 0, rejected: 0 };
    const items = approvals?.recentApprovals ?? [];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <StatCard label="Total Reviews" value={summary.total} accent="from-slate-900 via-slate-700 to-slate-500" />
                <StatCard label="Pending" value={summary.pending} accent="from-amber-500 via-amber-400 to-yellow-300" />
                <StatCard label="Approved" value={summary.approved} accent="from-emerald-500 via-green-400 to-emerald-300" />
                <StatCard label="Rejected" value={summary.rejected} accent="from-rose-500 via-red-400 to-rose-300" />
            </div>

            <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-[0_24px_60px_-28px_rgba(15,23,42,0.75)]">
                <CardHeader className="border-b border-white/10 bg-white/5">
                    <CardTitle className="flex items-center gap-2 text-sm font-bold text-white">
                        <ShieldCheck className="h-4 w-4 text-emerald-300" />
                        Recent Approval Reviews
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {items.length === 0 ? (
                        <div className="px-6 py-14 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 ring-1 ring-white/10">
                                <FileText className="h-8 w-8 text-white/60" />
                            </div>
                            <p className="mt-5 text-lg font-bold text-white">No approval reviews yet</p>
                            <p className="mt-2 text-sm text-slate-300">
                                Task report approvals will appear here once workers submit reports.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/10">
                            {items.map((item) => {
                                const meta = decisionMeta[item.reviewDecision];
                                const Icon = meta.icon;

                                return (
                                    <div key={item.id} className="bg-white/0 px-6 py-6 transition-colors hover:bg-white/5">
                                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                            <div className="flex-1 space-y-4">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <Badge className={`border ${meta.color} px-3 py-1.5 text-xs font-bold shadow-sm`}>
                                                        <Icon className="mr-1.5 h-3.5 w-3.5" />
                                                        {meta.label}
                                                    </Badge>
                                                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
                                                        Task #{item.taskId.slice(0, 8)}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <h3 className="text-xl font-black tracking-tight text-white">
                                                        {item.taskTitle}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-300">
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <User2 className="h-4 w-4 text-slate-400" />
                                                            {item.worker?.fullName || 'Worker not found'}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <MapPin className="h-4 w-4 text-slate-400" />
                                                            {item.floor?.name || '—'}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <MapPin className="h-4 w-4 text-slate-400" />
                                                            {item.room?.name || '—'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Submitted</p>
                                                        <p className="mt-2 text-sm font-semibold text-white">{formatDateTime(item.submittedAt)}</p>
                                                    </div>
                                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Reviewed</p>
                                                        <p className="mt-2 text-sm font-semibold text-white">{formatDateTime(item.reviewedAt)}</p>
                                                    </div>
                                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Task Status</p>
                                                        <p className="mt-2 text-sm font-semibold text-white capitalize">{item.taskStatus.replace(/_/g, ' ')}</p>
                                                    </div>
                                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Review State</p>
                                                        <p className="mt-2 text-sm font-semibold text-white">{meta.label}</p>
                                                    </div>
                                                </div>

                                                {item.notes && (
                                                    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                                                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Worker Notes</p>
                                                        <p className="text-sm leading-7 text-slate-200">{item.notes}</p>
                                                    </div>
                                                )}

                                                {item.reviewDescription && (
                                                    <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
                                                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">Reviewer Note</p>
                                                        <p className="text-sm leading-7 text-emerald-50">{item.reviewDescription}</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className={`rounded-[28px] border border-white/10 bg-gradient-to-b ${meta.ring} p-4 text-slate-900 shadow-2xl lg:w-[320px]`}>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">Media</p>
                                                        <p className="mt-1 text-sm font-bold">Task Proof</p>
                                                    </div>
                                                    <div className="rounded-full bg-slate-900/5 p-2">
                                                        <ImageIcon className="h-4 w-4 text-slate-700" />
                                                    </div>
                                                </div>
                                                <div className="mt-4 space-y-3">
                                                    {[
                                                        { label: 'Before Photo', url: item.beforePhotoUrl },
                                                        { label: 'After Photo', url: item.afterPhotoUrl },
                                                        { label: 'Receipt', url: item.receiptUrl },
                                                    ].map((entry) => (
                                                        <div key={entry.label} className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3">
                                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{entry.label}</p>
                                                            <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                                                                {entry.url ? 'Available' : 'Not provided'}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
