import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { ArrowLeft, Share2, Download, Lock, Globe } from 'lucide-react';
import DocxViewer from '../components/viewers/DocxViewer';
import ImageViewer from '../components/viewers/ImageViewer';
import TextViewer from '../components/viewers/TextViewer';

export default function ViewDocument() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDoc() {
      try {
        setLoading(true);
        const { data, error: fetchErr } = await supabase
          .from('documents')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchErr || !data) throw new Error('Dokumen tidak ditemukan atau tidak memiliki akses.');

        setDoc(data);

        if (data.visibility === 'public') {
          const { data: pubUrl } = supabase.storage
            .from('documents')
            .getPublicUrl(data.storage_path);
          setFileUrl(pubUrl.publicUrl);
        } else {
          const { data: signedData, error: signedErr } = await supabase.storage
            .from('documents')
            .createSignedUrl(data.storage_path, 3600);

          if (signedErr) throw signedErr;
          setFileUrl(signedData.signedUrl);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadDoc();
  }, [id]);

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link disalin ke clipboard!');
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-gray-500">Memuat Dokumen...</div>;
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-2">Akses Terbatas</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Link to="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  const renderViewer = () => {
    const ext = doc.extension.toLowerCase();

    if (['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(ext)) {
      return <ImageViewer url={fileUrl} alt={doc.original_name} />;
    }
    if (['txt', 'md'].includes(ext)) {
      return <TextViewer url={fileUrl} isMarkdown={ext === 'md'} />;
    }
    if (ext === 'docx') {
      return <DocxViewer url={fileUrl} />;
    }
    // PDF / Office Viewer Fallback dengan Google Docs Embed Viewer
    if (['pdf', 'ppt', 'pptx', 'xls', 'xlsx', 'doc'].includes(ext)) {
      const googleDocsUrl = `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;
      return (
        <iframe
          src={googleDocsUrl}
          className="w-full h-full border-0"
          title="Document Viewer"
        />
      );
    }

    return <div className="p-8 text-center text-gray-500">Format file ini tidak mendukung preview langsung.</div>;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 dark:text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div>
            <h1 className="font-semibold text-gray-800 dark:text-white text-lg truncate max-w-md">
              {doc.original_name}
            </h1>
            <span className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-1 mt-0.5">
              {doc.visibility === 'public' ? (
                <>
                  <Globe className="w-3 h-3 text-green-500" /> Public
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 text-amber-500" /> Private
                </>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={copyShareLink}
            className="flex items-center space-x-2 px-3 py-1.5 border rounded-lg hover:bg-gray-50 text-sm font-medium transition"
          >
            <Share2 className="w-4 h-4" />
            <span>Bagikan</span>
          </button>
          <a
            href={fileUrl}
            download={doc.original_name}
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition"
          >
            <Download className="w-4 h-4" />
            <span>Unduh</span>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        {renderViewer()}
      </main>
    </div>
  );
}