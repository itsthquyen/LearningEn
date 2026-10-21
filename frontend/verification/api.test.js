import './setup';
import { beforeEach, describe, expect, it, vi } from 'vitest';

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/problem+json' } });
}

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('VITE_API_BASE_URL', '');
});

describe('API transport and error contract', () => {
  it('bootstraps CSRF before a mutation, decodes its cookie, and includes the session on both calls', async () => {
    const fetch = vi.fn().mockImplementationOnce(async () => {
      document.cookie = 'XSRF-TOKEN=session%2Bcsrf%3D; path=/';
      return jsonResponse({ token: 'session+csrf=', headerName: 'X-XSRF-TOKEN' });
    }).mockResolvedValueOnce(jsonResponse({ id: 'stored-item' }, 201));
    vi.stubGlobal('fetch', fetch);
    const { api } = await import('../src/services/api');
    await expect(api('/learning-items', { method: 'POST', body: { expression: 'carry out' } })).resolves.toEqual({ id: 'stored-item' });
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[0]).toEqual(['/api/v1/auth/csrf', expect.objectContaining({ method: 'GET', credentials: 'include' })]);
    expect(fetch.mock.calls[1]).toEqual(['/api/v1/learning-items', expect.objectContaining({
      method: 'POST', credentials: 'include', body: JSON.stringify({ expression: 'carry out' }),
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-XSRF-TOKEN': 'session+csrf=' },
    })]);
  });

  it('reuses the existing CSRF cookie for a bodyless DELETE', async () => {
    document.cookie = 'XSRF-TOKEN=existing-csrf; path=/';
    const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetch);
    const { api } = await import('../src/services/api');
    await expect(api('/personal-data', { method: 'DELETE' })).resolves.toBeNull();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][1]).toMatchObject({ method: 'DELETE', credentials: 'include', body: undefined,
      headers: { Accept: 'application/json', 'X-XSRF-TOKEN': 'existing-csrf' } });
    expect(fetch.mock.calls[0][1].headers).not.toHaveProperty('Content-Type');
  });

  it('does not issue a mutation when CSRF initialization fails', async () => {
    const fetch = vi.fn().mockResolvedValue(jsonResponse({ detail: 'CSRF session unavailable' }, 503));
    vi.stubGlobal('fetch', fetch);
    const { api } = await import('../src/services/api');
    await expect(api('/auth/login', { method: 'POST', body: { email: 'learner@example.test', password: 'test-only' } }))
      .rejects.toMatchObject({ status: 503, message: 'CSRF session unavailable' });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe('/api/v1/auth/csrf');
  });

  it('respects the configured base URL and forwards cancellation on reads without requesting CSRF', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://learning.example.test/api/v1/');
    const fetch = vi.fn().mockResolvedValue(jsonResponse([]));
    vi.stubGlobal('fetch', fetch);
    const controller = new AbortController();
    const { api } = await import('../src/services/api');
    await expect(api('/courses', { signal: controller.signal })).resolves.toEqual([]);
    expect(fetch).toHaveBeenCalledExactlyOnceWith('https://learning.example.test/api/v1/courses', expect.objectContaining({
      credentials: 'include', signal: controller.signal, method: 'GET', headers: { Accept: 'application/json' },
    }));
  });

  it.each([409, 422, 429, 502, 503])('preserves RFC ProblemDetail at status %s instead of returning fallback data', async (status) => {
    const detail = status === 503 ? 'AI provider is not configured' : `Server explanation for ${status}`;
    const errors = { content: 'Server validation detail' };
    document.cookie = 'XSRF-TOKEN=csrf; path=/';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ type: 'about:blank', status, detail, errors }, status)));
    const { api, ApiError } = await import('../src/services/api');
    const error = await api('/assistant-requests', { method: 'POST', body: { content: 'A test question' } }).catch((value) => value);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status, message: detail, errors });
  });

  it('normalizes network failure but preserves the original AbortError', async () => {
    const abort = new DOMException('Cancelled by caller', 'AbortError');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new TypeError('offline')).mockRejectedValueOnce(abort));
    const { api, ApiError } = await import('../src/services/api');
    const error = await api('/dashboard').catch((value) => value);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(0);
    expect(error.message).toMatch(/m\u00e1y ch\u1ee7/);
    await expect(api('/dashboard')).rejects.toBe(abort);
  });

  it('handles non-JSON error pages as errors, not successful payloads', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>Bad gateway</html>', { status: 502 })));
    const { api, ApiError } = await import('../src/services/api');
    const error = await api('/dashboard').catch((value) => value);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(502);
    expect(error.message).toBeTruthy();
    expect(error.message).not.toContain('<html>');
  });

  it('expires the session on protected 401s but not a rejected login', async () => {
    document.cookie = 'XSRF-TOKEN=csrf; path=/';
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => jsonResponse({ detail: 'Sign in required' }, 401)));
    const listener = vi.fn();
    window.addEventListener('session-expired', listener);
    try {
      const { api } = await import('../src/services/api');
      await expect(api('/auth/login', { method: 'POST', body: {} })).rejects.toMatchObject({ status: 401 });
      expect(listener).not.toHaveBeenCalled();
      await expect(api('/dashboard')).rejects.toMatchObject({ status: 401 });
      expect(listener).toHaveBeenCalledTimes(1);
    } finally {
      window.removeEventListener('session-expired', listener);
    }
  });
});
