import './setup';
import { StrictMode } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Reviews from '../src/pages/Reviews';
import Lesson from '../src/pages/Lesson';
import Assistant from '../src/pages/Assistant';
import { api } from '../src/services/api';

vi.mock('../src/services/api', () => ({ api: vi.fn() }));

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const card = {
  id: '8b58e47e-20dd-4f56-a28d-e496ca3cb4b6',
  learningItemId: '017a8042-2f97-4b83-b831-2b65575c59a0',
  expression: 'carry out', meaning: 'perform a task',
  context: 'The team will carry out the plan.',
  example: 'We carried out the checks.', version: 17,
};
const lesson = {
  id: 'af64017a-9a51-461b-a041-6db7f6e1053f', title: 'Server lesson title',
  objective: 'Write about the next task', kind: 'LESSON', contentStatus: 'DRAFT',
  body: 'Lesson content supplied by the server.',
  draftAnswers: { choice: 'will', writing: 'My restored server draft.' },
  questions: [
    { id: 'choice', prompt: 'We ___ check the result.', type: 'MULTIPLE_CHOICE', options: ['will', 'was'] },
    { id: 'writing', prompt: 'Describe your plan.', type: 'WRITING', options: [] },
  ],
};
const labels = {
  reveal: 'Xem \u0111\u00e1p \u00e1n', good: 'Nh\u1edb', easy: 'D\u1ec5',
  submit: 'N\u1ed9p b\u00e0i', save: 'L\u01b0u nh\u00e1p',
};

function mountLesson() {
  return render(<StrictMode><MemoryRouter initialEntries={[`/lessons/${lesson.id}`]}>
    <Routes><Route path="/lessons/:id" element={<Lesson />} /></Routes>
  </MemoryRouter></StrictMode>);
}

function mutations(suffix) {
  return api.mock.calls.filter(([path, options]) => options?.method && (!suffix || path.endsWith(suffix)));
}

beforeEach(() => {
  vi.resetAllMocks();
  api.mockImplementation(async (path) => {
    if (path === '/review-cards?due=true') return [card];
    if (path === `/lessons/${lesson.id}`) return lesson;
    if (path === '/conversations?q=') return [];
    throw new Error(`Unexpected API request: ${path}`);
  });
});

describe('Reviews through the API boundary', () => {
  it('requires recall before showing server meaning, example, or rating controls', async () => {
    render(<MemoryRouter><Reviews /></MemoryRouter>);
    expect(await screen.findByRole('heading', { name: card.expression })).toBeInTheDocument();
    expect(screen.getByText(card.context)).toBeInTheDocument();
    expect(screen.queryByText(card.meaning)).not.toBeInTheDocument();
    expect(screen.queryByText(card.example)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: labels.good })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: labels.reveal }));
    expect(screen.getByText(card.meaning)).toBeInTheDocument();
    expect(screen.getByText(card.example)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: labels.good })).toBeEnabled();
    expect(mutations()).toHaveLength(0);
  });

  it('retries the same UUID, rating, and server version after a lost response', async () => {
    const read = api.getMockImplementation();
    let attempts = 0;
    api.mockImplementation((path, options) => options?.method === 'POST'
      ? (++attempts === 1 ? Promise.reject(new Error('Review response lost')) : Promise.resolve({ ...card, version: 18 }))
      : read(path, options));
    render(<MemoryRouter><Reviews /></MemoryRouter>);
    fireEvent.click(await screen.findByRole('button', { name: labels.reveal }));
    fireEvent.click(screen.getByRole('button', { name: labels.good }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Review response lost');
    expect(screen.getByText(card.expression)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: labels.easy })).toBeDisabled();
    const first = mutations()[0];
    expect(first[0]).toBe(`/review-cards/${card.id}/reviews`);
    expect(first[1].body).toEqual({ requestId: expect.stringMatching(uuid), rating: 'GOOD', version: 17 });

    fireEvent.click(screen.getByRole('button', { name: labels.good }));
    await waitFor(() => expect(screen.queryByText(card.expression)).not.toBeInTheDocument());
    expect(mutations()).toHaveLength(2);
    expect(mutations()[1]).toEqual(first);
  });

  it('does not advance or issue duplicate mutations while rating is unresolved', async () => {
    const read = api.getMockImplementation();
    let resolveRating;
    api.mockImplementation((path, options) => options?.method === 'POST'
      ? new Promise((resolve) => { resolveRating = resolve; }) : read(path, options));
    render(<MemoryRouter><Reviews /></MemoryRouter>);
    fireEvent.click(await screen.findByRole('button', { name: labels.reveal }));
    const button = screen.getByRole('button', { name: labels.good });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(mutations()).toHaveLength(1);
    expect(button).toBeDisabled();
    expect(screen.getByText(card.expression)).toBeInTheDocument();
    await act(async () => resolveRating({ ...card, version: 18 }));
    expect(screen.queryByText(card.expression)).not.toBeInTheDocument();
  });

  it('does not present a failed card fetch as an empty successful queue', async () => {
    api.mockRejectedValue(new Error('Review service unavailable'));
    render(<MemoryRouter><Reviews /></MemoryRouter>);
    expect(await screen.findByRole('alert')).toHaveTextContent('Review service unavailable');
    expect(screen.queryByRole('heading', { name: 'Ch\u01b0a c\u00f3 th\u1ebb \u0111\u1ebfn h\u1ea1n' })).not.toBeInTheDocument();
  });
});

describe('Server-backed lesson drafts and grading', () => {
  it('restores server answers and performs no draft save or grading merely on render', async () => {
    mountLesson();
    expect(await screen.findByRole('textbox', { name: 'Describe your plan.' })).toHaveValue(lesson.draftAnswers.writing);
    expect(screen.getByRole('radio', { name: 'will' })).toBeChecked();
    expect(screen.getByText(lesson.body)).toBeInTheDocument();
    expect(screen.getByText(/N\u1ed9i dung b\u1ea3n nh\u00e1p/)).toBeInTheDocument();
    vi.useFakeTimers();
    await act(async () => vi.advanceTimersByTime(1500));
    expect(mutations()).toHaveLength(0);
  });

  it('keeps edited answers after a failed draft save', async () => {
    const read = api.getMockImplementation();
    api.mockImplementation((path, options) => options?.method === 'PUT'
      ? Promise.reject(new Error('Draft storage unavailable')) : read(path, options));
    mountLesson();
    const writing = await screen.findByRole('textbox', { name: 'Describe your plan.' });
    fireEvent.change(writing, { target: { value: 'My unsaved new answer.' } });
    fireEvent.click(screen.getByRole('button', { name: labels.save }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Draft storage unavailable');
    expect(writing).toHaveValue('My unsaved new answer.');
    expect(mutations('/draft')[0]).toEqual([`/lessons/${lesson.id}/draft`, {
      method: 'PUT', body: { answers: { choice: 'will', writing: 'My unsaved new answer.' } },
    }]);
    expect(mutations('/attempts')).toHaveLength(0);
  });

  it('preserves the answers and request UUID on attempt retry and displays only server feedback', async () => {
    const read = api.getMockImplementation();
    let attempts = 0;
    api.mockImplementation((path, options) => options?.method === 'POST'
      ? (++attempts === 1 ? Promise.reject(new Error('Attempt response lost')) : Promise.resolve({
        score: 37, passed: false, assisted: true,
        feedback: [{ questionId: 'writing', correct: null, expected: 'Server reference answer', explanation: 'Human review required.' }],
      })) : read(path, options));
    mountLesson();
    const writing = await screen.findByRole('textbox', { name: 'Describe your plan.' });
    fireEvent.change(writing, { target: { value: 'My actual submitted answer.' } });
    fireEvent.click(screen.getByRole('checkbox'));
    expect(screen.queryByText('37%')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: labels.submit }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Attempt response lost');
    expect(writing).toHaveValue('My actual submitted answer.');
    expect(screen.getByRole('checkbox')).toBeChecked();
    const first = mutations('/attempts')[0];
    expect(first[1].body).toEqual({
      requestId: expect.stringMatching(uuid), answers: { choice: 'will', writing: 'My actual submitted answer.' }, assisted: true,
    });
    fireEvent.click(screen.getByRole('button', { name: labels.submit }));
    expect(await screen.findByText('Server reference answer')).toBeInTheDocument();
    expect(screen.getByText('37%')).toBeInTheDocument();
    expect(screen.getByText('Human review required.')).toBeInTheDocument();
    expect(mutations('/attempts')).toHaveLength(2);
    expect(mutations('/attempts')[1]).toEqual(first);
    expect(writing).toBeDisabled();
  });

  it('blocks incomplete submissions without manufacturing a score', async () => {
    const read = api.getMockImplementation();
    api.mockImplementation((path, options) => path === `/lessons/${lesson.id}`
      ? Promise.resolve({ ...lesson, draftAnswers: {} }) : read(path, options));
    mountLesson();
    expect(await screen.findByRole('button', { name: labels.submit })).toBeDisabled();
    fireEvent.click(screen.getByRole('radio', { name: 'was' }));
    expect(screen.getByRole('button', { name: labels.submit })).toBeDisabled();
    expect(mutations('/attempts')).toHaveLength(0);
    expect(screen.queryByText(/\d+%/)).not.toBeInTheDocument();
  });
});

describe('Assistant failure preservation', () => {
  it('retains input and retries the same request when the AI provider is missing', async () => {
    const read = api.getMockImplementation();
    api.mockImplementation((path, options) => options?.method === 'POST'
      ? Promise.reject(Object.assign(new Error('AI provider is not configured'), { status: 503 })) : read(path, options));
    render(<MemoryRouter><Assistant /></MemoryRouter>);
    const input = screen.getByRole('textbox', { name: 'N\u1ed9i dung c\u1ea7n h\u1ecfi' });
    fireEvent.change(input, { target: { value: 'Please explain carry out.' } });
    fireEvent.click(screen.getByRole('button', { name: 'G\u1eedi c\u00e2u h\u1ecfi' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('AI provider is not configured');
    expect(input).toHaveValue('Please explain carry out.');
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Th\u1eed l\u1ea1i c\u00f9ng y\u00eau c\u1ea7u' }));
    await waitFor(() => expect(mutations()).toHaveLength(2));
    expect(mutations()[0][0]).toBe('/assistant-requests');
    expect(mutations()[0][1].body).toMatchObject({ content: 'Please explain carry out.', requestId: expect.stringMatching(uuid) });
    expect(mutations()[1]).toEqual(mutations()[0]);
    await waitFor(() => expect(input).toBeEnabled());
  });
});
