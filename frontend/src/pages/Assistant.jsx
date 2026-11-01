import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Copy, History, Plus, Save, Send, Sparkles, Trash2, Volume2 } from 'lucide-react';
import useResource from '../hooks/useResource';
import { api } from '../services/api';
import { EmptyState, ErrorNotice, Loading, Modal, PageHeading } from '../components/Common';
import ItemForm from '../features/notebook/ItemForm';
import ImageAttachments, { imageUploadEnabled } from '../features/assistant/ImageAttachments';
import ImageAnalysis, { imageAnalysisText, imageTasks, parseImageAnalysis } from '../features/assistant/ImageAnalysis';

const modes = [{ code: 'AUTO', label: 'Tự nhận diện' }, { code: 'TRANSLATE', label: 'Dịch' }, { code: 'EXPLAIN', label: 'Giải thích' }, { code: 'CORRECT', label: 'Sửa câu' }];
function mergeMessages(local, history = []) {
  const historyIds = new Set(history.map((message) => message.id));
  // A retained assistant response replaces its optimistic user turn too: the
  // server assigns a separate ID to that user message.
  const merged = [...new Map(local.filter((message) => !message.responseId || !historyIds.has(message.responseId)).map((message) => [message.id, message])).values()];
  history.forEach((message, position) => {
    const existing = merged.findIndex((item) => item.id === message.id);
    if (existing !== -1) { merged[existing] = message; return; }
    const nextIds = new Set(history.slice(position + 1).map((item) => item.id));
    const next = merged.findIndex((item) => nextIds.has(item.id));
    merged.splice(next === -1 ? merged.length : next, 0, message);
  });
  return merged;
}
export default function Assistant() {
  const location = useLocation();
  const [content, setContent] = useState(location.state?.draft || ''); const [context, setContext] = useState('');
  const [mode, setMode] = useState('AUTO'); const [conversationId, setConversationId] = useState(null);
  const [query, setQuery] = useState(''); const [filter, setFilter] = useState('');
  const history = useResource(`/conversations?q=${encodeURIComponent(filter)}`);
  const messages = useResource(conversationId ? `/conversations/${conversationId}/messages` : null);
  const capabilities = useResource('/assistant-capabilities');
  const [images, setImages] = useState([]); const [task, setTask] = useState('DETAILED');
  const [questionNumbers, setQuestionNumbers] = useState(''); const [learnerAnswer, setLearnerAnswer] = useState('');
  const availableTasks = imageTasks.filter((option) => Array.isArray(capabilities.data?.imageTasks) && capabilities.data.imageTasks.includes(option.code));
  const imageAvailable = imageUploadEnabled(capabilities.data) && availableTasks.length > 0;
  const selectedTask = availableTasks.some((option) => option.code === task) ? task : availableTasks[0]?.code;
  const [transient, setTransient] = useState([]); const [busy, setBusy] = useState(false); const [error, setError] = useState(null);
  useEffect(() => {
    if (messages.data) setTransient((current) => {
      const merged = mergeMessages(current, messages.data);
      return merged.length === current.length && merged.every((message, index) => message === current[index]) ? current : merged;
    });
  }, [messages.data]);
  const [saving, setSaving] = useState(null); const [deleting, setDeleting] = useState(null); const [notice, setNotice] = useState('');
  const pending = useRef(null); const lock = useRef(false);
  function change(setter, value) { setter(value); pending.current = null; setNotice(''); }
  function select(id) { setConversationId(id); setTransient([]); setError(null); setImages([]); setQuestionNumbers(''); setLearnerAnswer(''); pending.current = null; }
  async function send(event, newRequest = false) {
    event.preventDefault(); if ((!content.trim() && !images.length) || lock.current || (images.length > 0 && !imageAvailable)) return;
    if (newRequest) pending.current = null;
    lock.current = true; setBusy(true); setError(null); setNotice('');
    if (!pending.current) {
      const metadata = { content: content.trim(), context, conversationId, requestId: crypto.randomUUID(), ...(images.length ? { task: selectedTask, questionNumbers, learnerAnswer } : { mode }) };
      if (images.length) {
        const body = new FormData();
        body.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        images.forEach((file) => body.append('images', file, file.name));
        pending.current = { metadata, body, imageCount: images.length };
      } else pending.current = { metadata, body: metadata };
    }
    try {
      const result = await api('/assistant-requests', { method: 'POST', body: pending.current.body });
      const userMessage = { id: pending.current.metadata.requestId, responseId: result.id, role: 'user', content: [pending.current.metadata.content, pending.current.imageCount ? `Đã gửi ${pending.current.imageCount} ảnh · ${imageTasks.find((option) => option.code === pending.current.metadata.task)?.label}` : ''].filter(Boolean).join('\n') };
      setTransient((current) => [...mergeMessages(current, messages.data || []), userMessage, result]);
      setConversationId(result.conversationId || null); setContent(''); setImages([]); setQuestionNumbers(''); setLearnerAnswer(''); pending.current = null;
      history.reload(); messages.reload();
    } catch (err) { setError(err); }
    finally { lock.current = false; setBusy(false); }
  }
  async function copy(text) { try { await navigator.clipboard.writeText(text); setNotice('Đã sao chép.'); } catch { setNotice('Trình duyệt chưa cho phép sao chép. Bạn có thể chọn văn bản để sao chép.'); } }
  function speak(text) { const speech = new SpeechSynthesisUtterance(text); speech.lang = 'en-US'; window.speechSynthesis.cancel(); window.speechSynthesis.speak(speech); }
  async function remove() {
    if (lock.current) return;lock.current = true;setBusy(true);setError(null);
    try { await api(`/conversations/${deleting.id}`, { method: 'DELETE' }); if (conversationId === deleting.id) select(null); setDeleting(null); history.reload(); }
    catch (err) { setError(err); } finally { lock.current = false;setBusy(false); }
  }
  const visibleMessages = mergeMessages(transient, conversationId ? messages.data || [] : []);
  return <><PageHeading eyebrow="TÒ MÒ LÀ ĐIỂM BẮT ĐẦU" title="Hỏi & Dịch" action={<button disabled={busy} className="button secondary" onClick={() => select(null)}><Plus size={17} />Hội thoại mới</button>}>Hiểu nghĩa, hiểu cách dùng — với ngữ cảnh của bạn.</PageHeading>
    <div className="assistant-layout"><aside className="panel history-panel"><h2><History size={18} />Lịch sử</h2><form onSubmit={(e) => { e.preventDefault();setFilter(query);history.reload(); }}><label className="sr-only" htmlFor="history-search">Tìm hội thoại</label><input id="history-search" placeholder="Tìm hội thoại…" maxLength={500} value={query} onChange={(e) => setQuery(e.target.value)} /><button className="button secondary full">Tìm</button></form><ErrorNotice error={history.error} />{history.loading && <Loading />}{history.data?.length === 0 && <p className="muted small">Chưa có hội thoại được lưu.</p>}<div className="history-list">{history.data?.map((item) => <div className={conversationId === item.id ? 'history-row selected' : 'history-row'} key={item.id}><button disabled={busy} onClick={() => select(item.id)}>{item.title}</button><button className="icon-button" disabled={busy} aria-label={`Xóa hội thoại ${item.title}`} onClick={() => { setError(null);setDeleting(item); }}><Trash2 size={15} /></button></div>)}</div></aside>
    <section className="assistant-main"><div className="panel conversation-panel"><ErrorNotice error={messages.error} />{messages.loading && conversationId && <Loading />}{visibleMessages.length === 0 && !messages.loading && <EmptyState icon={Sparkles} title="Điều gì khiến bạn muốn hỏi?">Nhập một từ, dán một câu hoặc hỏi vì sao một cấu trúc được dùng.</EmptyState>}
      {visibleMessages.map((message, index) => {
        const analysis = message.role === 'assistant' ? parseImageAnalysis(message.content) : null;
        const readable = analysis ? imageAnalysisText(analysis) : message.content;
        return <article className={`message ${message.role}`} key={message.id}><div className="eyebrow">{message.role === 'user' ? 'BẠN' : 'TRỢ LÝ · AI TẠO'}</div>{analysis ? <ImageAnalysis result={analysis} onSave={setSaving} /> : <div className="preserve-space message-content">{message.content}</div>}{message.role === 'assistant' && <div className="message-actions"><button className="text-link" onClick={() => copy(readable)}><Copy size={14} />Sao chép</button>{'speechSynthesis' in window && <button className="text-link" onClick={() => speak(readable)}><Volume2 size={14} />Giọng tổng hợp</button>}{!analysis && <button className="text-link" onClick={() => setSaving({ expression: (visibleMessages[index - 1]?.content || '').slice(0, 500), meaning: message.content.slice(0, 2000), context, notes: 'AI tạo — cần kiểm tra', reviewEnabled: false })}><Save size={14} />Lưu sổ tay</button>}</div>}</article>;
      })}
      {busy && !deleting && <div className="pending-message"><p className="preserve-space">{pending.current?.metadata.content}{pending.current?.imageCount ? ` · ${pending.current.imageCount} ảnh` : ''}</p><Loading text="Đang xử lý câu hỏi…" /></div>}</div>
    <form className="panel composer" onSubmit={send}>
      <ImageAttachments capabilities={capabilities.data} loading={capabilities.loading} available={imageAvailable} files={images} onChange={(files) => change(setImages, files)} busy={busy} onReload={capabilities.reload} />
      {images.length > 0 ? <fieldset className="image-task-fieldset"><legend>Bạn muốn học theo cách nào?</legend><div className="image-task-grid">{availableTasks.map((option) => <button type="button" disabled={busy} aria-pressed={selectedTask === option.code} className={`image-task${selectedTask === option.code ? ' active' : ''}`} key={option.code} onClick={() => change(setTask, option.code)}>{option.label}</button>)}</div><div className="image-task-fields"><label>Số câu cần giải (không bắt buộc)<input maxLength={200} disabled={busy} value={questionNumbers} placeholder="Ví dụ: 1-5, 8" onChange={(event) => change(setQuestionNumbers, event.target.value)} /></label><label>Đáp án bạn đã chọn (không bắt buộc)<input maxLength={2000} disabled={busy} value={learnerAnswer} placeholder="Ví dụ: 1A, 2C" onChange={(event) => change(setLearnerAnswer, event.target.value)} /></label></div></fieldset> : <div className="mode-tabs" role="group" aria-label="Chế độ trợ lý">{modes.map((option) => <button type="button" disabled={busy} aria-pressed={mode === option.code} className={mode === option.code ? 'mode active' : 'mode'} key={option.code} onClick={() => change(setMode, option.code)}>{option.label}</button>)}</div>}
      <ErrorNotice error={error} />{error && pending.current && <div className="assistant-new-request"><p id="new-request-warning" className="privacy-hint">Thử lại cùng yêu cầu giữ nguyên mã để tránh gửi trùng khi chưa biết kết quả. Nếu yêu cầu đã thất bại, bạn có thể gửi thành yêu cầu mới với nội dung và ảnh hiện tại. Yêu cầu mới có thể tiêu tốn thêm ngân sách AI.</p><button type="button" className="button secondary" disabled={busy || (images.length > 0 && !imageAvailable)} aria-describedby="new-request-warning" onClick={(event) => send(event, true)}>Gửi thành yêu cầu mới</button></div>}<label>Nội dung cần hỏi<textarea required={!images.length} maxLength={6000} rows={4} disabled={busy} placeholder={images.length ? 'Có thể để trống khi đã đính kèm ảnh…' : 'Nhập từ, câu hoặc câu hỏi…'} value={content} onChange={(e) => change(setContent, e.target.value)} /></label><details><summary>Thêm ngữ cảnh</summary><label className="sr-only" htmlFor="learning-context">Ngữ cảnh</label><textarea id="learning-context" maxLength={4000} disabled={busy} placeholder="Câu xung quanh, tình huống công việc…" value={context} onChange={(e) => change(setContext, e.target.value)} /></details><div className="ask-actions"><span>{content.length}/6000 ký tự{images.length ? ` · ${images.length} ảnh` : ''}</span><button className="button primary" disabled={busy || (!content.trim() && !images.length) || (images.length > 0 && !imageAvailable)}><Send size={16} />{busy ? 'Đang gửi…' : pending.current ? 'Thử lại cùng yêu cầu' : images.length ? 'Gửi ảnh bài tập' : 'Gửi câu hỏi'}</button></div><p className="privacy-hint">Nội dung được gửi tới nhà cung cấp AI. Lựa chọn lưu lịch sử nằm trong Cài đặt. Khi tắt lưu, kết quả chỉ ở phiên hiện tại. AI không đảm bảo luôn chính xác.</p></form><p role="status" className="success-text">{notice}</p></section></div>
    {saving && <ItemForm initial={saving} onClose={() => setSaving(null)} onSaved={() => { setSaving(null);setNotice('Đã lưu kiến thức vào sổ tay.'); }} />}
    {deleting && <Modal title="Xóa hội thoại?" onClose={busy ? undefined : () => setDeleting(null)}><ErrorNotice error={error} /><p>Toàn bộ tin nhắn trong “{deleting.title}” sẽ được xóa.</p><div className="form-actions"><button disabled={busy} className="button secondary" onClick={() => setDeleting(null)}>Giữ lại</button><button disabled={busy} className="button danger" onClick={remove}>Xóa hội thoại</button></div></Modal>}
  </>;
}
