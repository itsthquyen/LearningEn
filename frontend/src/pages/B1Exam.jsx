import { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import './B1Exam.css';

function isListening(section) {
  return section.kind === 'listening';
}

function Question({ question, listening, value, onChange, answerState, onReveal }) {
  const unavailable = question.unavailable || question.type === 'unavailable';
  const options = Array.isArray(question.options) ? question.options : [];
  return <article className="b1-question">
    <fieldset>
      <legend><span className="b1-question-number">{question.number != null ? `Câu ${question.number}` : 'Câu hỏi'}</span><span className="b1-preserve">{question.prompt}</span></legend>
      {question.sourcePage != null && <p className="b1-source">Trang {question.sourcePage}</p>}
      {question.image && <img className="b1-image" src={question.image} alt={`Hình minh họa ${question.number != null ? `câu ${question.number}` : 'câu hỏi'}`} loading="lazy" />}
      {question.image && listening && <p className="b1-muted">Các hình theo thứ tự từ trái sang phải: A, B, C.</p>}
      {unavailable ? <p className="b1-muted">Nội dung câu hỏi này chưa có sẵn hoặc bị che trong tài liệu gốc.</p> : <>
        {question.type === 'choice' && (options.length ? <div className="b1-options">{options.map((option) => <label className={`b1-option${value === String(option.id) ? ' is-selected' : ''}`} key={option.id}>
          <input type="radio" name={`b1-${question.id}`} value={String(option.id)} checked={value === String(option.id)} onChange={(event) => onChange(event.target.value)} />
          <span><span className="b1-preserve">{option.text}</span>{option.image && <img className="b1-option-image" src={option.image} alt={`Hình minh họa ${option.text || 'lựa chọn'}`} loading="lazy" />}</span>
        </label>)}</div> : <p className="b1-muted">Chưa có lựa chọn cho câu hỏi này.</p>)}
        {question.type === 'matching' && (options.length ? <><label className="b1-input-label">Chọn câu trả lời<select value={value} onChange={(event) => onChange(event.target.value)}><option value="">Chọn một phương án</option>{options.map((option) => <option key={option.id} value={String(option.id)}>{option.text}</option>)}</select></label>{options.some((option) => option.image) && <div className="b1-options">{options.filter((option) => option.image).map((option) => <div className="b1-option" key={option.id}><span>{option.text}<img className="b1-option-image" src={option.image} alt={`Hình minh họa ${option.text || 'lựa chọn'}`} loading="lazy" /></span></div>)}</div>}</> : <p className="b1-muted">Chưa có lựa chọn cho câu hỏi này.</p>)}
        {(question.type === 'writing' || question.type === 'speaking') && <label className="b1-input-label">{question.type === 'writing' ? 'Bài viết của bạn' : 'Ghi chú phần nói của bạn'}<textarea rows={5} maxLength={4000} value={value} onChange={(event) => onChange(event.target.value)} /></label>}
        {!['choice', 'matching', 'writing', 'speaking'].includes(question.type) && <p className="b1-muted">Dạng câu hỏi này chưa được hỗ trợ.</p>}
      </>}
    </fieldset>
    {!listening && !unavailable && <div className="b1-answer-area">
      <button type="button" className="button secondary compact" onClick={onReveal} disabled={answerState?.loading} aria-expanded={Boolean(answerState?.data)}>{answerState?.loading ? 'Đang tải đáp án…' : answerState?.data ? 'Ẩn đáp án' : 'Xem đáp án'}</button>
      {answerState?.error && <p className="b1-answer-error" role="alert">{answerState.error}</p>}
      {answerState?.data && <div className="b1-answer" role="region" aria-label="Đáp án">
        {(question.type === 'writing' || question.type === 'speaking') && <p className="b1-reference">Đáp án mẫu chỉ mang tính tham khảo.</p>}
        <div><strong>Đáp án</strong><p className="b1-preserve">{answerState.data.answer == null || answerState.data.answer === 'unavailable' ? 'Không thể xác định chắc chắn từ tài liệu gốc.' : answerState.data.answer}</p></div>
        {answerState.data.explanation && <div><strong>Giải thích</strong><p className="b1-preserve">{answerState.data.explanation}</p></div>}
        {answerState.data.translation && <div><strong>Bản dịch</strong><p className="b1-preserve">{answerState.data.translation}</p></div>}
      </div>}
    </div>}
  </article>;
}

export default function B1Exam() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [groupIndex, setGroupIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [answers, setAnswers] = useState({});
  const [saveState, setSaveState] = useState('saved');
  const [saveError, setSaveError] = useState('');
  const draft = useRef({ responses: {}, version: 0, revision: 0, savedRevision: 0, pending: null, saving: false, conflict: false });

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(null);
    Promise.all([api('/b1-exam', { signal: controller.signal }), api('/b1-exam/draft', { signal: controller.signal })]).then(([exam, saved]) => {
      if (controller.signal.aborted) return;
      draft.current = { responses: saved.responses, version: saved.version, revision: 0, savedRevision: 0, pending: null, saving: false, conflict: false };
      setResponses(saved.responses); setSaveState('saved'); setSaveError(''); setData(exam);
    }).catch((err) => {
      if (err.name !== 'AbortError') setError(err);
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [attempt]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') api('/auth/me').catch(() => {});
    }, 10 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  function changeResponse(questionId, value) {
    const current = draft.current;
    current.responses = { ...current.responses };
    if (value === '') delete current.responses[questionId];
    else current.responses[questionId] = value;
    current.revision++;
    setResponses(current.responses);
    setSaveState('unsaved');
  }

  async function saveDraft() {
    const current = draft.current;
    if (current.saving || current.conflict || current.revision === current.savedRevision) return;
    if (!current.pending) current.pending = { responses: current.responses, version: current.version, revision: current.revision };
    current.saving = true; setSaveState('saving'); setSaveError('');
    try {
      const result = await api('/b1-exam/draft', { method: 'PUT', body: { responses: current.pending.responses, version: current.pending.version } });
      current.version = result.version; current.savedRevision = current.pending.revision; current.pending = null;
      setSaveState(current.revision === current.savedRevision ? 'saved' : 'unsaved');
    } catch (err) {
      if (err.status === 409) current.conflict = true;
      setSaveState('error');
      setSaveError(err.status === 409 ? 'Bài làm đã thay đổi ở thiết bị khác. Vui lòng sao chép phần chưa lưu trước khi tải lại trang.' : 'Chưa lưu được bài làm. Kiểm tra kết nối và chọn Thử lưu lại.');
    } finally {
      current.saving = false;
      if (!current.pending && current.revision !== current.savedRevision && !current.conflict) window.setTimeout(saveDraft, 0);
    }
  }

  useEffect(() => {
    if (loading || draft.current.revision === draft.current.savedRevision) return;
    const timer = window.setTimeout(saveDraft, 700);
    return () => window.clearTimeout(timer);
  }, [responses, loading]);

  useEffect(() => {
    function warn(event) {
      if (draft.current.revision !== draft.current.savedRevision) { event.preventDefault(); event.returnValue = ''; }
    }
    window.addEventListener('beforeunload', warn);
    return () => { window.removeEventListener('beforeunload', warn); void saveDraft(); };
  }, []);

  async function reveal(questionId) {
    const current = answers[questionId];
    if (current?.data) {
      setAnswers((previous) => ({ ...previous, [questionId]: { ...previous[questionId], data: null, cached: current.data } }));
      return;
    }
    if (current?.cached) {
      setAnswers((previous) => ({ ...previous, [questionId]: { data: current.cached } }));
      return;
    }
    setAnswers((previous) => ({ ...previous, [questionId]: { loading: true } }));
    try {
      const result = await api(`/b1-exam/answers/${encodeURIComponent(questionId)}`);
      setAnswers((previous) => ({ ...previous, [questionId]: { data: result } }));
    } catch (err) {
      setAnswers((previous) => ({ ...previous, [questionId]: { error: err.status === 404 ? 'Chưa có đáp án cho câu hỏi này.' : (err.message || 'Không thể tải đáp án. Vui lòng thử lại.') } }));
    }
  }

  if (loading) return <div className="loading" role="status">Đang tải bộ đề B1…</div>;
  if (error) return <div className="b1-exam"><div className="notice error" role="alert">{error.message || 'Không thể tải bộ đề B1.'}</div><button type="button" className="button secondary" onClick={() => setAttempt((value) => value + 1)}>Thử lại</button></div>;
  const sections = Array.isArray(data?.sections) ? data.sections : [];
  const section = sections[sectionIndex];
  const groups = Array.isArray(section?.groups) ? section.groups : [];
  const group = groups[groupIndex];
  const questions = Array.isArray(group?.questions) ? group.questions : [];
  const listening = section ? isListening(section) : false;

  return <div className="b1-exam">
    <header className="b1-heading"><div className="eyebrow">BỘ ĐỀ B1</div><h1>{data?.title}</h1>{data?.description && <p className="b1-preserve">{data.description}</p>}<p className="b1-session-note">Không giới hạn thời gian · Bài làm được tự lưu theo tài khoản</p><p className="b1-session-note">Thời lượng trong hướng dẫn là của tài liệu gốc; ứng dụng không tính giờ hay tự nộp bài.</p><p className="b1-session-note">Lời giải được biên soạn từ bản scan và đã đối chiếu một phần; các câu mờ hoặc mơ hồ được ghi chú, không phải đáp án chính thức.</p><p className="b1-session-note" role="status">{saveState === 'saved' ? 'Đã lưu bài làm' : saveState === 'saving' ? 'Đang lưu bài làm…' : saveState === 'unsaved' ? 'Có thay đổi chưa lưu…' : 'Chưa lưu được bài làm'}</p>{saveError && <div className="notice error" role="alert">{saveError}{!draft.current.conflict && <button type="button" className="text-link" onClick={saveDraft}>Thử lưu lại</button>}</div>}</header>
    {!sections.length ? <div className="empty-state"><h2>Chưa có nội dung</h2><p>Bộ đề hiện chưa có phần nào.</p></div> : <div className="b1-layout">
      <nav className="b1-section-nav panel" aria-label="Các phần của bộ đề"><h2>Các phần</h2><div className="b1-section-list">{sections.map((item, index) => <button key={item.id} type="button" className={`b1-section-button${index === sectionIndex ? ' is-active' : ''}`} aria-current={index === sectionIndex ? 'true' : undefined} onClick={() => { setSectionIndex(index); setGroupIndex(0); }}><span className="b1-section-index">{String(index + 1).padStart(2, '0')}</span><span>{item.title}</span></button>)}</div></nav>
      <div className="b1-content"><section className="panel b1-section-intro"><div className="eyebrow">PHẦN {sectionIndex + 1} / {sections.length}</div><h2>{section.title}</h2>{section.description && <p className="b1-preserve">{section.description}</p>}{listening && <div className="notice info">Phần nghe: hãy sử dụng audio bên ngoài để làm bài. Bộ đề không cung cấp đáp án nghe; một số ảnh gốc còn nét bút viết tay, không coi đó là đáp án chính thức.</div>}</section>
        {!groups.length ? <div className="empty-state"><h3>Chưa có nhóm câu hỏi</h3><p>Phần này hiện chưa có nội dung.</p></div> : <>
          <nav className="b1-group-nav" aria-label="Nhóm câu hỏi">{groups.map((item, index) => <button key={item.id} type="button" className={`b1-group-button${index === groupIndex ? ' is-active' : ''}`} aria-current={index === groupIndex ? 'true' : undefined} onClick={() => setGroupIndex(index)}>{item.title}</button>)}</nav>
          <section className="panel b1-group"><header className="b1-group-heading"><div className="eyebrow">NHÓM {groupIndex + 1} / {groups.length}</div><h2>{group.title}</h2>{group.instructions && <p className="b1-preserve">{group.instructions}</p>}</header>
            {group.passage && <div className="b1-passage b1-preserve">{group.passage}</div>}
            {questions.length ? questions.map((question) => <Question key={question.id} question={question} listening={listening} value={responses[question.id] ?? ''} onChange={(value) => changeResponse(question.id, value)} answerState={answers[question.id]} onReveal={() => reveal(question.id)} />) : <p className="b1-muted">Nhóm này chưa có câu hỏi.</p>}
          </section>
          <div className="b1-pagination"><button type="button" className="button secondary" disabled={groupIndex === 0} onClick={() => setGroupIndex((value) => value - 1)}>Nhóm trước</button><span>{groupIndex + 1} / {groups.length}</span><button type="button" className="button secondary" disabled={groupIndex === groups.length - 1} onClick={() => setGroupIndex((value) => value + 1)}>Nhóm tiếp</button></div>
        </>}
      </div>
    </div>}
  </div>;
}
