import React from 'react';
import { X, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function QrModal({ isOpen, onClose, doc }) {
  if (!isOpen || !doc) return null;

  // Membuat URL lengkap yang akan discan oleh HP
  const documentUrl = `${window.location.origin}/view/${doc.id}`;

  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngFile;
      downloadLink.download = `QR_${doc.original_name}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative text-center flex flex-col items-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
          Scan QR Code
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 truncate max-w-[240px]">
          {doc.original_name}
        </p>

        {/* QR Code */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-inner mb-6">
          <QRCodeSVG
            id="qr-code-svg"
            value={documentUrl}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>

        <button
          onClick={downloadQR}
          className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition text-sm"
        >
          <Download className="w-4 h-4" />
          <span>Unduh Gambar QR</span>
        </button>
      </div>
    </div>
  );
}