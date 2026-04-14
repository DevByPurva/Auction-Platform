import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage          from './pages/LoginPage';
import DashboardPage      from './pages/DashboardPage';
import AuctionDetailPage  from './pages/AuctionDetailPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"            element={<LoginPage />} />
        <Route path="/dashboard"   element={<DashboardPage />} />
        <Route path="/auction/:id" element={<AuctionDetailPage />} />
        <Route path="/admin"       element={<AdminDashboardPage />} />
        <Route path="*"            element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
