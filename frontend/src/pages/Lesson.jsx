import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Save } from 'lucide-react';
import { api } from '../services/api';
import useResource from '../hooks/useResource';
import { ErrorNotice, Loading, PageHeading } from '../components/Common';

export default function Lesson() {
  const { id } = useParams(); const { data, loading, error } = useResource(`/lessons/${id}`);
  if (loading) return <Loading />;if (error) return <ErrorNotice error={error} />;
  return data ? <LessonEditor key={data.id} lesson={data} /> : null;
}
export function LessonEditor({ lesson }) {
  const [answers, setAnswers] = useState(lesson.draftAnswers || {});const [assisted, setAssisted] = useState(false);
  const [result, setResult] = useState(null);const [error, setError] = useState(null);const [busy, setBusy] = useState(false);const [saved, setSaved] = useState('');
  const pending = useRef(null);const lock = useRef(false);const revision = useRef(0);const savedRevision = useRef(0);const currentAnswers = useRef(answers);
  function change(id, value) { const next = { ...answers, [id]: value };setAnswers(next);currentAnswers.current = next;revision.current++;pending.current = null;setSaved('Chưa lưu'); }
  async function save() {
    if (lock.current || result) return;const version = revision.current;
    lock.current = true;setBusy(true);setError(null);
    try { await api(`/lessons/${lesson.id}/draft`, { method: 'PUT', body: { answers: currentAnswers.current } });savedRevision.current = version;setSaved(version === revision.current ? 'Đã lưu nháp' : 'Chưa lưu'); }
    catch (err) { setError(err); } finally { lock.current = false;setBusy(false); }
  }
  useEffect(() => {
    if (revision.current === savedRevision.current || result) return;
    const timer = setTimeout(save, 1000);return () => clearTimeout(timer);
    // The current answers are read from a ref; each edit schedules one autosave.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, result]);
  useEffect(() => { const warn = (event) => { if (revision.current !== savedRevision.current && !result) { event.preventDefault();event.returnValue = ''; } };window.addEventListener('beforeunload', warn);return () => window.removeEventListener('beforeunload', warn); }, [result]);
  async function submit(event) {
    event.preventDefault();if (lock.current) return;lock.current = true;setBusy(true);setError(null);
    if (!pending.current) pending.current = { requestId: crypto.randomUUID(), answers, assisted };
    try { const value = await api(`/lessons/${lesson.id}/attempts`, { method: 'POST', body: pending.current });setResult(value);savedRevision.current = revision.current;setSaved('Đã lưu kết quả');pending.current = null; }
    catch (err) { setError(err); } finally { lock.current = false;setBusy(false); }
  }
  const complete = lesson.questions.every((q) => answers[q.id]?.trim());
  return <><Link className="text-link" to="/progress"><ArrowLeft size={16} />Trở về lộ trình</Link><PageHeading eyebrow={lesson.kind === 'CHECKPOINT' ? 'KIỂM TRA MỐC' : 'HỌC THEO NHỊP CỦA BẠN'} title={lesson.title}>{lesson.objective}</PageHeading>{lesson.contentStatus !== 'REVIEWED' && <div className="notice warning">Nội dung bản nháp chưa được người có chuyên môn kiểm duyệt.</div>}<section className="panel lesson-content"><h2>Cùng tìm hiểu</h2><div className="preserve-space">{lesson.body}</div></section>
    <form className="panel lesson-exercises form-stack" onSubmit={submit}><h2>Thử dùng điều vừa học</h2>{lesson.questions.map((q, index) => <fieldset key={q.id} disabled={busy || Boolean(result)}><legend>{index + 1}. {q.prompt}</legend>{q.type === 'WRITING' ? <textarea aria-label={q.prompt} required maxLength={4000} rows={6} value={answers[q.id] || ''} onChange={(e) => change(q.id, e.target.value)} /> : q.options.map((option) => <label className={`answer-option ${answers[q.id] === option ? 'selected' : ''}`} key={option}><input type="radio" name={q.id} value={option} checked={answers[q.id] === option} onChange={() => change(q.id, option)} required />{option}</label>)}</fieldset>)}<label className="checkbox-label"><input type="checkbox" checked={assisted} disabled={busy || Boolean(result)} onChange={(e) => { setAssisted(e.target.checked);pending.current = null; }} />Tôi có dùng gợi ý hoặc trợ giúp khi làm bài</label><ErrorNotice error={error} />{!result && <div className="form-actions"><span className="muted small" role="status">{saved}</span><button type="button" className="button secondary" disabled={busy} onClick={save}><Save size={16} />Lưu nháp</button><button className="button primary" disabled={busy || !complete}>{busy ? 'Đang lưu…' : 'Nộp bài'}</button></div>}</form>
    {result && <section className="panel result-panel"><div className="section-heading"><h2>{result.passed ? 'Bạn đã đạt bài này độc lập' : result.score == null ? 'Đã lưu bài thực hành' : 'Đã ghi nhận lần luyện tập'}</h2>{result.score != null && <strong className="score">{result.score}%</strong>}</div>{result.assisted && <p className="notice warning">Lần làm bài có hỗ trợ, không tính là đạt độc lập.</p>}{result.feedback.map((feedback) => <div className="feedback" key={feedback.questionId}><strong>{feedback.correct == null ? 'Cần người duyệt' : feedback.correct ? '✓ Chính xác' : 'Thử xem lại'}</strong><p>{feedback.expected}</p><p className="muted">{feedback.explanation}</p></div>)}<div className="form-actions"><button className="button secondary" onClick={() => { setResult(null);pending.current = null;setSaved('');setError(null); }}>Luyện lại</button><Link className="button primary" to="/progress"><Check size={16} />Xem tiến bộ</Link></div></section>}
  </>;
}
