import React from 'react';
import { FileText, Eye, Trash2, Share2 } from 'lucide-react';
import { formatBytes } from '../utils/fileHelpers';
import { Link } from 'react-router-dom';

export default function FileCard({ doc, onDelete, onTogglePublic }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 truncate">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
            <FileText className="w-6 h-6" />
          </div>
          <div className="truncate">
            <h4 className="font-semibold text-gray-800 dark:text-gray-100 truncate text-sm">
              {doc.original_name}
            </h4>
            <p className="text-xs text-gray-500">{formatBytes(doc.size)}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs">
        <span className={`px-2 py-0.5 rounded-full font-medium ${
          doc.visibility === 'public' 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
        }`}>
          {doc.visibility}
        </span>

        <div className="flex space-x-1">
          <Link
            to={`/view/${doc.id}`}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
            title="Lihat Dokumen"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            onClick={() => onDelete(doc.id, doc.storage_path)}
            className="p-1.5 hover:bg-red-50 text-red-600 rounded"
            title="Hapus Dokumen"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}