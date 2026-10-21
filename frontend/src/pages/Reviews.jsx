import { useRef, useState } from 'react';
import { Check, Eye, RotateCcw } from 'lucide-react';
import useResource from '../hooks/useResource';
import { api } from '../services/api';
import { EmptyState, ErrorNotice, Loading, PageHeading } from '../components/Common';

const ratings = [{ code: 'AGAIN', label: 'Quên', className: 'again' }, { code: 'HARD', label: 'Khó', className: 'hard' }, { code: 'GOOD', label: 'Nhớ', className: 'good' }, { code: 'EASY', label: 'Dễ', className: 'easy' }];
export default function Reviews() {
  const { data, loading, error, reload } = useResource('/review-cards?due=true');
  const [done, setDone] = useState([]); const [revealed, setRevealed] = useState(null);
  const [busy, setBusy] = useState(false); const [mutationError, setMutationError] = useState(null);
  const pending = useRef(null); const lock = useRef(false);
  const card = data?.find((item) => !done.includes(item.id));
  async function rate(rating) {
    if (lock.current || !card || revealed !== card.id) return;
    lock.current = true; setBusy(true); setMutationError(null);
    if (!pending.current) pending.current = { cardId: card.id, requestId: crypto.randomUUID(), rating, version: card.version };
    try {
      const { cardId, ...body } = pending.current;
      await api(`/review-cards/${cardId}/reviews`, { method: 'POST', body });
      setDone((value) => [...value, cardId]); setRevealed(null); pending.current = null;
    } catch (err) { setMutationError(err); }
    finally { lock.current = false; setBusy(false); }
  }
  return <><PageHeading eyebrow="NHỚ LẠI TRƯỚC KHI XEM" title="Gặp lại điều đã học">Thử nhớ nghĩa từ ngữ cảnh, rồi tự đánh giá thật với chính mình.</PageHeading><ErrorNotice error={error} />
    {loading ? <Loading /> : error ? null : card ? <section className="panel review-panel"><div className="section-heading"><span className="subtle-tag">THẺ ĐẾN HẠN</span><span className="muted">{done.length} đã ôn · {data.length - done.length} còn lại</span></div><div className="review-question"><RotateCcw size={27} /><h2>{card.expression}</h2>{card.context && <blockquote>{card.context}</blockquote>}<p className="muted">Bạn nhớ cách hiểu và cách dùng cụm này chứ?</p></div>
      {revealed === card.id ? <><div className="review-answer"><span className="eyebrow">GỢI NHỚ</span><h3>{card.meaning}</h3>{card.example && <p className="preserve-space">{card.example}</p>}</div><ErrorNotice error={mutationError} /><div className="rating-grid">{ratings.map((rating) => <button className={`rating ${rating.className}`} key={rating.code} disabled={busy || (pending.current && pending.current.rating !== rating.code)} onClick={() => rate(rating.code)}>{rating.label}</button>)}</div>{pending.current && mutationError && <button className="text-link" onClick={() => { pending.current = null; setMutationError(null); reload(); }}>Tải lại thẻ từ máy chủ</button>}</> : <button className="button primary reveal-button" onClick={() => setRevealed(card.id)}><Eye size={18} />Xem đáp án</button>}
    </section> : <EmptyState icon={done.length ? Check : RotateCcw} title={done.length ? 'Bạn đã ôn xong phiên này' : 'Chưa có thẻ đến hạn'} action="Mở sổ tay" to="/notebook">{done.length ? `Đã ghi nhận ${done.length} lượt ôn. Lịch tiếp theo đã được lưu ở máy chủ.` : 'Thêm kiến thức vào sổ tay và bật ôn tập để bắt đầu.'}</EmptyState>}
    <p className="footnote">Lịch ôn hiện dùng SM-2, bốn mức tự đánh giá. Việc xem đáp án không tự ghi nhận là đã nhớ.</p>
  </>;
}
