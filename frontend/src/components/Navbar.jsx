import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex justify-between items-center sticky top-0 z-30">
      <Link to="/dashboard" className="flex items-center space-x-2 text-blue-600 font-bold text-xl">
        <FileText className="w-7 h-7" />
        <span>DocView</span>
      </Link>

      <div className="flex items-center space-x-4">
        {user && (
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full text-sm">
              <User className="w-4 h-4 text-gray-500 dark:text-gray-300" />
              <span className="text-gray-700 dark:text-gray-200 font-medium">{user.email}</span>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}