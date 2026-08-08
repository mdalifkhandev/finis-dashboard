import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Progress } from '@/shared/components/ui/Progress';
import { Badge } from '@/shared/components/ui/Badge';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
const complianceAreas = [{
  id: 1,
  title: 'OSHA Compliance',
  progress: 98,
  status: 'Compliant',
  lastUpdated: '2 days ago'
}, {
  id: 2,
  title: 'Environmental Regulations',
  progress: 100,
  status: 'Compliant',
  lastUpdated: '1 week ago'
}, {
  id: 3,
  title: 'Safety Training',
  progress: 85,
  status: 'In Progress',
  lastUpdated: 'Yesterday'
}, {
  id: 4,
  title: 'Equipment Inspections',
  progress: 92,
  status: 'Compliant',
  lastUpdated: '3 days ago'
}, {
  id: 5,
  title: 'PPE Compliance',
  progress: 75,
  status: 'Non-Compliant',
  lastUpdated: 'Today'
}];
export function ComplianceTracker() {
  return <Card className="h-full">
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <span>Compliance Tracker</span>
        <Badge variant="success" className="gap-1">
          <ShieldCheck className="h-3 w-3" /> 92% Overall
        </Badge>
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      {complianceAreas.map(area => <div key={area.id} className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{area.title}</span>
            {area.progress < 80 && <AlertTriangle className="h-4 w-4 text-red-500" />}
          </div>
          <span className="text-sm text-gray-500">{area.progress}%</span>
        </div>
        <Progress value={area.progress} className="h-2" />
        <div className="flex items-center justify-between text-xs">
          <span className={area.progress >= 90 ? 'text-green-600' : area.progress >= 80 ? 'text-yellow-600' : 'text-red-600'}>
            {area.status}
          </span>
          <span className="text-gray-400">Updated {area.lastUpdated}</span>
        </div>
      </div>)}
    </CardContent>
  </Card>;
}
