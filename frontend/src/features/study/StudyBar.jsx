import { useEffect, useRef, useState } from 'react';
import { Check, Clock3, Play } from 'lucide-react';
import { api } from '../../services/api';
import { ErrorNotice } from '../../components/Common';

export default function StudyBar() {
  const [session, setSession] = useState(null);const [seconds, setSeconds] = useState(0);const [minutes, setMinutes] = useState(20);const [busy, setBusy] = useState(false);const [error, setError] = useState(null);
  const current = useRef(null);const elapsed = useRef(0);const lastActive = useRef(Date.now());const pending = useRef(null);const saving = useRef(false);const startId = useRef(null);
  function accept(value) { current.current = value;elapsed.current = value?.activeSeconds || 0;setSeconds(elapsed.current);setSession(value); }
  useEffect(() => {
    let active = true;api('/study-sessions/current').then((value) => { if (active) accept(value); }).catch((err) => { if (active) setError(err); });
    function activity() { lastActive.current = Date.now(); }
    function clear() { accept(null);pending.current = null; }
    ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach((name) => window.addEventListener(name, activity, { passive: true }));window.addEventListener('personal-data-cleared', clear);
    const timer = setInterval(() => { if (current.current && document.visibilityState === 'visible' && Date.now() - lastActive.current < 60000 && elapsed.current < 28800) { elapsed.current++;setSeconds(elapsed.current); } }, 1000);
    const sync = setInterval(() => { if (current.current && elapsed.current > current.current.activeSeconds) persist(false); }, 15000);
    return () => { active = false;clearInterval(timer);clearInterval(sync);['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach((name) => window.removeEventListener(name, activity));window.removeEventListener('personal-data-cleared', clear); };
  }, []);
  async function start() {
    if (saving.current) return;saving.current = true;setBusy(true);setError(null);if (!startId.current) startId.current = crypto.randomUUID();
    try { accept(await api('/study-sessions', { method: 'POST', body: { requestId: startId.current, plannedMinutes: Number(minutes) } }));startId.current = null;lastActive.current = Date.now(); }
    catch (err) { setError(err); } finally { saving.current = false;setBusy(false); }
  }
  async function persist(completed) {
    if (!current.current || saving.current) return;saving.current = true;setBusy(completed);setError(null);
    if (!pending.current) pending.current = { activeSeconds: elapsed.current, version: current.current.version, completed };
    const id = current.current.id;
    try {
      const result = await api(`/study-sessions/${id}`, { method: 'PUT', body: pending.current });pending.current = null;
      if (result.status === 'COMPLETED') accept(null);else { current.current = result;setSession(result); }
      if (completed && result.status !== 'COMPLETED') { saving.current = false;await persist(true); }
    } catch (err) { setError(err);if (err.status === 409 || err.status === 404) { pending.current = null;try { accept(await api('/study-sessions/current')); } catch { /* Keep the error visible. */ } } }
    finally { saving.current = false;setBusy(false); }
  }
  return <section className="study-bar" aria-label="Phiên học chủ động"><div className="study-controls"><Clock3 size={18} />{session ? <><strong>{String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</strong><span>/ {session.plannedMinutes} phút{seconds >= session.plannedMinutes * 60 ? ' · Đã đủ mục tiêu' : ''}</span><button className="button secondary compact" disabled={busy} onClick={() => persist(true)}><Check size={15} />Kết thúc phiên</button></> : <><span>Một phiên học nhỏ</span><select aria-label="Thời lượng phiên học" disabled={busy} value={minutes} onChange={(e) => { setMinutes(Number(e.target.value));startId.current = null; }}><option value={5}>5 phút</option><option value={20}>20 phút</option><option value={30}>30 phút</option></select><button className="button primary compact" disabled={busy} onClick={start}><Play size={14} />Bắt đầu</button></>}</div><ErrorNotice error={error} /></section>;
}
