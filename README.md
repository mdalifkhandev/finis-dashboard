# FinisPro Admin Dashboard

Enterprise-grade construction management admin dashboard built with React, TypeScript, and Vite.

## 🏗️ Architecture

This project follows a **feature-based architecture** that separates concerns cleanly and makes backend integration trivial.

```
src/
├── app/                    # App initialization
├── features/               # Feature modules (projects, companies, etc.)
├── shared/                 # Shared components, hooks, types
├── services/               # API service layer
├── config/                 # Configuration
└── store/                  # Client-side state (UI only)
```

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## 📁 Project Structure

### Features (`src/features/`)

Each feature is a self-contained module with:
- `components/` - Feature-specific UI components
- `hooks/` - Data fetching and business logic hooks
- `pages/` - Route pages
- `types/` - Feature-specific types
- `index.ts` - Public API

**Available Features:**
- `dashboard` - Main dashboard
- `projects` - Project management
- `companies` - Company management
- `workforce` - Worker management
- `time-tracking` - Attendance and schedules
- `payroll` - Payroll processing
- `expenses` - Expense management
- `reports` - Reporting
- `admin-management` - Admin and manager management
- `geofencing` - Location-based tracking
- `chat` - Team communication
- `tenant-management` - Multi-tenant SaaS management

### Shared (`src/shared/`)

Reusable components and utilities used across features:
- `components/ui/` - Base UI primitives (Button, Input, etc.)
- `components/layout/` - Layout components (Sidebar, Header)
- `hooks/` - Shared custom hooks
- `types/` - Shared TypeScript types
- `utils/` - Utility functions

### Services (`src/services/`)

API service layer that abstracts backend communication:
- `api/` - Real API client and endpoints
- `mock/` - Mock API for development
- `index.ts` - Service exports and switching logic

---

## 🔌 Backend Integration

**This frontend is 100% backend-integration ready.**

### For Backend Developers

1. Create `src/services/api/realApi.ts`
2. Implement methods matching `MockApiService` interface
3. Set `VITE_USE_MOCK_API=false` in `.env`
4. That's it! No UI changes needed.

**See:** [`docs/BACKEND_INTEGRATION.md`](./docs/BACKEND_INTEGRATION.md) for detailed guide.

---

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Radix UI** - Accessible components
- **Recharts** - Charts and visualizations
- **React Router** - Routing
- **Lucide React** - Icons

---

## 🎯 Key Features

✅ **Enterprise Architecture** - Feature-based structure for scalability  
✅ **100% TypeScript** - Full type safety, no `any` types  
✅ **Backend-Ready** - Plug-and-play API integration  
✅ **State Management** - Separation of server and client state  
✅ **Performance** - Code splitting and lazy loading  
✅ **SEO-Friendly** - Semantic HTML and meta management  
✅ **Developer Experience** - Clear patterns and documentation

---

## 📝 Development Guide

### Adding a New Feature

1. **Create feature folder structure:**
```bash
mkdir -p src/features/my-feature/{components,hooks,pages,types}
```

2. **Create custom hooks:**
```typescript
// src/features/my-feature/hooks/useMyFeature.ts
import { useQuery } from '@/shared/hooks';
import { myService } from '@/services';

export function useMyFeature() {
  const query = useQuery('my-feature', () => myService.getData());
  return {
    data: query.data,
    isLoading: query.isLoading,
  };
}
```

3. **Create page component:**
```typescript
// src/features/my-feature/pages/MyFeaturePage.tsx
import { useMyFeature } from '../hooks';

export function MyFeaturePage() {
  const { data, isLoading } = useMyFeature();
  // ... render UI
}
```

4. **Add route:**
```typescript
// src/app/router.tsx
import { MyFeaturePage } from '@/features/my-feature/pages/MyFeaturePage';

// Add to routes
<Route path="/my-feature" element={<MyFeaturePage />} />
```

### Adding a New API Endpoint

See [`docs/BACKEND_INTEGRATION.md`](./docs/BACKEND_INTEGRATION.md#example-adding-a-new-endpoint)

---

## 🧪 Code Quality

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npx tsc --noEmit
```

---

## 📚 Documentation

- [Backend Integration Guide](./docs/BACKEND_INTEGRATION.md) - For connecting real APIs
- [Implementation Plan](../.gemini/antigravity/brain/*/implementation_plan.md) - Refactoring details
- [Task Breakdown](../.gemini/antigravity/brain/*/task.md) - Progress tracking

---

## 🤝 Contributing

1. Follow the existing architecture patterns
2. Keep components small and focused
3. Use custom hooks for data fetching
4. Never hardcode API data in components
5. Update types when adding features

---

## 📄 License

Proprietary - FinisPro Admin Dashboard

---

## 🆘 Support

For questions or issues, see the documentation or contact the development team.
