import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/Avatar';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
const certifications = [{
  id: 1,
  worker: 'Mike Ross',
  avatar: 'https://i.pravatar.cc/150?u=2',
  type: 'OSHA 30',
  expiry: '2024-03-20',
  status: 'Expiring Soon'
}, {
  id: 2,
  worker: 'Sarah Connor',
  avatar: 'https://i.pravatar.cc/150?u=1',
  type: 'Heavy Equipment',
  expiry: '2024-03-18',
  status: 'Expiring Soon'
}, {
  id: 3,
  worker: 'John Wick',
  avatar: 'https://i.pravatar.cc/150?u=5',
  type: 'First Aid',
  expiry: '2024-03-10',
  status: 'Expired'
}, {
  id: 4,
  worker: 'Ellen Ripley',
  avatar: 'https://i.pravatar.cc/150?u=6',
  type: 'Electrical Safety',
  expiry: '2024-04-15',
  status: 'Valid'
}];
export function CertificationsList() {
  return <Card className="h-full">
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>Certification Status</CardTitle>
      <Button variant="ghost" size="sm" className="text-primary">
        View All
      </Button>
    </CardHeader>
    <CardContent className="p-0">
      <div className="divide-y divide-gray-100">
        {certifications.map(cert => <div key={cert.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={cert.avatar} />
              <AvatarFallback>{cert.worker.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {cert.worker}
              </p>
              <p className="text-xs text-gray-500">{cert.type}</p>
            </div>
          </div>
          <div className="text-right">
            <Badge variant={cert.status === 'Valid' ? 'success' : cert.status === 'Expired' ? 'destructive' : 'warning'} className="mb-1">
              {cert.status}
            </Badge>
            <p className="text-xs text-gray-500">Exp: {cert.expiry}</p>
          </div>
        </div>)}
      </div>
    </CardContent>
  </Card>;
}
