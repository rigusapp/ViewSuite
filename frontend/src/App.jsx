import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ViewDocument from './pages/ViewDocument';
import PresentationView from './pages/PresentationView';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Bebas diakses tanpa login */}
        <Route path="/view/:id" element={<ViewDocument />} />
        <Route path="/present/:id" element={<PresentationView />} />
        
        {/* Jika ingin dashboard/halaman utama juga bisa diakses tanpa login */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />

        {/* Jika orang membuka URL utama (/), langsung arahkan ke Dashboard atau halaman tertentu */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}