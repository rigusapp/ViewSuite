import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export function useDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      console.error('Error fetching documents:', err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadDocument = async (file, isPublic = false) => {
    if (!user) throw new Error('User tidak terautentikasi');

    const fileExt = file.name.split('.').pop().toLowerCase();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data, error: dbError } = await supabase
      .from('documents')
      .insert([{
        user_id: user.id,
        filename: fileName,
        original_name: file.name,
        extension: fileExt,
        mime_type: file.type || 'application/octet-stream',
        size: file.size,
        storage_path: filePath,
        visibility: isPublic ? 'public' : 'private'
      }])
      .select()
      .single();

    if (dbError) throw dbError;

    setDocuments((prev) => [data, ...prev]);
    return data;
  };

  const toggleVisibility = async (docId, currentVisibility) => {
    const newVisibility = currentVisibility === 'public' ? 'private' : 'public';
    const { error } = await supabase
      .from('documents')
      .update({ visibility: newVisibility })
      .eq('id', docId);

    if (error) throw error;
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === docId ? { ...doc, visibility: newVisibility } : doc))
    );
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
    toggleVisibility,
    deleteDocument
  };
}