# Flutter Favorites Feature - Integration Guide

## Overview

This guide shows how to integrate the **Favorites** feature into your Flutter app. The feature allows users to save flyers to their favorites list with optimistic UI updates and backend synchronization.

## Architecture

```
features/favorites/
├── data/
│   └── favorite_api_service.dart       # API client for favorites endpoints
├── bloc/
│   ├── favorite_event.dart             # BLoC events
│   ├── favorite_state.dart             # BLoC states
│   └── favorite_bloc.dart              # BLoC logic
└── presentation/
    └── favorites_screen.dart           # Favorites list screen
```

## Features Implemented

### Backend API (✅ Complete)
- ✅ Add flyer to favorites
- ✅ Remove flyer from favorites
- ✅ Get all favorite flyers (paginated)
- ✅ Check if flyer is favorited
- ✅ Get favorite IDs for batch checking

### Flutter UI (✅ Complete)
- ✅ Favorite API service
- ✅ Favorite BLoC (state management)
- ✅ Favorites list screen
- ✅ Heart button on flyer cards
- ✅ Optimistic UI updates
- ✅ Pull-to-refresh
- ✅ Infinite scroll pagination

## Integration Steps

### Step 1: Provide BLoCs in Your App

You need to provide both `FlyerBloc` and `FavoriteBloc` at the app level or screen level.

**Option A: App-level BLoC Provider (Recommended)**

Update `main.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'features/flyers/bloc/flyer_bloc.dart';
import 'features/favorites/bloc/favorite_bloc.dart';

class TowninApp extends StatelessWidget {
  const TowninApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<FlyerBloc>(
          create: (context) => FlyerBloc(),
        ),
        BlocProvider<FavoriteBloc>(
          create: (context) => FavoriteBloc(),
        ),
      ],
      child: MaterialApp(
        title: 'Townin',
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF6366F1),
          ),
          useMaterial3: true,
        ),
        home: const LoginScreen(),
      ),
    );
  }
}
```

**Option B: Screen-level BLoC Provider**

If you prefer screen-level providers, wrap your screens:

```dart
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter/material.dart';
import 'features/flyers/bloc/flyer_bloc.dart';
import 'features/favorites/bloc/favorite_bloc.dart';
import 'features/flyers/presentation/flyer_list_screen.dart';

class FlyerScreenWrapper extends StatelessWidget {
  final String? h3Index;

  const FlyerScreenWrapper({Key? key, this.h3Index}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<FlyerBloc>(
          create: (context) => FlyerBloc(),
        ),
        BlocProvider<FavoriteBloc>(
          create: (context) => FavoriteBloc(),
        ),
      ],
      child: FlyerListScreen(h3Index: h3Index),
    );
  }
}
```

### Step 2: Add Favorites Screen to Navigation

Add a navigation item to access the favorites screen:

```dart
import 'package:flutter/material.dart';
import 'features/favorites/presentation/favorites_screen.dart';

// In your navigation bar or drawer:
ListTile(
  leading: const Icon(Icons.favorite),
  title: const Text('즐겨찾기'),
  onTap: () {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const FavoritesScreen(),
      ),
    );
  },
),
```

Or use in a bottom navigation bar:

```dart
BottomNavigationBar(
  items: const [
    BottomNavigationBarItem(
      icon: Icon(Icons.home),
      label: '홈',
    ),
    BottomNavigationBarItem(
      icon: Icon(Icons.favorite),
      label: '즐겨찾기',
    ),
    BottomNavigationBarItem(
      icon: Icon(Icons.person),
      label: '마이페이지',
    ),
  ],
  onTap: (index) {
    if (index == 1) {
      // Navigate to favorites
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => const FavoritesScreen(),
        ),
      );
    }
  },
)
```

### Step 3: Using FlyerCard with Favorites

The `FlyerCard` widget now supports favorites. Here's how to use it:

```dart
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter/material.dart';
import 'features/flyers/widgets/flyer_card.dart';
import 'features/favorites/bloc/favorite_bloc.dart';
import 'features/favorites/bloc/favorite_state.dart';
import 'features/favorites/bloc/favorite_event.dart';

// In your ListView.builder:
ListView.builder(
  itemCount: flyers.length,
  itemBuilder: (context, index) {
    final flyer = flyers[index];

    return BlocBuilder<FavoriteBloc, FavoriteState>(
      builder: (context, favoriteState) {
        bool isFavorited = false;
        if (favoriteState is FavoriteLoaded) {
          isFavorited = favoriteState.isFavorited(flyer.id);
        }

        return FlyerCard(
          flyer: flyer,
          isFavorited: isFavorited,
          onTap: () {
            // Navigate to detail screen
          },
          onFavoriteToggle: () {
            context.read<FavoriteBloc>().add(
              ToggleFavorite(
                flyerId: flyer.id,
                isFavorited: isFavorited,
              ),
            );
          },
        );
      },
    );
  },
)
```

## API Endpoints Used

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/favorites/:flyerId` | Add flyer to favorites |
| DELETE | `/favorites/:flyerId` | Remove from favorites |
| GET | `/favorites?page=1&limit=20` | Get all favorites (paginated) |
| GET | `/favorites/check/:flyerId` | Check if favorited |
| GET | `/favorites/ids` | Get all favorite IDs |

## BLoC Events

### ToggleFavorite
Toggles favorite status for a flyer (add or remove).

```dart
context.read<FavoriteBloc>().add(
  ToggleFavorite(
    flyerId: 'flyer-id',
    isFavorited: false, // current status
  ),
);
```

### LoadFavorites
Loads paginated list of favorite flyers.

```dart
context.read<FavoriteBloc>().add(
  const LoadFavorites(page: 1, limit: 20),
);
```

### LoadMoreFavorites
Loads next page (infinite scroll).

```dart
context.read<FavoriteBloc>().add(
  const LoadMoreFavorites(),
);
```

### LoadFavoriteIds
Loads just the IDs for quick lookup (used in flyer lists).

```dart
context.read<FavoriteBloc>().add(
  const LoadFavoriteIds(),
);
```

### RefreshFavorites
Refreshes the favorites list.

```dart
context.read<FavoriteBloc>().add(
  const RefreshFavorites(),
);
```

## BLoC States

### FavoriteInitial
Initial state before any data is loaded.

### FavoriteLoading
Loading state while fetching data.

### FavoriteLoaded
Data successfully loaded.

```dart
if (state is FavoriteLoaded) {
  final favorites = state.favorites; // List<FlyerModel>
  final favoriteIds = state.favoriteIds; // Set<String>
  final total = state.total; // Total count
  final hasMore = state.hasMore; // More pages available?
  final isFavorited = state.isFavorited(flyerId); // Check if favorited
}
```

### FavoriteError
Error occurred.

```dart
if (state is FavoriteError) {
  final errorMessage = state.message;
}
```

### FavoriteToggling
Optimistic update while toggling.

```dart
if (state is FavoriteToggling) {
  final flyerId = state.flyerId;
  final isAdding = state.isAdding;
}
```

## UI Components

### FlyerCard Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `flyer` | `FlyerModel` | Yes | The flyer data |
| `onTap` | `VoidCallback` | Yes | Callback when card is tapped |
| `isFavorited` | `bool?` | No | Whether flyer is favorited |
| `onFavoriteToggle` | `VoidCallback?` | No | Callback when favorite button tapped |

### FavoritesScreen Features

- ✅ Pull-to-refresh
- ✅ Infinite scroll pagination
- ✅ Empty state UI
- ✅ Error state with retry
- ✅ Loading indicators
- ✅ Favorite button on each card

## Example: Complete User Dashboard Integration

```dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../flyers/bloc/flyer_bloc.dart';
import '../flyers/bloc/flyer_event.dart';
import '../favorites/bloc/favorite_bloc.dart';
import '../favorites/bloc/favorite_event.dart';
import '../favorites/presentation/favorites_screen.dart';
import '../flyers/presentation/flyer_list_screen.dart';

class UserDashboard extends StatefulWidget {
  const UserDashboard({Key? key}) : super(key: key);

  @override
  State<UserDashboard> createState() => _UserDashboardState();
}

class _UserDashboardState extends State<UserDashboard> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const FlyerListScreen(), // Home: Flyer list
    const FavoritesScreen(), // Favorites
    const ProfileScreen(), // Profile (implement separately)
  ];

  @override
  void initState() {
    super.initState();
    // Load initial data
    context.read<FlyerBloc>().add(const LoadFeaturedFlyers());
    context.read<FavoriteBloc>().add(const LoadFavoriteIds());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() => _currentIndex = index);
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: '홈',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.favorite),
            label: '즐겨찾기',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: '마이페이지',
          ),
        ],
      ),
    );
  }
}
```

## Testing

### Manual Testing Checklist

- [ ] Tap heart icon on flyer card → Flyer added to favorites
- [ ] Tap heart icon again → Flyer removed from favorites
- [ ] Navigate to Favorites screen → See all favorited flyers
- [ ] Pull to refresh on Favorites screen → List updates
- [ ] Scroll to bottom of Favorites → Next page loads
- [ ] Remove favorite from Favorites screen → Flyer removed
- [ ] Check flyer list → Heart icon reflects correct state
- [ ] Test with no favorites → Empty state displays
- [ ] Test with network error → Error message displays with retry

### API Testing

You can test the API endpoints using the backend test scripts:

```bash
cd backend
npm run test:api
```

Or manually with curl:

```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@townin.kr","password":"password123"}' \
  | jq -r '.accessToken')

# Add favorite
curl -X POST http://localhost:3000/api/v1/favorites/{flyerId} \
  -H "Authorization: Bearer $TOKEN"

# Get favorites
curl -X GET "http://localhost:3000/api/v1/favorites?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"

# Remove favorite
curl -X DELETE http://localhost:3000/api/v1/favorites/{flyerId} \
  -H "Authorization: Bearer $TOKEN"
```

## Troubleshooting

### Issue: BLoC not found

**Error:** `Could not find the correct Provider<FavoriteBloc>`

**Solution:** Ensure `FavoriteBloc` is provided above the widget using it:

```dart
MultiBlocProvider(
  providers: [
    BlocProvider<FavoriteBloc>(create: (_) => FavoriteBloc()),
  ],
  child: YourScreen(),
)
```

### Issue: Favorite state not updating

**Problem:** Heart icon doesn't update after tapping

**Solution:** Make sure to:
1. Call `LoadFavoriteIds` on screen init
2. Use `BlocBuilder<FavoriteBloc, FavoriteState>` around `FlyerCard`
3. Check network connectivity

### Issue: Duplicate favorites

**Problem:** Same flyer added multiple times

**Solution:** Backend prevents duplicates (409 Conflict). Check error handling in `FavoriteApiService`.

## Next Steps

### Phase 1 Complete ✅
- [x] Backend API
- [x] Flutter UI
- [x] Heart button integration

### Phase 2: Share Feature (Next)
- [ ] Share button on flyer cards
- [ ] Share sheet implementation
- [ ] Deep linking for shared flyers

### Phase 3: Advanced Features
- [ ] Favorite folders/categories
- [ ] Favorite notifications (price drops, expiring soon)
- [ ] Collaborative favorites (family sharing)

## Related Documentation

- [Complete Implementation Guide](./Complete-Implementation-Guide.md)
- [Advanced Features Guide](./Advanced-Features-Implementation-Guide.md)
- [Backend API Documentation](../backend/README.md)
