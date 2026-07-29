import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import UploadModal from '../components/UploadModal';
import { useDocuments } from '../hooks/useDocuments';
import { formatBytes } from '../utils/fileHelpers';
import { FileText, HardDrive, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { documents, loading } = useDocuments();
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const totalStorage = documents.reduce((acc, doc) => acc + doc.size, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <Navbar />
      <div className="flex">
        <Sidebar onOpenUpload={() => setIsUploadOpen(true)} />

        <main className="flex-1 p-8 space-y-8">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ringkasan aktivitas dokumen Anda</p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center space-x-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Dokumen</p>
                <h3 className="text-2xl font-bold">{documents.length}</h3>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center space-x-4">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                <HardDrive className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Storage Digunakan</p>
                <h3 className="text-2xl font-bold">{formatBytes(totalStorage)}</h3>
              </div>
            </div>
          </div>

          {/* Dokumen Terbaru */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Dokumen Terbaru</h2>
            {loading ? (
              <p className="text-gray-500">Memuat dokumen...</p>
            ) : documents.length === 0 ? (
              <p className="text-gray-500">Belum ada dokumen yang diunggah.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {documents.slice(0, 6).map((doc) => (
                  <div key={doc.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div className="truncate mr-2">
                      <p className="font-medium truncate">{doc.original_name}</p>
                      <p className="text-xs text-gray-500">{formatBytes(doc.size)}</p>
                    </div>
                    <Link
                      to={`/view/${doc.id}`}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-blue-600"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
}