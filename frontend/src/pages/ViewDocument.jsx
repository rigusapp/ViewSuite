import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { ArrowLeft, Video } from 'lucide-react';

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
      const { data: doc } = await supabase.from('documents').select('*').eq('id', id).single();
      if (!doc) return;
      setDocData(doc);

      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(doc.storage_path);
      setFileUrl(urlData.publicUrl);
    } finally {
      setLoading(false);
    }
  };

  const copyObsLink = () => {
    const obsUrl = `${window.location.origin}/#/present/${id}`;
    navigator.clipboard.writeText(obsUrl);
    alert('Tautan OBS Browser Source berhasil disalin!\n\nURL: ' + obsUrl);
  };

  if (loading) return <div className="h-screen bg-gray-950 text-white flex items-center justify-center font-mono">Memuat Dokumen...</div>;

  const isPdf = docData?.mime_type === 'application/pdf' || docData?.original_name?.toLowerCase().endsWith('.pdf');

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden">
      {/* HEADER UTAMA */}
      <header className="h-12 bg-gray-900 border-b border-gray-800 px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-3 truncate">
          <button onClick={() => navigate('/dashboard')} className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-medium text-sm truncate max-w-sm">{docData?.original_name}</span>
        </div>
      </header>

      {/* AREA VIEWER DENGAN TOMBOL OBS DI SAMPING MENU OFFICE */}
      <main className="flex-1 w-full h-full bg-black overflow-hidden m-0 p-0 relative">
        {/* TOMBOL COPY LINK OBS (DIKUSTOM DI SAMPING MENU OFFICE) */}
        <div className="absolute top-2 right-4 z-30">
          <button
            onClick={copyObsLink}
            className="flex items-center space-x-1.5 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg transition opacity-90 hover:opacity-100"
          >
            <Video className="w-4 h-4" />
            <span>Copy Link OBS</span>
          </button>
        </div>

        {isPdf ? (
          <iframe
            src={`${fileUrl}#toolbar=0&navpanes=0`}
            title="PDF View"
            className="w-full h-full border-0"
          />
        ) : (
          /* EMBED VIEW TANPA LOGO MERAH POWERPOINT */
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