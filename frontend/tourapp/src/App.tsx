import { Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';

import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { EditProfilePage } from './pages/profile/EditProfilePage';
import { BlogListPage } from './pages/blogs/BlogListPage';
import { BlogDetailPage } from './pages/blogs/BlogDetailPage';
import { CreateBlogPage } from './pages/blogs/CreateBlogPage';
import { TourListPage } from './pages/tours/TourListPage';
import { TourDetailPage } from './pages/tours/TourDetailPage';
import { MyToursPage } from './pages/tours/MyToursPage';
import { CreateTourPage } from './pages/tours/CreateTourPage';
import { EditTourPage } from './pages/tours/EditTourPage';
import { ManageKeypointsPage } from './pages/tours/ManageKeypointsPage';
import { CartPage } from './pages/cart/CartPage';
import { PositionSimulatorPage } from './pages/simulator/PositionSimulatorPage';
import { TourExecutionPage } from './pages/execution/TourExecutionPage';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function RoleRoute({ roles, children }: { roles: string[]; children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function HomeRedirect() {
  const { isAuthenticated, isGuide } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={isGuide ? '/my-tours' : '/tours'} replace />;
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/tours" element={<TourListPage />} />
        <Route path="/tours/:id" element={<TourDetailPage />} />

        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />

        <Route path="/blogs" element={<ProtectedRoute><BlogListPage /></ProtectedRoute>} />
        <Route path="/blogs/create" element={<ProtectedRoute><CreateBlogPage /></ProtectedRoute>} />
        <Route path="/blogs/:id" element={<ProtectedRoute><BlogDetailPage /></ProtectedRoute>} />

        <Route path="/my-tours" element={<RoleRoute roles={['guide']}><MyToursPage /></RoleRoute>} />
        <Route path="/my-tours/create" element={<RoleRoute roles={['guide']}><CreateTourPage /></RoleRoute>} />
        <Route path="/my-tours/:id/edit" element={<RoleRoute roles={['guide']}><EditTourPage /></RoleRoute>} />
        <Route path="/my-tours/:id/keypoints" element={<RoleRoute roles={['guide']}><ManageKeypointsPage /></RoleRoute>} />

        <Route path="/cart" element={<RoleRoute roles={['tourist']}><CartPage /></RoleRoute>} />
        <Route path="/simulator" element={<RoleRoute roles={['tourist']}><PositionSimulatorPage /></RoleRoute>} />
        <Route path="/execution" element={<RoleRoute roles={['tourist']}><TourExecutionPage /></RoleRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
