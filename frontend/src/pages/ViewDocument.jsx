import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { ArrowLeft } from 'lucide-react';

export default function ViewDocument() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [docData, setDocData] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocumentDetails();
  }, [id]);

  const fetchDocumentDetails = async () => {
    try {
      setLoading(true);
      const { data: doc, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !doc) {
        setDocData(null);
        return;
      }

      setDocData(doc);

      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(doc.storage_path);

      setFileUrl(urlData.publicUrl);
    } catch (err) {
      console.error('Gagal mengambil dokumen:', err);
    } finally {
      setLoading(false);
    }
  };

  // Navigasi pintar: Jika ada history, balik ke halaman sebelumnya. Jika tidak, ke root/dashboard
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-950 text-white flex items-center justify-center font-mono">
        Memuat Dokumen...
      </div>
    );
  }

  if (!docData) {
    return (
      <div className="h-screen bg-gray-950 text-white flex flex-col items-center justify-center space-y-4">
        <p className="text-gray-400">Dokumen tidak ditemukan atau tidak tersedia secara publik.</p>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-white transition"
        >
          Kembali
        </button>
      </div>
    );
  }

  const isPdf =
    docData?.mime_type === 'application/pdf' ||
    docData?.original_name?.toLowerCase().endsWith('.pdf');

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden">
      {/* HEADER UTAMA */}
      <header className="h-12 bg-gray-900 border-b border-gray-800 px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-3 truncate">
          <button
            onClick={handleBack}
            className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition"
            title="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-medium text-sm truncate max-w-sm">
            {docData?.original_name}
          </span>
        </div>
      </header>

      {/* AREA VIEWER FULLSCREEN */}
      <main className="flex-1 w-full h-full bg-black overflow-hidden m-0 p-0 relative">
        {isPdf ? (
          <iframe
            src={`${fileUrl}#toolbar=0&navpanes=0`}
            title="PDF View"
            className="w-full h-full border-0"
          />
        ) : (
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}&action=embedview`}
            title="Office View"
            className="w-full h-full border-0"
            allowFullScreen
          />
        )}
      </main>
    </div>
  );
}