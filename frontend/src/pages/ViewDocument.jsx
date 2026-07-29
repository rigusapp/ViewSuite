import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { ArrowLeft, Download, Share2, ChevronLeft, ChevronRight, Play, ExternalLink } from 'lucide-react';

export default function ViewDocument() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [docData, setDocData] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(1);

  // Channel untuk komunikasi antar Layar 1 & Layar 2
  const channelRef = useRef(null);
  const presenterWindowRef = useRef(null);

  useEffect(() => {
    fetchDocumentDetails();

    // Buat saluran komunikasi (BroadcastChannel)
    const channel = new BroadcastChannel(`doc_presentation_${id}`);
    channelRef.current = channel;

    return () => {
      channel.close();
    };
  }, [id]);

  // Fungsi saat slide diubah dari Layar 1
  const updateSlide = (newSlide) => {
    const validSlide = Math.max(1, newSlide);
    setCurrentSlide(validSlide);

    // Kirim pesan sinkronisasi ke Layar 2
    if (channelRef.current) {
      channelRef.current.postMessage({ type: 'CHANGE_SLIDE', slide: validSlide });
    }
  };

  const fetchDocumentDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const { data: doc, error: dbError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();

      if (dbError || !doc) throw new Error('Dokumen tidak ditemukan.');

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

  // Membuka Jendela Presentasi (Layar 2)
  const startPresentation = () => {
    const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;
    
    const newWindow = window.open('', 'SlideShow', 'width=1280,height=720');

    if (newWindow) {
      presenterWindowRef.current = newWindow;

      // HTML untuk Layar 2 dengan Google/Office Viewer + Listener Sinkronisasi
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Presentation - ${docData?.original_name}</title>
            <style>
              body, html { margin: 0; padding: 0; width: 100vw; height: 100vh; overflow: hidden; background: #000; }
              iframe { width: 100%; height: 100%; border: none; }
            </style>
          </head>
          <body>
            <iframe id="presentationIframe" src="${googleViewerUrl}"></iframe>

            <script>
              const channel = new BroadcastChannel('doc_presentation_${id}');
              const iframe = document.getElementById('presentationIframe');
              const baseUrl = "${googleViewerUrl}";

              channel.onmessage = (event) => {
                if (event.data.type === 'CHANGE_SLIDE') {
                  // Re-render / scroll viewer saat ada event tombol next
                  console.log("Navigasi ke slide:", event.data.slide);
                }
              };
            </script>
          </body>
        </html>
      `);
      newWindow.document.close();
    } else {
      alert('Mohon izinkan Popup browser untuk membuka Layar Presentasi!');
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-950 text-gray-300">
        Memuat dokumen...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-950 text-red-500 p-4">
        <p className="mb-4">{error}</p>
        <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
          Kembali
        </button>
      </div>
    );
  }

  const isPdf = docData?.mime_type === 'application/pdf' || docData?.original_name?.toLowerCase().endsWith('.pdf');
  const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden">
      {/* HEADER NAVIGASI */}
      <header className="h-14 bg-gray-900 border-b border-gray-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3 truncate">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-medium text-sm truncate max-w-xs">{docData?.original_name}</span>
        </div>

        {/* TOMBOL NAVIGASI NEXT / PREV */}
        <div className="flex items-center space-x-3 bg-gray-800 px-4 py-1.5 rounded-xl border border-gray-700">
          <button
            onClick={() => updateSlide(currentSlide - 1)}
            className="p-1.5 hover:bg-gray-700 rounded-lg transition"
            title="Slide Sebelumnya"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-mono font-bold px-2">Halaman / Slide {currentSlide}</span>
          <button
            onClick={() => updateSlide(currentSlide + 1)}
            className="p-1.5 hover:bg-gray-700 rounded-lg transition"
            title="Slide Selanjutnya"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={startPresentation}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-1.5 rounded-lg text-xs font-semibold"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Present (Layar 2)</span>
          </button>

          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white"
          >
            <ExternalLink className="w-5 h-5" />
          </a>

          <a
            href={fileUrl}
            download={docData?.original_name}
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white"
          >
            <Download className="w-5 h-5" />
          </a>
        </div>
      </header>

      {/* VIEW UTAMA / EMBEDDED VIEWER (GOOGLE DOCS VIEWER) */}
      <main className="flex-1 w-full h-[calc(100vh-56px)] bg-gray-950 flex items-center justify-center overflow-hidden">
        {isPdf ? (
          <iframe
            src={`${fileUrl}#page=${currentSlide}`}
            title="PDF View"
            className="w-full h-full border-0"
          />
        ) : (
          <iframe
            src={googleViewerUrl}
            title="Office View"
            className="w-full h-full border-0"
          />
        )}
      </main>
    </div>
  );
}