import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

export default function PresentationView() {
  const { id } = useParams();
  const [docData, setDocData] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [currentSlide, setCurrentSlide] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocumentDetails();

    // Sync via LocalStorage
    const checkStorage = () => {
      const saved = localStorage.getItem(`doc_slide_${id}`);
      if (saved) {
        setCurrentSlide(parseInt(saved, 10));
      }
    };

    const interval = setInterval(checkStorage, 300);

    const handleStorageChange = (e) => {
      if (e.key === `doc_slide_${id}` && e.newValue) {
        setCurrentSlide(parseInt(e.newValue, 10));
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [id]);

  const fetchDocumentDetails = async () => {
    try {
      const { data: doc } = await supabase.from('documents').select('*').eq('id', id).single();
      if (!doc) return;
      setDocData(doc);

      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(doc.storage_path);
      setFileUrl(urlData.publicUrl);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center text-white font-mono text-xl">
        Memuat Slide Presentation...
      </div>
    );
  }

  const isPdf = docData?.mime_type === 'application/pdf' || docData?.original_name?.toLowerCase().endsWith('.pdf');

  return (
    <div className="w-screen h-screen bg-black overflow-hidden m-0 p-0 flex items-center justify-center">
      {isPdf ? (
        <iframe
          key={`obs_pdf_${currentSlide}`}
          src={`${fileUrl}#page=${currentSlide}&toolbar=0&navpanes=0&scrollbar=0`}
          title="OBS Slide View"
          className="w-full h-full border-0"
        />
      ) : (
        /* Menggunakan Full PowerPoint Web View (/op/view.aspx) */
        <iframe
          src={`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`}
          title="OBS Slide View"
          className="w-full h-full border-0"
          allowFullScreen
        />
      )}
    </div>
  );
}