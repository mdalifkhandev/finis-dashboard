import { useNavigate } from 'react-router-dom';
import { Building2, MoreHorizontal, MapPin, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/Avatar';
import { Button } from '@/shared/components/ui/Button';
import { Company } from '@/shared/types';
import { formatCurrency, getFullUrl } from '@/shared/utils';

interface CompanyCardProps {
    company: Company;
}

export function CompanyCard({
    company
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

    return (
        <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-blue-200" onClick={() => navigate(`/companies/${company.id}`)}>
            <CardHeader className="flex flex-row items-start justify-between pb-4">
                <div className="flex gap-4">
                    <Avatar className="h-12 w-12 rounded-xl border border-gray-100">
                        <AvatarImage src={getFullUrl(company.logo)} />
                        <AvatarFallback className="rounded-xl bg-blue-50 text-blue-600 font-bold">
                            {company.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">
                                {company.name}
                            </h3>
                            <Badge variant={getStatusColor(company.status)} className="scale-90">
                                {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                            </Badge>
                        </div>
                        <p className="text-xs text-gray-500">{company.industry || 'General Contractor'}</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="-mr-2 -mt-2 text-gray-400">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </CardHeader>

            <CardContent>
                <div className="space-y-4">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 py-2 border-y border-gray-100">
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Revenue</p>
                            <p className="font-bold text-gray-900">{company.annualRevenue ? formatCurrency(company.annualRevenue) : '$0'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Projects</p>
                            <div className="flex items-center gap-1.5 font-bold text-gray-900">
                                <Building2 className="h-3.5 w-3.5 text-gray-400" />
                                {company.projectCount}
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <MapPin className="h-3.5 w-3.5 text-gray-400" />
                            <span className="truncate">{company.location || 'No location'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Globe className="h-3.5 w-3.5 text-gray-400" />
                            <span className="truncate text-blue-600 hover:underline">{company.publicLink?.url || 'No website'}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
