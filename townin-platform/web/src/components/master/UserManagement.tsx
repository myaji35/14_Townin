import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserManagement.css';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  region: string;
  joinDate: string;
  lastLogin: string;
  status: 'active' | 'inactive' | 'suspended';
  flyers?: number;
  purchases?: number;
}

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    // Mock 데이터
    const mockUsers: User[] = [
      { id: '1', name: '김철수', email: 'user1@example.com', role: 'user', region: '의정부시', joinDate: '2024-01-15', lastLogin: '2024-03-15 14:30', status: 'active', flyers: 0, purchases: 12 },
      { id: '2', name: '이영희', email: 'merchant1@example.com', role: 'merchant', region: '양주시', joinDate: '2024-01-20', lastLogin: '2024-03-15 13:45', status: 'active', flyers: 23, purchases: 0 },
      { id: '3', name: '박민수', email: 'user2@example.com', role: 'user', region: '남양주시', joinDate: '2024-02-01', lastLogin: '2024-03-14 20:15', status: 'active', flyers: 0, purchases: 5 },
      { id: '4', name: '최상점', email: 'merchant2@example.com', role: 'merchant', region: '의정부시', joinDate: '2024-02-10', lastLogin: '2024-03-15 10:00', status: 'suspended', flyers: 15, purchases: 0 },
      { id: '5', name: '정보안', email: 'guard1@townin.kr', role: 'security_guard', region: '의정부시', joinDate: '2024-01-01', lastLogin: '2024-03-15 08:00', status: 'active', flyers: 0, purchases: 0 },
      { id: '6', name: '강사용', email: 'user3@example.com', role: 'user', region: '구리시', joinDate: '2024-02-15', lastLogin: '2024-03-10 15:30', status: 'inactive', flyers: 0, purchases: 3 },
      { id: '7', name: '윤상인', email: 'merchant3@example.com', role: 'merchant', region: '포천시', joinDate: '2024-02-20', lastLogin: '2024-03-15 11:20', status: 'active', flyers: 8, purchases: 0 },
      { id: '8', name: '한관리', email: 'admin@townin.kr', role: 'admin', region: '전체', joinDate: '2024-01-01', lastLogin: '2024-03-15 09:00', status: 'active', flyers: 0, purchases: 0 },
    ];
    setUsers(mockUsers);
    setFilteredUsers(mockUsers);
  }, []);

  useEffect(() => {
    let filtered = users;

    // 검색어 필터
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.region.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 역할 필터
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // 상태 필터
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, statusFilter, users]);

  const handleStatusChange = (userId: string, newStatus: 'active' | 'inactive' | 'suspended') => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId ? { ...user, status: newStatus } : user
      )
    );
  };

  const handleVisitDashboard = (user: User) => {
    // 사용자의 역할에 따라 다른 대시보드로 이동 (이메일을 쿼리 파라미터로 전달)
    switch(user.role) {
      case 'admin':
      case 'master':
        navigate(`/admin/dashboard?email=${encodeURIComponent(user.email)}`);
        break;
      case 'merchant':
        navigate(`/ceo/dashboard?email=${encodeURIComponent(user.email)}`);
        break;
      case 'security_guard':
        navigate(`/guard/dashboard?email=${encodeURIComponent(user.email)}`);
        break;
      case 'user':
      default:
        navigate(`/dashboard?email=${encodeURIComponent(user.email)}`);
        break;
    }
  };

  const getRoleName = (role: string) => {
    const roleNames: { [key: string]: string } = {
      user: '일반 사용자',
      merchant: '사장님',
      security_guard: '보안관',
      admin: '관리자',
      master: '마스터'
    };
    return roleNames[role] || role;
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: { [key: string]: string } = {
      active: 'status-active',
      inactive: 'status-inactive',
      suspended: 'status-suspended'
    };
    const statusNames: { [key: string]: string } = {
      active: '활성',
      inactive: '비활성',
      suspended: '정지'
    };
    return (
      <span className={`status-badge ${statusClasses[status]}`}>
        {statusNames[status]}
      </span>
    );
  };

  return (
    <div className="user-management">
      <div className="management-header">
        <h2>사용자 관리</h2>
        <div className="user-stats">
          <div className="stat-item">
            <span className="stat-label">전체 사용자</span>
            <span className="stat-value">{users.length}명</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">활성 사용자</span>
            <span className="stat-value">{users.filter(u => u.status === 'active').length}명</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">신규 가입 (이번달)</span>
            <span className="stat-value">127명</span>
          </div>
        </div>
      </div>

      <div className="management-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="이름, 이메일, 지역으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        <div className="filter-group">
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">모든 역할</option>
            <option value="user">일반 사용자</option>
            <option value="merchant">사장님</option>
            <option value="security_guard">보안관</option>
            <option value="admin">관리자</option>
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">모든 상태</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
            <option value="suspended">정지</option>
          </select>

          <button className="export-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 10v3a1 1 0 001 1h10a1 1 0 001-1v-3M8 2v8M8 2L5 5M8 2l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            내보내기
          </button>
        </div>
      </div>

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>이름</th>
              <th>이메일</th>
              <th>역할</th>
              <th>지역</th>
              <th>가입일</th>
              <th>마지막 로그인</th>
              <th>상태</th>
              <th>활동</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td className="user-name">
                  <div className="user-avatar">{user.name[0]}</div>
                  {user.name}
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge role-${user.role}`}>
                    {getRoleName(user.role)}
                  </span>
                </td>
                <td>{user.region}</td>
                <td>{user.joinDate}</td>
                <td>{user.lastLogin}</td>
                <td>{getStatusBadge(user.status)}</td>
                <td>
                  {user.role === 'merchant' ? (
                    <span>전단지 {user.flyers}개</span>
                  ) : user.role === 'user' ? (
                    <span>구매 {user.purchases}건</span>
                  ) : (
                    <span>-</span>
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn view-btn"
                      onClick={() => setSelectedUser(user)}
                      title="상세보기"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 3C3 3 0 8 0 8s3 5 8 5 8-5 8-5-3-5-8-5z" stroke="currentColor" strokeWidth="1.5"/>
                        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                    </button>
                    {user.status === 'active' ? (
                      <button
                        className="action-btn suspend-btn"
                        onClick={() => handleStatusChange(user.id, 'suspended')}
                        title="정지"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M6 6h4M6 10h4M14 8A6 6 0 112 8a6 6 0 0112 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </button>
                    ) : (
                      <button
                        className="action-btn activate-btn"
                        onClick={() => handleStatusChange(user.id, 'active')}
                        title="활성화"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M5 8l2 2 4-4M14 8A6 6 0 112 8a6 6 0 0112 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </button>
                    )}
                    <button
                      className="action-btn visit-btn"
                      onClick={() => handleVisitDashboard(user)}
                      title="방문"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M10 2H14V6M14 2L8 8M14 9V14H2V2H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="user-detail-modal" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>사용자 상세 정보</h3>
              <button className="close-btn" onClick={() => setSelectedUser(null)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="user-detail">
                <div className="detail-row">
                  <span className="detail-label">이름</span>
                  <span className="detail-value">{selectedUser.name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">이메일</span>
                  <span className="detail-value">{selectedUser.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">역할</span>
                  <span className="detail-value">{getRoleName(selectedUser.role)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">지역</span>
                  <span className="detail-value">{selectedUser.region}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">가입일</span>
                  <span className="detail-value">{selectedUser.joinDate}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">마지막 로그인</span>
                  <span className="detail-value">{selectedUser.lastLogin}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">상태</span>
                  <span className="detail-value">{getStatusBadge(selectedUser.status)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}