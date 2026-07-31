import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ViewDocument from './pages/ViewDocument';
import PresentationView from './pages/PresentationView';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Mengarahkan halaman utama (/) langsung ke Dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Semua halaman dapat diakses publik tanpa login */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/view/:id" element={<ViewDocument />} />
        <Route path="/present/:id" element={<PresentationView />} />

        {/* Wildcard: Jika URL acak diakses, balikkan ke Dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}