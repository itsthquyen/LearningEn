const baseUrl = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

function csrfToken() {
  const cookie = document.cookie.split('; ').find((value) => value.startsWith('XSRF-TOKEN='));
  return cookie ? decodeURIComponent(cookie.substring('XSRF-TOKEN='.length)) : undefined;
}

export async function api(path, { method = 'GET', body, signal } = {}) {
  const headers = { Accept: 'application/json' };
  const multipart = body instanceof FormData;
  if (body !== undefined && !multipart) headers['Content-Type'] = 'application/json';
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    if (!csrfToken()) await api('/auth/csrf');
    headers['X-XSRF-TOKEN'] = csrfToken();
  }
  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method, headers, credentials: 'include', body: body === undefined ? undefined : multipart ? body : JSON.stringify(body), signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('Không thể kết nối máy chủ. Kiểm tra mạng và thử lại.', 0);
  }
  const payload = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/auth/')) window.dispatchEvent(new Event('session-expired'));
    throw new ApiError(payload?.detail || payload?.message || 'Yêu cầu chưa thực hiện được. Vui lòng thử lại.', response.status, payload?.errors);
  }
  return payload;
}

export function downloadJson(data, fileName) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
