import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { flyerService } from '../services/flyer';
import './CreateFlyerPage.css';

interface ProductItem {
  id: string;
  title: string;
  description: string;
  category: string;
  price?: string;
  selected: boolean;
}

interface AnalyzedData {
  products: ProductItem[];
  extractedText: string;
}

export default function CreateFlyerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [extractedText, setExtractedText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [gridCell, setGridCell] = useState('의정부동');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'application/pdf'];

    if (!validTypes.includes(selectedFile.type)) {
      alert('이미지 파일(JPG, PNG, GIF) 또는 PDF만 업로드 가능합니다.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    // 이전 상태 모두 초기화
    setAnalyzed(false);
    setProducts([]);
    setExtractedText('');
    setFile(selectedFile);

    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewUrl('');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const analyzeFile = async () => {
    if (!file) return;

    setAnalyzing(true);

    try {
      // 백엔드 API 호출
      const response = await flyerService.analyzeFlyerImage(file);

      // API 응답을 ProductItem 형식으로 변환
      const analyzedProducts: ProductItem[] = response.data.products.map((product, index) => ({
        id: String(index + 1),
        title: product.title,
        description: product.description,
        category: product.category,
        price: product.price,
        selected: true,
      }));

      setProducts(analyzedProducts);
      setExtractedText(response.data.extractedText);
      setAnalyzed(true);
    } catch (error) {
      console.error('분석 실패:', error);
      alert('파일 분석에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleProductSelection = (productId: string) => {
    setProducts(products.map(p =>
      p.id === productId ? { ...p, selected: !p.selected } : p
    ));
  };

  const toggleSelectAll = () => {
    const allSelected = products.every(p => p.selected);
    setProducts(products.map(p => ({ ...p, selected: !allSelected })));
  };

  const updateProduct = (productId: string, field: keyof ProductItem, value: string) => {
    setProducts(products.map(p =>
      p.id === productId ? { ...p, [field]: value } : p
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedProducts = products.filter(p => p.selected);

    if (selectedProducts.length === 0) {
      alert('최소 1개 이상의 상품을 선택해주세요.');
      return;
    }

    try {
      // 백엔드 배치 등록 API 호출
      const batchData = {
        gridCell,
        imageUrl: previewUrl,
        flyers: selectedProducts.map(product => ({
          title: product.title,
          description: product.description,
          category: product.category,
          price: product.price,
        })),
      };

      const response = await flyerService.batchCreateFlyers(batchData);

      alert(`${response.data.count}개의 전단지가 성공적으로 등록되었습니다!`);
      navigate('/ceo/dashboard');
    } catch (error) {
      console.error('전단지 등록 실패:', error);
      alert('전단지 등록에 실패했습니다.');
    }
  };

  const user = authService.getUser();
  const selectedCount = products.filter(p => p.selected).length;

  return (
    <div className="create-flyer-page">
      <header className="create-flyer-header">
        <div className="create-flyer-header-content">
          <button onClick={() => navigate('/ceo/dashboard')} className="back-button">
            ← 돌아가기
          </button>
          <h1>새 전단지 등록</h1>
          <div className="user-info">
            <span>{user?.email}</span>
          </div>
        </div>
      </header>

      <main className="create-flyer-main">
        <div className="create-flyer-container-single">
          {/* AI 분석 섹션 */}
          <section className="upload-section-full">
            <div className="section-header">
              <h2>🤖 AI 자동 분석</h2>
              <p>전단지 이미지나 PDF를 업로드하면 AI가 자동으로 상품을 분리해드립니다</p>
            </div>

            <div
              className={`upload-area ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
              />

              {!file ? (
                <div className="upload-placeholder">
                  <div className="upload-icon">📁</div>
                  <p className="upload-text-primary">이미지 또는 PDF 파일을 드래그하거나 클릭하세요</p>
                  <p className="upload-text-secondary">JPG, PNG, GIF, PDF (최대 10MB)</p>
                </div>
              ) : (
                <div className="file-preview">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="preview-image" />
                  ) : (
                    <div className="pdf-preview">
                      <div className="pdf-icon">📄</div>
                      <p>{file.name}</p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setPreviewUrl('');
                      setAnalyzed(false);
                      setProducts([]);
                      setExtractedText('');
                      // 파일 입력 필드도 초기화
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="remove-file-button"
                  >
                    ✕ 파일 제거
                  </button>
                </div>
              )}
            </div>

            {file && !analyzed && (
              <button
                type="button"
                onClick={analyzeFile}
                disabled={analyzing}
                className="analyze-button"
              >
                {analyzing ? (
                  <>
                    <span className="spinner"></span>
                    AI 분석 중...
                  </>
                ) : (
                  <>
                    🔍 AI로 상품 분석하기
                  </>
                )}
              </button>
            )}

            {analyzed && extractedText && (
              <div className="extracted-text">
                <h3>📝 AI 분석 결과</h3>
                <pre>{extractedText}</pre>
              </div>
            )}
          </section>

          {/* 감지된 상품 목록 */}
          {analyzed && products.length > 0 && (
            <section className="products-section">
              <div className="products-header">
                <div className="products-title-row">
                  <h2>🎯 감지된 상품 ({products.length}개)</h2>
                  <button type="button" onClick={toggleSelectAll} className="select-all-button">
                    {products.every(p => p.selected) ? '전체 해제' : '전체 선택'}
                  </button>
                </div>
                <p>각 상품을 개별 전단지로 등록합니다. 필요시 수정하고 등록할 항목을 선택하세요.</p>
              </div>

              <div className="products-list">
                {products.map((product, index) => (
                  <div key={product.id} className={`product-card ${product.selected ? 'selected' : ''}`}>
                    <div className="product-card-header">
                      <label className="product-checkbox">
                        <input
                          type="checkbox"
                          checked={product.selected}
                          onChange={() => toggleProductSelection(product.id)}
                        />
                        <span className="product-number">상품 #{index + 1}</span>
                      </label>
                      {product.price && (
                        <span className="product-price">{product.price}</span>
                      )}
                    </div>

                    <div className="product-form">
                      <div className="product-form-group">
                        <label>제목</label>
                        <input
                          type="text"
                          value={product.title}
                          onChange={(e) => updateProduct(product.id, 'title', e.target.value)}
                          placeholder="상품 제목"
                          maxLength={100}
                        />
                      </div>

                      <div className="product-form-group">
                        <label>설명</label>
                        <textarea
                          value={product.description}
                          onChange={(e) => updateProduct(product.id, 'description', e.target.value)}
                          placeholder="상품 설명"
                          rows={3}
                          maxLength={500}
                        />
                      </div>

                      <div className="product-form-row">
                        <div className="product-form-group">
                          <label>카테고리</label>
                          <select
                            value={product.category}
                            onChange={(e) => updateProduct(product.id, 'category', e.target.value)}
                          >
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="register-section">
                <div className="form-group">
                  <label htmlFor="gridCell">
                    적용 지역 <span className="required">*</span>
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

                <div className="register-summary">
                  <div className="summary-info">
                    <span className="summary-label">선택된 상품:</span>
                    <span className="summary-value">{selectedCount}개</span>
                  </div>
                  <div className="summary-info">
                    <span className="summary-label">등록될 전단지:</span>
                    <span className="summary-value">{selectedCount}개</span>
                  </div>
                </div>

                <div className="register-actions">
                  <button
                    type="button"
                    onClick={() => navigate('/ceo/dashboard')}
                    className="cancel-button"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="submit-button"
                    disabled={selectedCount === 0}
                  >
                    {selectedCount}개 전단지 등록
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
