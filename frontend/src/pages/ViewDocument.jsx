import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { ArrowLeft, Download, Share2, Globe, Lock, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ViewDocument() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [docData, setDocData] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pdfPage, setPdfPage] = useState(1);

  useEffect(() => {
    fetchDocumentDetails();
  }, [id]);

  const fetchDocumentDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const { data: doc, error: dbError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();

      if (dbError || !doc) throw new Error('Dokumen tidak ditemukan atau akses ditolak.');

      setDocData(doc);

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

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Tautan dokumen berhasil disalin ke clipboard!');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-950 text-gray-300 font-medium">
        Memuat viewer dokumen...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-950 text-red-500 p-4 text-center">
        <h2 className="text-xl font-bold mb-2">Terjadi Kesalahan</h2>
        <p className="mb-4 text-sm text-gray-400">{error}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  const isPdf = docData?.mime_type === 'application/pdf' || docData?.original_name?.toLowerCase().endsWith('.pdf');
  const isImage = docData?.mime_type?.startsWith('image/');

  // Menggunakan Microsoft Office Online Viewer sebagai alternatif Google jika file adalah Office/PPT
  const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
  const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden">
      {/* HEADER NAVIGASI */}
      <header className="h-14 bg-gray-900 border-b border-gray-800 px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center space-x-3 truncate">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition"
            title="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-medium text-sm truncate max-w-xs md:max-w-md">
            {docData?.original_name}
          </span>
          {docData?.visibility === 'public' ? (
            <Globe className="w-4 h-4 text-green-400 shrink-0" title="Public Document" />
          ) : (
            <Lock className="w-4 h-4 text-amber-400 shrink-0" title="Private Document" />
          )}
        </div>

        {/* Khusus PDF: Tombol ganti halaman manual di header */}
        {isPdf && (
          <div className="flex items-center space-x-2 bg-gray-800 px-3 py-1 rounded-lg">
            <button
              onClick={() => setPdfPage((p) => Math.max(1, p - 1))}
              className="p-1 hover:bg-gray-700 rounded transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono">Halaman {pdfPage}</span>
            <button
              onClick={() => setPdfPage((p) => p + 1)}
              className="p-1 hover:bg-gray-700 rounded transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <button
            onClick={handleShare}
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition"
            title="Bagikan Tautan"
          >
            <Share2 className="w-5 h-5" />
          </button>

          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition"
            title="Buka File Asli"
          >
            <ExternalLink className="w-5 h-5" />
          </a>

          <a
            href={fileUrl}
            download={docData?.original_name}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium transition"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </a>
        </div>
      </header>

      {/* AREA VIEWER */}
      <main className="flex-1 w-full bg-gray-950 flex items-center justify-center overflow-hidden">
        {isImage ? (
          <div className="p-4 max-h-full overflow-auto">
            <img
              src={fileUrl}
              alt={docData?.original_name}
              className="max-h-[85vh] object-contain mx-auto rounded-lg shadow-xl"
            />
          </div>
        ) : isPdf ? (
          <iframe
            src={`${fileUrl}#page=${pdfPage}`}
            title={docData?.original_name}
            className="w-full h-full border-0"
          />
        ) : (
          /* Office / PPT Viewer */
          <iframe
            src={googleViewerUrl}
            title={docData?.original_name}
            className="w-full h-full border-0"
          />
        )}
      </main>
    </div>
  );
}