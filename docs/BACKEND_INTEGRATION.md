# Backend Integration Guide

## Overview

This frontend is **100% backend-integration ready**. The architecture separates UI components from data fetching, making it trivial for backend developers to plug in real APIs without touching any UI code.

---

## Quick Start for Backend Developers

### 1. **Set Environment Variables**

Create a `.env` file in the project root (copy from `.env.example`):

```env
VITE_API_BASE_URL=https://your-api.com/api
VITE_USE_MOCK_API=false  # ← Set to false to use real API
VITE_ENV=production
```

### 2. **Create Real API Service**

Create `src/services/api/realApi.ts` and implement the same methods as `MockApiService`:

```typescript
import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type { ApiResponse, Project, Company, Worker } from '@/shared/types';

export class RealApiService {
  // Projects
  static async getProjects(): Promise<ApiResponse<Project[]>> {
    return apiClient.get(API_ENDPOINTS.PROJECTS.LIST);
  }

  static async getProject(id: string): Promise<ApiResponse<Project>> {
    return apiClient.get(API_ENDPOINTS.PROJECTS.DETAIL(id));
  }

  static async createProject(data: Partial<Project>): Promise<ApiResponse<Project>> {
    return apiClient.post(API_ENDPOINTS.PROJECTS.CREATE, data);
  }

  static async updateProject(id: string, data: Partial<Project>): Promise<ApiResponse<Project>> {
    return apiClient.put(API_ENDPOINTS.PROJECTS.UPDATE(id), data);
  }

  static async deleteProject(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(API_ENDPOINTS.PROJECTS.DELETE(id));
  }

  // Repeat for Companies, Workers, etc.
  // See src/services/mock/mockApi.ts for full interface
}
```

### 3. **Switch to Real API**

Update `src/services/index.ts`:

```typescript
import { config } from '@/config/env';
import { MockApiService } from './mock/mockApi';
import { RealApiService } from './api/realApi';  // ← Import real API

export const apiService = config.useMockApi
  ? MockApiService
  : RealApiService;  // ← Switch here
```

**That's it!** The entire frontend will now use your real API. Zero changes needed to UI components.

---

## Architecture Overview

### Data Flow

```
UI Component 
  ↓
Custom Hook (useProjects, useCompanies, etc.)
  ↓
Service Layer (projectService, companyService)
  ↓
API Client / Mock API
  ↓
Backend API
```

### Key Principles

1. **UI components don't know about APIs** - They only use custom hooks
2. **Custom hooks manage state** - Loading, error, success states
3. **Service layer handles API calls** - Single source of truth
4. **Easy to swap** - Mock → Real API by changing one line

---

## API Service Interface

All services must implement these standard methods:

### Standard CRUD Operations

```typescript
// GET all
static async get{Resources}(): Promise<ApiResponse<T[]>>

// GET one
static async get{Resource}(id: string): Promise<ApiResponse<T>>

// CREATE
static async create{Resource}(data: Partial<T>): Promise<ApiResponse<T>>

// UPDATE
static async update{Resource}(id: string, data: Partial<T>): Promise<ApiResponse<T>>

// DELETE
static async delete{Resource}(id: string): Promise<ApiResponse<void>>
```

### Response Format

All API responses must follow this structure:

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}
```

### Error Format

All API errors should follow:

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
  statusCode?: number;
}
```

---

## Authentication

The API client automatically adds authentication tokens to all requests.

### Setting the Token

```typescript
// After user logs in
localStorage.setItem('auth_token', 'your-jwt-token');

// The API client will automatically include:
// Authorization: Bearer your-jwt-token
```

### Removing the Token

```typescript
// On logout
localStorage.removeItem('auth_token');
```

---

## API Endpoints

All endpoints are defined in `src/services/api/endpoints.ts`:

```typescript
export const API_ENDPOINTS = {
  PROJECTS: {
    LIST: '/projects',
    DETAIL: (id: string) => `/projects/${id}`,
    CREATE: '/projects',
    UPDATE: (id: string) => `/projects/${id}`,
    DELETE: (id: string) => `/projects/${id}`,
  },
  // ... more endpoints
};
```

**Update these to match your backend routes.**

---

## Required Backend Endpoints

Your backend needs to implement these endpoints:

### Projects
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Companies
- `GET /api/companies` - List all companies
- `GET /api/companies/:id` - Get single company
- `POST /api/companies` - Create company
- `PUT /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Delete company

### Workforce
- `GET /api/workers` - List all workers
- `GET /api/workers/:id` - Get single worker
- `POST /api/workers` - Create worker
- `PUT /api/workers/:id` - Update worker
- `DELETE /api/workers/:id` - Delete worker
- `GET /api/workers/:id/schedule` - Get worker schedule

### Admins & Managers
- `GET /api/admins` - List admins
- `GET /api/admins/:id` - Get admin details
- `POST /api/admins` - Create admin
-`.PUT /api/admins/:id` - Update admin
- `GET /api/managers` - List managers

### Time Tracking
- `GET /api/time-tracking/attendance` - Get attendance records
- `GET /api/time-tracking/adjustments` - Get time adjustment requests
- `POST /api/time-tracking/adjustments/:id/approve` - Approve adjustment
- `POST /api/time-tracking/adjustments/:id/reject` - Reject adjustment

### Payroll
- `GET /api/payroll/records` - Get payroll records
- `GET /api/payroll/config` - Get payroll configuration
- `PUT /api/payroll/config` - Update configuration
- `POST /api/payroll/calculate` - Calculate payroll
- `POST /api/payroll/records/:id/approve` - Approve payroll

### Expenses
- `GET /api/expenses` - List expenses
- `POST /api/expenses/:id/approve` - Approve expense
- `POST /api/expenses/:id/reject` - Reject expense

### Geofencing
- `GET /api/geofencing` - List geofences
- `POST /api/geofencing` - Create geofence
- `PUT /api/geofencing/:id` - Update geofence
- `DELETE /api/geofencing/:id` - Delete geofence

### Chat
- `GET /api/chat/conversations` - List conversations
- `GET /api/chat/conversations/:id/messages` - Get messages
- `POST /api/chat/conversations/:id/messages` - Send message

### Tenants & Subscriptions
- `GET /api/tenants` - List tenants
- `GET /api/tenants/:id` - Get tenant
- `GET /api/subscriptions/plans` - List subscription plans

### File Uploads
- `POST /api/uploads/file` - Upload general file
- `POST /api/uploads/image` - Upload image
- `POST /api/uploads/document` - Upload document

---

## Type Definitions

All API request/response types are in:
- `src/shared/types/entities.ts` - Domain entities
- `src/shared/types/api.ts` - API-specific types

Your backend should return data matching these TypeScript interfaces.

---

## Example: Adding a New Endpoint

### 1. Add endpoint definition

```typescript
// src/services/api/endpoints.ts
export const API_ENDPOINTS = {
  // ... existing
  INVOICES: {
    LIST: '/invoices',
    DETAIL: (id: string) => `/invoices/${id}`,
  },
};
```

### 2. Add to service

```typescript
// src/services/api/realApi.ts
static async getInvoices(): Promise<ApiResponse<Invoice[]>> {
  return apiClient.get(API_ENDPOINTS.INVOICES.LIST);
}
```

### 3. Create hook

```typescript
// src/features/invoices/hooks/useInvoices.ts
export function useInvoices() {
  const query = useQuery(
    'invoices',
    () => apiService.getInvoices()
  );

  return {
    invoices: query.data || [],
    isLoading: query.isLoading,
};
}
```

### 4. Use in component

```typescript
// src/features/invoices/pages/InvoicesPage.tsx
import { useInvoices } from '../hooks';

export function InvoicesPage() {
  const { invoices, isLoading } = useInvoices();

  if (isLoading) return <Loading />;

  return (
    <div>
      {invoices.map(invoice => (
        <InvoiceCard key={invoice.id} invoice={invoice} />
      ))}
    </div>
  );
}
```

---

## Testing Integration

### 1. Start with Mock API

Set `VITE_USE_MOCK_API=true` to verify UI works with expected data structure.

### 2. Implement Real API

Switch to `VITE_USE_MOCK_API=false` and point to your backend.

### 3. Verify

Check that:
- Data loads correctly
- Forms submit successfully
- Errors are handled gracefully
- Loading states show properly

---

## Common Issues & Solutions

### Issue: CORS Errors

**Solution:** Configure your backend to allow requests from `http://localhost:5173` (Vite dev server):

```javascript
// Express example
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-domain.com'],
  credentials: true,
}));
```

### Issue: Response format mismatch

**Solution:** Ensure your API returns data in the `ApiResponse<T>` format:

```json
{
  "data": [ /* your data */ ],
  "status": 200,
  "message": "Success"
}
```

### Issue: Authentication not working

**Solution:** Check that:
1. Token is stored in `localStorage` with key `auth_token`
2. Backend accepts `Authorization: Bearer <token>` header
3. Token is valid and not expired

---

## Need Help?

1. **Check Mock API** - `src/services/mock/mockApi.ts` shows expected behavior
2. **Check Types** - `src/shared/types/` defines all expected data structures
3. **Check Endpoints** - `src/services/api/endpoints.ts` lists all routes
4. **Check Hooks** - Feature-specific hooks show how data is consumed

---

## Summary

✅ **Frontend is 100% ready for backend integration**  
✅ **No UI code changes needed**  
✅ **Just implement `RealApiService` matching `MockApiService` interface**  
✅ **Switch one environment variable** (`VITE_USE_MOCK_API=false`)  
✅ **Everything works automatically**
