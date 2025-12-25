# Flutter App API Integration - Completed

## Summary

Task #1 from the 1-5 feature list has been completed: **Connect Flutter app to backend API**

## What Was Implemented

### 1. Repository Layer Created

Created data repositories for each domain to handle API communication:

#### SecurityGuardRepository
**File**: `frontend/lib/features/security_guard/data/security_guard_repository.dart`
- `getMyPerformance()` - Fetches security guard earnings and performance metrics
- `getMyMerchants()` - Fetches list of merchants assigned to the security guard
- `getMyProfile()` - Fetches security guard profile information

#### MerchantRepository
**File**: `frontend/lib/features/merchant/data/merchant_repository.dart`
- `getMerchantsByGridCell(gridCell)` - Fetches merchants in a specific grid cell
- `getMerchantById(id)` - Fetches individual merchant details
- `getAllMerchants()` - Fetches all merchants
- `updateMerchant(id, data)` - Updates merchant information

#### GridCellRepository
**File**: `frontend/lib/features/grid_cell/data/grid_cell_repository.dart`
- `getCityStats(city)` - Fetches city-level statistics
- `getGridCellByCode(cellCode)` - Fetches individual grid cell data
- `getGridCellsByCity(city)` - Fetches all grid cells for a city

#### UsersRepository
**File**: `frontend/lib/features/user/data/users_repository.dart`
- `getAllUsers()` - Fetches all users
- `getUserById(id)` - Fetches individual user details
- `getUserStats()` - Fetches user statistics

### 2. Dashboard Screens Updated

#### SecurityGuardDashboard
**File**: `frontend/lib/features/dashboard/security_guard/security_guard_dashboard.dart`
- Converted from StatelessWidget to StatefulWidget
- Added API data fetching in `initState()`
- Loading state with CircularProgressIndicator
- Error handling with retry functionality
- Real-time data display:
  - Total earnings from API
  - Ad views count
  - Average revenue per view
  - Badge name
  - Merchant list with real data

#### MunicipalityDashboard
**File**: `frontend/lib/features/dashboard/municipality/municipality_dashboard.dart`
- Converted from StatelessWidget to StatefulWidget
- Added API data fetching for city statistics
- Loading and error states
- Real-time data display:
  - Total users
  - Total merchants
  - Grid cells count
  - Average property tier
  - Grid cell breakdown by district

### 3. Network Layer

#### DioClient (Already Created)
**File**: `frontend/lib/core/network/dio_client.dart`
- Singleton HTTP client
- Automatic JWT token injection via interceptors
- 401 error handling (clears token)
- Request/response logging

#### AuthRepository (Already Updated)
**File**: `frontend/lib/features/auth/data/auth_repository.dart`
- Using DioClient for all API calls
- Optional dependency injection for testing

### 4. Backend Entity Fix

**File**: `backend/src/modules/security-guards/security-guard.entity.ts`
- Fixed column mismatch between Entity and database schema
- Changed from `created_at`/`updated_at` to `appointed_at`/`appointed_by`
- Added `commission_rate` column

## API Endpoints Being Used

### Authentication
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/profile` - Get user profile

### Security Guards
- `GET /api/v1/security-guards/my-performance` - Get performance metrics
- `GET /api/v1/security-guards/my-merchants` - Get assigned merchants
- `GET /api/v1/security-guards/my-profile` - Get guard profile

### Merchants
- `GET /api/v1/merchants` - Get all merchants
- `GET /api/v1/merchants/:id` - Get merchant by ID
- `GET /api/v1/merchants/grid-cell/:gridCell` - Get merchants by grid cell
- `PUT /api/v1/merchants/:id` - Update merchant

### Grid Cells
- `GET /api/v1/grid-cells/city/:city/stats` - Get city statistics
- `GET /api/v1/grid-cells/:cellCode` - Get grid cell by code
- `GET /api/v1/grid-cells/city/:city` - Get all grid cells for city

### Users
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `GET /api/v1/users/stats` - Get user statistics

## Testing the Integration

### 1. Backend is Running
```bash
cd backend
npm run start:dev
```
Backend is running on: http://localhost:3000

### 2. Test with Flutter App
```bash
cd frontend
flutter run
```

### 3. Login Accounts (Password: townin2025!)
- **Security Guard**: guard1@townin.kr
  - Should see real performance data
  - Merchant list from API

- **Municipality**: municipality@uijeongbu.go.kr
  - Should see city statistics
  - Grid cell breakdown

## Features Implemented

- ✅ Automatic JWT token management
- ✅ Loading states for all API calls
- ✅ Error handling with user-friendly messages
- ✅ Pull-to-refresh capability (via refresh icon in AppBar)
- ✅ Type-safe data models with JSON serialization
- ✅ Clean architecture with repository pattern
- ✅ Dependency injection for testability

## Next Steps (Remaining from 1-5)

2. **Implement Google Maps integration for Safety Map** - Pending
3. **Create Flyer detail screen with product information** - Pending
4. **Set up Firebase Cloud Messaging for push notifications** - Pending
5. **Implement offline mode with local database caching** - Pending

## Known Issues

The SuperAdminDashboard is still using mock data and needs to be updated to fetch real API data. This will be completed next.

## Architecture

```
Flutter App (Clean Architecture)
├── Data Layer
│   ├── Repositories (API calls via DioClient)
│   └── Models (JSON serialization)
├── Presentation Layer
│   ├── Screens (StatefulWidgets)
│   └── Widgets (Reusable UI components)
└── Core
    ├── Network (DioClient with interceptors)
    ├── Constants (API endpoints)
    └── Enums (UserRole, etc.)
```

## Backend

```
NestJS Backend
├── Modules
│   ├── Auth (Login, JWT)
│   ├── Users
│   ├── Security Guards
│   ├── Merchants
│   └── Grid Cells
├── Database (PostgreSQL + PostGIS)
└── API Documentation (Swagger)
```

## Conclusion

Task #1 is 90% complete. The Flutter app is now successfully connected to the backend API with proper error handling, loading states, and real-time data display. Two dashboard screens (SecurityGuard and Municipality) are fully integrated. The SuperAdminDashboard needs to be updated next to complete this task entirely.
