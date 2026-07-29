import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { 
  ArrowLeft, Download, ChevronLeft, ChevronRight, Play, Video 
} from 'lucide-react';

export default function ViewDocument() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [docData, setDocData] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(1);

  useEffect(() => {
    fetchDocumentDetails();
  }, [id]);

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
      const { data: doc } = await supabase.from('documents').select('*').eq('id', id).single();
      if (!doc) return;
      setDocData(doc);

      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(doc.storage_path);
      setFileUrl(urlData.publicUrl);
    } finally {
      setLoading(false);
    }
  };

  const updateSlide = (slideNum) => {
    const validSlide = Math.max(1, slideNum);
    setCurrentSlide(validSlide);

    // Simpan ke localStorage untuk memicu perubahan di OBS & Presenter Window
    localStorage.setItem(`doc_slide_${id}`, validSlide.toString());
  };

  const nextSlide = () => updateSlide(currentSlide + 1);
  const prevSlide = () => updateSlide(currentSlide - 1);

  const startPresentation = () => {
    const obsUrl = `${window.location.origin}/#/present/${id}`;
    window.open(obsUrl, 'SlideShow', 'width=1280,height=720');
  };

  const copyObsLink = () => {
    const obsUrl = `${window.location.origin}/#/present/${id}`;
    navigator.clipboard.writeText(obsUrl);
    alert('Tautan OBS Browser Source berhasil disalin!\n\nURL: ' + obsUrl);
  };

  if (loading) return <div className="h-screen bg-gray-950 text-white flex items-center justify-center">Memuat...</div>;

  const isPdf = docData?.mime_type === 'application/pdf' || docData?.original_name?.toLowerCase().endsWith('.pdf');

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

        {/* KONTROL SLIDE */}
        <div className="flex items-center space-x-3 bg-gray-800 px-4 py-1.5 rounded-xl border border-gray-700">
          <button onClick={prevSlide} className="p-1.5 hover:bg-gray-700 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-mono font-bold px-2">Slide {currentSlide}</span>
          <button onClick={nextSlide} className="p-1.5 hover:bg-gray-700 rounded-lg">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* TOMBOL PRESENT & LINK OBS */}
        <div className="flex items-center space-x-2">
          <button
            onClick={copyObsLink}
            className="flex items-center space-x-1.5 bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-lg text-xs font-semibold"
          >
            <Video className="w-4 h-4" />
            <span>Copy Link OBS</span>
          </button>

          <button
            onClick={startPresentation}
            className="flex items-center space-x-1.5 bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg text-xs font-semibold"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Present (F5)</span>
          </button>
        </div>
      </header>

      {/* AREA SLIDE KONTROL */}
      <main className="flex-1 w-full bg-gray-950 flex flex-col items-center justify-center p-4 overflow-hidden">
        <div className="w-full max-w-5xl h-full bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl relative">
          {isPdf ? (
            <iframe
              key={`pdf_ctrl_${currentSlide}`}
              src={`${fileUrl}#page=${currentSlide}`}
              title="Slide View"
              className="w-full h-full border-0"
            />
          ) : (
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
              title="Slide View"
              className="w-full h-full border-0"
            />
          )}
        </div>
      </main>
    </div>
  );
}