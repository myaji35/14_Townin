import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'providers/home_provider.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  @override
  void initState() {
    super.initState();
    // Load dashboard data
    Future.microtask(() => ref.read(homeProvider.notifier).loadDashboard());
  }

  @override
  Widget build(BuildContext context) {
    final homeState = ref.watch(homeProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('타운인'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {
              // Navigate to notifications
            },
          ),
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () {
              // Navigate to settings
            },
          ),
        ],
      ),
      body: homeState.isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () =>
                  ref.read(homeProvider.notifier).loadDashboard(),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Points Card
                    _buildPointsCard(homeState),
                    const SizedBox(height: 16),

                    // Quick Actions
                    _buildQuickActions(),
                    const SizedBox(height: 24),

                    // User Hubs Section
                    _buildSectionHeader('내 허브', onTap: () {
                      // Navigate to hubs management
                    }),
                    const SizedBox(height: 12),
                    _buildHubsList(homeState),
                    const SizedBox(height: 24),

                    // Nearby Flyers Section
                    _buildSectionHeader('근처 전단지', onTap: () {
                      // Navigate to flyers list
                    }),
                    const SizedBox(height: 12),
                    _buildFlyersList(homeState),
                  ],
                ),
              ),
            ),
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: 0,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: '홈',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.map),
            label: '안전지도',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.receipt),
            label: '전단지',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.stars),
            label: '포인트',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: '내정보',
          ),
        ],
        onTap: (index) {
          // Handle navigation
          switch (index) {
            case 0:
              // Already on home
              break;
            case 1:
              Navigator.of(context).pushNamed('/safety-map');
              break;
            case 2:
              Navigator.of(context).pushNamed('/flyers');
              break;
            case 3:
              Navigator.of(context).pushNamed('/points');
              break;
            case 4:
              Navigator.of(context).pushNamed('/profile');
              break;
          }
        },
      ),
    );
  }

  Widget _buildPointsCard(HomeState state) {
    final totalPoints = state.dashboard?.points.totalPoints ?? 0;

    return Card(
      elevation: 2,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          gradient: const LinearGradient(
            colors: [Colors.blue, Colors.blueAccent],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              '내 포인트',
              style: TextStyle(
                color: Colors.white,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(
                  Icons.stars,
                  color: Colors.yellowAccent,
                  size: 32,
                ),
                const SizedBox(width: 8),
                Text(
                  '$totalPoints P',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                TextButton.icon(
                  onPressed: () {
                    // Navigate to points detail
                  },
                  icon: const Icon(Icons.history, color: Colors.white),
                  label: const Text(
                    '포인트 내역',
                    style: TextStyle(color: Colors.white),
                  ),
                  style: TextButton.styleFrom(
                    backgroundColor: Colors.white24,
                  ),
                ),
                const Icon(
                  Icons.arrow_forward_ios,
                  color: Colors.white,
                  size: 16,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActions() {
    final actions = [
      {'icon': Icons.map, 'label': '안전지도', 'route': '/safety-map'},
      {'icon': Icons.receipt, 'label': '전단지', 'route': '/flyers'},
      {'icon': Icons.location_on, 'label': '허브 추가', 'route': '/add-hub'},
      {'icon': Icons.more_horiz, 'label': '더보기', 'route': '/more'},
    ];

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children: actions.map((action) {
        return InkWell(
          onTap: () {
            Navigator.of(context).pushNamed(action['route'] as String);
          },
          borderRadius: BorderRadius.circular(12),
          child: Container(
            width: 80,
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.blue.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    action['icon'] as IconData,
                    color: Colors.blue,
                    size: 28,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  action['label'] as String,
                  style: const TextStyle(fontSize: 12),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildSectionHeader(String title, {VoidCallback? onTap}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        if (onTap != null)
          TextButton(
            onPressed: onTap,
            child: const Text('더보기'),
          ),
      ],
    );
  }

  Widget _buildHubsList(HomeState state) {
    final hubs = state.dashboard?.hubs.hubs ?? [];

    if (hubs.isEmpty) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const Icon(Icons.location_off, size: 48, color: Colors.grey),
              const SizedBox(height: 12),
              const Text('등록된 허브가 없습니다'),
              const SizedBox(height: 8),
              ElevatedButton.icon(
                onPressed: () {
                  // Navigate to add hub
                },
                icon: const Icon(Icons.add),
                label: const Text('허브 추가하기'),
              ),
            ],
          ),
        ),
      );
    }

    return SizedBox(
      height: 120,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: hubs.length,
        itemBuilder: (context, index) {
          final hub = hubs[index];
          return Card(
            margin: const EdgeInsets.only(right: 12),
            child: Container(
              width: 160,
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    _getHubIcon(hub['hubType']),
                    size: 32,
                    color: Colors.blue,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    hub['name'] ?? '',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    hub['address'] ?? '',
                    style: const TextStyle(
                      fontSize: 12,
                      color: Colors.grey,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildFlyersList(HomeState state) {
    final flyers = state.dashboard?.nearbyFlyers ?? [];

    if (flyers.isEmpty) {
      return const Card(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Center(
            child: Text('근처에 전단지가 없습니다'),
          ),
        ),
      );
    }

    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: flyers.length > 3 ? 3 : flyers.length,
      itemBuilder: (context, index) {
        final flyer = flyers[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            leading: flyer['thumbnailUrl'] != null
                ? Image.network(
                    flyer['thumbnailUrl'],
                    width: 60,
                    height: 60,
                    fit: BoxFit.cover,
                  )
                : Container(
                    width: 60,
                    height: 60,
                    color: Colors.grey[300],
                    child: const Icon(Icons.image),
                  ),
            title: Text(flyer['title'] ?? ''),
            subtitle: Text(
              flyer['merchantName'] ?? '',
              style: const TextStyle(fontSize: 12),
            ),
            trailing: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                const Icon(Icons.visibility, size: 16, color: Colors.grey),
                Text(
                  '${flyer['viewCount'] ?? 0}',
                  style: const TextStyle(fontSize: 12),
                ),
              ],
            ),
            onTap: () {
              // Navigate to flyer detail
            },
          ),
        );
      },
    );
  }

  IconData _getHubIcon(String? hubType) {
    switch (hubType) {
      case 'residence':
        return Icons.home;
      case 'workplace':
        return Icons.business;
      case 'family_home':
        return Icons.family_restroom;
      default:
        return Icons.location_on;
    }
  }
}
