import { useState } from 'react';
import { BookOpen, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import useResource from '../hooks/useResource';
import { api } from '../services/api';
import { EmptyState, ErrorNotice, Loading, Modal, PageHeading } from '../components/Common';
import ItemForm from '../features/notebook/ItemForm';

export default function Notebook() {
  const [query, setQuery] = useState(''); const [filter, setFilter] = useState('');
  const { data, loading, error, reload } = useResource(`/learning-items?q=${encodeURIComponent(filter)}`);
  const [editing, setEditing] = useState(null); const [deleting, setDeleting] = useState(null);
  const [mutationError, setMutationError] = useState(null); const [busy, setBusy] = useState(false);
  async function remove() {
    setBusy(true); setMutationError(null);
    try { await api(`/learning-items/${deleting.id}`, { method: 'DELETE' }); setDeleting(null); reload(); }
    catch (err) { setMutationError(err); } finally { setBusy(false); }
  }
  return <><PageHeading eyebrow="KIẾN THỨC CỦA RIÊNG BẠN" title="Sổ tay của tôi" action={<button className="button primary" onClick={() => setEditing({})}><Plus size={17} />Thêm kiến thức</button>}>Lưu có chọn lọc. Nhớ trong ngữ cảnh. Dùng trong câu của bạn.</PageHeading>
    <form className="search-bar panel" onSubmit={(e) => { e.preventDefault(); setFilter(query.trim()); reload(); }}><Search size={19} /><input aria-label="Tìm trong sổ tay" placeholder="Tìm từ, nghĩa hoặc nhãn…" value={query} onChange={(e) => setQuery(e.target.value)} maxLength={500} /><button className="button secondary">Tìm kiếm</button><button type="button" className="text-link" onClick={() => { setQuery(''); setFilter(''); reload(); }}>Đặt lại</button></form>
    <ErrorNotice error={error} />{loading ? <Loading /> : data?.length ? <div className="notebook-grid">{data.map((item) => <article className="panel notebook-card" key={item.id}><div className="section-heading"><span className="subtle-tag">{item.reviewEnabled ? 'ĐÃ BẬT ÔN TẬP' : 'THAM KHẢO'}</span><div className="inline-actions"><button className="icon-button" aria-label={`Sửa ${item.expression}`} onClick={() => setEditing(item)}><Pencil size={17} /></button><button className="icon-button danger-text" aria-label={`Xóa ${item.expression}`} onClick={() => { setMutationError(null); setDeleting(item); }}><Trash2 size={17} /></button></div></div><h2>{item.expression}</h2><p className="meaning">{item.meaning}</p>{item.context && <blockquote>{item.context}</blockquote>}{item.example && <p className="preserve-space">{item.example}</p>}{item.notes && <details><summary>Ghi chú của bạn</summary><p className="preserve-space">{item.notes}</p></details>}<div className="card-meta"><span>{item.tags || 'Chưa gắn nhãn'}</span><time>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</time></div></article>)}</div> : <EmptyState icon={BookOpen} title={filter ? 'Chưa tìm thấy kiến thức phù hợp' : 'Gieo kiến thức đầu tiên'}>Thêm từ, cụm từ hoặc câu bạn muốn hiểu và nhớ. Bạn cũng có thể lưu từ Hỏi & Dịch.</EmptyState>}
    {editing && <ItemForm initial={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}
    {deleting && <Modal title="Xóa kiến thức này?" onClose={busy ? undefined : () => setDeleting(null)}><ErrorNotice error={mutationError} /><p>“{deleting.expression}” cùng thẻ và lịch sử ôn liên quan sẽ được xóa.</p><div className="form-actions"><button className="button secondary" disabled={busy} onClick={() => setDeleting(null)}>Giữ lại</button><button className="button danger" disabled={busy} onClick={remove}>{busy ? 'Đang xóa…' : 'Xóa kiến thức'}</button></div></Modal>}
  </>;
}
