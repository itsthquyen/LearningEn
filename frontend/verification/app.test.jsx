import './setup';
import { act, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../src/App';
import { api } from '../src/services/api';

vi.mock('../src/services/api', () => ({ api: vi.fn() }));

const lessonId = 'afd3d592-bf06-446c-9f01-118e80655c41';
const profile = { id: 'test-profile', email: 'learner@example.test', displayName: 'Server Learner', dailyMinutes: 30, timeZone: 'UTC' };

beforeEach(() => {
  vi.resetAllMocks();
  api.mockImplementation(async (path) => {
    if (path === '/auth/me') return profile;
    if (path === '/study-sessions/current') return null;
    if (path === `/lessons/${lessonId}`) return {
      id: lessonId, title: 'Lesson from the authenticated route', objective: 'Server objective',
      body: 'Route lesson body', kind: 'LESSON', contentStatus: 'REVIEWED', draftAnswers: {}, questions: [],
    };
    throw new Error(`Unexpected API request: ${path}`);
  });
});

describe('Application authentication and lesson routing', () => {
  it('waits for authentication before loading the requested lesson', async () => {
    const read = api.getMockImplementation();
    let resolveProfile;
    api.mockImplementation((path, options) => path === '/auth/me'
      ? new Promise((resolve) => { resolveProfile = resolve; }) : read(path, options));
    render(<MemoryRouter initialEntries={[`/lessons/${lessonId}`]}><App /></MemoryRouter>);
    expect(screen.getByRole('status')).toHaveTextContent('\u0110ang m\u1edf g\u00f3c h\u1ecdc c\u1ee7a b\u1ea1n');
    expect(api.mock.calls.map(([path]) => path)).toEqual(['/auth/me']);
    await act(async () => resolveProfile(profile));
    expect(await screen.findByRole('heading', { name: 'Lesson from the authenticated route' })).toBeInTheDocument();
    expect(screen.getByText('Server Learner')).toBeInTheDocument();
    expect(screen.getByText('Route lesson body')).toBeInTheDocument();
    expect(api).toHaveBeenCalledWith(`/lessons/${lessonId}`, expect.objectContaining({ signal: expect.any(AbortSignal) }));
    expect(api.mock.calls.some(([, options]) => options?.method === 'POST')).toBe(false);
  });

  it('shows login without fetching private lesson content for an unauthenticated session', async () => {
    api.mockRejectedValue(Object.assign(new Error('Sign in required'), { status: 401 }));
    render(<MemoryRouter initialEntries={[`/lessons/${lessonId}`]}><App /></MemoryRouter>);
    expect(await screen.findByLabelText('Email')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(api.mock.calls.map(([path]) => path)).toEqual(['/auth/me']);
  });

  it('surfaces auth service failure rather than impersonating a user', async () => {
    api.mockRejectedValue(Object.assign(new Error('Authentication storage unavailable'), { status: 503 }));
    render(<MemoryRouter initialEntries={[`/lessons/${lessonId}`]}><App /></MemoryRouter>);
    expect(await screen.findByRole('alert')).toHaveTextContent('Authentication storage unavailable');
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.queryByText('Server Learner')).not.toBeInTheDocument();
    expect(api.mock.calls.map(([path]) => path)).toEqual(['/auth/me']);
  });

  it('removes private lesson content when the API signals session expiry', async () => {
    render(<MemoryRouter initialEntries={[`/lessons/${lessonId}`]}><App /></MemoryRouter>);
    await screen.findByRole('heading', { name: 'Lesson from the authenticated route' });
    api.mockRejectedValue(Object.assign(new Error('Session expired'), { status: 401 }));
    act(() => window.dispatchEvent(new Event('session-expired')));
    expect(await screen.findByLabelText('Email')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Route lesson body')).not.toBeInTheDocument());
  });
});
