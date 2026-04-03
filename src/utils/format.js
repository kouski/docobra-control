export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(date) {
  if (!date) return '—';
  try {
    const value = typeof date?.toDate === 'function' ? date.toDate() : new Date(date);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    }).format(value);
  } catch {
    return String(date);
  }
}

export function formatDateTime(date) {
  if (!date) return '—';
  try {
    const value = typeof date?.toDate === 'function' ? date.toDate() : new Date(date);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(value);
  } catch {
    return String(date);
  }
}
