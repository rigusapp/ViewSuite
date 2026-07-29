import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ViewDocument from './pages/ViewDocument';
import PresentationView from './pages/PresentationView';

// Proteksi Halaman yang Butuh Login
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500">
        Memuat DocView...
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

// Redirect Otomatis dari Halaman Root (/)
function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500">
        Memuat DocView...
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Halaman Utama / Redirect otomatis */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          
          {/* Halaman Khusus User Terautentikasi */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Halaman Publik (Dapat Diakses Siapa Saja Tanpa Login) */}
          <Route path="/view/:id" element={<ViewDocument />} />
          <Route path="/present/:id" element={<PresentationView />} />
          
          {/* Wildcard jika URL tidak ditemukan */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}