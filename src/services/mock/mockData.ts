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

// Admins
export const mockAdmins: Admin[] = [
    {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@finispro.com',
        phone: '+1-416-555-0100',
        role: 'super_admin',
        status: 'active',
        avatar: 'https://i.pravatar.cc/150?img=12',
        createdAt: '2025-01-01T00:00:00Z',
        lastLogin: '2026-01-09T05:30:00Z',
        permissions: ['all']
    },
    {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@finispro.com',
        phone: '+1-416-555-0101',
        role: 'admin',
        status: 'active',
        avatar: 'https://i.pravatar.cc/150?img=45',
        createdAt: '2025-02-15T00:00:00Z',
        lastLogin: '2026-01-08T18:45:00Z',
        permissions: ['projects', 'companies', 'workforce', 'reports']
    },
    {
        id: '3',
        name: 'Mike Wilson',
        email: 'mike.wilson@finispro.com',
        phone: '+1-416-555-0102',
        role: 'admin',
        status: 'pending',
        createdAt: '2026-01-05T00:00:00Z',
        permissions: ['projects', 'workforce']
    }
];

// Managers
export const mockManagers: Manager[] = [
    {
        id: 'm1',
        name: 'Robert Brown',
        email: 'robert.brown@company.com',
        phone: '+1-416-555-0200',
        avatar: 'https://i.pravatar.cc/150?img=33',
        assignedCompanies: ['c1', 'c2'],
        assignedProjects: ['p1', 'p2', 'p3'],
        status: 'active',
        createdAt: '2025-03-01T00:00:00Z'
    },
    {
        id: 'm2',
        name: 'Emily Davis',
        email: 'emily.davis@company.com',
        phone: '+1-416-555-0201',
        avatar: 'https://i.pravatar.cc/150?img=47',
        assignedCompanies: ['c1'],
        assignedProjects: ['p1', 'p4'],
        status: 'active',
        createdAt: '2025-04-10T00:00:00Z'
    }
];

// Workers
export const mockWorkers: Worker[] = [
    {
        id: 'w1',
        name: 'Carlos Martinez',
        email: 'carlos.m@worker.com',
        phone: '+1-416-555-0300',
        avatar: 'https://i.pravatar.cc/150?img=68',
        role: 'Electrician',
        assignedCompany: 'c1',
        assignedProject: 'p1',
        assignedFloors: ['f1', 'f2'],
        assignedRooms: ['r1', 'r2', 'r3'],
        status: 'active',
        hourlyRate: 45.50,
        createdAt: '2025-05-01T00:00:00Z'
    },
    {
        id: 'w2',
        name: 'David Chen',
        email: 'david.c@worker.com',
        phone: '+1-416-555-0301',
        avatar: 'https://i.pravatar.cc/150?img=14',
        role: 'Plumber',
        assignedCompany: 'c1',
        assignedProject: 'p1',
        assignedFloors: ['f1'],
        assignedRooms: ['r1', 'r2'],
        status: 'active',
        hourlyRate: 42.00,
        createdAt: '2025-05-15T00:00:00Z'
    },
    {
        id: 'w3',
        name: 'Maria Rodriguez',
        email: 'maria.r@worker.com',
        phone: '+1-416-555-0302',
        avatar: 'https://i.pravatar.cc/150?img=49',
        role: 'Carpenter',
        assignedCompany: 'c2',
        assignedProject: 'p2',
        status: 'active',
        hourlyRate: 38.75,
        createdAt: '2025-06-01T00:00:00Z'
    }
];

// Companies
export const mockCompanies: Company[] = [
    {
        id: 'c1',
        name: 'Summit Construction Ltd.',
        logo: 'https://via.placeholder.com/100/4F46E5/FFFFFF?text=SC',
        description: 'Leading construction company specializing in residential and commercial projects',
        industry: 'Construction',
        status: 'active',
        annualRevenue: 5500000,
        location: 'Toronto, ON',
        contact: {
            name: 'Tom Anderson',
            email: 'tom@summitconstruction.com',
            phone: '+1-416-555-1000'
        },
        address: '123 King St W, Toronto, ON M5H 1A1',
        publicLink: {
            url: 'https://finispro.app/public/c1-summit',
            enabled: true,
            createdAt: '2025-01-10T00:00:00Z'
        },
        projectCount: 8,
        createdAt: '2025-01-01T00:00:00Z'
    },
    {
        id: 'c2',
        name: 'Horizon Builders Inc.',
        logo: 'https://via.placeholder.com/100/059669/FFFFFF?text=HB',
        description: 'Innovative building solutions for modern living spaces',
        industry: 'Architecture',
        status: 'active',
        annualRevenue: 3200000,
        location: 'Vancouver, BC',
        contact: {
            name: 'Lisa Thompson',
            email: 'lisa@horizonbuilders.com',
            phone: '+1-416-555-1001'
        },
        address: '45Bay St, Vancouver, BC V6B 1A1',
        projectCount: 5,
        createdAt: '2025-02-01T00:00:00Z'
    }
];

// Projects with Floors and Rooms
export const mockProjects: Project[] = [
    {
        id: 'p1',
        name: 'Lakeside Towers',
        companyId: 'c1',
        companyName: 'Summit Construction Ltd.',
        type: 'apartment_building',
        description: 'Luxury 15-story apartment building with 120 units',
        status: 'active',
        startDate: '2025-06-01',
        endDate: '2026-12-31',
        budget: 15000000,
        address: '789 Lakeshore Blvd, Toronto, ON M8V 1A1',
        publicLink: {
            url: 'https://finispro.app/public/p1-lakeside',
            enabled: true,
            createdAt: '2025-06-05T00:00:00Z'
        },
        floors: [
            {
                id: 'f1',
                projectId: 'p1',
                number: 1,
                name: 'Ground Floor',
                rooms: [
                    {
                        id: 'r1',
                        floorId: 'f1',
                        number: '101',
                        name: 'Lobby',
                        status: 'completed',
                        assignedWorkers: ['w1', 'w2'],
                        tasks: []
                    },
                    {
                        id: 'r2',
                        floorId: 'f1',
                        number: '102',
                        name: 'Reception',
                        status: 'active',
                        assignedWorkers: ['w1'],
                        tasks: []
                    }
                ]
            },
            {
                id: 'f2',
                projectId: 'p1',
                number: 2,
                name: 'Second Floor',
                rooms: [
                    {
                        id: 'r3',
                        floorId: 'f2',
                        number: '201',
                        name: 'Unit 201',
                        roomGroup: 'A Block',
                        status: 'active',
                        assignedWorkers: ['w1'],
                        tasks: []
                    },
                    {
                        id: 'r4',
                        floorId: 'f2',
                        number: '202',
                        name: 'Unit 202',
                        roomGroup: 'A Block',
                        status: 'pending',
                        assignedWorkers: [],
                        tasks: []
                    }
                ]
            }
        ],
        geofence: {
            id: 'gf1',
            projectId: 'p1',
            projectName: 'Lakeside Towers',
            coordinates: [
                { lat: 43.6332, lng: -79.4186 },
                { lat: 43.6342, lng: -79.4186 },
                { lat: 43.6342, lng: -79.4176 },
                { lat: 43.6332, lng: -79.4176 }
            ],
            enabled: true,
            createdAt: '2025-06-10T00:00:00Z'
        },
        progress: 45,
        hasBudget: true,
        team: [
            { name: 'Sarah Johnson', image: 'https://i.pravatar.cc/150?img=1' },
            { name: 'Mike Wilson', image: 'https://i.pravatar.cc/150?img=2' },
            { name: 'Robert Brown', image: 'https://i.pravatar.cc/150?img=3' },
            { name: 'Emily Davis', image: 'https://i.pravatar.cc/150?img=4' }
        ],
        createdAt: '2025-06-01T00:00:00Z'
    },
    {
        id: 'p2',
        name: 'Maple Grove Homes',
        companyId: 'c2',
        companyName: 'Horizon Builders Inc.',
        type: 'house',
        description: 'Development of 25 detached homes',
        status: 'active',
        startDate: '2025-08-01',
        budget: 8500000,
        address: '100 Maple Rd, Mississauga, ON L5B 3C1',
        floors: [
            { id: 'f2-1', projectId: 'p2', number: 0, name: 'Full house', rooms: [], tasks: [] },
            { id: 'f2-2', projectId: 'p2', number: 1, name: 'Main floor', rooms: [], tasks: [] },
            { id: 'f2-3', projectId: 'p2', number: 2, name: 'Basement', rooms: [], tasks: [] }
        ],
        progress: 30,
        hasBudget: true,
        team: [
            { name: 'David Chen', image: 'https://i.pravatar.cc/150?img=5' },
            { name: 'Maria Rodriguez', image: 'https://i.pravatar.cc/150?img=6' }
        ],
        createdAt: '2025-08-01T00:00:00Z'
    },
    {
        id: 'p3',
        name: 'Oakwood Residences',
        companyId: 'c1',
        companyName: 'Summit Construction Ltd.',
        type: 'apartment_building',
        description: 'Modern residential complex',
        status: 'completed',
        startDate: '2025-09-15',
        endDate: '2026-08-30',
        budget: 12000000,
        address: '45 Oakwood Ave, Toronto, ON M6E 2V3',
        floors: [],
        progress: 60,
        hasBudget: true,
        team: [
            { name: 'Sarah Johnson', image: 'https://i.pravatar.cc/150?img=1' },
            { name: 'Robert Brown', image: 'https://i.pravatar.cc/150?img=3' }
        ],
        createdAt: '2025-09-15T00:00:00Z'
    },
    {
        id: 'p4',
        name: 'Westside Community Center',
        companyId: 'c2',
        companyName: 'Horizon Builders Inc.',
        type: 'house',
        description: 'Community gathering space',
        status: 'completed',
        startDate: '2025-01-10',
        endDate: '2025-11-20',
        budget: 5500000,
        address: '300 Westside Dr, Vancouver, BC V5K 1B1',
        floors: [],
        progress: 100,
        hasBudget: true,
        team: [
            { name: 'David Chen', image: 'https://i.pravatar.cc/150?img=5' }
        ],
        createdAt: '2025-01-10T00:00:00Z'
    },
    {
        id: 'p5',
        name: 'Harborfront Condos',
        companyId: 'c1',
        companyName: 'Summit Construction Ltd.',
        type: 'apartment_building',
        description: 'Luxury waterfront condos',
        status: 'delayed',
        startDate: '2025-05-01',
        endDate: '2026-10-31',
        budget: 25000000,
        address: '10 Harborfront Dr, Toronto, ON M5J 2Z1',
        floors: [],
        progress: 25,
        hasBudget: true,
        team: [
            { name: 'Mike Wilson', image: 'https://i.pravatar.cc/150?img=2' },
            { name: 'Emily Davis', image: 'https://i.pravatar.cc/150?img=4' }
        ],
        createdAt: '2025-05-01T00:00:00Z'
    }
];

// Tasks
export const mockTasks: Task[] = [
    {
        id: 't1',
        name: 'Electrical Wiring',
        description: 'Install electrical wiring throughout the unit',
        category: 'Electrical',
        internalValue: 2500,
        status: 'active',
        assignedTo: ['w1'],
        isCustom: false,
        approved: true,
        photos: []
    },
    {
        id: 't2',
        name: 'Plumbing Installation',
        description: 'Install plumbing fixtures and pipes',
        category: 'Plumbing',
        internalValue: 1800,
        status: 'pending',
        assignedTo: ['w2'],
        isCustom: false,
        approved: true,
        photos: []
    },
    {
        id: 't3',
        name: 'Custom Cabinet Work',
        description: 'Build custom cabinets for kitchen',
        category: 'Carpentry',
        internalValue: 3200,
        status: 'pending',
        isCustom: true,
        approved: false,
        photos: []
    }
];

// Schedules
export const mockSchedules: Schedule[] = [
    {
        id: 's1',
        name: 'Standard Weekday Shift',
        workDays: [1, 2, 3, 4, 5], // Monday to Friday
        startTime: '08:00',
        endTime: '17:00',
        assignedWorkers: ['w1', 'w2'],
        createdAt: '2025-05-01T00:00:00Z'
    },
    {
        id: 's2',
        name: 'Weekend Shift',
        workDays: [6, 0], // Saturday and Sunday
        startTime: '09:00',
        endTime: '15:00',
        assignedWorkers: ['w3'],
        createdAt: '2025-05-01T00:00:00Z'
    }
];

// Attendance
export const mockAttendance: Attendance[] = [
    {
        id: 'a1',
        workerId: 'w1',
        workerName: 'Carlos Martinez',
        date: '2026-01-08',
        checkIn: {
            time: '07:58',
            location: { lat: 43.6332, lng: -79.4186, timestamp: '2026-01-08T07:58:00Z' }
        },
        checkOut: {
            time: '17:05',
            location: { lat: 43.6332, lng: -79.4186, timestamp: '2026-01-08T17:05:00Z' }
        },
        status: 'present',
        hoursWorked: 9.12,
        locations: [
            { timestamp: '2026-01-08T10:00:00Z', location: { lat: 43.6335, lng: -79.4188, timestamp: '2026-01-08T10:00:00Z' } },
            { timestamp: '2026-01-08T12:30:00Z', location: { lat: 43.6333, lng: -79.4187, timestamp: '2026-01-08T12:30:00Z' } }
        ]
    },
    {
        id: 'a2',
        workerId: 'w2',
        workerName: 'David Chen',
        date: '2026-01-08',
        checkIn: {
            time: '08:15',
            location: { lat: 43.6332, lng: -79.4186, timestamp: '2026-01-08T08:15:00Z' }
        },
        checkOut: {
            time: '16:45',
            location: { lat: 43.6332, lng: -79.4186, timestamp: '2026-01-08T16:45:00Z' }
        },
        status: 'late',
        hoursWorked: 8.5,
        locations: []
    }
];

// Time Adjustment Requests
export const mockTimeAdjustments: TimeAdjustmentRequest[] = [
    {
        id: 'ta1',
        workerId: 'w1',
        workerName: 'Carlos Martinez',
        date: '2026-01-07',
        requestType: 'check_in',
        originalTime: '08:25',
        requestedTime: '08:00',
        reason: 'Traffic delay on highway, arrived late but was en route from 7:30 AM',
        status: 'pending',
        createdAt: '2026-01-07T18:00:00Z'
    },
    {
        id: 'ta2',
        workerId: 'w3',
        workerName: 'Maria Rodriguez',
        date: '2026-01-06',
        requestType: 'check_out',
        originalTime: '16:30',
        requestedTime: '17:00',
        reason: 'Forgot to check out, continued working until 5 PM',
        status: 'approved',
        createdAt: '2026-01-06T19:00:00Z',
        reviewedAt: '2026-01-07T09:00:00Z',
        reviewedBy: '1'
    }
];

// Payroll Config
export const mockPayrollConfig: PayrollConfig = {
    id: 'pc1',
    period: 'biweekly',
    cppEmployee: 5.95,
    cppEmployer: 5.95,
    eiEmployee: 1.66,
    eiEmployer: 2.32,
    federalTax: 15.0,
    provincialTax: 5.05,
    wsibEmployer: 1.42,
    vacationPay: 4.0,
    updatedAt: '2026-01-01T00:00:00Z'
};

// Payroll Records
export const mockPayrollRecords: PayrollRecord[] = [
    {
        id: 'pr1',
        workerId: 'w1',
        workerName: 'Carlos Martinez',
        period: 'Dec 16 - Dec 31, 2025',
        startDate: '2025-12-16',
        endDate: '2025-12-31',
        hoursWorked: 80,
        hourlyRate: 45.50,
        grossPay: 3640,
        deductions: {
            cppEmployee: 216.58,
            eiEmployee: 60.42,
            federalTax: 546,
            provincialTax: 183.82
        },
        employerContributions: {
            cppEmployer: 216.58,
            eiEmployer: 84.45,
            wsibEmployer: 51.69
        },
        vacationPay: 145.60,
        netPay: 2633.18,
        status: 'approved',
        createdAt: '2026-01-01T00:00:00Z'
    }
];

// Expenses
export const mockExpenses: Expense[] = [
    {
        id: 'e1',
        workerId: 'w1',
        workerName: 'Carlos Martinez',
        subtotal: 115.00,
        tax: 10.50,
        totalAmount: 125.50,
        amount: 125.50,
        category: 'Tools',
        description: 'Replacement drill bits and screwdriver set',
        receiptUrl: 'https://via.placeholder.com/400x600/CCCCCC/333333?text=Receipt',
        date: '2026-01-05',
        status: 'pending',
        projectId: 'p1',
        projectName: 'Lakeside Towers',
        createdAt: '2026-01-05T14:30:00Z'
    },
    {
        id: 'e2',
        workerId: 'w2',
        workerName: 'David Chen',
        subtotal: 70.00,
        tax: 8.00,
        totalAmount: 78.00,
        amount: 78.00,
        category: 'Materials',
        description: 'PVC pipes and fittings',
        receiptUrl: 'https://via.placeholder.com/400x600/CCCCCC/333333?text=Receipt',
        date: '2026-01-06',
        status: 'approved',
        projectId: 'p1',
        projectName: 'Lakeside Towers',
        taskId: 't2',
        reviewedAt: '2026-01-07T10:00:00Z',
        reviewedBy: '1',
        createdAt: '2026-01-06T16:20:00Z'
    },
    {
        id: 'e3',
        workerId: 'w3',
        workerName: 'Maria Rodriguez',
        subtotal: 40.00,
        tax: 5.25,
        totalAmount: 45.25,
        amount: 45.25,
        category: 'Transportation',
        description: 'Parking fees',
        receiptUrl: 'https://via.placeholder.com/400x600/CCCCCC/333333?text=Receipt',
        date: '2026-01-07',
        status: 'rejected',
        rejectionReason: 'Parking fees are not covered as per company policy',
        reviewedAt: '2026-01-08T09:15:00Z',
        reviewedBy: '1',
        createdAt: '2026-01-07T17:00:00Z'
    }
];

// Chat Conversations
export const mockConversations: ChatConversation[] = [
    {
        id: 'conv1',
        type: 'individual',
        name: 'Carlos Martinez',
        participants: ['1', 'w1'],
        lastMessage: {
            id: 'msg1',
            conversationId: 'conv1',
            senderId: 'w1',
            senderName: 'Carlos Martinez',
            senderRole: 'worker',
            content: 'I\'ve completed the wiring in unit 201.',
            timestamp: '2026-01-08T15:30:00Z',
            read: false
        },
        unreadCount: 2,
        status: 'active',
        createdAt: '2025-05-01T00:00:00Z',
        updatedAt: '2026-01-08T15:30:00Z'
    },
    {
        id: 'conv2',
        type: 'project',
        name: 'Lakeside Towers Team',
        participants: ['1', 'm1', 'w1', 'w2'],
        lastMessage: {
            id: 'msg2',
            conversationId: 'conv2',
            senderId: 'm1',
            senderName: 'Robert Brown',
            senderRole: 'manager',
            content: 'Team meeting tomorrow at 9 AM',
            timestamp: '2026-01-08T16:00:00Z',
            read: true
        },
        unreadCount: 0,
        status: 'active',
        createdAt: '2025-06-01T00:00:00Z',
        updatedAt: '2026-01-08T16:00:00Z'
    }
];

// Tenants
export const mockTenants: Tenant[] = [
    {
        id: 'tenant1',
        name: 'BuildCo Solutions',
        logo: 'https://via.placeholder.com/100/DC2626/FFFFFF?text=BC',
        domain: 'buildco.finispro.app',
        subscriptionPlan: 'Professional',
        status: 'active',
        whiteLabel: {
            primaryColor: '#DC2626',
            secondaryColor: '#991B1B',
            logo: 'https://via.placeholder.com/200/DC2626/FFFFFF?text=BuildCo'
        },
        companyCount: 12,
        userCount: 145,
        createdAt: '2024-11-01T00:00:00Z'
    },
    {
        id: 'tenant2',
        name: 'ProContractors Inc',
        subscriptionPlan: 'Enterprise',
        status: 'active',
        whiteLabel: {
            primaryColor: '#2563EB',
            secondaryColor: '#1E40AF'
        },
        companyCount: 25,
        userCount: 320,
        createdAt: '2024-09-15T00:00:00Z'
    }
];

// Subscription Plans
export const mockSubscriptionPlans: SubscriptionPlan[] = [
    {
        id: 'plan1',
        name: 'Starter',
        price: 99,
        interval: 'monthly',
        features: [
            'Up to 5 companies',
            'Up to 10 projects',
            'Up to 50 users',
            '10 GB storage',
            'Basic reporting',
            'Email support'
        ],
        limits: {
            companies: 5,
            projects: 10,
            users: 50,
            storage: 10
        },
        active: true
    },
    {
        id: 'plan2',
        name: 'Professional',
        price: 299,
        interval: 'monthly',
        features: [
            'Up to 20 companies',
            'Up to 50 projects',
            'Up to 200 users',
            '50 GB storage',
            'Advanced reporting',
            'Geofencing',
            'Priority support'
        ],
        limits: {
            companies: 20,
            projects: 50,
            users: 200,
            storage: 50
        },
        active: true
    },
    {
        id: 'plan3',
        name: 'Enterprise',
        price: 799,
        interval: 'monthly',
        features: [
            'Unlimited companies',
            'Unlimited projects',
            'Unlimited users',
            '500 GB storage',
            'Custom reporting',
            'Geofencing',
            'White label',
            'Dedicated support'
        ],
        limits: {
            companies: -1,
            projects: -1,
            users: -1,
            storage: 500
        },
        active: true
    }
];

// Invitations
export const mockInvitations: Invitation[] = [
    {
        id: 'inv1',
        email: 'new.admin@finispro.com',
        role: 'admin',
        status: 'pending',
        invitedBy: '1',
        expiresAt: '2026-01-16T00:00:00Z',
        createdAt: '2026-01-09T00:00:00Z'
    },
    {
        id: 'inv2',
        phone: '+1-416-555-0999',
        role: 'manager',
        status: 'pending',
        invitedBy: '2',
        expiresAt: '2026-01-15T00:00:00Z',
        createdAt: '2026-01-08T00:00:00Z'
    }
];

// Standard Tasks (Global Library)
export const MOCK_LIBRARY = [
    { id: '1', name: 'Install Drywall (8x4)', category: 'Drywall', description: 'Install standard 8x4 drywall sheet including screw patterns.', internalCost: 15.00 },
    { id: '2', name: 'Mud & Tape - L1', category: 'Drywall', description: 'Level 1 finish for fire taping.', internalCost: 0.45 },
    { id: '3', name: 'Paint Wall (Standard)', category: 'Painting', description: 'Prime and 2 coats of paint.', internalCost: 1.25 },
    { id: '4', name: 'Install Pot Light', category: 'Electrical', description: 'Rough-in and trim out 4-inch LED pot light.', internalCost: 45.00 },
    { id: '5', name: 'Install Hardwood', category: 'Flooring', description: 'Nail down hardwood installation per sq ft.', internalCost: 3.50 }
];

// Defined Tasks for a specific Mock Project (Project Scope)
export const MOCK_PROJECT_SCOPE = [
    { id: 'pt1', name: 'Electrical Rough-in', description: 'Main wiring and boxes', category: 'Electrical', pricingType: 'fixed', internalValue: 1200, estimatedHours: 15, assignedInstances: 12 },
    { id: 'pt2', name: 'Premium Trim', description: 'Floor baseboards and window casing', category: 'Carpentry', pricingType: 'hourly', internalValue: 45, estimatedHours: 8, assignedInstances: 5 }
];
