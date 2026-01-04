import { useState } from 'react';
import { Plus, Edit2, Trash2, Users, X } from 'lucide-react';
import './FamilyMemberManagement.css';

interface FamilyMember {
  id: string;
  relationship: string;
  birthYear?: number;
  gender?: string;
  nickname?: string;
  hasIotSensors: boolean;
  notificationsEnabled: boolean;
}

export default function FamilyMemberManagement() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    relationship: 'parent',
    birthYear: '',
    gender: '',
    nickname: '',
    hasIotSensors: false,
    notificationsEnabled: true,
  });

  const relationshipOptions = [
    { value: 'parent', label: '부모' },
    { value: 'child', label: '자녀' },
    { value: 'spouse', label: '배우자' },
    { value: 'sibling', label: '형제/자매' },
    { value: 'grandparent', label: '조부모' },
    { value: 'grandchild', label: '손자/손녀' },
    { value: 'other', label: '기타' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newMember: FamilyMember = {
      id: editingMember?.id || `fm_${Date.now()}`,
      relationship: formData.relationship,
      birthYear: formData.birthYear ? parseInt(formData.birthYear) : undefined,
      gender: formData.gender || undefined,
      nickname: formData.nickname || undefined,
      hasIotSensors: formData.hasIotSensors,
      notificationsEnabled: formData.notificationsEnabled,
    };

    if (editingMember) {
      setFamilyMembers(members =>
        members.map(m => (m.id === editingMember.id ? newMember : m))
      );
    } else {
      setFamilyMembers([...familyMembers, newMember]);
    }

    resetForm();
  };

  const handleEdit = (member: FamilyMember) => {
    setEditingMember(member);
    setFormData({
      relationship: member.relationship,
      birthYear: member.birthYear?.toString() || '',
      gender: member.gender || '',
      nickname: member.nickname || '',
      hasIotSensors: member.hasIotSensors,
      notificationsEnabled: member.notificationsEnabled,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setFamilyMembers(members => members.filter(m => m.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      relationship: 'parent',
      birthYear: '',
      gender: '',
      nickname: '',
      hasIotSensors: false,
      notificationsEnabled: true,
    });
    setEditingMember(null);
    setIsFormOpen(false);
  };

  return (
    <div className="family-management">
      {/* Header */}
      <div className="fm-header">
        <div className="fm-title-section">
          <Users size={24} className="fm-icon" />
          <div>
            <h2>가족 구성원 관리</h2>
            <p>가족 구성원의 정보를 관리합니다 (최대 10명)</p>
          </div>
        </div>
        <button className="btn-add-member" onClick={() => setIsFormOpen(true)}>
          <Plus size={18} />
          <span>구성원 추가</span>
        </button>
      </div>

      {/* Privacy Notice */}
      <div className="privacy-notice">
        <div className="notice-icon">🔒</div>
        <div className="notice-content">
          <h4>개인정보 최소화 원칙</h4>
          <p>
            Townin은 <strong>실명, 주민번호, 상세 주소를 수집하지 않습니다</strong>.
            가족 구성원의 관계, 생년, 성별만 선택적으로 입력 가능합니다.
          </p>
        </div>
      </div>

      {/* Family Members List */}
      {familyMembers.length === 0 ? (
        <div className="empty-state-fm">
          <div className="empty-icon">👨‍👩‍👧‍👦</div>
          <h3>등록된 가족 구성원이 없습니다</h3>
          <p>IoT 센서 모니터링과 맞춤형 케어를 위해 가족 구성원을 등록하세요.</p>
          <button className="btn-primary" onClick={() => setIsFormOpen(true)}>
            첫 구성원 등록하기
          </button>
        </div>
      ) : (
        <div className="family-members-grid">
          {familyMembers.map(member => (
            <div key={member.id} className="family-member-card">
              <div className="fm-card-header">
                <div className="fm-card-title">
                  <h4>{member.nickname || relationshipOptions.find(r => r.value === member.relationship)?.label}</h4>
                  <span className="fm-relationship-badge">
                    {relationshipOptions.find(r => r.value === member.relationship)?.label}
                  </span>
                </div>
                <div className="fm-card-actions">
                  <button className="icon-btn" onClick={() => handleEdit(member)}>
                    <Edit2 size={16} />
                  </button>
                  <button className="icon-btn danger" onClick={() => handleDelete(member.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="fm-card-body">
                {member.birthYear && (
                  <div className="fm-info-row">
                    <span className="label">생년:</span>
                    <span className="value">{member.birthYear}년</span>
                  </div>
                )}
                {member.gender && (
                  <div className="fm-info-row">
                    <span className="label">성별:</span>
                    <span className="value">
                      {member.gender === 'M' ? '남성' : member.gender === 'F' ? '여성' : '기타'}
                    </span>
                  </div>
                )}

                <div className="fm-features">
                  {member.hasIotSensors && (
                    <span className="feature-badge iot">IoT 센서</span>
                  )}
                  {member.notificationsEnabled && (
                    <span className="feature-badge notify">알림 활성화</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {isFormOpen && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content-fm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-fm">
              <h3>{editingMember ? '가족 구성원 수정' : '가족 구성원 추가'}</h3>
              <button className="close-btn" onClick={resetForm}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="fm-form">
              {/* Relationship */}
              <div className="form-group">
                <label>관계 *</label>
                <select
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  required
                >
                  {relationshipOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nickname */}
              <div className="form-group">
                <label>별칭 (선택)</label>
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  placeholder="예: 어머니, 할머니"
                  maxLength={50}
                />
              </div>

              {/* Birth Year */}
              <div className="form-group">
                <label>생년 (선택)</label>
                <input
                  type="number"
                  value={formData.birthYear}
                  onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })}
                  placeholder="예: 1960"
                  min="1900"
                  max="2024"
                />
              </div>

              {/* Gender */}
              <div className="form-group">
                <label>성별 (선택)</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="">선택 안 함</option>
                  <option value="M">남성</option>
                  <option value="F">여성</option>
                  <option value="OTHER">기타</option>
                </select>
              </div>

              {/* IoT Sensors */}
              <div className="form-group-checkbox">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.hasIotSensors}
                    onChange={(e) => setFormData({ ...formData, hasIotSensors: e.target.checked })}
                  />
                  <span>IoT 센서 설치됨 (효도 리포터)</span>
                </label>
              </div>

              {/* Notifications */}
              <div className="form-group-checkbox">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.notificationsEnabled}
                    onChange={(e) => setFormData({ ...formData, notificationsEnabled: e.target.checked })}
                  />
                  <span>알림 받기</span>
                </label>
              </div>

              {/* Actions */}
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  취소
                </button>
                <button type="submit" className="btn-primary">
                  {editingMember ? '수정' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
