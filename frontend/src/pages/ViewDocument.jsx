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
      const { data: doc } = await supabase.from('documents').select('*').eq('id', id).single();
      if (!doc) return;
      setDocData(doc);

      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(doc.storage_path);
      setFileUrl(urlData.publicUrl);
    } finally {
      setLoading(false);
    }
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