import { useEffect, useRef, useState } from 'react';
import { renderAsync } from 'docx-preview';

export default function DocxViewer({ url }) {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function renderDocx() {
      try {
        setLoading(true);
        const response = await fetch(url);
        const blob = await response.blob();
        
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          await renderAsync(blob, containerRef.current, null, {
            className: 'docx-preview-wrapper',
            inWrapper: true
          });
        }
      } catch (err) {
        console.error('Gagal merender DOCX:', err);
      } finally {
        setLoading(false);
      }
    }

    if (url) renderDocx();
  }, [url]);

  return (
    <div className="w-full h-full overflow-auto p-4 bg-gray-200 dark:bg-gray-950 flex justify-center">
      {loading && <p className="text-gray-500 mt-10">Merekapitulasi tampilan Word...</p>}
      <div ref={containerRef} className="bg-white shadow-md max-w-4xl w-full min-h-full" />
    </div>
  );
}