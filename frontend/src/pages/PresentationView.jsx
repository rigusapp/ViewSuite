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

    // Dengarkan perintah pergantian slide dari layar utama via BroadcastChannel
    const channel = new BroadcastChannel(`doc_presentation_${id}`);
    channel.onmessage = (event) => {
      if (event.data.type === 'CHANGE_SLIDE') {
        setCurrentSlide(event.data.slide);
      }
    };

    return () => channel.close();
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
    return <div className="w-screen h-screen bg-black flex items-center justify-center text-white">Loading Slide...</div>;
  }

  const isPdf = docData?.mime_type === 'application/pdf' || docData?.original_name?.toLowerCase().endsWith('.pdf');

  return (
    <div className="w-screen h-screen bg-black overflow-hidden m-0 p-0">
      {isPdf ? (
        <iframe
          src={`${fileUrl}#page=${currentSlide}&toolbar=0&navpanes=0`}
          title="OBS Slide View"
          className="w-full h-full border-0"
        />
      ) : (
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
          title="OBS Slide View"
          className="w-full h-full border-0"
        />
      )}
    </div>
  );
}