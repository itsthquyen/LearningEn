import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Assistant from '../pages/Assistant';
import ImageAnalysis, { imageAnalysisText, parseImageAnalysis } from '../features/assistant/ImageAnalysis';

const capabilities = { imageEnabled: true, imageModelConfigured: true, maxImages: 3, maxImageBytes: 100, maxTotalImageBytes: 180, maxImagePixels: 16000000, imageTasks: ['ANSWER_ONLY', 'DETAILED', 'HINT', 'TRANSLATE', 'TRANSCRIBE', 'PRACTICE'] };
const analysis = {
  kind: 'IMAGE_ANALYSIS', task: 'DETAILED', summary: 'Phân tích câu 1', extractedText: 'She ___ a teacher.', warnings: ['Góc ảnh hơi mờ; hãy kiểm tra lại.'],
  questions: [{ number: '1', prompt: 'She ___ a teacher.', status: 'ANSWERED', answer: 'B', explanation: 'She đi với is.', translation: 'Cô ấy là giáo viên.', options: [{ label: 'A', text: 'are', verdict: 'INCORRECT', explanation: 'Không phù hợp chủ ngữ số ít.' }, { label: 'B', text: 'is', verdict: 'CORRECT', explanation: 'Phù hợp chủ ngữ số ít.' }, { label: 'C', text: 'am', verdict: 'INCORRECT', explanation: 'Am đi với I.' }, { label: 'D', text: 'be', verdict: 'INCORRECT', explanation: 'Cần chia động từ.' }], knowledge: ['She dùng is ở hiện tại.'], tips: ['Tìm chủ ngữ trước.'] }], practice: [],
};
const response = (payload, status = 200) => new Response(JSON.stringify(payload), { status });
const file = (name = 'exercise.png', type = 'image/png', bytes = 10) => new File([new Uint8Array(bytes)], name, { type });
const readBlob = (blob) => new Promise((resolve) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.readAsText(blob); });
let posts, capabilityResponse, submit, fetchMock, createUrl, revokeUrl;
function mount() { return render(<MemoryRouter><Assistant /></MemoryRouter>); }
async function upload(files = [file()]) {
  const input = screen.getByLabelText('Chọn ảnh JPEG / PNG');
  await waitFor(() => expect(input).toBeEnabled());
  fireEvent.change(input, { target: { files } });
}

beforeEach(() => {
  document.cookie = 'XSRF-TOKEN=image-csrf; path=/';
  posts = []; capabilityResponse = capabilities;
  submit = async () => response({ id: 'answer-1', role: 'assistant', content: JSON.stringify(analysis) });
  createUrl = vi.fn(() => `blob:preview-${Math.random()}`); revokeUrl = vi.fn();
  vi.stubGlobal('URL', Object.assign(class extends URL {}, { createObjectURL: createUrl, revokeObjectURL: revokeUrl }));
  fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, options) => {
    if (url.endsWith('/assistant-capabilities')) return capabilityResponse instanceof Response ? capabilityResponse : response(capabilityResponse);
    if (url.endsWith('/assistant-requests')) { posts.push(options); return submit(options); }
    return response([]);
  });
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); document.cookie = 'XSRF-TOKEN=; Max-Age=0; path=/'; });

describe('Image tutoring transport and upload', () => {
  it('allows image-only send and uses ordered multipart files + JSON metadata without overriding the boundary', async () => {
    mount();
    await upload([file('first.png'), file('second.jpg', 'image/jpeg')]);
    fireEvent.change(screen.getByLabelText('Số câu cần giải (không bắt buộc)'), { target: { value: '1-2' } });
    fireEvent.change(screen.getByLabelText('Đáp án bạn đã chọn (không bắt buộc)'), { target: { value: '1A' } });
    fireEvent.change(screen.getByLabelText('Ngữ cảnh'), { target: { value: 'Bài hiện tại đơn' } });
    expect(screen.getByLabelText('Nội dung cần hỏi')).not.toBeRequired();
    fireEvent.click(screen.getByRole('button', { name: 'Gửi ảnh bài tập' }));
    await screen.findByText('Đáp án AI đề xuất: B');
    expect(posts).toHaveLength(1);
    const request = posts[0];
    expect(request.body).toBeInstanceOf(FormData);
    expect(request.headers).not.toHaveProperty('Content-Type');
    expect(request).toMatchObject({ credentials: 'include', headers: { 'X-XSRF-TOKEN': 'image-csrf' } });
    expect(request.body.getAll('images').map((image) => image.name)).toEqual(['first.png', 'second.jpg']);
    expect(request.body.get('metadata').type).toBe('application/json');
    expect(JSON.parse(await readBlob(request.body.get('metadata')))).toMatchObject({ content: '', context: 'Bài hiện tại đơn', questionNumbers: '1-2', learnerAnswer: '1A', task: 'DETAILED', requestId: expect.any(String) });
    expect(screen.queryByRole('list', { name: 'Thứ tự ảnh gửi' })).not.toBeInTheDocument();
  });

  it('retains images, fields and request identity after failure; locks concurrent submissions', async () => {
    let reject;
    submit = () => new Promise((_, fail) => { reject = fail; });
    mount(); await upload();
    fireEvent.change(screen.getByLabelText('Nội dung cần hỏi'), { target: { value: 'Giải câu 1' } });
    const send = screen.getByRole('button', { name: 'Gửi ảnh bài tập' });
    fireEvent.click(send); fireEvent.click(send);
    expect(posts).toHaveLength(1); expect(screen.getByLabelText('Nội dung cần hỏi')).toBeDisabled();
    reject(new TypeError('lost response'));
    await screen.findByRole('alert');
    expect(screen.getByLabelText('Nội dung cần hỏi')).toHaveValue('Giải câu 1');
    expect(screen.getByRole('list', { name: 'Thứ tự ảnh gửi' })).toBeInTheDocument();
    submit = async () => response({ id: 'retry', role: 'assistant', content: JSON.stringify(analysis) });
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại cùng yêu cầu' }));
    await screen.findByText('Đáp án AI đề xuất: B');
    expect(posts).toHaveLength(2); expect(posts[1].body).toBe(posts[0].body);
    expect(await readBlob(posts[1].body.get('metadata'))).toBe(await readBlob(posts[0].body.get('metadata')));
  });

  it('uses drag-drop and clipboard order, removes files and revokes preview URLs on cleanup', async () => {
    const view = mount(); await upload([file('one.png')]);
    const zone = screen.getByRole('group', { name: 'Kéo thả hoặc dán ảnh tại đây' });
    fireEvent.drop(zone, { dataTransfer: { files: [file('two.jpg', 'image/jpeg')] } });
    fireEvent.paste(screen.getByLabelText('Nội dung cần hỏi'), { clipboardData: { items: [{ kind: 'file', getAsFile: () => file('three.png') }] } });
    expect(within(screen.getByRole('list', { name: 'Thứ tự ảnh gửi' })).getAllByRole('img').map((image) => image.alt)).toEqual(['Ảnh 1: one.png', 'Ảnh 2: two.jpg', 'Ảnh 3: three.png']);
    fireEvent.click(screen.getByRole('button', { name: 'Phóng to ảnh 1: one.png' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Độ phóng đại'), { target: { value: '200' } });
    expect(within(dialog).getByRole('img')).toHaveStyle({ width: '200%' });
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Bỏ ảnh 3' }));
    expect(revokeUrl).toHaveBeenCalledTimes(1);
    view.unmount(); expect(revokeUrl.mock.calls.length).toBe(createUrl.mock.calls.length);
  });

  it('offers only server-supported image tasks and submits the selected mode', async () => {
    capabilityResponse = { ...capabilities, imageTasks: ['HINT', 'TRANSCRIBE'] };
    mount(); await upload();
    expect(screen.queryByRole('button', { name: 'Giải chi tiết ABCD' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Gợi ý' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Chép nội dung' }));
    fireEvent.click(screen.getByRole('button', { name: 'Gửi ảnh bài tập' }));
    await waitFor(() => expect(posts).toHaveLength(1));
    expect(JSON.parse(await readBlob(posts[0].body.get('metadata'))).task).toBe('TRANSCRIBE');
  });

  it('creates a new request identity when the failed image request is edited', async () => {
    submit = async () => response({ detail: 'Thử lại' }, 502);
    mount(); await upload();
    fireEvent.click(screen.getByRole('button', { name: 'Gửi ảnh bài tập' }));
    await screen.findByRole('alert');
    const first = JSON.parse(await readBlob(posts[0].body.get('metadata')));
    fireEvent.click(screen.getByRole('button', { name: 'Gợi ý' }));
    fireEvent.click(screen.getByRole('button', { name: 'Gửi ảnh bài tập' }));
    await waitFor(() => expect(posts).toHaveLength(2));
    const second = JSON.parse(await readBlob(posts[1].body.get('metadata')));
    expect(second.requestId).not.toBe(first.requestId); expect(second.task).toBe('HINT');
  });

  it.each(['image', 'text'])('allows an explicit new %s request after 502 without editing the payload', async (kind) => {
    submit = async () => response({ detail: 'Provider failed' }, 502);
    mount();
    if (kind === 'image') {
      await upload();
      fireEvent.change(screen.getByLabelText('Số câu cần giải (không bắt buộc)'), { target: { value: '1' } });
    }
    fireEvent.change(screen.getByLabelText('Nội dung cần hỏi'), { target: { value: 'Explain this' } });
    fireEvent.click(screen.getByRole('button', { name: kind === 'image' ? 'Gửi ảnh bài tập' : 'Gửi câu hỏi' }));
    await screen.findByRole('alert');
    const first = kind === 'image' ? JSON.parse(await readBlob(posts[0].body.get('metadata'))) : JSON.parse(posts[0].body);
    expect(posts).toHaveLength(1);
    const newRequest = screen.getByRole('button', { name: 'Gửi thành yêu cầu mới' });
    expect(newRequest).toHaveAccessibleDescription(/tiêu tốn thêm ngân sách AI/);
    expect(screen.getByLabelText('Nội dung cần hỏi')).toHaveValue('Explain this');
    submit = async () => response({ id: 'new-request', role: 'assistant', content: 'New response' });
    fireEvent.click(newRequest);
    await screen.findByText('New response');
    expect(posts).toHaveLength(2);
    const second = kind === 'image' ? JSON.parse(await readBlob(posts[1].body.get('metadata'))) : JSON.parse(posts[1].body);
    expect(second.requestId).not.toBe(first.requestId);
    expect({ ...second, requestId: first.requestId }).toEqual(first);
    if (kind === 'image') expect(posts[1].body.getAll('images')).toEqual(posts[0].body.getAll('images'));
  });

  it('clears image attachments and image-specific fields on a new conversation', async () => {
    mount(); await upload();
    expect(screen.getByLabelText('Số câu cần giải (không bắt buộc)')).toHaveAttribute('maxlength', '200');
    fireEvent.change(screen.getByLabelText('Số câu cần giải (không bắt buộc)'), { target: { value: '1-2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Hội thoại mới' }));
    expect(screen.queryByRole('list', { name: 'Thứ tự ảnh gửi' })).not.toBeInTheDocument();
    expect(revokeUrl).toHaveBeenCalledTimes(1);
    await upload();
    expect(screen.getByLabelText('Số câu cần giải (không bắt buộc)')).toHaveValue('');
    expect(screen.getByLabelText('Đáp án bạn đã chọn (không bắt buộc)')).toHaveValue('');
  });

  it.each([
    ['unsupported media', () => [file('unsafe.svg', 'image/svg+xml')], /Chỉ nhận ảnh JPEG hoặc PNG/],
    ['per-file bytes', () => [file('large.png', 'image/png', 101)], /Mỗi ảnh không được quá/],
    ['image count', () => Array.from({ length: 4 }, (_, index) => file(`${index}.png`)), /tối đa 3 ảnh/],
    ['total bytes', () => [file('a.png', 'image/png', 95), file('b.png', 'image/png', 95)], /Tổng ảnh không được quá/],
    ['empty file', () => [file('empty.png', 'image/png', 0)], /Ảnh trống/],
  ])('rejects %s without sending or creating previews', async (_, incoming, warning) => {
    mount(); await upload(incoming());
    expect(screen.getByRole('alert')).toHaveTextContent(warning);
    expect(posts).toHaveLength(0); expect(createUrl).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Gửi câu hỏi' })).toBeDisabled();
  });

  it.each([null, { ...capabilities, imageEnabled: false }, { ...capabilities, imageModelConfigured: false }, { ...capabilities, maxImages: undefined }, { ...capabilities, imageTasks: ['UNKNOWN'] }, { ...capabilities, imageTasks: {} }])('fails closed for unavailable/invalid capabilities without blocking text', async (value) => {
    capabilityResponse = value === null ? response({ detail: 'unavailable' }, 503) : value;
    submit = async () => response({ id: 'text', role: 'assistant', content: 'Text response' });
    mount();
    await screen.findByText(/Tải ảnh chưa khả dụng/);
    expect(screen.getByLabelText('Chọn ảnh JPEG / PNG')).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Nội dung cần hỏi'), { target: { value: 'Hello' } });
    fireEvent.click(screen.getByRole('button', { name: 'Gửi câu hỏi' }));
    await screen.findByText('Text response');
    expect(JSON.parse(posts[0].body)).toMatchObject({ content: 'Hello', mode: 'AUTO' });
    expect(posts[0].headers['Content-Type']).toBe('application/json');
  });
});

describe('Structured image results', () => {
  it.each(['image', 'text'])('keeps nonretained %s turns in an existing conversation across reloads and retained turns', async (kind) => {
    const original = [{ id: 'old-user', role: 'user', content: 'Earlier question' }, { id: 'old-answer', role: 'assistant', content: 'Earlier answer' }];
    const turn = kind === 'image' ? JSON.stringify(analysis) : 'Nonretained text response';
    let loads = 0, finishReload;
    fetchMock.mockImplementation(async (url, options) => {
      if (url.endsWith('/assistant-capabilities')) return response(capabilities);
      if (url.endsWith('/conversations/c1/messages')) {
        loads += 1;
        if (loads === 2) return new Promise((resolve) => { finishReload = () => resolve(response(original)); });
        if (loads >= 3) return response([...original, { id: 'server-user', role: 'user', content: 'Retained followup' }, { id: 'retained-answer', role: 'assistant', content: 'Retained reply' }]);
        return response(original);
      }
      if (url.endsWith('/assistant-requests')) {
        posts.push(options);
        return response({ id: posts.length === 1 ? 'nonretained' : 'retained-answer', role: 'assistant', conversationId: 'c1', content: posts.length === 1 ? turn : 'Retained reply' });
      }
      return response([{ id: 'c1', title: 'Existing conversation' }]);
    });
    mount(); fireEvent.click(await screen.findByRole('button', { name: 'Existing conversation' }));
    await screen.findByText('Earlier answer');
    if (kind === 'image') await upload();
    fireEvent.change(screen.getByLabelText('Nội dung cần hỏi'), { target: { value: 'Nonretained question' } });
    fireEvent.click(screen.getByRole('button', { name: kind === 'image' ? 'Gửi ảnh bài tập' : 'Gửi câu hỏi' }));
    const answerText = kind === 'image' ? 'Đáp án AI đề xuất: B' : 'Nonretained text response';
    await screen.findByText(answerText);
    await waitFor(() => expect(finishReload).toBeTypeOf('function'));
    expect(screen.getByText('Earlier answer')).toBeInTheDocument();
    finishReload();
    await waitFor(() => expect(screen.queryByText('Đang tải dữ liệu…')).not.toBeInTheDocument());
    expect(screen.getByText(answerText)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Nội dung cần hỏi'), { target: { value: 'Retained followup' } });
    fireEvent.click(screen.getByRole('button', { name: 'Gửi câu hỏi' }));
    await screen.findByText('Retained reply');
    await waitFor(() => expect(loads).toBe(3));
    await waitFor(() => expect(screen.queryByText('Đang tải dữ liệu…')).not.toBeInTheDocument());
    expect(screen.getAllByText('Retained followup')).toHaveLength(1);
    expect(screen.getAllByText('Retained reply')).toHaveLength(1);
    expect(screen.getAllByText(answerText)).toHaveLength(1);
    const articles = [...document.querySelectorAll('.conversation-panel article')];
    expect(articles).toHaveLength(6);
    expect(articles.map((article) => article.textContent)).toEqual([
      expect.stringContaining('Earlier question'), expect.stringContaining('Earlier answer'),
      expect.stringContaining('Nonretained question'), expect.stringContaining(answerText),
      expect.stringContaining('Retained followup'), expect.stringContaining('Retained reply'),
    ]);
  });

  it('renders warnings, separate answer/status, ABCD explanations, safe text and notebook selection', async () => {
    const safeAnalysis = { ...analysis, summary: '<img src=x onerror=alert(1)>' };
    submit = async () => response({ id: 'safe', role: 'assistant', content: JSON.stringify(safeAnalysis) });
    mount(); await upload(); fireEvent.click(screen.getByRole('button', { name: 'Gửi ảnh bài tập' }));
    await screen.findByText('<img src=x onerror=alert(1)>');
    expect(screen.getByRole('region', { name: 'Lưu ý từ phân tích' })).toHaveTextContent('Góc ảnh hơi mờ');
    expect(screen.getByText('Đã phân tích')).toBeInTheDocument();
    expect(screen.getByText('Đáp án AI đề xuất: B')).toBeInTheDocument();
    expect(screen.getByText('Không phù hợp chủ ngữ số ít.')).toBeInTheDocument();
    expect(screen.getByText('Đúng')).toBeInTheDocument(); expect(screen.getAllByText('Sai')).toHaveLength(3);
    expect(screen.getByText('C. am')).toBeInTheDocument(); expect(screen.getByText('D. be')).toBeInTheDocument();
    expect(document.querySelector('img[src="x"]')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Lưu câu 1 vào sổ tay' }));
    const dialog = screen.getByRole('dialog', { name: 'Lưu vào sổ tay' });
    expect(within(dialog).getByLabelText('Từ, cụm từ hoặc câu')).toHaveValue('She ___ a teacher.');
    expect(within(dialog).getByLabelText('Nghĩa theo ngữ cảnh').value).toContain('Đáp án AI đề xuất: B');
  });

  it('renders retained history with the same structured component and copies readable text, not JSON', async () => {
    const clipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
    vi.stubGlobal('navigator', Object.assign(Object.create(navigator), { clipboard }));
    fetchMock.mockImplementation(async (url) => {
      if (url.includes('/assistant-capabilities')) return response(capabilities);
      if (url.includes('/conversations/c1/messages')) return response([{ id: 'history-answer', role: 'assistant', content: JSON.stringify(analysis) }]);
      return response([{ id: 'c1', title: 'Bài ảnh hôm qua' }]);
    });
    mount(); fireEvent.click(await screen.findByRole('button', { name: 'Bài ảnh hôm qua' }));
    await screen.findByText('Đáp án AI đề xuất: B');
    fireEvent.click(screen.getByRole('button', { name: 'Sao chép' }));
    await waitFor(() => expect(clipboard.writeText).toHaveBeenCalled());
    expect(clipboard.writeText.mock.calls[0][0]).toContain('A. are - Sai');
    expect(clipboard.writeText.mock.calls[0][0]).not.toContain('IMAGE_ANALYSIS');
  });

  it('does not invent/show answers or correct verdicts for hint mode and tolerates malformed fields', () => {
    const result = parseImageAnalysis(JSON.stringify({ ...analysis, task: 'HINT', warnings: [null, 'Cần nhìn kỹ đề.'], questions: [...analysis.questions, null, { status: '???', options: [null, {}], knowledge: {}, tips: [null] }], practice: [{ prompt: 'Forbidden', answer: 'LEAK' }] }));
    render(<ImageAnalysis result={result} />);
    expect(screen.queryByText(/Đáp án AI đề xuất/)).not.toBeInTheDocument();
    expect(screen.queryByText('Đúng')).not.toBeInTheDocument();
    expect(screen.queryByText('Forbidden')).not.toBeInTheDocument();
    expect(screen.getByText('Không yêu cầu đáp án')).toBeInTheDocument();
    expect(screen.getByText('Cần thêm ngữ cảnh')).toBeInTheDocument();
    expect(imageAnalysisText(result)).not.toContain('Đáp án AI đề xuất');
    expect(parseImageAnalysis('{invalid')).toBeNull(); expect(parseImageAnalysis('null')).toBeNull();
    expect(parseImageAnalysis(JSON.stringify({ kind: 'other' }))).toBeNull();
  });

  it('keeps uncertainty distinct from an answer and never promotes unrecognized verdicts', () => {
    const result = parseImageAnalysis(JSON.stringify({ ...analysis, questions: [{ ...analysis.questions[0], status: 'NEEDS_CLEARER_IMAGE', answer: 'B' }, { ...analysis.questions[0], number: '2', options: [{ label: 'A', verdict: '__proto__', explanation: 'Không chắc.' }] }] }));
    render(<ImageAnalysis result={result} />);
    expect(screen.getByRole('region', { name: 'Câu 1' })).toHaveTextContent('Cần ảnh rõ hơn');
    expect(within(screen.getByRole('region', { name: 'Câu 1' })).queryByText(/Đáp án AI đề xuất/)).not.toBeInTheDocument();
    expect(screen.getAllByText('Chưa xác định')).toHaveLength(5);
  });

  it('keeps practice answers concealed until revealed and out of copied text', () => {
    const result = parseImageAnalysis(JSON.stringify({ kind: 'IMAGE_ANALYSIS', task: 'PRACTICE', practice: [{ prompt: 'They ___ students.', answer: 'are', explanation: 'They dùng are.' }] }));
    render(<ImageAnalysis result={result} />);
    const answer = screen.getByText('are');
    expect(answer.closest('details')).not.toHaveAttribute('open');
    expect(imageAnalysisText(result)).not.toContain('They dùng are.');
    fireEvent.click(screen.getByText('Xem đáp án luyện tập 1'));
    expect(answer.closest('details')).toHaveAttribute('open');
  });
});
