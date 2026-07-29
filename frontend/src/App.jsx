import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ViewDocument from './pages/ViewDocument';

// Marker untuk halaman terproteksi
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/view/:id" element={<ViewDocument />} />
          {/* Tambahkan rute /login, /dashboard, dan /my-documents di sini */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}