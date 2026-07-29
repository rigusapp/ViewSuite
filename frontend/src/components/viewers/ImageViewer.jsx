import { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

export default function ImageViewer({ url, alt }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Controls */}
      <div className="flex items-center justify-center space-x-4 p-3 bg-gray-800 border-b border-gray-700">
        <button onClick={() => setZoom((z) => Math.max(0.2, z - 0.2))} className="p-2 hover:bg-gray-700 rounded">
          <ZoomOut className="w-5 h-5" />
        </button>
        <span className="text-sm">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom((z) => z + 0.2)} className="p-2 hover:bg-gray-700 rounded">
          <ZoomIn className="w-5 h-5" />
        </button>
        <button onClick={() => setRotation((r) => (r + 90) % 360)} className="p-2 hover:bg-gray-700 rounded">
          <RotateCw className="w-5 h-5" />
        </button>
      </div>

      {/* Image Canvas */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4">
        <img
          src={url}
          alt={alt}
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transition: 'transform 0.2s ease-in-out'
          }}
          className="max-h-full max-w-full object-contain"
        />
      </div>
    </div>
  );
}