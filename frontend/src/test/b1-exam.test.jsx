import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import B1Exam from '../pages/B1Exam';
import { api } from '../services/api';

vi.mock('../services/api', () => ({ api: vi.fn() }));

const exam = {
  title: 'Bộ đề B1', sections: [
    { id: 'reading', title: 'Đọc', kind: 'reading', groups: [{ id: 'reading-1', title: 'Phần đọc', questions: [{ id: 'r1', number: 1, prompt: 'Chọn từ', type: 'choice', options: [{ id: 'A', text: 'apple' }, { id: 'B', text: 'book' }] }] }] },
    { id: 'listening', title: 'Nghe', kind: 'listening', groups: [{ id: 'listening-1', title: 'Phần nghe', questions: [{ id: 'l1', number: 1, prompt: 'Nghe và chọn', type: 'choice', options: [{ id: 'A', text: 'A' }, { id: 'B', text: 'B' }] }] }] }
  ]
};

beforeEach(() => {
  vi.resetAllMocks();
  let saved = { responses: {}, version: 0 };
  api.mockImplementation((url, options) => {
    if (url === '/b1-exam') return Promise.resolve(exam);
    if (url === '/b1-exam/draft' && options?.method === 'PUT') { saved = { responses: options.body.responses, version: saved.version + 1 }; return Promise.resolve(saved); }
    if (url === '/b1-exam/draft') return Promise.resolve(saved);
    return Promise.resolve({ answer: 'A', explanation: 'Lý do cụ thể', translation: 'Câu dịch cụ thể' });
  });
});

describe('Bộ đề B1', () => {
  it('shows reading answers on demand and keeps selections across sections', async () => {
    render(<B1Exam />);
    await screen.findByText('Chọn từ');
    fireEvent.click(screen.getByRole('radio', { name: /apple/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Xem đáp án' }));
    await screen.findByText('Lý do cụ thể');
    expect(screen.getByText('Câu dịch cụ thể')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Nghe/ }));
    expect(screen.getByText('Nghe và chọn')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Xem đáp án' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: 'A' }));
    fireEvent.click(screen.getByRole('button', { name: /Đọc/ }));
    expect(screen.getByRole('radio', { name: /apple/ })).toBeChecked();
  });

  it('automatically saves selections and restores them on a new page', async () => {
    const view = render(<B1Exam />);
    await screen.findByText('Chọn từ');
    fireEvent.click(screen.getByRole('radio', { name: /book/ }));
    await waitFor(() => expect(api).toHaveBeenCalledWith('/b1-exam/draft', expect.objectContaining({ method: 'PUT', body: { responses: { r1: 'B' }, version: 0 } })));
    await screen.findByText('Đã lưu bài làm');
    view.unmount();
    render(<B1Exam />);
    await screen.findByText('Chọn từ');
    expect(screen.getByRole('radio', { name: /book/ })).toBeChecked();
  });

  it('retains the answer and warns instead of overwriting a conflicting draft', async () => {
    api.mockImplementation((url, options) => {
      if (url === '/b1-exam') return Promise.resolve(exam);
      if (options?.method === 'PUT') return Promise.reject(Object.assign(new Error('Conflict'), { status: 409 }));
      return Promise.resolve({ responses: {}, version: 0 });
    });
    render(<B1Exam />);
    await screen.findByText('Chọn từ');
    fireEvent.click(screen.getByRole('radio', { name: /book/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('thiết bị khác');
    expect(screen.getByRole('radio', { name: /book/ })).toBeChecked();
    expect(screen.queryByRole('button', { name: 'Thử lưu lại' })).not.toBeInTheDocument();
  });
});
