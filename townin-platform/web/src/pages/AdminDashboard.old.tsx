import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import api from '../services/api';
import './AdminDashboard.css';

interface SystemStats {
  totalUsers: number;
  totalFlyers: number;
  activeFlyers: number;
  usersByRole: Array<{ role: string; count: number }>;
}

interface UserData {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

interface FlyerData {
  id: string;
  title: string;
  description: string;
  merchantEmail: string;
  isActive: boolean;
  createdAt: string;
  expiresAt: string;
}

interface RegionData {
  id: string;
  name: string;
  level: 'city' | 'district' | 'neighborhood';
  code: string;
  parent_id: string | null;
  master_id: string | null;
  master?: {
    id: string;
    email: string;
  };
  totalUsers: number;
  totalMerchants: number;
  totalFlyers: number;
  livabilityIndex: number;
  safetyScore: number;
  isActive: boolean;
  children?: RegionData[];
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [flyers, setFlyers] = useState<FlyerData[]>([]);
  const [regions, setRegions] = useState<RegionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'flyers' | 'regions' | 'logs'>('overview');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMasterModal, setShowMasterModal] = useState(false);

  // User management filters
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userCityFilter, setUserCityFilter] = useState('');
  const [userDistrictFilter, setUserDistrictFilter] = useState('');
  const [userNeighborhoodFilter, setUserNeighborhoodFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);

  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getUser();
    if (!currentUser || (currentUser.role !== 'super_admin' && currentUser.role !== 'admin')) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    loadAdminData();
  }, [navigate]);

  const loadAdminData = async () => {
    try {
      // Mock data for stats
      const mockStats: SystemStats = {
        totalUsers: 1543,
        totalFlyers: 89,
        activeFlyers: 67,
        usersByRole: [
          { role: 'user', count: 1245 },
          { role: 'merchant', count: 287 },
          { role: 'admin', count: 8 },
          { role: 'super_admin', count: 3 }
        ]
      };

      // Mock data for users
      const mockUsers: UserData[] = [
        {
          id: '1',
          email: 'admin@townin.com',
          role: 'admin',
          isActive: true,
          createdAt: '2024-01-15T08:00:00Z',
          lastLoginAt: '2024-03-20T14:30:00Z'
        },
        {
          id: '2',
          email: 'merchant1@store.com',
          role: 'merchant',
          isActive: true,
          createdAt: '2024-02-01T10:00:00Z',
          lastLoginAt: '2024-03-20T12:00:00Z'
        },
        {
          id: '3',
          email: 'user1@example.com',
          role: 'user',
          isActive: true,
          createdAt: '2024-02-15T09:00:00Z',
          lastLoginAt: '2024-03-20T11:00:00Z'
        },
        {
          id: '4',
          email: 'merchant2@shop.com',
          role: 'merchant',
          isActive: false,
          createdAt: '2024-01-20T11:00:00Z',
          lastLoginAt: '2024-03-01T10:00:00Z'
        },
        {
          id: '5',
          email: 'user2@example.com',
          role: 'user',
          isActive: true,
          createdAt: '2024-03-01T14:00:00Z',
          lastLoginAt: '2024-03-19T16:00:00Z'
        }
      ];

      setStats(mockStats);
      setUsers(mockUsers);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFlyers = async () => {
    try {
      // Mock data for flyers
      const mockFlyers: FlyerData[] = [
        {
          id: '1',
          title: '봄맞이 대세일',
          description: '신선한 과일과 채소 30% 할인',
          merchantEmail: 'merchant1@store.com',
          isActive: true,
          createdAt: '2024-03-15T10:00:00Z',
          expiresAt: '2024-03-31T23:59:59Z'
        },
        {
          id: '2',
          title: '커피 1+1 이벤트',
          description: '아메리카노 1+1, 라떼 20% 할인',
          merchantEmail: 'cafe@shop.com',
          isActive: true,
          createdAt: '2024-03-18T09:00:00Z',
          expiresAt: '2024-03-25T23:59:59Z'
        },
        {
          id: '3',
          title: '헬스장 신규 회원 모집',
          description: '첫달 50% 할인, PT 3회 무료',
          merchantEmail: 'gym@fitness.com',
          isActive: false,
          createdAt: '2024-03-10T08:00:00Z',
          expiresAt: '2024-03-20T23:59:59Z'
        }
      ];
      setFlyers(mockFlyers);
    } catch (error) {
      console.error('Failed to load flyers:', error);
    }
  };

  const loadRegions = async () => {
    try {
      // Mock data for regions
      const mockRegions: RegionData[] = [
        {
          id: '1',
          name: '의정부시',
          level: 'city',
          code: '41150',
          parent_id: null,
          master_id: 'master1',
          master: {
            id: 'master1',
            email: 'master1@townin.com'
          },
          totalUsers: 456,
          totalMerchants: 45,
          totalFlyers: 23,
          livabilityIndex: 78,
          safetyScore: 82,
          isActive: true,
          children: [
            {
              id: '2',
              name: '의정부1동',
              level: 'district',
              code: '41150001',
              parent_id: '1',
              master_id: null,
              totalUsers: 120,
              totalMerchants: 12,
              totalFlyers: 8,
              livabilityIndex: 75,
              safetyScore: 80,
              isActive: true
            },
            {
              id: '3',
              name: '의정부2동',
              level: 'district',
              code: '41150002',
              parent_id: '1',
              master_id: null,
              totalUsers: 150,
              totalMerchants: 15,
              totalFlyers: 10,
              livabilityIndex: 80,
              safetyScore: 85,
              isActive: true
            }
          ]
        },
        {
          id: '4',
          name: '양주시',
          level: 'city',
          code: '41630',
          parent_id: null,
          master_id: 'master2',
          master: {
            id: 'master2',
            email: 'master2@townin.com'
          },
          totalUsers: 234,
          totalMerchants: 28,
          totalFlyers: 15,
          livabilityIndex: 72,
          safetyScore: 78,
          isActive: true,
          children: []
        }
      ];
      setRegions(mockRegions);
    } catch (error) {
      console.error('Failed to load regions:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'flyers' && flyers.length === 0) {
      loadFlyers();
    }
    if (activeTab === 'regions' && regions.length === 0) {
      loadRegions();
    }
    if (activeTab === 'users' && regions.length === 0) {
      loadRegions();
    }
  }, [activeTab]);

  const handleLogout = () => {
    authService.logout();
  };

  const handleToggleUserActive = async (userId: string) => {
    try {
      await api.patch(`/admin/users/${userId}/toggle-active`);
      await loadAdminData();
    } catch (error) {
      console.error('Failed to toggle user active:', error);
      alert('사용자 상태 변경에 실패했습니다.');
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      await loadAdminData();
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to update user role:', error);
      alert('역할 변경에 실패했습니다.');
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`정말로 ${email} 계정을 삭제하시겠습니까?`)) {
      return;
    }
    try {
      await api.delete(`/admin/users/${userId}`);
      await loadAdminData();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('사용자 삭제에 실패했습니다.');
    }
  };

  const handleToggleFlyerActive = async (flyerId: string) => {
    try {
      await api.patch(`/admin/flyers/${flyerId}/toggle-active`);
      await loadFlyers();
    } catch (error) {
      console.error('Failed to toggle flyer active:', error);
      alert('전단지 상태 변경에 실패했습니다.');
    }
  };

  const handleDeleteFlyer = async (flyerId: string, title: string) => {
    if (!confirm(`정말로 "${title}" 전단지를 삭제하시겠습니까?`)) {
      return;
    }
    try {
      await api.delete(`/admin/flyers/${flyerId}`);
      await loadFlyers();
    } catch (error) {
      console.error('Failed to delete flyer:', error);
      alert('전단지 삭제에 실패했습니다.');
    }
  };

  const handleVisitDashboard = (role: string, email: string) => {
    // 사용자의 역할에 따라 다른 대시보드로 이동 (이메일을 쿼리 파라미터로 전달)
    switch(role) {
      case 'admin':
      case 'super_admin':
        navigate(`/admin/dashboard?email=${encodeURIComponent(email)}`);
        break;
      case 'merchant':
        navigate(`/ceo/dashboard?email=${encodeURIComponent(email)}`);
        break;
      case 'security_guard':
        navigate(`/guard/dashboard?email=${encodeURIComponent(email)}`);
        break;
      case 'user':
      default:
        navigate(`/dashboard?email=${encodeURIComponent(email)}`);
        break;
    }
  };

  const getRoleLabel = (role: string): string => {
    const labels: Record<string, string> = {
      user: '일반 사용자',
      merchant: '상인',
      security_guard: '보안요원',
      municipality: '공무원',
      super_admin: '시스템 관리자',
    };
    return labels[role] || role;
  };

  const getRoleBadgeColor = (role: string): string => {
    const colors: Record<string, string> = {
      super_admin: '#dc2626',
      municipality: '#2563eb',
      security_guard: '#16a34a',
      merchant: '#ea580c',
      user: '#64748b',
    };
    return colors[role] || '#64748b';
  };

  // Filter regions based on search query
  const filterRegions = (regions: RegionData[], query: string): RegionData[] => {
    if (!query.trim()) return regions;

    return regions.map(region => {
      const matchesSearch = region.name.toLowerCase().includes(query.toLowerCase());
      const filteredChildren = region.children ? filterRegions(region.children, query) : [];

      if (matchesSearch || filteredChildren.length > 0) {
        return {
          ...region,
          children: filteredChildren.length > 0 ? filteredChildren : region.children
        };
      }
      return null;
    }).filter((r): r is RegionData => r !== null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user || !stats) {
    return <div className="loading">데이터를 불러올 수 없습니다.</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Townin - 시스템 관리자 대시보드</h1>
        <div className="user-info">
          <span>{user.email}</span>
          <button onClick={handleLogout} className="logout-button">
            로그아웃
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div style={{
        background: 'white',
        borderBottom: '2px solid #e5e7eb',
        padding: '0 32px',
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'overview', label: '개요' },
            { id: 'users', label: '사용자 관리' },
            { id: 'flyers', label: '전단지 관리' },
            { id: 'regions', label: '지역 관리' },
            { id: 'logs', label: '활동 로그' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '16px 24px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.id ? '3px solid #667eea' : '3px solid transparent',
                color: activeTab === tab.id ? '#667eea' : '#6b7280',
                fontSize: '16px',
                fontWeight: activeTab === tab.id ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="dashboard-main">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <div className="dashboard-welcome">
              <h2>환영합니다, 관리자님!</h2>
              <p>Townin 플랫폼 전체를 관리하고 모니터링합니다.</p>
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>총 사용자</h3>
                <p className="card-value">{stats.totalUsers}</p>
                <p className="card-label">등록된 사용자</p>
              </div>

              <div className="dashboard-card">
                <h3>총 전단지</h3>
                <p className="card-value">{stats.totalFlyers}</p>
                <p className="card-label">등록된 전단지</p>
              </div>

              <div className="dashboard-card">
                <h3>활성 전단지</h3>
                <p className="card-value">{stats.activeFlyers}</p>
                <p className="card-label">현재 활성화</p>
              </div>

              <div className="dashboard-card">
                <h3>시스템 상태</h3>
                <p className="card-value" style={{ color: '#16a34a' }}>정상</p>
                <p className="card-label">모든 서비스 작동 중</p>
              </div>
            </div>

            <div className="dashboard-section">
              <h3>역할별 사용자 분포</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
                {stats.usersByRole.map((item) => (
                  <div
                    key={item.role}
                    style={{
                      padding: '20px',
                      background: 'white',
                      borderRadius: '12px',
                      border: `2px solid ${getRoleBadgeColor(item.role)}`,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '32px', fontWeight: '700', color: getRoleBadgeColor(item.role) }}>
                      {item.count}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
                      {getRoleLabel(item.role)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Users Management Tab */}
        {activeTab === 'users' && (
          <UsersManagement
            users={users}
            regions={regions}
            onToggleActive={handleToggleUserActive}
            onChangeRole={(user) => setSelectedUser(user)}
            onDelete={handleDeleteUser}
            onRefresh={loadAdminData}
            onVisitDashboard={handleVisitDashboard}
            getRoleLabel={getRoleLabel}
            getRoleBadgeColor={getRoleBadgeColor}
          />
        )}

        {/* Flyers Management Tab */}
        {activeTab === 'flyers' && (
          <FlyersStatsDashboard
            flyers={flyers}
            users={users}
            regions={regions}
            onRefresh={loadFlyers}
          />
        )}

        {/* Regions Management Tab */}
        {activeTab === 'regions' && (
          <RegionsManagement
            regions={regions}
            users={users}
            onEdit={(region) => {
              setSelectedRegion(region);
              setShowEditModal(true);
            }}
            onAssignMaster={(region) => {
              setSelectedRegion(region);
              setShowMasterModal(true);
            }}
            onAddNew={() => setShowAddModal(true)}
            onRefresh={loadRegions}
          />
        )}

        {/* Activity Feed Tab */}
        {activeTab === 'logs' && (
          <PlatformActivityFeed
            users={users}
            flyers={flyers}
            regions={regions}
          />
        )}
      </main>

      {/* Role Change Modal */}
      {selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '400px',
            width: '90%',
          }}>
            <h3 style={{ marginBottom: '16px' }}>역할 변경</h3>
            <p style={{ marginBottom: '24px', color: '#6b7280' }}>
              {selectedUser.email}의 역할을 변경합니다.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['user', 'merchant', 'security_guard', 'municipality', 'super_admin'].map((role) => (
                <button
                  key={role}
                  onClick={() => handleUpdateUserRole(selectedUser.id, role)}
                  style={{
                    padding: '12px 16px',
                    background: selectedUser.role === role ? '#667eea' : 'white',
                    color: selectedUser.role === role ? 'white' : '#667eea',
                    border: `2px solid ${getRoleBadgeColor(role)}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  {getRoleLabel(role)}
                </button>
              ))}
            </div>
            <button
              onClick={() => setSelectedUser(null)}
              style={{
                marginTop: '24px',
                width: '100%',
                padding: '12px',
                background: '#f3f4f6',
                color: '#6b7280',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* Region Edit Modal */}
      {showEditModal && selectedRegion && (
        <RegionEditModal
          region={selectedRegion}
          onClose={() => {
            setShowEditModal(false);
            setSelectedRegion(null);
          }}
          onSave={async (data) => {
            try {
              await api.patch(`/regions/${selectedRegion.id}`, data);
              await loadRegions();
              setShowEditModal(false);
              setSelectedRegion(null);
              alert('지역 정보가 수정되었습니다.');
            } catch (error) {
              console.error('Failed to update region:', error);
              alert('지역 정보 수정에 실패했습니다.');
            }
          }}
        />
      )}

      {/* Master Assignment Modal */}
      {showMasterModal && selectedRegion && (
        <MasterAssignmentModal
          region={selectedRegion}
          users={users}
          onClose={() => {
            setShowMasterModal(false);
            setSelectedRegion(null);
          }}
          onAssign={async (userId) => {
            try {
              await api.post(`/regions/${selectedRegion.id}/master`, { userId });
              await loadRegions();
              setShowMasterModal(false);
              setSelectedRegion(null);
              alert('마스터가 배정되었습니다.');
            } catch (error) {
              console.error('Failed to assign master:', error);
              alert('마스터 배정에 실패했습니다.');
            }
          }}
        />
      )}

      {/* Add Region Modal */}
      {showAddModal && (
        <AddRegionModal
          regions={regions}
          onClose={() => setShowAddModal(false)}
          onAdd={async (data) => {
            try {
              await api.post('/regions', data);
              await loadRegions();
              setShowAddModal(false);
              alert('새 지역이 추가되었습니다.');
            } catch (error) {
              console.error('Failed to add region:', error);
              alert('지역 추가에 실패했습니다.');
            }
          }}
        />
      )}
    </div>
  );
}

// Users Management Component
function UsersManagement({
  users,
  regions,
  onToggleActive,
  onChangeRole,
  onDelete,
  onRefresh,
  onVisitDashboard,
  getRoleLabel,
  getRoleBadgeColor
}: {
  users: UserData[];
  regions: RegionData[];
  onToggleActive: (userId: string) => void;
  onChangeRole: (user: UserData) => void;
  onDelete: (userId: string, email: string) => void;
  onRefresh: () => void;
  onVisitDashboard: (role: string, email: string) => void;
  getRoleLabel: (role: string) => string;
  getRoleBadgeColor: (role: string) => string;
}) {
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Extract regions hierarchy
  const cities = regions;
  const districts = selectedCity
    ? (regions.find(r => r.id === selectedCity)?.children || [])
    : [];
  const neighborhoods = selectedDistrict
    ? (districts.find(r => r.id === selectedDistrict)?.children || [])
    : [];

  // Filter users
  const filteredUsers = users.filter(user => {
    // Role filter
    if (roleFilter !== 'all' && user.role !== roleFilter) return false;

    // Search filter (email)
    if (searchQuery && !user.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;

    // TODO: Region filter would need user.regionId or similar field
    // For now, we skip region filtering

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, searchQuery, selectedCity, selectedDistrict, selectedNeighborhood]);

  return (
    <div className="dashboard-section">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3>사용자 관리 (총 {filteredUsers.length}명)</h3>
        <button
          onClick={onRefresh}
          style={{
            padding: '8px 16px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          🔄 새로고침
        </button>
      </div>

      {/* Role Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: '0',
      }}>
        {[
          { id: 'all', label: '전체', count: users.length },
          { id: 'user', label: '일반 사용자', count: users.filter(u => u.role === 'user').length },
          { id: 'merchant', label: '상인', count: users.filter(u => u.role === 'merchant').length },
          { id: 'security_guard', label: '보안관', count: users.filter(u => u.role === 'security_guard').length },
          { id: 'municipality', label: '지자체', count: users.filter(u => u.role === 'municipality').length },
          { id: 'super_admin', label: '시스템 관리자', count: users.filter(u => u.role === 'super_admin').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setRoleFilter(tab.id)}
            style={{
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom: roleFilter === tab.id ? '3px solid #667eea' : '3px solid transparent',
              color: roleFilter === tab.id ? '#667eea' : '#6b7280',
              fontSize: '14px',
              fontWeight: roleFilter === tab.id ? '600' : '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label} <span style={{
              marginLeft: '6px',
              padding: '2px 8px',
              background: roleFilter === tab.id ? '#667eea' : '#e5e7eb',
              color: roleFilter === tab.id ? 'white' : '#6b7280',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600',
            }}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        background: '#f9fafb',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px',
      }}>
        {/* Search */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
            🔍 이메일 검색
          </label>
          <input
            type="text"
            placeholder="사용자 이메일로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
          />
        </div>

        {/* Region Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {/* City Select */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
              📍 시/도
            </label>
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setSelectedDistrict('');
                setSelectedNeighborhood('');
              }}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                background: 'white',
                cursor: 'pointer',
              }}
            >
              <option value="">전체</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          {/* District Select */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
              📍 시/군/구
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setSelectedNeighborhood('');
              }}
              disabled={!selectedCity}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                background: selectedCity ? 'white' : '#f3f4f6',
                cursor: selectedCity ? 'pointer' : 'not-allowed',
              }}
            >
              <option value="">전체</option>
              {districts.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
            </select>
          </div>

          {/* Neighborhood Select */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
              📍 읍/면/동
            </label>
            <select
              value={selectedNeighborhood}
              onChange={(e) => setSelectedNeighborhood(e.target.value)}
              disabled={!selectedDistrict}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                background: selectedDistrict ? 'white' : '#f3f4f6',
                cursor: selectedDistrict ? 'pointer' : 'not-allowed',
              }}
            >
              <option value="">전체</option>
              {neighborhoods.map((neighborhood) => (
                <option key={neighborhood.id} value={neighborhood.id}>
                  {neighborhood.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {(roleFilter !== 'all' || searchQuery || selectedCity) && (
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>활성 필터:</span>
            {roleFilter !== 'all' && (
              <span style={{
                padding: '4px 12px',
                background: '#667eea',
                color: 'white',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600',
              }}>
                역할: {getRoleLabel(roleFilter)}
              </span>
            )}
            {searchQuery && (
              <span style={{
                padding: '4px 12px',
                background: '#667eea',
                color: 'white',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600',
              }}>
                검색: "{searchQuery}"
              </span>
            )}
            {selectedCity && (
              <span style={{
                padding: '4px 12px',
                background: '#667eea',
                color: 'white',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600',
              }}>
                지역: {cities.find(c => c.id === selectedCity)?.name}
                {selectedDistrict && ` > ${districts.find(d => d.id === selectedDistrict)?.name}`}
                {selectedNeighborhood && ` > ${neighborhoods.find(n => n.id === selectedNeighborhood)?.name}`}
              </span>
            )}
          </div>
        )}
      </div>

      {/* User Table */}
      {paginatedUsers.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#6b7280', background: '#f9fafb', borderRadius: '12px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
          <div style={{ fontSize: '16px', fontWeight: '500' }}>검색 결과가 없습니다</div>
          <div style={{ fontSize: '14px', marginTop: '8px' }}>필터 조건을 변경해보세요</div>
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}>
              <thead>
                <tr style={{
                  borderBottom: '2px solid #e5e7eb',
                  background: '#f9fafb',
                }}>
                  <th style={{ padding: '14px 12px', fontSize: '13px', fontWeight: '700', color: '#374151', textAlign: 'left' }}>이메일</th>
                  <th style={{ padding: '14px 12px', fontSize: '13px', fontWeight: '700', color: '#374151', textAlign: 'center' }}>역할</th>
                  <th style={{ padding: '14px 12px', fontSize: '13px', fontWeight: '700', color: '#374151', textAlign: 'center' }}>상태</th>
                  <th style={{ padding: '14px 12px', fontSize: '13px', fontWeight: '700', color: '#374151', textAlign: 'center' }}>가입일</th>
                  <th style={{ padding: '14px 12px', fontSize: '13px', fontWeight: '700', color: '#374151', textAlign: 'center' }}>최근 로그인</th>
                  <th style={{ padding: '14px 12px', fontSize: '13px', fontWeight: '700', color: '#374151', textAlign: 'center' }}>관리</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((userData, index) => (
                  <tr key={userData.id} style={{
                    borderBottom: '1px solid #f3f4f6',
                    background: index % 2 === 0 ? 'white' : '#fafafa',
                  }}>
                    <td style={{ padding: '14px 12px', fontSize: '14px', color: '#1f2937' }}>{userData.email}</td>
                    <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '5px 14px',
                        borderRadius: '14px',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: 'white',
                        background: getRoleBadgeColor(userData.role),
                      }}>
                        {getRoleLabel(userData.role)}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '5px 14px',
                        borderRadius: '14px',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: userData.isActive ? '#16a34a' : '#dc2626',
                        background: userData.isActive ? '#dcfce7' : '#fee2e2',
                      }}>
                        {userData.isActive ? '✓ 활성' : '✗ 비활성'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px', fontSize: '13px', color: '#6b7280', textAlign: 'center' }}>
                      {new Date(userData.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td style={{ padding: '14px 12px', fontSize: '13px', color: '#6b7280', textAlign: 'center' }}>
                      {userData.lastLoginAt ? new Date(userData.lastLoginAt).toLocaleDateString('ko-KR') : '-'}
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button
                          onClick={() => onToggleActive(userData.id)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            background: userData.isActive ? '#fee2e2' : '#dcfce7',
                            color: userData.isActive ? '#dc2626' : '#16a34a',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                          }}
                        >
                          {userData.isActive ? '비활성화' : '활성화'}
                        </button>
                        <button
                          onClick={() => onChangeRole(userData)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            background: '#dbeafe',
                            color: '#2563eb',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                          }}
                        >
                          역할 변경
                        </button>
                        <button
                          onClick={() => onDelete(userData.id, userData.email)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            background: '#fee2e2',
                            color: '#dc2626',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                          }}
                        >
                          삭제
                        </button>
                        <button
                          onClick={() => onVisitDashboard(userData.role, userData.email)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            background: '#e9d5ff',
                            color: '#7c3aed',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                          }}
                        >
                          방문
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              marginTop: '24px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
            }}>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 16px',
                  background: currentPage === 1 ? '#f3f4f6' : 'white',
                  color: currentPage === 1 ? '#9ca3af' : '#667eea',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                }}
              >
                ← 이전
              </button>

              <div style={{ display: 'flex', gap: '4px' }}>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      style={{
                        padding: '8px 12px',
                        background: currentPage === pageNum ? '#667eea' : 'white',
                        color: currentPage === pageNum ? 'white' : '#374151',
                        border: '2px solid ' + (currentPage === pageNum ? '#667eea' : '#e5e7eb'),
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px',
                        minWidth: '40px',
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 16px',
                  background: currentPage === totalPages ? '#f3f4f6' : 'white',
                  color: currentPage === totalPages ? '#9ca3af' : '#667eea',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                }}
              >
                다음 →
              </button>

              <span style={{
                marginLeft: '16px',
                fontSize: '14px',
                color: '#6b7280',
                fontWeight: '500',
              }}>
                {currentPage} / {totalPages} 페이지
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Regions Management Component
function RegionsManagement({
  regions,
  users,
  onEdit,
  onAssignMaster,
  onAddNew,
  onRefresh
}: {
  regions: RegionData[];
  users: UserData[];
  onEdit: (region: RegionData) => void;
  onAssignMaster: (region: RegionData) => void;
  onAddNew: () => void;
  onRefresh: () => void;
}) {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract regions hierarchy
  const cities = regions;
  const districts = selectedCity
    ? (regions.find(r => r.id === selectedCity)?.children || [])
    : [];
  const neighborhoods = selectedDistrict
    ? (districts.find(r => r.id === selectedDistrict)?.children || [])
    : [];

  // Get regions to display based on selection
  const getDisplayRegions = (): RegionData[] => {
    if (selectedDistrict) {
      return neighborhoods;
    } else if (selectedCity) {
      return districts;
    } else {
      return cities;
    }
  };

  // Filter by search
  const filteredRegions = getDisplayRegions().filter(region =>
    !searchQuery || region.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      city: '시/도',
      district: '시/군/구',
      neighborhood: '동/읍/면',
    };
    return labels[level] || level;
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      city: '#2563eb',
      district: '#7c3aed',
      neighborhood: '#059669',
    };
    return colors[level] || '#64748b';
  };

  return (
    <div className="dashboard-section">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3>지역 관리 ({filteredRegions.length}개)</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onAddNew}
            style={{
              padding: '8px 16px',
              background: '#16a34a',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            + 새 지역 추가
          </button>
          <button
            onClick={onRefresh}
            style={{
              padding: '8px 16px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            🔄 새로고침
          </button>
        </div>
      </div>

      {/* Region Selection Filters */}
      <div style={{
        background: '#f9fafb',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px',
      }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
            🔍 지역 이름 검색
          </label>
          <input
            type="text"
            placeholder="지역 이름으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
          {/* City Select */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
              📍 시/도 선택
            </label>
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setSelectedDistrict('');
              }}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                background: 'white',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              <option value="">전국 (시/도 목록)</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          {/* District Select */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
              📍 시/군/구 선택
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={!selectedCity}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                background: selectedCity ? 'white' : '#f3f4f6',
                cursor: selectedCity ? 'pointer' : 'not-allowed',
                fontWeight: '500',
              }}
            >
              <option value="">선택한 시/도의 시/군/구 목록</option>
              {districts.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Breadcrumb */}
        {(selectedCity || selectedDistrict) && (
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>현재 위치:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => {
                  setSelectedCity('');
                  setSelectedDistrict('');
                }}
                style={{
                  padding: '4px 12px',
                  background: 'white',
                  color: '#667eea',
                  border: '2px solid #667eea',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                🏠 전국
              </button>
              {selectedCity && (
                <>
                  <span style={{ color: '#9ca3af' }}>→</span>
                  <button
                    onClick={() => setSelectedDistrict('')}
                    style={{
                      padding: '4px 12px',
                      background: selectedDistrict ? 'white' : '#667eea',
                      color: selectedDistrict ? '#667eea' : 'white',
                      border: `2px solid #667eea`,
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    {cities.find(c => c.id === selectedCity)?.name}
                  </button>
                </>
              )}
              {selectedDistrict && (
                <>
                  <span style={{ color: '#9ca3af' }}>→</span>
                  <span style={{
                    padding: '4px 12px',
                    background: '#667eea',
                    color: 'white',
                    border: '2px solid #667eea',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}>
                    {districts.find(d => d.id === selectedDistrict)?.name}
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Regions Table */}
      {filteredRegions.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#6b7280', background: '#f9fafb', borderRadius: '12px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📍</div>
          <div style={{ fontSize: '16px', fontWeight: '500' }}>
            {searchQuery ? `"${searchQuery}"에 대한 검색 결과가 없습니다` : '등록된 지역이 없습니다'}
          </div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
          }}>
            <thead>
              <tr style={{
                borderBottom: '2px solid #e5e7eb',
                background: '#f9fafb',
              }}>
                <th style={{ padding: '14px 12px', fontSize: '13px', fontWeight: '700', color: '#374151', textAlign: 'left' }}>지역명</th>
                <th style={{ padding: '14px 12px', fontSize: '13px', fontWeight: '700', color: '#374151', textAlign: 'center' }}>레벨</th>
                <th style={{ padding: '14px 12px', fontSize: '13px', fontWeight: '700', color: '#374151', textAlign: 'center' }}>코드</th>
                <th style={{ padding: '14px 12px', fontSize: '13px', fontWeight: '700', color: '#374151', textAlign: 'center' }}>사용자</th>
                <th style={{ padding: '14px 12px', fontSize: '13px', fontWeight: '700', color: '#374151', textAlign: 'center' }}>상인</th>
                <th style={{ padding: '14px 12px', fontSize: '13px', fontWeight: '700', color: '#374151', textAlign: 'center' }}>전단지</th>
                <th style={{ padding: '14px 12px', fontSize: '13px', fontWeight: '700', color: '#374151', textAlign: 'center' }}>마스터</th>
                <th style={{ padding: '14px 12px', fontSize: '13px', fontWeight: '700', color: '#374151', textAlign: 'center' }}>지수</th>
                <th style={{ padding: '14px 12px', fontSize: '13px', fontWeight: '700', color: '#374151', textAlign: 'center' }}>상태</th>
                <th style={{ padding: '14px 12px', fontSize: '13px', fontWeight: '700', color: '#374151', textAlign: 'center' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegions.map((region, index) => (
                <tr key={region.id} style={{
                  borderBottom: '1px solid #f3f4f6',
                  background: index % 2 === 0 ? 'white' : '#fafafa',
                }}>
                  <td style={{ padding: '14px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                        {region.name}
                      </span>
                      {region.children && region.children.length > 0 && (
                        <span style={{
                          padding: '2px 6px',
                          background: '#e5e7eb',
                          color: '#6b7280',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: '600',
                        }}>
                          {region.children.length}개 하위
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '700',
                      color: 'white',
                      background: getLevelColor(region.level),
                    }}>
                      {getLevelLabel(region.level)}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px', fontSize: '13px', color: '#6b7280', textAlign: 'center' }}>
                    {region.code || '-'}
                  </td>
                  <td style={{ padding: '14px 12px', fontSize: '14px', color: '#1f2937', textAlign: 'center', fontWeight: '600' }}>
                    {region.totalUsers || 0}명
                  </td>
                  <td style={{ padding: '14px 12px', fontSize: '14px', color: '#1f2937', textAlign: 'center', fontWeight: '600' }}>
                    {region.totalMerchants || 0}개
                  </td>
                  <td style={{ padding: '14px 12px', fontSize: '14px', color: '#1f2937', textAlign: 'center', fontWeight: '600' }}>
                    {region.totalFlyers || 0}개
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                    {region.master ? (
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        background: '#ede9fe',
                        color: '#7c3aed',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                      }}>
                        ✓ {region.master.email}
                      </span>
                    ) : (
                      <span style={{ fontSize: '13px', color: '#9ca3af' }}>미배정</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      <div>🏡 {region.livabilityIndex || 0}</div>
                      <div>🛡️ {region.safetyScore || 0}</div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: region.isActive ? '#16a34a' : '#dc2626',
                      background: region.isActive ? '#dcfce7' : '#fee2e2',
                    }}>
                      {region.isActive ? '✓ 활성' : '✗ 비활성'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button
                        onClick={() => onEdit(region)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          background: '#dbeafe',
                          color: '#2563eb',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                        }}
                      >
                        📝 편집
                      </button>
                      <button
                        onClick={() => onAssignMaster(region)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          background: '#ede9fe',
                          color: '#7c3aed',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                        }}
                      >
                        👤 마스터
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Region Tree Node Component
function RegionTreeNode({
  region,
  level,
  expandedRegions,
  setExpandedRegions,
  onEdit,
  onAssignMaster
}: {
  region: RegionData;
  level: number;
  expandedRegions: Set<string>;
  setExpandedRegions: React.Dispatch<React.SetStateAction<Set<string>>>;
  onEdit?: (region: RegionData) => void;
  onAssignMaster?: (region: RegionData) => void;
}) {
  const isExpanded = expandedRegions.has(region.id);
  const hasChildren = region.children && region.children.length > 0;

  const toggleExpand = () => {
    const newExpanded = new Set(expandedRegions);
    if (isExpanded) {
      newExpanded.delete(region.id);
    } else {
      newExpanded.add(region.id);
    }
    setExpandedRegions(newExpanded);
  };

  const getLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      city: '시',
      district: '구',
      neighborhood: '동/읍/면',
    };
    return labels[level] || level;
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      city: '#2563eb',
      district: '#7c3aed',
      neighborhood: '#059669',
    };
    return colors[level] || '#64748b';
  };

  return (
    <div style={{ marginLeft: level * 24 }}>
      <div
        style={{
          padding: '16px',
          background: '#f9fafb',
          borderRadius: '8px',
          marginBottom: '8px',
          border: '1px solid #e5e7eb',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {hasChildren && (
            <button
              onClick={toggleExpand}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '4px',
              }}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          {!hasChildren && <div style={{ width: '24px' }} />}

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{region.name}</h4>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: 'white',
                  background: getLevelColor(region.level),
                }}
              >
                {getLevelLabel(region.level)}
              </span>
              {!region.isActive && (
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#dc2626',
                    background: '#fee2e2',
                  }}
                >
                  비활성
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#6b7280' }}>
              <div>👥 사용자: <strong>{region.totalUsers || 0}</strong></div>
              <div>🏪 상인: <strong>{region.totalMerchants || 0}</strong></div>
              <div>📄 전단지: <strong>{region.totalFlyers || 0}</strong></div>
              <div>⭐ 살기좋은동네지수: <strong>{region.livabilityIndex || 0}</strong></div>
              <div>🛡️ 안전점수: <strong>{region.safetyScore || 0}</strong></div>
            </div>

            {region.master && (
              <div style={{ marginTop: '8px', fontSize: '13px', color: '#667eea' }}>
                👤 마스터: <strong>{region.master.email}</strong>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
              <button
                onClick={() => onEdit?.(region)}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  background: '#dbeafe',
                  color: '#2563eb',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                📝 편집
              </button>
              <button
                onClick={() => onAssignMaster?.(region)}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  background: '#ede9fe',
                  color: '#7c3aed',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                👤 마스터 배정
              </button>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div style={{ marginTop: '8px' }}>
          {region.children!.map((child) => (
            <RegionTreeNode
              key={child.id}
              region={child}
              level={level + 1}
              expandedRegions={expandedRegions}
              setExpandedRegions={setExpandedRegions}
              onEdit={onEdit}
              onAssignMaster={onAssignMaster}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Region Edit Modal
function RegionEditModal({
  region,
  onClose,
  onSave
}: {
  region: RegionData;
  onClose: () => void;
  onSave: () => void;
}) {
  const [livabilityIndex, setLivabilityIndex] = useState(region.livabilityIndex || 0);
  const [safetyScore, setSafetyScore] = useState(region.safetyScore || 0);
  const [isActive, setIsActive] = useState(region.isActive);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.patch(`/regions/${region.id}`, {
        livabilityIndex,
        safetyScore,
        isActive
      });
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to update region:', error);
      alert('지역 정보 업데이트에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        width: '90%',
        maxWidth: '500px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>
          지역 정보 수정
        </h3>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
            지역: <strong>{region.name}</strong>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            살기좋은동네지수 (0-100)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={livabilityIndex}
            onChange={(e) => setLivabilityIndex(Number(e.target.value))}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            안전점수 (0-100)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={safetyScore}
            onChange={(e) => setSafetyScore(Number(e.target.value))}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            활성화 상태
          </label>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={isSaving}
            style={{
              padding: '8px 16px',
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: '8px 16px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Master Assignment Modal
function MasterAssignmentModal({
  region,
  onClose,
  onSave
}: {
  region: RegionData;
  onClose: () => void;
  onSave: () => void;
}) {
  const [masters, setMasters] = useState<any[]>([]);
  const [selectedMasterId, setSelectedMasterId] = useState(region.master_id || '');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadMasters();
  }, []);

  const loadMasters = async () => {
    try {
      const response = await api.get('/users?role=security_guard');
      setMasters(response.data);
    } catch (error) {
      console.error('Failed to load masters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedMasterId) {
      alert('마스터를 선택해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      await api.post(`/regions/${region.id}/master`, {
        userId: selectedMasterId
      });
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to assign master:', error);
      alert('마스터 배정에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        width: '90%',
        maxWidth: '500px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>
          마스터 배정
        </h3>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
            지역: <strong>{region.name}</strong>
          </div>
          {region.master && (
            <div style={{ fontSize: '14px', color: '#667eea', marginBottom: '8px' }}>
              현재 마스터: <strong>{region.master.email}</strong>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            마스터 선택
          </label>
          {isLoading ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>
              로딩 중...
            </div>
          ) : (
            <select
              value={selectedMasterId}
              onChange={(e) => setSelectedMasterId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">마스터를 선택하세요</option>
              {masters.map((master) => (
                <option key={master.id} value={master.id}>
                  {master.email} ({master.name || '이름 없음'})
                </option>
              ))}
            </select>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={isSaving}
            style={{
              padding: '8px 16px',
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            취소
          </button>
          <button
            onClick={handleAssign}
            disabled={isSaving || isLoading}
            style={{
              padding: '8px 16px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            {isSaving ? '배정 중...' : '배정'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Add Region Modal
function AddRegionModal({
  regions,
  onClose,
  onSave
}: {
  regions: RegionData[];
  onClose: () => void;
  onSave: () => void;
}) {
  const [name, setName] = useState('');
  const [level, setLevel] = useState<'city' | 'district' | 'neighborhood'>('neighborhood');
  const [code, setCode] = useState('');
  const [parentId, setParentId] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Flatten regions for parent selection
  const getAllRegions = (regions: RegionData[]): RegionData[] => {
    let result: RegionData[] = [];
    for (const region of regions) {
      result.push(region);
      if (region.children) {
        result = result.concat(getAllRegions(region.children));
      }
    }
    return result;
  };

  const allRegions = getAllRegions(regions);

  // Filter parent options based on selected level
  const getParentOptions = () => {
    if (level === 'city') {
      return []; // Cities have no parent
    } else if (level === 'district') {
      return allRegions.filter(r => r.level === 'city');
    } else {
      return allRegions.filter(r => r.level === 'district' || r.level === 'city');
    }
  };

  const parentOptions = getParentOptions();

  const handleSave = async () => {
    if (!name.trim()) {
      alert('지역명을 입력해주세요.');
      return;
    }

    if (level !== 'city' && !parentId) {
      alert('상위 지역을 선택해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      await api.post('/regions', {
        name,
        level,
        code: code || undefined,
        parent_id: parentId || undefined,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined
      });
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to create region:', error);
      alert('지역 생성에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>
          새 지역 추가
        </h3>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            지역명 *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 강남구"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            레벨 *
          </label>
          <select
            value={level}
            onChange={(e) => {
              setLevel(e.target.value as any);
              setParentId(''); // Reset parent when level changes
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="city">시/도</option>
            <option value="district">구/군</option>
            <option value="neighborhood">동/읍/면</option>
          </select>
        </div>

        {level !== 'city' && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
              상위 지역 *
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">선택하세요</option>
              {parentOptions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name} ({region.level})
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            지역 코드
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="예: 11680"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            위도
          </label>
          <input
            type="text"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="예: 37.4979"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            경도
          </label>
          <input
            type="text"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="예: 127.0276"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={isSaving}
            style={{
              padding: '8px 16px',
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: '8px 16px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            {isSaving ? '생성 중...' : '생성'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Flyers Statistics Dashboard Component
function FlyersStatsDashboard({
  flyers,
  users,
  regions,
  onRefresh
}: {
  flyers: any[];
  users: UserData[];
  regions: RegionData[];
  onRefresh: () => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');

  // Calculate statistics
  const totalFlyers = flyers.length;
  const activeFlyers = flyers.filter(f => f.isActive).length;
  const totalViews = flyers.reduce((sum, f) => sum + (f.viewCount || 0), 0);
  const totalClicks = flyers.reduce((sum, f) => sum + (f.clickCount || 0), 0);
  const avgCTR = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : '0.00';

  // Category distribution
  const categoryStats = flyers.reduce((acc, flyer) => {
    const cat = flyer.category || '기타';
    if (!acc[cat]) {
      acc[cat] = { count: 0, views: 0, clicks: 0 };
    }
    acc[cat].count++;
    acc[cat].views += flyer.viewCount || 0;
    acc[cat].clicks += flyer.clickCount || 0;
    return acc;
  }, {} as Record<string, { count: number; views: number; clicks: number }>);

  // Region distribution
  const regionStats = flyers.reduce((acc, flyer) => {
    const region = flyer.gridCell || '미지정';
    if (!acc[region]) {
      acc[region] = { count: 0, views: 0, clicks: 0 };
    }
    acc[region].count++;
    acc[region].views += flyer.viewCount || 0;
    acc[region].clicks += flyer.clickCount || 0;
    return acc;
  }, {} as Record<string, { count: number; views: number; clicks: number }>);

  // Top performing flyers
  const topByViews = [...flyers].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 5);
  const topByClicks = [...flyers].sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0)).slice(0, 5);
  const topByCTR = [...flyers]
    .filter(f => (f.viewCount || 0) > 0)
    .sort((a, b) => {
      const ctrA = (a.clickCount || 0) / (a.viewCount || 1);
      const ctrB = (b.clickCount || 0) / (b.viewCount || 1);
      return ctrB - ctrA;
    })
    .slice(0, 5);

  // Recent flyers
  const recentFlyers = [...flyers].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 10);

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
          전단지 통계 대시보드
        </h2>
        <button
          onClick={onRefresh}
          style={{
            padding: '10px 20px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          🔄 새로고침
        </button>
      </div>

      {/* Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #f3f4f6'
        }}>
          <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600', marginBottom: '8px' }}>총 전단지</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#667eea', marginBottom: '4px' }}>{totalFlyers}</div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>활성: {activeFlyers}개</div>
        </div>

        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #f3f4f6'
        }}>
          <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600', marginBottom: '8px' }}>총 조회수</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981', marginBottom: '4px' }}>
            {totalViews.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>전단지당 평균: {(totalViews / totalFlyers || 0).toFixed(0)}</div>
        </div>

        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #f3f4f6'
        }}>
          <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600', marginBottom: '8px' }}>총 클릭수</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b', marginBottom: '4px' }}>
            {totalClicks.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>전단지당 평균: {(totalClicks / totalFlyers || 0).toFixed(0)}</div>
        </div>

        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #f3f4f6'
        }}>
          <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600', marginBottom: '8px' }}>평균 CTR</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#8b5cf6', marginBottom: '4px' }}>
            {avgCTR}%
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>클릭률 (Click Through Rate)</div>
        </div>
      </div>

      {/* Category & Region Distribution */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Category Distribution */}
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #f3f4f6'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
            카테고리별 분포
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(categoryStats)
              .sort((a, b) => b[1].count - a[1].count)
              .map(([category, stats]) => (
                <div key={category} style={{
                  padding: '12px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{category}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      조회: {stats.views.toLocaleString()} | 클릭: {stats.clicks.toLocaleString()}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#667eea',
                    minWidth: '40px',
                    textAlign: 'right'
                  }}>
                    {stats.count}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Region Distribution */}
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #f3f4f6'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
            지역별 분포
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(regionStats)
              .sort((a, b) => b[1].count - a[1].count)
              .slice(0, 10)
              .map(([region, stats]) => (
                <div key={region} style={{
                  padding: '12px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{region}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      조회: {stats.views.toLocaleString()} | 클릭: {stats.clicks.toLocaleString()}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#10b981',
                    minWidth: '40px',
                    textAlign: 'right'
                  }}>
                    {stats.count}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Top Performing Flyers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Top by Views */}
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #f3f4f6'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
            👀 조회수 TOP 5
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topByViews.map((flyer, idx) => (
              <div key={flyer.id} style={{
                padding: '10px',
                background: idx === 0 ? '#fef3c7' : '#f9fafb',
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>
                    {idx + 1}. {flyer.title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                    {flyer.category} · {flyer.merchantEmail}
                  </div>
                </div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#10b981' }}>
                  {(flyer.viewCount || 0).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top by Clicks */}
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #f3f4f6'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
            🖱️ 클릭수 TOP 5
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topByClicks.map((flyer, idx) => (
              <div key={flyer.id} style={{
                padding: '10px',
                background: idx === 0 ? '#fef3c7' : '#f9fafb',
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>
                    {idx + 1}. {flyer.title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                    {flyer.category} · {flyer.merchantEmail}
                  </div>
                </div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#f59e0b' }}>
                  {(flyer.clickCount || 0).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top by CTR */}
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #f3f4f6'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
            📊 클릭률(CTR) TOP 5
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topByCTR.map((flyer, idx) => {
              const ctr = ((flyer.clickCount || 0) / (flyer.viewCount || 1) * 100).toFixed(2);
              return (
                <div key={flyer.id} style={{
                  padding: '10px',
                  background: idx === 0 ? '#fef3c7' : '#f9fafb',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>
                      {idx + 1}. {flyer.title}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                      조회: {flyer.viewCount || 0} · 클릭: {flyer.clickCount || 0}
                    </div>
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#8b5cf6' }}>
                    {ctr}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Flyers */}
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #f3f4f6'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
          📋 최근 등록된 전단지
        </h3>
        {recentFlyers.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            등록된 전단지가 없습니다.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                  <th style={{ padding: '12px 8px', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>제목</th>
                  <th style={{ padding: '12px 8px', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>카테고리</th>
                  <th style={{ padding: '12px 8px', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>상인</th>
                  <th style={{ padding: '12px 8px', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>지역</th>
                  <th style={{ padding: '12px 8px', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>조회</th>
                  <th style={{ padding: '12px 8px', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>클릭</th>
                  <th style={{ padding: '12px 8px', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>상태</th>
                  <th style={{ padding: '12px 8px', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>등록일</th>
                </tr>
              </thead>
              <tbody>
                {recentFlyers.map((flyer, idx) => (
                  <tr key={flyer.id} style={{
                    borderBottom: '1px solid #f3f4f6',
                    background: idx % 2 === 0 ? 'white' : '#fafbfc'
                  }}>
                    <td style={{ padding: '12px 8px', fontSize: '13px', fontWeight: '500' }}>{flyer.title}</td>
                    <td style={{ padding: '12px 8px', fontSize: '13px', color: '#6b7280' }}>{flyer.category}</td>
                    <td style={{ padding: '12px 8px', fontSize: '13px', color: '#6b7280' }}>{flyer.merchantEmail}</td>
                    <td style={{ padding: '12px 8px', fontSize: '13px', color: '#6b7280' }}>{flyer.gridCell}</td>
                    <td style={{ padding: '12px 8px', fontSize: '13px', color: '#10b981', fontWeight: '600' }}>
                      {(flyer.viewCount || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 8px', fontSize: '13px', color: '#f59e0b', fontWeight: '600' }}>
                      {(flyer.clickCount || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: '600',
                        color: flyer.isActive ? '#16a34a' : '#dc2626',
                        background: flyer.isActive ? '#dcfce7' : '#fee2e2',
                      }}>
                        {flyer.isActive ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', fontSize: '13px', color: '#6b7280' }}>
                      {new Date(flyer.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Platform Activity Feed Component
function PlatformActivityFeed({
  users,
  flyers,
  regions
}: {
  users: UserData[];
  flyers: any[];
  regions: RegionData[];
}) {
  // Generate activity feed items from data
  const activities = [];

  // User registrations (recent users)
  const recentUsers = [...users]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20);

  recentUsers.forEach(user => {
    activities.push({
      id: `user-${user.id}`,
      type: 'user_registered',
      timestamp: new Date(user.createdAt),
      icon: '👤',
      title: '새 사용자 가입',
      description: `${user.email} (${getRoleLabel(user.role)})`,
      color: '#667eea'
    });
  });

  // Flyer creations (recent flyers)
  const recentFlyers = [...flyers]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20);

  recentFlyers.forEach(flyer => {
    activities.push({
      id: `flyer-${flyer.id}`,
      type: 'flyer_created',
      timestamp: new Date(flyer.createdAt),
      icon: '📄',
      title: '새 전단지 등록',
      description: `${flyer.merchantEmail} - "${flyer.title}" (${flyer.category})`,
      color: '#10b981'
    });
  });

  // Milestone activities (view/click counts)
  flyers.forEach(flyer => {
    if (flyer.viewCount >= 1000 && flyer.viewCount < 1010) {
      activities.push({
        id: `milestone-view-${flyer.id}`,
        type: 'milestone_views',
        timestamp: new Date(flyer.updatedAt),
        icon: '🎉',
        title: '조회수 1,000회 돌파',
        description: `"${flyer.title}" - ${flyer.merchantEmail}`,
        color: '#f59e0b'
      });
    }
    if (flyer.viewCount >= 5000 && flyer.viewCount < 5010) {
      activities.push({
        id: `milestone-view-5k-${flyer.id}`,
        type: 'milestone_views',
        timestamp: new Date(flyer.updatedAt),
        icon: '🌟',
        title: '조회수 5,000회 돌파',
        description: `"${flyer.title}" - ${flyer.merchantEmail}`,
        color: '#8b5cf6'
      });
    }
  });

  // Sort all activities by timestamp (most recent first)
  const sortedActivities = activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Time filter
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('week');

  const now = new Date();
  const filteredActivities = sortedActivities.filter(activity => {
    const diff = now.getTime() - activity.timestamp.getTime();
    const daysDiff = diff / (1000 * 60 * 60 * 24);

    switch (timeFilter) {
      case 'today':
        return daysDiff < 1;
      case 'week':
        return daysDiff < 7;
      case 'month':
        return daysDiff < 30;
      case 'all':
      default:
        return true;
    }
  });

  // Helper function for role labels
  function getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      user: '일반 사용자',
      merchant: '상인',
      security_guard: '보안관',
      municipality: '지자체',
      super_admin: '슈퍼 관리자'
    };
    return labels[role] || role;
  }

  // Format relative time
  function getRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR');
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
          플랫폼 활동 피드
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['today', 'week', 'month', 'all'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              style={{
                padding: '8px 16px',
                background: timeFilter === filter ? '#667eea' : 'white',
                color: timeFilter === filter ? 'white' : '#6b7280',
                border: `1px solid ${timeFilter === filter ? '#667eea' : '#e5e7eb'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
              }}
            >
              {filter === 'today' ? '오늘' : filter === 'week' ? '이번 주' : filter === 'month' ? '이번 달' : '전체'}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #f3f4f6'
        }}>
          <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600', marginBottom: '8px' }}>총 활동</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#667eea' }}>
            {filteredActivities.length}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #f3f4f6'
        }}>
          <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600', marginBottom: '8px' }}>신규 가입</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>
            {filteredActivities.filter(a => a.type === 'user_registered').length}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #f3f4f6'
        }}>
          <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600', marginBottom: '8px' }}>전단지 등록</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b' }}>
            {filteredActivities.filter(a => a.type === 'flyer_created').length}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #f3f4f6'
        }}>
          <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600', marginBottom: '8px' }}>마일스톤</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#8b5cf6' }}>
            {filteredActivities.filter(a => a.type === 'milestone_views').length}
          </div>
        </div>
      </div>

      {/* Activity Trend Chart */}
      <ActivityTrendChart activities={filteredActivities} timeFilter={timeFilter} />

      {/* Activity Timeline */}
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #f3f4f6'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '20px' }}>
          활동 타임라인
        </h3>

        {filteredActivities.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#6b7280' }}>
            선택한 기간에 활동이 없습니다.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredActivities.slice(0, 50).map((activity) => (
              <div
                key={activity.id}
                style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '16px',
                  background: '#f9fafb',
                  borderRadius: '10px',
                  borderLeft: `4px solid ${activity.color}`,
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f3f4f6';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f9fafb';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                {/* Icon */}
                <div style={{
                  fontSize: '32px',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'white',
                  borderRadius: '12px',
                  flexShrink: 0
                }}>
                  {activity.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: '4px'
                  }}>
                    {activity.title}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#6b7280',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {activity.description}
                  </div>
                </div>

                {/* Timestamp */}
                <div style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                  whiteSpace: 'nowrap',
                  alignSelf: 'center'
                }}>
                  {getRelativeTime(activity.timestamp)}
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredActivities.length > 50 && (
          <div style={{
            marginTop: '20px',
            padding: '12px',
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '13px',
            background: '#f9fafb',
            borderRadius: '8px'
          }}>
            최근 50개의 활동만 표시됩니다. (전체 {filteredActivities.length}개)
          </div>
        )}
      </div>
    </div>
  );
}

// Activity Trend Chart Component
function ActivityTrendChart({
  activities,
  timeFilter
}: {
  activities: any[];
  timeFilter: 'today' | 'week' | 'month' | 'all';
}) {
  // Prepare data by grouping activities by date and type
  const prepareChartData = () => {
    const dateMap = new Map<string, { user_registered: number; flyer_created: number; milestone_views: number }>();

    // Determine date range based on filter
    const now = new Date();
    let startDate = new Date();

    switch (timeFilter) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(now.getDate() - 30);
        break;
      case 'all':
        startDate.setDate(now.getDate() - 90); // Show last 90 days for 'all'
        break;
    }

    // Initialize all dates in range with zero counts
    const currentDate = new Date(startDate);
    while (currentDate <= now) {
      const dateKey = currentDate.toISOString().split('T')[0];
      dateMap.set(dateKey, { user_registered: 0, flyer_created: 0, milestone_views: 0 });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Count activities by date and type
    activities.forEach(activity => {
      const dateKey = activity.timestamp.toISOString().split('T')[0];
      const existing = dateMap.get(dateKey);
      if (existing) {
        existing[activity.type as keyof typeof existing]++;
      }
    });

    // Convert to array and sort by date
    return Array.from(dateMap.entries())
      .map(([date, counts]) => ({
        date,
        ...counts
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const chartData = prepareChartData();

  // Calculate max value for y-axis scaling
  const maxValue = Math.max(
    ...chartData.map(d => Math.max(d.user_registered, d.flyer_created, d.milestone_views)),
    1
  );

  // Chart dimensions
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartHeight = 300;

  // Generate SVG path for a line
  const generatePath = (dataKey: 'user_registered' | 'flyer_created' | 'milestone_views') => {
    if (chartData.length === 0) return '';

    const points = chartData.map((d, i) => {
      const x = (i / (chartData.length - 1 || 1)) * 100;
      const y = ((maxValue - d[dataKey]) / maxValue) * (chartHeight - padding.top - padding.bottom) + padding.top;
      return `${x},${y}`;
    });

    return points.map((p, i) => (i === 0 ? `M${p}` : `L${p}`)).join(' ');
  };

  // Line colors
  const lineColors = {
    user_registered: '#667eea',
    flyer_created: '#10b981',
    milestone_views: '#f59e0b'
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return timeFilter === 'today'
      ? date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      : `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // Show every nth label to avoid crowding
  const labelInterval = timeFilter === 'today' ? 1 : timeFilter === 'week' ? 1 : timeFilter === 'month' ? 5 : 10;

  return (
    <div style={{
      background: 'white',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      border: '1px solid #f3f4f6',
      marginBottom: '24px'
    }}>
      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
        📈 활동 추이
      </h3>

      {/* Legend */}
      <div style={{
        display: 'flex',
        gap: '24px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '16px',
            height: '3px',
            background: lineColors.user_registered,
            borderRadius: '2px'
          }} />
          <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>신규 가입</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '16px',
            height: '3px',
            background: lineColors.flyer_created,
            borderRadius: '2px'
          }} />
          <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>전단지 등록</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '16px',
            height: '3px',
            background: lineColors.milestone_views,
            borderRadius: '2px'
          }} />
          <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>마일스톤</span>
        </div>
      </div>

      {/* Chart */}
      <div style={{ position: 'relative', width: '100%', height: `${chartHeight}px`, overflow: 'hidden' }}>
        <svg
          width="100%"
          height={chartHeight}
          viewBox={`0 0 100 ${chartHeight}`}
          preserveAspectRatio="none"
          style={{ display: 'block' }}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = (1 - ratio) * (chartHeight - padding.top - padding.bottom) + padding.top;
            return (
              <line
                key={ratio}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="#f3f4f6"
                strokeWidth="0.2"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}

          {/* Data lines */}
          <path
            d={generatePath('user_registered')}
            fill="none"
            stroke={lineColors.user_registered}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={generatePath('flyer_created')}
            fill="none"
            stroke={lineColors.flyer_created}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={generatePath('milestone_views')}
            fill="none"
            stroke={lineColors.milestone_views}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          {/* Data points */}
          {chartData.map((d, i) => {
            const x = (i / (chartData.length - 1 || 1)) * 100;
            const y1 = ((maxValue - d.user_registered) / maxValue) * (chartHeight - padding.top - padding.bottom) + padding.top;
            const y2 = ((maxValue - d.flyer_created) / maxValue) * (chartHeight - padding.top - padding.bottom) + padding.top;
            const y3 = ((maxValue - d.milestone_views) / maxValue) * (chartHeight - padding.top - padding.bottom) + padding.top;

            return (
              <g key={i}>
                <circle cx={x} cy={y1} r="1.5" fill={lineColors.user_registered} vectorEffect="non-scaling-stroke" />
                <circle cx={x} cy={y2} r="1.5" fill={lineColors.flyer_created} vectorEffect="non-scaling-stroke" />
                <circle cx={x} cy={y3} r="1.5" fill={lineColors.milestone_views} vectorEffect="non-scaling-stroke" />
              </g>
            );
          })}
        </svg>

        {/* Y-axis labels (positioned absolutely) */}
        <div style={{ position: 'absolute', left: 0, top: padding.top, bottom: padding.bottom, width: '40px' }}>
          {[1, 0.75, 0.5, 0.25, 0].map((ratio) => (
            <div
              key={ratio}
              style={{
                position: 'absolute',
                top: `${(1 - ratio) * 100}%`,
                right: '8px',
                transform: 'translateY(-50%)',
                fontSize: '11px',
                color: '#9ca3af',
                textAlign: 'right'
              }}
            >
              {Math.round(maxValue * ratio)}
            </div>
          ))}
        </div>

        {/* X-axis labels */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: `${padding.bottom}px`,
          display: 'flex',
          justifyContent: 'space-between',
          paddingTop: '8px'
        }}>
          {chartData.map((d, i) => {
            if (i % labelInterval !== 0 && i !== chartData.length - 1) return null;
            return (
              <div
                key={i}
                style={{
                  fontSize: '11px',
                  color: '#6b7280',
                  textAlign: 'center',
                  flex: 1
                }}
              >
                {formatDate(d.date)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{
        marginTop: '20px',
        padding: '16px',
        background: '#f9fafb',
        borderRadius: '8px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px'
      }}>
        <div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>일평균 신규 가입</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: lineColors.user_registered }}>
            {(chartData.reduce((sum, d) => sum + d.user_registered, 0) / chartData.length || 0).toFixed(1)}명
          </div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>일평균 전단지 등록</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: lineColors.flyer_created }}>
            {(chartData.reduce((sum, d) => sum + d.flyer_created, 0) / chartData.length || 0).toFixed(1)}개
          </div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>최고 활동일</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#667eea' }}>
            {(() => {
              if (chartData.length === 0) return '-';
              const maxDay = chartData.reduce((max, d) => {
                const total = d.user_registered + d.flyer_created + d.milestone_views;
                const maxTotal = max.user_registered + max.flyer_created + max.milestone_views;
                return total > maxTotal ? d : max;
              }, chartData[0]);
              return formatDate(maxDay.date);
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
