import React from 'react';
import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex justify-between items-center sticky top-0 z-30">
      <Link to="/dashboard" className="flex items-center space-x-2 text-blue-600 font-bold text-xl">
        <FileText className="w-7 h-7" />
        <span>ViewSuite</span>
      </Link>
    </nav>
  );
}