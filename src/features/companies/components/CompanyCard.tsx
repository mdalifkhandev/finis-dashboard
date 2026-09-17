import { useNavigate } from 'react-router-dom';
import {
    Building2,
    MoreHorizontal,
    MapPin,
    Globe,
    Eye,
    ShieldAlert,
    CheckCircle2,
    Mail,
    CreditCard,
    User,
    Lock,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/Avatar';
import { Button } from '@/shared/components/ui/Button';
import { Dropdown } from '@/shared/components/ui/Dropdown';
import { Company } from '@/shared/types';
import { formatCurrency, getFullUrl, cn } from '@/shared/utils';

interface CompanyCardProps {
    company: Company;
    isSuperAdmin?: boolean;
    onToggleStatus?: (companyId: string) => void;
}

export function CompanyCard({
    company,
    isSuperAdmin = false,
    onToggleStatus,
}: CompanyCardProps) {
    const navigate = useNavigate();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'success';
            case 'pending':
                return 'warning';
            case 'inactive':
                return 'secondary';
            default:
                return 'secondary';
        }
    };

    const isSuspended = company.status === 'inactive';
    const ownerName = company.owner?.fullName || company.contact?.name || 'Unassigned';
    const ownerEmail = company.owner?.email || company.contact?.email || '';
    const planName = company.subscription?.planName || 'No Plan';
    const hasSub = company.subscription?.hasSubscription;
    const subStatus = company.subscription?.status || 'none';

    const handleCardClick = () => {
        if (isSuspended && !isSuperAdmin) {
            alert('This company has been suspended by Super Admin. You cannot view company details while it is suspended.');
            return;
        }
        navigate(`/companies/${company.id}`);
    };

    return (
        <Card
            className={cn(
                "group transition-all flex flex-col justify-between",
                isSuspended && !isSuperAdmin
                    ? "opacity-90 border-red-200 bg-red-50/10 cursor-not-allowed hover:border-red-300"
                    : "cursor-pointer hover:shadow-md hover:border-blue-200"
            )}
            onClick={handleCardClick}
        >
            <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div className="flex gap-3.5 min-w-0">
                    <Avatar className="h-12 w-12 rounded-xl border border-gray-100 shrink-0">
                        <AvatarImage src={getFullUrl(company.logo)} />
                        <AvatarFallback className="rounded-xl bg-blue-50 text-blue-600 font-bold">
                            {company.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors truncate max-w-[170px]">
                                {company.name}
                            </h3>
                            <Badge
                                variant={isSuspended ? 'destructive' : getStatusColor(company.status)}
                                className="scale-90 capitalize"
                            >
                                {isSuspended ? 'Suspended' : company.status}
                            </Badge>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{company.industry || 'General Contractor'}</p>

                        {/* Owner / Admin Info */}
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 pt-0.5">
                            <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            <span className="truncate">
                                Owner: <strong className="text-[#1D4F6D] font-semibold">{ownerName}</strong>
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3-Dot Action Dropdown (stopPropagation prevents card click navigation) */}
                <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                    <Dropdown
                        trigger={
                            <Button
                                variant="ghost"
                                size="icon"
                                className="-mr-2 -mt-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg h-8 w-8"
                                aria-label="Company Actions"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        }
                        items={[
                            {
                                label: isSuspended && !isSuperAdmin ? 'View Details (Suspended)' : 'View Details',
                                icon: isSuspended && !isSuperAdmin ? Lock : Eye,
                                onClick: () => {
                                    if (isSuspended && !isSuperAdmin) {
                                        alert('This company has been suspended by Super Admin. You cannot view company details.');
                                        return;
                                    }
                                    navigate(`/companies/${company.id}`);
                                },
                            },
                            ...(isSuperAdmin ? [{
                                label: company.status === 'active' ? 'Suspend Company' : 'Activate Company',
                                icon: company.status === 'active' ? ShieldAlert : CheckCircle2,
                                onClick: () => onToggleStatus?.(company.id),
                                variant: company.status === 'active' ? ('destructive' as const) : undefined,
                            }] : []),
                            {
                                label: isSuperAdmin ? 'Contact Owner' : 'Contact Support',
                                icon: Mail,
                                onClick: () => {
                                    if (isSuperAdmin) {
                                        if (ownerEmail) {
                                            window.open(`mailto:${ownerEmail}?subject=Finis Platform: Regarding ${encodeURIComponent(company.name)}`);
                                        } else {
                                            alert('No contact email found for this company owner');
                                        }
                                    } else {
                                        window.location.href = `mailto:support@finis.com?subject=Regarding suspended company: ${encodeURIComponent(company.name)}`;
                                    }
                                },
                            },
                        ]}
                    />
                </div>
            </CardHeader>

            <CardContent className="space-y-3.5 pt-0">
                {/* Suspended Lock Banner for Non-Super-Admin */}
                {isSuspended && !isSuperAdmin && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50/90 text-red-700 text-xs font-semibold border border-red-200">
                        <Lock className="h-3.5 w-3.5 shrink-0 text-red-500" />
                        <span className="truncate">Suspended by Super Admin • Details Locked</span>
                    </div>
                )}
                {/* Subscription Plan & Status Badge */}
                <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-gray-50/90 border border-gray-100">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <CreditCard className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span className="text-gray-500 font-medium">Plan:</span>
                        <span className="font-bold text-gray-900 truncate">
                            {planName}
                        </span>
                    </div>
                    <span
                        className={cn(
                            'px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider shrink-0',
                            hasSub
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                        )}
                    >
                        {subStatus === 'active' ? 'Active' : (hasSub ? subStatus : 'No Subscription')}
                    </span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 py-2 border-y border-gray-100">
                    <div>
                        <p className="text-xs text-gray-400 mb-0.5">Revenue</p>
                        <p className="font-bold text-gray-900 text-sm">
                            {company.annualRevenue ? formatCurrency(company.annualRevenue) : '$0'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 mb-0.5">Projects</p>
                        <div className="flex items-center gap-1.5 font-bold text-gray-900 text-sm">
                            <Building2 className="h-3.5 w-3.5 text-gray-400" />
                            {company.projectCount}
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5 pt-0.5">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{company.location || 'No location specified'}</span>
                    </div>
                    {ownerEmail && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            <span className="truncate">{ownerEmail}</span>
                        </div>
                    )}
                    {company.publicLink?.url && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Globe className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            <span className="truncate text-blue-600 hover:underline">{company.publicLink.url}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
