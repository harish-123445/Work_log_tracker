export function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export function filenameFromDisposition(disposition, fallback) {
  if (!disposition) return fallback;
  const match = disposition.match(/filename="?([^"]+)"?/);
  return match ? match[1] : fallback;
}
