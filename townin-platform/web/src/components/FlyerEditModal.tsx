import { useState, useEffect, useRef } from 'react';
import './FlyerEditModal.css';

interface Flyer {
  id: string;
  merchantId: string;
  title: string;
  description?: string;
  imageUrl?: string;
  category: string;
  gridCell: string;
  isActive: boolean;
  viewCount: number;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
  // 광고 관련 필드
  isAdEnabled?: boolean;
  adCostPerView?: number;
  adBudget?: number;
  targetRegions?: string[];
  targetAgeMin?: number;
  targetAgeMax?: number;
  targetGender?: 'male' | 'female' | 'all';
  targetInterests?: string[];
  adImpressions?: number;
  adView5sCount?: number;
  adSpent?: number;
}

interface FlyerEditModalProps {
  flyer: Flyer | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedFlyer: Flyer) => void;
}

export default function FlyerEditModal({ flyer, isOpen, onClose, onSave }: FlyerEditModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [category, setCategory] = useState('');
  const [gridCell, setGridCell] = useState('');
  const [isActive, setIsActive] = useState(true);

  // 광고 설정 상태
  const [isAdEnabled, setIsAdEnabled] = useState(false);
  const [adCostPerView, setAdCostPerView] = useState(50);
  const [adBudget, setAdBudget] = useState(100000);
  const [targetRegions, setTargetRegions] = useState<string[]>([]);
  const [targetAgeMin, setTargetAgeMin] = useState(20);
  const [targetAgeMax, setTargetAgeMax] = useState(60);
  const [targetGender, setTargetGender] = useState<'male' | 'female' | 'all'>('all');
  const [targetInterests, setTargetInterests] = useState<string[]>([]);
  const [currentRegion, setCurrentRegion] = useState('');
  const [currentInterest, setCurrentInterest] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (flyer) {
      setTitle(flyer.title);
      setDescription(flyer.description || '');
      setImagePreview(flyer.imageUrl || '');
      setCategory(flyer.category);
      setGridCell(flyer.gridCell);
      setIsActive(flyer.isActive);

      // 광고 설정 불러오기
      setIsAdEnabled(flyer.isAdEnabled || false);
      setAdCostPerView(flyer.adCostPerView || 50);
      setAdBudget(flyer.adBudget || 100000);
      setTargetRegions(flyer.targetRegions || []);
      setTargetAgeMin(flyer.targetAgeMin || 20);
      setTargetAgeMax(flyer.targetAgeMax || 60);
      setTargetGender(flyer.targetGender || 'all');
      setTargetInterests(flyer.targetInterests || []);
    }
  }, [flyer]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddRegion = () => {
    if (currentRegion.trim() && !targetRegions.includes(currentRegion.trim())) {
      setTargetRegions([...targetRegions, currentRegion.trim()]);
      setCurrentRegion('');
    }
  };

  const handleRemoveRegion = (region: string) => {
    setTargetRegions(targetRegions.filter(r => r !== region));
  };

  const handleAddInterest = () => {
    if (currentInterest.trim() && !targetInterests.includes(currentInterest.trim())) {
      setTargetInterests([...targetInterests, currentInterest.trim()]);
      setCurrentInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setTargetInterests(targetInterests.filter(i => i !== interest));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!flyer) return;

    // 이미지 업로드 처리 (실제 구현시 서버에 업로드)
    let imageUrl = flyer.imageUrl;
    if (imageFile) {
      // FormData를 사용하여 이미지 업로드
      const formData = new FormData();
      formData.append('image', imageFile);
      // TODO: 실제 이미지 업로드 API 호출
      // const response = await api.post('/upload', formData);
      // imageUrl = response.data.url;
      imageUrl = imagePreview; // 임시로 preview 사용
    }

    const updatedFlyer: Flyer = {
      ...flyer,
      title,
      description,
      imageUrl: imageUrl || undefined,
      category,
      gridCell,
      isActive,
      // 광고 설정 추가
      isAdEnabled,
      adCostPerView,
      adBudget,
      targetRegions: targetRegions.length > 0 ? targetRegions : undefined,
      targetAgeMin,
      targetAgeMax,
      targetGender,
      targetInterests: targetInterests.length > 0 ? targetInterests : undefined,
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedFlyer);
    onClose();
  };

  if (!isOpen || !flyer) return null;

  return (
    <div className="edit-modal-overlay" onClick={onClose}>
      <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="edit-modal-close" onClick={onClose} aria-label="닫기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="edit-modal-header">
          <h2>전단지 수정</h2>
          <p>전단지 정보를 수정하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="edit-modal-form">
          <div className="edit-form-group">
            <label htmlFor="title">
              제목 <span className="required">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="전단지 제목을 입력하세요"
              required
              maxLength={100}
            />
          </div>

          <div className="edit-form-group">
            <label htmlFor="description">
              설명
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="전단지 설명을 입력하세요"
              rows={4}
              maxLength={500}
            />
          </div>

          <div className="edit-form-row">
            <div className="edit-form-group">
              <label htmlFor="category">
                카테고리 <span className="required">*</span>
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">카테고리 선택</option>
                <option value="식품">식품</option>
                <option value="음식점">음식점</option>
                <option value="카페">카페</option>
                <option value="생활">생활</option>
                <option value="운동">운동</option>
                <option value="교육">교육</option>
                <option value="의료">의료</option>
                <option value="기타">기타</option>
              </select>
            </div>

            <div className="edit-form-group">
              <label htmlFor="gridCell">
                지역 <span className="required">*</span>
              </label>
              <input
                id="gridCell"
                type="text"
                value={gridCell}
                onChange={(e) => setGridCell(e.target.value)}
                placeholder="예: 의정부동"
                required
              />
            </div>
          </div>

          <div className="edit-form-row">
            <div className="edit-form-group">
              <label>
                전단지 이미지
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="edit-upload-button"
              >
                이미지 업로드
              </button>
              {imagePreview && (
                <div className="edit-image-preview">
                  <img src={imagePreview} alt="미리보기" />
                </div>
              )}
            </div>

            <div className="edit-form-group">
              <label className="edit-checkbox-label">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <span>전단지 활성화</span>
              </label>
              <p className="edit-help-text">
                활성화된 전단지만 고객에게 표시됩니다
              </p>
            </div>
          </div>

          {/* 광고 설정 섹션 */}
          <div className="edit-section-divider">
            <h3>광고 설정</h3>
          </div>

          <div className="edit-form-group">
            <label className="edit-checkbox-label">
              <input
                type="checkbox"
                checked={isAdEnabled}
                onChange={(e) => setIsAdEnabled(e.target.checked)}
              />
              <span>광고 활성화</span>
            </label>
            <p className="edit-help-text">
              광고를 활성화하면 타겟 고객에게 우선적으로 노출됩니다
            </p>
          </div>

          {isAdEnabled && (
            <>
              <div className="edit-form-row">
                <div className="edit-form-group">
                  <label htmlFor="adCostPerView">
                    5초 뷰당 광고비 (원)
                  </label>
                  <input
                    id="adCostPerView"
                    type="number"
                    value={adCostPerView}
                    onChange={(e) => setAdCostPerView(Number(e.target.value))}
                    min="10"
                    max="10000"
                    step="10"
                  />
                </div>

                <div className="edit-form-group">
                  <label htmlFor="adBudget">
                    광고 총 예산 (원)
                  </label>
                  <input
                    id="adBudget"
                    type="number"
                    value={adBudget}
                    onChange={(e) => setAdBudget(Number(e.target.value))}
                    min="1000"
                    step="1000"
                  />
                </div>
              </div>

              <div className="edit-form-group">
                <label>타겟 지역</label>
                <div className="edit-tag-input">
                  <input
                    type="text"
                    value={currentRegion}
                    onChange={(e) => setCurrentRegion(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddRegion();
                      }
                    }}
                    placeholder="지역명 입력 후 Enter"
                  />
                  <button type="button" onClick={handleAddRegion}>추가</button>
                </div>
                <div className="edit-tags">
                  {targetRegions.map(region => (
                    <span key={region} className="edit-tag">
                      {region}
                      <button
                        type="button"
                        onClick={() => handleRemoveRegion(region)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="edit-form-row">
                <div className="edit-form-group">
                  <label htmlFor="targetAgeMin">
                    타겟 최소 연령
                  </label>
                  <input
                    id="targetAgeMin"
                    type="number"
                    value={targetAgeMin}
                    onChange={(e) => setTargetAgeMin(Number(e.target.value))}
                    min="1"
                    max="100"
                  />
                </div>

                <div className="edit-form-group">
                  <label htmlFor="targetAgeMax">
                    타겟 최대 연령
                  </label>
                  <input
                    id="targetAgeMax"
                    type="number"
                    value={targetAgeMax}
                    onChange={(e) => setTargetAgeMax(Number(e.target.value))}
                    min="1"
                    max="100"
                  />
                </div>
              </div>

              <div className="edit-form-group">
                <label htmlFor="targetGender">
                  타겟 성별
                </label>
                <select
                  id="targetGender"
                  value={targetGender}
                  onChange={(e) => setTargetGender(e.target.value as 'male' | 'female' | 'all')}
                >
                  <option value="all">전체</option>
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                </select>
              </div>

              <div className="edit-form-group">
                <label>타겟 관심사</label>
                <div className="edit-tag-input">
                  <input
                    type="text"
                    value={currentInterest}
                    onChange={(e) => setCurrentInterest(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddInterest();
                      }
                    }}
                    placeholder="관심사 입력 후 Enter"
                  />
                  <button type="button" onClick={handleAddInterest}>추가</button>
                </div>
                <div className="edit-tags">
                  {targetInterests.map(interest => (
                    <span key={interest} className="edit-tag">
                      {interest}
                      <button
                        type="button"
                        onClick={() => handleRemoveInterest(interest)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {flyer.adImpressions !== undefined && (
                <div className="edit-ad-stats">
                  <h4>광고 성과</h4>
                  <div className="edit-stat-grid">
                    <div className="edit-stat-item">
                      <span className="edit-stat-label">노출 수</span>
                      <span className="edit-stat-value">{flyer.adImpressions || 0}</span>
                    </div>
                    <div className="edit-stat-item">
                      <span className="edit-stat-label">5초 뷰</span>
                      <span className="edit-stat-value">{flyer.adView5sCount || 0}</span>
                    </div>
                    <div className="edit-stat-item">
                      <span className="edit-stat-label">사용 금액</span>
                      <span className="edit-stat-value">₩{flyer.adSpent || 0}</span>
                    </div>
                    <div className="edit-stat-item">
                      <span className="edit-stat-label">잔여 예산</span>
                      <span className="edit-stat-value">₩{(adBudget || 0) - (flyer.adSpent || 0)}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="edit-modal-stats">
            <div className="edit-stat-item">
              <span className="edit-stat-label">조회수</span>
              <span className="edit-stat-value">{flyer.viewCount}</span>
            </div>
            <div className="edit-stat-item">
              <span className="edit-stat-label">클릭수</span>
              <span className="edit-stat-value">{flyer.clickCount}</span>
            </div>
            <div className="edit-stat-item">
              <span className="edit-stat-label">등록일</span>
              <span className="edit-stat-value">
                {new Date(flyer.createdAt).toLocaleDateString('ko-KR')}
              </span>
            </div>
          </div>

          <div className="edit-modal-actions">
            <button type="button" onClick={onClose} className="edit-cancel-button">
              취소
            </button>
            <button type="submit" className="edit-save-button">
              저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}