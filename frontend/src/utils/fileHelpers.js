// Konversi ukuran file menjadi format Human-Readable
export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Menentukan kategori jenis file
export function getFileCategory(ext) {
  const extension = ext.toLowerCase();
  if (['ppt', 'pptx', 'odp'].includes(extension)) return 'Presentation';
  if (['pdf', 'doc', 'docx', 'odt'].includes(extension)) return 'Document';
  if (['xls', 'xlsx', 'ods'].includes(extension)) return 'Spreadsheet';
  if (['epub'].includes(extension)) return 'Ebook';
  if (['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(extension)) return 'Image';
  if (['txt', 'md'].includes(extension)) return 'Text';
  return 'Other';
}