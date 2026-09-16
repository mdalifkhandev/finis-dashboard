import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Edit, ShieldCheck, Calendar as CalendarIcon, ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Tabs } from '@/shared/components/ui/Tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/Avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import {
  AttendanceCalendar,
  PayrollHistory,
  WorkerSchedule,
  WorkerDocuments,
  MessageWorkerModal,
  EditWorkerProfileModal
} from '../components';
import { formatDate } from '@/shared/utils';
import { useAppSelector } from '@/store/hooks';
import { apiClient } from '@/services';

export function WorkerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const workers = useAppSelector((state) => state.workforce.workers);
  const [worker, setWorker] = useState<any>(() => workers.find(w => w.id === id || w.memberId === id) || null);
  const [isLoading, setIsLoading] = useState(!worker);

  useEffect(() => {
    if (!id) return;
    const fromStore = workers.find(w => w.id === id || w.memberId === id);
    if (fromStore) {
      setWorker({
        ...fromStore,
        name: fromStore.fullName,
        role: fromStore.role || 'Worker',
        avatar: fromStore.avatarUrl,
        status: fromStore.status || 'active',
      });
      setIsLoading(false);
      return;
    }
    void (async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get<any>(`/super_admin/team/users/${id}`);
        const data = res?.data || res;
        if (data) {
          setWorker({
            ...data,
            name: data.fullName || data.name || 'Worker',
            role: data.role || 'Worker',
            avatar: data.avatarUrl || data.avatar,
            status: data.status || 'active',
          });
        }
      } catch {
        // Handled
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id, workers]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1D4F6D]" />
        <p className="mt-3 text-sm text-gray-500">Loading worker profile...</p>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-2xl font-bold text-gray-900">Worker not found</h2>
        <Button className="mt-4" onClick={() => navigate('/workforce')}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => navigate('/workforce')}
            className="flex items-center gap-1 text-gray-500 hover:text-[#1D4F6D] font-medium transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Workforce
          </button>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-bold">{worker.name}</span>
        </div>
      </div>

      {/* Header Profile Section */}
      <Card className="border-none shadow-sm overflow-hidden bg-white">
        <div className="h-32 bg-gradient-to-r from-[#1D4F6D] to-[#2a739e]" />
        <CardContent className="px-8 pb-8 -mt-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <div className="relative">
                <Avatar className="h-32 w-32 rounded-3xl border-4 border-white shadow-2xl">
                  <AvatarImage src={worker.avatar} />
                  <AvatarFallback className="text-3xl font-black bg-blue-50 text-blue-600">
                    {worker.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-4 border-white shadow-sm ${worker.status === 'active' ? 'bg-green-500' :
                  worker.status === 'inactive' ? 'bg-gray-400' : 'bg-yellow-500'
                  }`} />
              </div>
              <div className="space-y-2 mb-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight">{worker.name}</h1>
                  <Badge variant={worker.status === 'active' ? 'success' : 'secondary'} className="font-bold px-3 py-1">
                    {worker.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-5 text-sm font-bold text-gray-500">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-lg">
                    <ShieldCheck className="h-4 w-4 text-[#1D4F6D]" />
                    {worker.role}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {worker.assignedProject || 'Unassigned'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    Joined {formatDate(worker.createdAt)}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mb-2">
              <Button
                variant="outline"
                onClick={() => setIsMessageModalOpen(true)}
                className="gap-2 h-11 px-6 border-gray-200 text-gray-600 hover:text-[#1D4F6D] font-bold rounded-xl"
              >
                <Mail className="h-4 w-4" />
                Message
              </Button>
              <Button
                onClick={() => setIsEditModalOpen(true)}
                className="gap-2 h-11 px-6 bg-[#1D4F6D] hover:bg-[#163a50] text-white shadow-lg font-bold rounded-xl"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Layout */}
      <div className="space-y-6">
        <Tabs
          tabs={[
            { id: 'profile', label: 'Overview' },
            { id: 'schedule', label: 'Work Schedule' },
            { id: 'attendance', label: 'Attendance' },
            { id: 'payroll', label: 'Payroll' },
            { id: 'documents', label: 'Documents' }
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-gray-100 shadow-sm rounded-2xl">
                  <CardHeader className="border-b border-gray-50">
                    <CardTitle className="text-base font-black text-[#1D4F6D] uppercase tracking-widest">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6">
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</p>
                      <p className="font-bold text-gray-900 text-lg">{worker.name}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date of Birth</p>
                      <p className="font-bold text-gray-900 text-lg">May 15, 1985</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Employment Role</p>
                      <p className="font-bold text-gray-900 text-lg">{worker.role}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hourly Compensation</p>
                      <p className="font-bold text-blue-600 text-lg px-3 py-1 bg-blue-50 rounded-lg inline-block">
                        ${worker.hourlyRate}/hr
                      </p>
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Primary Residence</p>
                      <p className="font-bold text-gray-900 leading-relaxed text-lg">
                        1234 Oak Avenue, Apartment 4B, Los Angeles, CA 90001
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-100 shadow-sm rounded-2xl">
                  <CardHeader className="border-b border-gray-50">
                    <CardTitle className="text-base font-black text-[#1D4F6D] uppercase tracking-widest">Emergency Contact</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6">
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Name</p>
                      <p className="font-bold text-gray-900 text-lg">Kyle Reese</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Relationship</p>
                      <p className="font-bold text-gray-900 text-lg">Spouse</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</p>
                      <p className="font-bold text-gray-900 text-lg">+1 (555) 987-6543</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-gray-100 shadow-sm rounded-2xl">
                  <CardHeader className="border-b border-gray-50">
                    <CardTitle className="text-base font-black text-[#1D4F6D] uppercase tracking-widest">Contact Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-6">
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                      <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mobile</p>
                        <p className="text-sm font-bold text-gray-900 mt-0.5">{worker.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                      <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</p>
                        <p className="text-sm font-bold text-gray-900 mt-0.5">{worker.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-100 shadow-sm rounded-2xl">
                  <CardHeader className="border-b border-gray-50">
                    <CardTitle className="text-base font-black text-[#1D4F6D] uppercase tracking-widest">Certifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-6">
                    <div className="flex items-center justify-between p-4 bg-[#10B981]/5 border border-[#10B981]/10 rounded-xl group hover:bg-[#10B981]/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-[#10B981] flex items-center justify-center text-white font-black text-xs">
                          PM
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">PMP Certified</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Expires: Dec 2025</p>
                        </div>
                      </div>
                      <Badge variant="success" className="font-bold">ACTIVE</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-[#6366F1]/5 border border-[#6366F1]/10 rounded-xl group hover:bg-[#6366F1]/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-[#6366F1] flex items-center justify-center text-white font-black text-xs">
                          SS
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">Site Safety Plus</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Expires: Jun 2025</p>
                        </div>
                      </div>
                      <Badge variant="success" className="font-bold">ACTIVE</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && <WorkerSchedule />}
          {activeTab === 'attendance' && <AttendanceCalendar />}
          {activeTab === 'payroll' && <PayrollHistory />}
          {activeTab === 'documents' && <WorkerDocuments />}
        </div>
      </div>

      {/* Modals */}
      <MessageWorkerModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        workerName={worker.name}
      />
      <EditWorkerProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        worker={worker}
      />
    </div>
  );
}