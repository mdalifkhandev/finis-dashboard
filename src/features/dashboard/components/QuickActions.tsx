import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Plus, Users, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export function QuickActions() {
    const actions = [
        { label: 'Add Project', icon: Plus, path: '/projects', color: 'bg-blue-50 text-blue-600' },
        { label: 'Register Worker', icon: Users, path: '/workforce', color: 'bg-green-50 text-green-600' },
        { label: 'Export Report', icon: FileText, path: '/reports', color: 'bg-orange-50 text-orange-600' },
    ];

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                {actions.map((action) => (
                    <Link key={action.label} to={action.path}>
                        <Button
                            variant="outline"
                            className="w-full h-auto py-4 flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors border-gray-100"
                        >
                            <div className={`p-2 rounded-lg ${action.color}`}>
                                <action.icon className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{action.label}</span>
                        </Button>
                    </Link>
                ))}
            </CardContent>
        </Card>
    );
}
