import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage          from './pages/LoginPage';
import SignupPage         from './pages/SignupPage';
import DashboardPage      from './pages/DashboardPage';
import AuctionDetailPage  from './pages/AuctionDetailPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function UserRoute({ children }) {
  const role = sessionStorage.getItem('role');
  if (role !== 'USER') return <Navigate to="/" />;
  return children;
}

function AdminRoute({ children }) {
  const role = sessionStorage.getItem('role');
  if (role !== 'ADMIN') return <Navigate to="/" />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<LoginPage />} />
        <Route path="/signup"  element={<SignupPage />} />

        <Route path="/dashboard"   element={<UserRoute><DashboardPage /></UserRoute>} />
        <Route path="/auction/:id" element={<UserRoute><AuctionDetailPage /></UserRoute>} />
        <Route path="/admin"       element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
