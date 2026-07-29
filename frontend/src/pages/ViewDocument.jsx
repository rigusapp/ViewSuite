import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { ArrowLeft, Download, Share2, ChevronLeft, ChevronRight, Play } from 'lucide-react';

export default function ViewDocument() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [docData, setDocData] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(1);

  const presenterWindowRef = useRef(null);

  useEffect(() => {
    fetchDocumentDetails();
  }, [id]);

  // Sinkronkan pergantian slide ke layar 2 (Presenter Window)
  useEffect(() => {
    if (presenterWindowRef.current && !presenterWindowRef.current.closed) {
      const isPdf = docData?.original_name?.toLowerCase().endsWith('.pdf');
      
      if (isPdf) {
        // Untuk PDF: Kirim perintah ubah URL hash / page
        presenterWindowRef.current.location.href = `${fileUrl}#page=${currentSlide}&toolbar=0`;
      } else {
        // Untuk Office PPT: Reload iframe dengan URL yang ter-update
        const iframe = presenterWindowRef.current.document.getElementById('slideIframe');
        if (iframe) {
          iframe.src = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}&wdSlideId=${currentSlide}`;
        }
      }
    }
  }, [currentSlide]);

  const fetchDocumentDetails = async () => {
    try {
      setLoading(true);
      const { data: doc } = await supabase.from('documents').select('*').eq('id', id).single();
      if (!doc) return;
      setDocData(doc);
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(doc.storage_path);
      setFileUrl(urlData.publicUrl);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => setCurrentSlide((prev) => prev + 1);
  const prevSlide = () => setCurrentSlide((prev) => Math.max(1, prev - 1));

  // Membuka Jendela Layar 2 (Popup)
  const startPresentation = () => {
    const isPdf = docData?.original_name?.toLowerCase().endsWith('.pdf');
    const embedSrc = isPdf
      ? `${fileUrl}#page=${currentSlide}&toolbar=0`
      : `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;

    const newWindow = window.open('', 'SlideShow', 'width=1280,height=720');

    if (newWindow) {
      presenterWindowRef.current = newWindow;
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Presentation View - ${docData?.original_name}</title>
            <style>
              body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #000; }
              iframe { width: 100%; height: 100%; border: none; }
            </style>
          </head>
          <body>
            <iframe id="slideIframe" src="${embedSrc}"></iframe>
          </body>
        </html>
      `);
      newWindow.document.close();
    } else {
      alert('Izinkan Popup pada browser Anda untuk membuka Presenter View!');
    }
  };

  if (loading) return <div className="h-screen bg-gray-950 text-white flex items-center justify-center">Memuat...</div>;

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white">
      {/* HEADER NAVIGASI */}
      <header className="h-14 bg-gray-900 border-b border-gray-800 px-4 flex items-center justify-between">
        <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-800 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 bg-gray-800 px-4 py-1.5 rounded-xl border border-gray-700">
          <button onClick={prevSlide} className="p-1.5 hover:bg-gray-700 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-mono font-bold px-2">Slide {currentSlide}</span>
          <button onClick={nextSlide} className="p-1.5 hover:bg-gray-700 rounded-lg">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={startPresentation}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-1.5 rounded-lg text-xs font-semibold"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Present (Layar 2)</span>
        </button>
      </header>

      {/* VIEW UTAMA */}
      <main className="flex-1 p-4 flex items-center justify-center">
        <iframe
          src={`${fileUrl}#page=${currentSlide}`}
          className="w-full h-full border-0 rounded-xl bg-white"
          title="Layar Kontrol"
        />
      </main>
    </div>
  );
}