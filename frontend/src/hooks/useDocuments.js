import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';

export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil semua dokumen secara publik tanpa filter user_id
  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      console.error('Error fetching documents:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Upload dokumen secara publik
  const uploadDocument = async (file) => {
    const fileExt = file.name.split('.').pop().toLowerCase();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    // Simpan di folder public
    const filePath = `public/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data, error: dbError } = await supabase
      .from('documents')
      .insert([{
        filename: fileName,
        original_name: file.name,
        extension: fileExt,
        mime_type: file.type || 'application/octet-stream',
        size: file.size,
        storage_path: filePath,
        visibility: 'public'
      }])
      .select()
      .single();

    if (dbError) throw dbError;

    setDocuments((prev) => [data, ...prev]);
    return data;
  };

  const deleteDocument = async (docId, storagePath) => {
    await supabase.storage.from('documents').remove([storagePath]);
    const { error } = await supabase.from('documents').delete().eq('id', docId);
    if (error) throw error;

    setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
  };

  return {
    documents,
    loading,
    fetchDocuments,
    uploadDocument,
    deleteDocument
  };
}