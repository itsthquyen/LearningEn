import { useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Copy, History, Plus, Save, Send, Sparkles, Trash2, Volume2 } from 'lucide-react';
import useResource from '../hooks/useResource';
import { api } from '../services/api';
import { EmptyState, ErrorNotice, Loading, Modal, PageHeading } from '../components/Common';
import ItemForm from '../features/notebook/ItemForm';

const modes = [{ code: 'AUTO', label: 'Tự nhận diện' }, { code: 'TRANSLATE', label: 'Dịch' }, { code: 'EXPLAIN', label: 'Giải thích' }, { code: 'CORRECT', label: 'Sửa câu' }];
export default function Assistant() {
  const location = useLocation();
  const [content, setContent] = useState(location.state?.draft || ''); const [context, setContext] = useState('');
  const [mode, setMode] = useState('AUTO'); const [conversationId, setConversationId] = useState(null);
  const [query, setQuery] = useState(''); const [filter, setFilter] = useState('');
  const history = useResource(`/conversations?q=${encodeURIComponent(filter)}`);
  const messages = useResource(conversationId ? `/conversations/${conversationId}/messages` : null);
  const [transient, setTransient] = useState([]); const [busy, setBusy] = useState(false); const [error, setError] = useState(null);
  const [saving, setSaving] = useState(null); const [deleting, setDeleting] = useState(null); const [notice, setNotice] = useState('');
  const pending = useRef(null); const lock = useRef(false);
  function change(setter, value) { setter(value); pending.current = null; setNotice(''); }
  function select(id) { setConversationId(id); setTransient([]); setError(null); pending.current = null; }
  async function send(event) {
    event.preventDefault(); if (!content.trim() || lock.current) return;
    lock.current = true; setBusy(true); setError(null); setNotice('');
    if (!pending.current) pending.current = { content: content.trim(), context, mode, conversationId, requestId: crypto.randomUUID() };
    try {
      const result = await api('/assistant-requests', { method: 'POST', body: pending.current });
      const userMessage = { id: pending.current.requestId, role: 'user', content: pending.current.content };
      setTransient((current) => [...(messages.data || current), userMessage, result]);
      setConversationId(result.conversationId || null); setContent(''); pending.current = null;
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
  const visibleMessages = conversationId ? (messages.data || transient) : transient;
  return <><PageHeading eyebrow="TÒ MÒ LÀ ĐIỂM BẮT ĐẦU" title="Hỏi & Dịch" action={<button disabled={busy} className="button secondary" onClick={() => select(null)}><Plus size={17} />Hội thoại mới</button>}>Hiểu nghĩa, hiểu cách dùng — với ngữ cảnh của bạn.</PageHeading>
    <div className="assistant-layout"><aside className="panel history-panel"><h2><History size={18} />Lịch sử</h2><form onSubmit={(e) => { e.preventDefault();setFilter(query);history.reload(); }}><label className="sr-only" htmlFor="history-search">Tìm hội thoại</label><input id="history-search" placeholder="Tìm hội thoại…" maxLength={500} value={query} onChange={(e) => setQuery(e.target.value)} /><button className="button secondary full">Tìm</button></form><ErrorNotice error={history.error} />{history.loading && <Loading />}{history.data?.length === 0 && <p className="muted small">Chưa có hội thoại được lưu.</p>}<div className="history-list">{history.data?.map((item) => <div className={conversationId === item.id ? 'history-row selected' : 'history-row'} key={item.id}><button disabled={busy} onClick={() => select(item.id)}>{item.title}</button><button className="icon-button" disabled={busy} aria-label={`Xóa hội thoại ${item.title}`} onClick={() => { setError(null);setDeleting(item); }}><Trash2 size={15} /></button></div>)}</div></aside>
    <section className="assistant-main"><div className="panel conversation-panel"><ErrorNotice error={messages.error} />{messages.loading && conversationId && <Loading />}{visibleMessages.length === 0 && !messages.loading && <EmptyState icon={Sparkles} title="Điều gì khiến bạn muốn hỏi?">Nhập một từ, dán một câu hoặc hỏi vì sao một cấu trúc được dùng.</EmptyState>}
      {visibleMessages.map((message, index) => <article className={`message ${message.role}`} key={message.id}><div className="eyebrow">{message.role === 'user' ? 'BẠN' : 'TRỢ LÝ · AI TẠO'}</div><div className="preserve-space message-content">{message.content}</div>{message.role === 'assistant' && <div className="message-actions"><button className="text-link" onClick={() => copy(message.content)}><Copy size={14} />Sao chép</button>{'speechSynthesis' in window && <button className="text-link" onClick={() => speak(message.content)}><Volume2 size={14} />Giọng tổng hợp</button>}<button className="text-link" onClick={() => setSaving({ expression: (visibleMessages[index - 1]?.content || '').slice(0, 500), meaning: message.content.slice(0, 2000), context, notes: 'AI tạo — cần kiểm tra', reviewEnabled: false })}><Save size={14} />Lưu sổ tay</button></div>}</article>)}
      {busy && !deleting && <div className="pending-message"><p className="preserve-space">{pending.current?.content}</p><Loading text="Đang xử lý câu hỏi…" /></div>}</div>
    <form className="panel composer" onSubmit={send}><div className="mode-tabs" role="group" aria-label="Chế độ trợ lý">{modes.map((option) => <button type="button" disabled={busy} aria-pressed={mode === option.code} className={mode === option.code ? 'mode active' : 'mode'} key={option.code} onClick={() => change(setMode, option.code)}>{option.label}</button>)}</div><ErrorNotice error={error} /><label>Nội dung cần hỏi<textarea required maxLength={6000} rows={4} disabled={busy} placeholder="Nhập từ, câu hoặc câu hỏi…" value={content} onChange={(e) => change(setContent, e.target.value)} /></label><details><summary>Thêm ngữ cảnh</summary><label className="sr-only" htmlFor="learning-context">Ngữ cảnh</label><textarea id="learning-context" maxLength={4000} disabled={busy} placeholder="Câu xung quanh, tình huống công việc…" value={context} onChange={(e) => change(setContext, e.target.value)} /></details><div className="ask-actions"><span>{content.length}/6000 ký tự</span><button className="button primary" disabled={busy || !content.trim()}><Send size={16} />{busy ? 'Đang gửi…' : pending.current ? 'Thử lại cùng yêu cầu' : 'Gửi câu hỏi'}</button></div><p className="privacy-hint">Nội dung được gửi tới nhà cung cấp AI. Lựa chọn lưu lịch sử nằm trong Cài đặt. Khi tắt lưu, kết quả chỉ ở phiên hiện tại.</p></form><p role="status" className="success-text">{notice}</p></section></div>
    {saving && <ItemForm initial={saving} onClose={() => setSaving(null)} onSaved={() => { setSaving(null);setNotice('Đã lưu kiến thức vào sổ tay.'); }} />}
    {deleting && <Modal title="Xóa hội thoại?" onClose={busy ? undefined : () => setDeleting(null)}><ErrorNotice error={error} /><p>Toàn bộ tin nhắn trong “{deleting.title}” sẽ được xóa.</p><div className="form-actions"><button disabled={busy} className="button secondary" onClick={() => setDeleting(null)}>Giữ lại</button><button disabled={busy} className="button danger" onClick={remove}>Xóa hội thoại</button></div></Modal>}
  </>;
}
