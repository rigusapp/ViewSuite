import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Share2, 
  Globe, 
  Lock 
} from 'lucide-react';

export default function ViewDocument() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [docData, setDocData] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State untuk kontrol viewer (Page & Zoom)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);

  useEffect(() => {
    fetchDocumentDetails();
  }, [id]);

  const fetchDocumentDetails = async () => {
    try {
      setLoading(true);
      setError('');

      // 1. Ambil metadata dari tabel documents
      const { data: doc, error: dbError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();

      if (dbError || !doc) throw new Error('Dokumen tidak ditemukan atau akses ditolak.');

      setDocData(doc);

      // 2. Dapatkan public URL / signed URL dari Supabase Storage
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(doc.storage_path);

      setFileUrl(urlData.publicUrl);
    } catch (err) {
      setError(err.message || 'Gagal memuat dokumen.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handleZoomIn = () => {
    if (zoomLevel < 200) setZoomLevel((prev) => prev + 25);
  };

  const handleZoomOut = () => {
    if (zoomLevel > 50) setZoomLevel((prev) => prev - 25);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Tautan dokumen berhasil disalin ke clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300">
        Memuat viewer dokumen...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-red-600 p-4">
        <h2 className="text-xl font-bold mb-2">Terjadi Kesalahan</h2>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">{error}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  const isPdf = docData?.mime_type === 'application/pdf';
  const isImage = docData?.mime_type?.startsWith('image/');

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      {/* HEADER NAVIGASI VIEWER */}
      <header className="h-14 bg-gray-800 border-b border-gray-700 px-4 flex items-center justify-between z-20">
        {/* Sisi Kiri: Tombol Back & Nama Dokumen */}
        <div className="flex items-center space-x-3 truncate max-w-xs md:max-w-md">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-1.5 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition"
            title="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-medium text-sm truncate">{docData?.original_name}</span>
          {docData?.visibility === 'public' ? (
            <Globe className="w-4 h-4 text-green-400 flex-shrink-0" title="Public Document" />
          ) : (
            <Lock className="w-4 h-4 text-amber-400 flex-shrink-0" title="Private Document" />
          )}
        </div>

        {/* Sisi Tengah: Kontrol Halaman (Next / Prev) */}
        <div className="flex items-center space-x-2 bg-gray-900/60 px-3 py-1 rounded-lg">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="p-1 hover:bg-gray-700 rounded disabled:opacity-40 disabled:hover:bg-transparent transition"
            title="Halaman Sebelumnya"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-mono">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="p-1 hover:bg-gray-700 rounded disabled:opacity-40 disabled:hover:bg-transparent transition"
            title="Halaman Selanjutnya"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Sisi Kanan: Zoom, Share, Download */}
        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex items-center space-x-1 bg-gray-900/60 px-2 py-1 rounded-lg mr-2">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:bg-gray-700 rounded transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono w-12 text-center">{zoomLevel}%</span>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:bg-gray-700 rounded transition"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleShare}
            className="p-1.5 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition"
            title="Bagikan Tautan"
          >
            <Share2 className="w-5 h-5" />
          </button>

          <a
            href={fileUrl}
            download={docData?.original_name}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium transition"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </a>
        </div>
      </header>

      {/* AREA DOKUMEN / RENDERING */}
      <main className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-950">
        <div 
          className="transition-all duration-200 shadow-2xl rounded-lg overflow-hidden bg-white max-w-full"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
        >
          {isImage ? (
            <img 
              src={fileUrl} 
              alt={docData?.original_name} 
              className="max-h-[80vh] object-contain mx-auto"
            />
          ) : isPdf ? (
            /* PDF Iframe Viewer standar browser */
            <iframe
              src={`${fileUrl}#page=${currentPage}`}
              title={docData?.original_name}
              className="w-[800px] h-[80vh] border-0"
            />
          ) : (
            /* Fallback Viewer via Office / Google Doc Viewer untuk Office Files */
            <iframe
              src={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`}
              title={docData?.original_name}
              className="w-[800px] h-[80vh] border-0"
            />
          )}
        </div>
      </main>
    </div>
  );
}