import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Reviews from '../pages/Reviews';
import ItemForm from '../features/notebook/ItemForm';
import { LessonEditor } from '../pages/Lesson';
import Assistant from '../pages/Assistant';
import useResource from '../hooks/useResource';
import { api } from '../services/api';

vi.mock('../hooks/useResource', () => ({ default: vi.fn() }));
vi.mock('../services/api', () => ({ api: vi.fn() }));
const reload = vi.fn();
const card = { id: 'card-1', expression: 'look forward to', meaning: 'mong chờ', context: 'work email', example: 'I look forward to hearing from you.', version: 3 };
const lesson = { id: 'lesson-1', title: 'Bài học', objective: 'Mục tiêu', kind: 'LESSON', contentStatus: 'DRAFT', body: 'Nội dung từ máy chủ', draftAnswers: { q1: 'is' }, questions: [{ id: 'q1', prompt: 'My name ___ Mai.', options: ['is', 'are'], type: 'MULTIPLE_CHOICE' }] };
function mount(component) { return render(<MemoryRouter>{component}</MemoryRouter>); }
beforeEach(() => { vi.resetAllMocks();useResource.mockReturnValue({ data: [card], loading: false, error: null, reload }); });

describe('Review safety', () => {
  it('hides meaning and rating controls until answer is revealed', () => {
    mount(<Reviews />);expect(screen.queryByText('mong chờ')).not.toBeInTheDocument();expect(screen.queryByRole('button', { name: 'Nhớ' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Xem đáp án' }));expect(screen.getByText('mong chờ')).toBeInTheDocument();expect(screen.getByRole('button', { name: 'Nhớ' })).toBeEnabled();expect(api).not.toHaveBeenCalled();
  });
  it('preserves the idempotency key and rating after a lost response', async () => {
    api.mockRejectedValueOnce(new Error('Mất mạng')).mockResolvedValueOnce({ version: 4 });mount(<Reviews />);
    fireEvent.click(screen.getByRole('button', { name: 'Xem đáp án' }));fireEvent.click(screen.getByRole('button', { name: 'Nhớ' }));
    await screen.findByRole('alert');expect(screen.getByRole('button', { name: 'Dễ' })).toBeDisabled();fireEvent.click(screen.getByRole('button', { name: 'Nhớ' }));
    await screen.findByText('Bạn đã ôn xong phiên này');expect(api.mock.calls[0]).toEqual(api.mock.calls[1]);expect(api.mock.calls[0][1].body).toMatchObject({ version: 3, rating: 'GOOD' });
  });
  it('shows an API failure without inventing an empty success state', () => {
    useResource.mockReturnValue({ data: null, loading: false, error: new Error('Không kết nối được'), reload });mount(<Reviews />);expect(screen.getByRole('alert')).toHaveTextContent('Không kết nối được');
  });
});

describe('Notebook forms', () => {
  it('keeps draft fields after a server conflict', async () => {
    api.mockRejectedValue(new Error('Đã có từ và nghĩa này'));mount(<ItemForm onClose={vi.fn()} onSaved={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Từ, cụm từ hoặc câu'), { target: { value: 'bank' } });fireEvent.change(screen.getByLabelText('Nghĩa theo ngữ cảnh'), { target: { value: 'ngân hàng' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu kiến thức' }));await screen.findByRole('alert');expect(screen.getByLabelText('Từ, cụm từ hoặc câu')).toHaveValue('bank');expect(screen.getByLabelText('Nghĩa theo ngữ cảnh')).toHaveValue('ngân hàng');
  });
  it('uses PUT and saved server identity when editing', async () => {
    const saved = vi.fn();api.mockResolvedValue({ id: 'item-1' });mount(<ItemForm initial={{ id: 'item-1', expression: 'bank', meaning: 'bờ sông' }} onClose={vi.fn()} onSaved={saved} />);
    fireEvent.click(screen.getByRole('button', { name: 'Lưu kiến thức' }));await waitFor(() => expect(saved).toHaveBeenCalledWith({ id: 'item-1' }));expect(api.mock.calls[0][0]).toBe('/learning-items/item-1');expect(api.mock.calls[0][1].method).toBe('PUT');
  });
});

describe('Lesson evidence', () => {
  it('restores saved draft and does not grant an attempt merely on view', () => {
    mount(<LessonEditor lesson={lesson} />);expect(screen.getByRole('radio', { name: 'is' })).toBeChecked();expect(api).not.toHaveBeenCalled();expect(screen.getByText(/Nội dung bản nháp/)).toBeInTheDocument();
  });
  it('sends assisted flag and shows server feedback only after submission', async () => {
    api.mockResolvedValue({ id: 'attempt-1', score: 100, passed: false, assisted: true, feedback: [{ questionId: 'q1', correct: true, expected: 'is', explanation: 'Chủ ngữ số ít.' }] });mount(<LessonEditor lesson={lesson} />);
    fireEvent.click(screen.getByRole('checkbox'));fireEvent.click(screen.getByRole('button', { name: 'Nộp bài' }));await screen.findByText('Đã ghi nhận lần luyện tập');expect(api.mock.calls[0][1].body).toMatchObject({ answers: { q1: 'is' }, assisted: true });expect(screen.getByText(/không tính là đạt độc lập/)).toBeInTheDocument();
  });
  it('preserves answers and uses the same submission key on retry', async () => {
    api.mockRejectedValueOnce(new Error('Mất phản hồi')).mockResolvedValueOnce({ score: 100, passed: true, assisted: false, feedback: [] });mount(<LessonEditor lesson={lesson} />);
    fireEvent.click(screen.getByRole('button', { name: 'Nộp bài' }));await screen.findByRole('alert');expect(screen.getByRole('radio', { name: 'is' })).toBeChecked();fireEvent.click(screen.getByRole('button', { name: 'Nộp bài' }));await screen.findByText('Bạn đã đạt bài này độc lập');expect(api.mock.calls[0]).toEqual(api.mock.calls[1]);
  });
});

describe('Assistant failures', () => {
  it('keeps input on missing provider instead of returning a fabricated translation', async () => {
    useResource.mockImplementation((path) => ({ data: path ? [] : null, loading: false, error: null, reload }));api.mockRejectedValue(new Error('AI chưa được cấu hình'));mount(<Assistant />);
    fireEvent.change(screen.getByLabelText('Nội dung cần hỏi'), { target: { value: 'Hello there' } });fireEvent.click(screen.getByRole('button', { name: 'Gửi câu hỏi' }));await screen.findByRole('alert');expect(screen.getByLabelText('Nội dung cần hỏi')).toHaveValue('Hello there');expect(screen.queryByText('Xin chào')).not.toBeInTheDocument();expect(api.mock.calls[0][1].body.content).toBe('Hello there');
  });
});
