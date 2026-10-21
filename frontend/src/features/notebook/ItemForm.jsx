import { useState } from 'react';
import { api } from '../../services/api';
import { ErrorNotice, Modal } from '../../components/Common';

export const emptyItem = { expression: '', meaning: '', context: '', example: '', notes: '', tags: '', reviewEnabled: false };

export default function ItemForm({ initial = {}, onClose, onSaved }) {
  const [form, setForm] = useState({ ...emptyItem, ...initial });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  function field(key) { return { value: form[key], onChange: (event) => setForm({ ...form, [key]: event.target.value }) }; }
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError(null);
    try {
      const item = await api(initial.id ? `/learning-items/${initial.id}` : '/learning-items', { method: initial.id ? 'PUT' : 'POST', body: form });
      onSaved(item);
    } catch (err) { setError(err); } finally { setBusy(false); }
  }
  return <Modal title={initial.id ? 'Chỉnh sửa kiến thức' : 'Lưu vào sổ tay'} onClose={busy ? undefined : onClose}>
    <form onSubmit={submit} className="form-stack"><ErrorNotice error={error} />
      <label>Từ, cụm từ hoặc câu<input required maxLength={500} {...field('expression')} /></label>
      <label>Nghĩa theo ngữ cảnh<textarea required maxLength={2000} {...field('meaning')} /></label>
      <label>Ngữ cảnh / câu gốc<textarea maxLength={4000} {...field('context')} /></label>
      <label>Ví dụ song ngữ<textarea maxLength={4000} {...field('example')} /></label>
      <label>Ghi chú<textarea maxLength={8000} {...field('notes')} /></label>
      <label>Nhãn chủ đề<input maxLength={1000} placeholder="Ví dụ: công việc, đời sống" {...field('tags')} /></label>
      <label className="checkbox-label"><input type="checkbox" checked={form.reviewEnabled} onChange={(e) => setForm({ ...form, reviewEnabled: e.target.checked })} />Đưa kiến thức này vào ôn tập</label>
      <p className="muted small">Bạn có thể lưu nhiều nghĩa khác nhau của cùng một từ. Nội dung AI cần được kiểm tra trước khi ghi nhớ.</p>
      <div className="form-actions"><button type="button" className="button secondary" disabled={busy} onClick={onClose}>Hủy</button><button className="button primary" disabled={busy}>{busy ? 'Đang lưu…' : 'Lưu kiến thức'}</button></div>
    </form>
  </Modal>;
}
