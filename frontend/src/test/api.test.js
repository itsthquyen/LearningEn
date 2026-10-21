import { beforeEach, expect, it, vi } from 'vitest';

beforeEach(() => { vi.resetModules();document.cookie = 'XSRF-TOKEN=; Max-Age=0; path=/';vi.restoreAllMocks(); });
it('obtains CSRF token and includes credentials before a mutation', async () => {
  const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementationOnce(async () => { document.cookie = 'XSRF-TOKEN=test-token; path=/';return new Response(JSON.stringify({ token: 'test-token' }), { status: 200 }); }).mockResolvedValueOnce(new Response(JSON.stringify({ id: 'saved' }), { status: 201 }));
  const { api } = await import('../services/api');await api('/learning-items', { method: 'POST', body: { expression: 'hello' } });
  expect(fetchMock.mock.calls[0][0]).toBe('/api/v1/auth/csrf');expect(fetchMock.mock.calls[1][1]).toMatchObject({ credentials: 'include', method: 'POST', headers: { 'X-XSRF-TOKEN': 'test-token' } });
});
it('converts network failures into a visible error without clearing user data', async () => {
  vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('offline'));const { api } = await import('../services/api');await expect(api('/dashboard')).rejects.toMatchObject({ status: 0 });
});
it('handles 204 and forwards abort without disguising it as network failure', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(null, { status: 204 })).mockRejectedValueOnce(new DOMException('aborted', 'AbortError'));const { api } = await import('../services/api');expect(await api('/study-sessions/current')).toBeNull();await expect(api('/dashboard')).rejects.toMatchObject({ name: 'AbortError' });
});
it('emits session expiry for a protected endpoint returning 401', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ detail: 'Sign in required' }), { status: 401 }));const listener = vi.fn();window.addEventListener('session-expired', listener);const { api } = await import('../services/api');await expect(api('/dashboard')).rejects.toMatchObject({ status: 401 });expect(listener).toHaveBeenCalledTimes(1);window.removeEventListener('session-expired', listener);
});
