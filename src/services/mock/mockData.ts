import {
    Admin,
    Manager,
    Worker,
    Company,
    Project,
    Task,
    Schedule,
    Attendance,
    TimeAdjustmentRequest,
    PayrollConfig,
    PayrollRecord,
    Expense,
    ChatConversation,
    Tenant,
    SubscriptionPlan,
    Invitation
} from '@/shared/types';

// Empty datasets (mock data removed - live API used)
export const mockAdmins: Admin[] = [];
export const mockManagers: Manager[] = [];
export const mockWorkers: Worker[] = [];
export const mockCompanies: Company[] = [];
export const mockProjects: Project[] = [];
export const mockTasks: Task[] = [];
export const mockSchedules: Schedule[] = [];
export const mockAttendance: Attendance[] = [];
export const mockTimeAdjustments: TimeAdjustmentRequest[] = [];
export const mockPayrollConfig: PayrollConfig = {
    id: '',
    period: 'monthly',
    cppEmployee: 0,
    cppEmployer: 0,
    eiEmployee: 0,
    eiEmployer: 0,
    federalTax: 0,
    provincialTax: 0,
    wsibEmployer: 0,
    vacationPay: 0,
    updatedAt: '',
};
export const mockPayrollRecords: PayrollRecord[] = [];
export const mockExpenses: Expense[] = [];
export const mockConversations: ChatConversation[] = [];
export const mockTenants: Tenant[] = [];
export const mockSubscriptionPlans: SubscriptionPlan[] = [];
export const mockInvitations: Invitation[] = [];
export const MOCK_LIBRARY: any[] = [];
export const MOCK_PROJECT_SCOPE: any[] = [];
