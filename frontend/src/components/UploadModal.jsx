import React, { useState } from 'react';
import { X, UploadCloud } from 'lucide-react';
import { useDocuments } from '../hooks/useDocuments';

export default function UploadModal({ isOpen, onClose }) {
  const { uploadDocument } = useDocuments();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError(null);
      // Panggil uploadDocument hanya dengan file
      await uploadDocument(selectedFile);
      setSelectedFile(null);
      onClose();
    } catch (err) {
      setError(err.message || 'Gagal mengunggah file.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Upload Dokumen</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <label className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition">
            <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {selectedFile ? selectedFile.name : 'Klik atau seret file ke sini'}
            </span>
            <input type="file" onChange={handleFileChange} className="hidden" />
          </label>

          <button
            type="submit"
            disabled={!selectedFile || uploading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2.5 rounded-xl transition"
          >
            {uploading ? 'Mengunggah...' : 'Upload Dokumen'}
          </button>
        </form>
      </div>
    </div>
  );
}