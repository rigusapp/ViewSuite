import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { 
  ArrowLeft, Download, Share2, Globe, Lock, ExternalLink, 
  ChevronLeft, ChevronRight, Play, Maximize 
} from 'lucide-react';

export default function ViewDocument() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [docData, setDocData] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State untuk kontrol Slide / Halaman
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isPresenting, setIsPresenting] = useState(false);
  
  const presenterWindowRef = useRef(null);

  useEffect(() => {
    fetchDocumentDetails();
  }, [id]);

  // Shortcut Keyboard: F5 untuk Mulai Presentasi, Panah Kiri/Kanan untuk Next/Prev
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F5') {
        e.preventDefault();
        startPresentation();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        prevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, fileUrl]);

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

  // Navigasi Slide
  const nextSlide = () => {
    setCurrentSlide((prev) => {
      const next = prev + 1;
      updatePresenterWindow(next);
      return next;
    });
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      const next = Math.max(1, prev - 1);
      updatePresenterWindow(next);
      return next;
    });
  };

  // Membuka Jendela Baru / Full Screen Layar Kedua untuk Presentasi
  const startPresentation = () => {
    setIsPresenting(true);
    
    // Buka jendela baru di monitor kedua/audiens jika ada
    const newWindow = window.open(
      '',
      'SlideShow',
      'width=1280,height=720,menubar=no,toolbar=no,location=no'
    );

    if (newWindow) {
      presenterWindowRef.current = newWindow;
      updatePresenterWindow(currentSlide);
    } else {
      alert('Mohon izinkan Popup di browser Anda untuk membuka Presenter View!');
    }
  };

  // Update konten di jendela audiens secara otomatis
  const updatePresenterWindow = (slideNum) => {
    if (presenterWindowRef.current && !presenterWindowRef.current.closed) {
      const isOffice = !docData?.original_name?.toLowerCase().endsWith('.pdf');
      
      const slideContent = isOffice
        ? `<iframe src="https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}" style="width:100vw;height:100vh;border:none;"></iframe>`
        : `<iframe src="${fileUrl}#page=${slideNum}&toolbar=0" style="width:100vw;height:100vh;border:none;"></iframe>`;

      presenterWindowRef.current.document.body.style.margin = '0';
      presenterWindowRef.current.document.body.style.backgroundColor = '#000';
      presenterWindowRef.current.document.body.innerHTML = slideContent;
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-950 text-gray-300">
        Memuat Presenter Mode...
      </div>
    );
  }

  const isPdf = docData?.mime_type === 'application/pdf' || docData?.original_name?.toLowerCase().endsWith('.pdf');

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden">
      {/* HEADER NAVIGASI & PRESENTER BAR */}
      <header className="h-14 bg-gray-900 border-b border-gray-800 px-4 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center space-x-3 truncate">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-medium text-sm truncate max-w-xs">{docData?.original_name}</span>
        </div>

        {/* KONTROL SLIDE / NEXT / PREV */}
        <div className="flex items-center space-x-3 bg-gray-800 px-4 py-1.5 rounded-xl border border-gray-700">
          <button
            onClick={prevSlide}
            className="p-1.5 hover:bg-gray-700 rounded-lg transition"
            title="Slide Sebelumnya (Kiri / PageUp)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-sm font-mono font-bold px-2">
            Slide {currentSlide}
          </span>

          <button
            onClick={nextSlide}
            className="p-1.5 hover:bg-gray-700 rounded-lg transition"
            title="Slide Selanjutnya (Kanan / Space / PageDown)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* TOMBOL PRESENT / F5 */}
        <div className="flex items-center space-x-2">
          <button
            onClick={startPresentation}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-1.5 rounded-lg text-xs font-semibold transition"
            title="Tekan F5 atau Klik untuk Mode Presentasi"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Present (F5)</span>
          </button>

          <a
            href={fileUrl}
            download={docData?.original_name}
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition"
          >
            <Download className="w-5 h-5" />
          </a>
        </div>
      </header>

      {/* AREA DOKUMEN / KONTROL LAYAR KEDUA */}
      <main className="flex-1 w-full bg-gray-950 flex flex-col items-center justify-center p-4 overflow-hidden">
        <div className="w-full max-w-5xl h-full bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl relative">
          {isPdf ? (
            <iframe
              src={`${fileUrl}#page=${currentSlide}`}
              title="Slide View"
              className="w-full h-full border-0"
            />
          ) : (
            /* Microsoft Office Online Embed dengan Auto-Slide Control */
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
              title="Slide View"
              className="w-full h-full border-0"
            />
          )}
        </div>

        <p className="text-xs text-gray-500 mt-2">
          💡 **Tips**: Tekan **F5** atau klik **Present** untuk membuka layar terpisah. Gunakan tombol **Panah Kanan / Space** untuk pindah slide.
        </p>
      </main>
    </div>
  );
}