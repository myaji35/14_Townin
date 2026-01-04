import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UserDashboard from './pages/UserDashboard';
import MerchantDashboard from './pages/MerchantDashboard';
import PartnerDashboard from './pages/PartnerDashboard';
import CreateFlyerPage from './pages/CreateFlyerPage';
import SecurityGuardDashboard from './pages/SecurityGuardDashboard';
import MunicipalityDashboard from './pages/MunicipalityDashboard';
import AdminDashboard from './pages/AdminDashboard';
import MasterDashboard from './pages/MasterDashboard';
import { authService } from './services/auth';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  // Temporarily disable authentication for demo purposes
  return <>{children}</>;
  // return authService.isAuthenticated() ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

        {/* 고객 대시보드 */}
        <Route
          path="/user/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />

        {/* 고객 프리미엄 대시보드 (Gold Theme) */}
        <Route
          path="/user/premium"
          element={
            <PrivateRoute>
              <UserDashboard />
            </PrivateRoute>
          }
        />

        {/* 사장님 (Merchant) 대시보드 */}
        <Route
          path="/ceo/dashboard"
          element={
            <PrivateRoute>
              <MerchantDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/merchant/dashboard"
          element={
            <PrivateRoute>
              <MerchantDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/ceo/flyers/new"
          element={
            <PrivateRoute>
              <CreateFlyerPage />
            </PrivateRoute>
          }
        />

        {/* 파트너 (지역 관리자) 대시보드 */}
        <Route
          path="/partner/dashboard"
          element={
            <PrivateRoute>
              <PartnerDashboard />
            </PrivateRoute>
          }
        />

        {/* 마스터 대시보드 */}
        <Route
          path="/master/dashboard"
          element={
            <PrivateRoute>
              <MasterDashboard />
            </PrivateRoute>
          }
        />

        {/* 보안관 대시보드 */}
        <Route
          path="/security/dashboard"
          element={
            <PrivateRoute>
              <SecurityGuardDashboard />
            </PrivateRoute>
          }
        />

        {/* 관리자 대시보드 */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* 지자체 대시보드 (별도 유지) */}
        <Route
          path="/municipality/dashboard"
          element={
            <PrivateRoute>
              <MunicipalityDashboard />
            </PrivateRoute>
          }
        />

        {/* 리다이렉트 */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
        <Route path="/user" element={<Navigate to="/user/premium" />} />
        <Route path="/ceo" element={<Navigate to="/ceo/dashboard" />} />
        <Route path="/merchant" element={<Navigate to="/merchant/dashboard" />} />
        <Route path="/partner" element={<Navigate to="/partner/dashboard" />} />
        <Route path="/master" element={<Navigate to="/master/dashboard" />} />
        <Route path="/dashboard" element={<Navigate to="/user/premium" />} />
        <Route path="/" element={<Navigate to="/user/premium" />} />
      </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
