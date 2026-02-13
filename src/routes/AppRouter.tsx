import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '@/features/auth/LoginPage';
import BouncerPage from '@/features/bouncer/BouncerPage';
import ResidentPage from '@/features/resident/ResidentPage';
import VisitorPage from '@/features/visitor/VisitorPage';
import ReportPage from '@/features/report/ReportPage';
import NoticePage from '@/features/notice/NoticePage';
import DashboardPage from './DashboardPage';
import ProtectedRoute from './ProtectedRoute';

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/bouncers" element={<BouncerPage />} />
        <Route path="/residents" element={<ResidentPage />} />
        <Route path="/visitors" element={<VisitorPage />} />
        <Route path="/reports" element={<ReportPage />} />
        <Route path="/notices" element={<NoticePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
