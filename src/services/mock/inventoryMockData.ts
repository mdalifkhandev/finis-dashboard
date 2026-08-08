import { InventoryItem, InventoryLog, DamageReport } from '@/shared/types/entities';

export const mockInventoryItems: InventoryItem[] = [
    {
        id: 'inv-1',
        name: 'Drywall Sheets (4x8)',
        unitType: 'Sheets',
        quantity: 120,
        reorderThreshold: 50,
        status: 'in_stock',
        category: 'Materials',
        lastUpdated: '2024-01-15T10:30:00Z'
    },
    {
        id: 'inv-2',
        name: 'Structural Lumber (2x4x8)',
        unitType: 'Pieces',
        quantity: 45,
        reorderThreshold: 100,
        status: 'low_stock',
        category: 'Materials',
        lastUpdated: '2024-01-18T14:20:00Z'
    },
    {
        id: 'inv-3',
        name: 'Latex Paint (White)',
        unitType: 'Gallons',
        quantity: 0,
        reorderThreshold: 10,
        status: 'out_of_stock',
        category: 'Finishing',
        lastUpdated: '2024-01-10T09:15:00Z'
    },
    {
        id: 'inv-4',
        name: 'PVC Pipes (1/2 inch)',
        unitType: 'Linear Feet',
        quantity: 500,
        reorderThreshold: 200,
        status: 'in_stock',
        category: 'Plumbing',
        lastUpdated: '2024-01-19T16:45:00Z'
    },
    {
        id: 'inv-5',
        name: 'Copper Wire (14/2)',
        unitType: 'Rolls',
        quantity: 15,
        reorderThreshold: 5,
        status: 'in_stock',
        category: 'Electrical',
        lastUpdated: '2024-01-17T11:00:00Z'
    }
];

export const mockInventoryLogs: InventoryLog[] = [
    {
        id: 'log-1',
        itemId: 'inv-1',
        itemName: 'Drywall Sheets (4x8)',
        quantityMoved: -20,
        type: 'usage',
        projectId: 'p1',
        projectName: 'Modern Waterfront Villa',
        taskId: 't3',
        taskName: 'Install Drywall',
        handledBy: 'w1',
        handledByName: 'John Smith',
        timestamp: '2024-01-19T10:00:00Z',
        notes: 'Used for living room walls'
    },
    {
        id: 'log-2',
        itemId: 'inv-2',
        itemName: 'Structural Lumber (2x4x8)',
        quantityMoved: 200,
        type: 'restock',
        handledBy: 'admin-1',
        handledByName: 'Fajar Kun',
        timestamp: '2024-01-18T09:00:00Z',
        notes: 'Monthly bulk restock'
    }
];

export const mockDamageReports: DamageReport[] = [
    {
        id: 'dmg-1',
        itemId: 'inv-1',
        itemName: 'Drywall Sheets (4x8)',
        quantity: 2,
        photoUrl: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecb?q=80&w=200',
        notes: 'Sheets cracked during transport to 3rd floor',
        reportedBy: 'w1',
        reportedByName: 'John Smith',
        accountability: 'Loading Crew',
        projectId: 'p1',
        projectName: 'Modern Waterfront Villa',
        timestamp: '2024-01-19T14:30:00Z',
        status: 'pending'
    }
];
