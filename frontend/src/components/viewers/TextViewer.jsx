import { useEffect, useState } from 'react';
import { marked } from 'marked';

export default function TextViewer({ url, isMarkdown }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadText() {
      try {
        setLoading(true);
        const res = await fetch(url);
        const text = await res.text();
        setContent(isMarkdown ? marked.parse(text) : text);
      } catch (err) {
        setContent('Gagal memuat dokumen teks.');
      } finally {
        setLoading(false);
      }
    }
    if (url) loadText();
  }, [url, isMarkdown]);

  if (loading) return <div className="p-8 text-center text-gray-500">Memuat teks...</div>;

  return (
    <div className="h-full overflow-auto p-8 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 max-w-4xl mx-auto shadow-md">
      {isMarkdown ? (
        <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <pre className="whitespace-pre-wrap font-mono text-sm">{content}</pre>
      )}
    </div>
  );
}