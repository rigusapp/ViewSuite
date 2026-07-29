import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FileText, Mail } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginWithMagicLink } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setMessage('');
      await loginWithMagicLink(email);
      setMessage('Magic link telah dikirim ke email Anda! Periksa kotak masuk.');
    } catch (err) {
      setError(err.message || 'Gagal mengirim email login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-xl mb-2">
            <FileText className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Masuk ke DocView</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Masukan email Anda untuk mendapatkan tautan akses tanpa password</p>
        </div>

        {message && <div className="p-3 bg-green-100 text-green-700 text-sm rounded-lg">{message}</div>}
        {error && <div className="p-3 bg-red-100 text-red-700 text-sm rounded-lg">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
            <input
              type="email"
              required
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition"
          >
            {loading ? 'Sending Link...' : 'Kirim Magic Link'}
          </button>
        </form>
      </div>
    </div>
  );
}