import { useEffect, useState } from 'react';
import { NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, BookOpen, ChartNoAxesCombined, CircleHelp, Home, LogOut, MessageSquareText, RotateCcw, Settings, ShieldCheck, Sprout } from 'lucide-react';
import { api } from './services/api';
import { Brand, ErrorNotice, Loading } from './components/Common';
import Dashboard from './pages/Dashboard';
import Assistant from './pages/Assistant';
import Notebook from './pages/Notebook';
import Reviews from './pages/Reviews';
import Progress from './pages/Progress';
import Preferences from './pages/Preferences';
import Lesson from './pages/Lesson';
import B1Exam from './pages/B1Exam';
import StudyBar from './features/study/StudyBar';

const navigation = [
  { to: '/', label: 'Hôm nay', icon: Home },
  { to: '/assistant', label: 'Hỏi & Dịch', icon: MessageSquareText },
  { to: '/notebook', label: 'Sổ tay của tôi', icon: BookOpen },
  { to: '/reviews', label: 'Ôn tập', icon: RotateCcw },
  { to: '/progress', label: 'Lộ trình & Tiến bộ', icon: ChartNoAxesCombined },
  { to: '/b1-exam', label: 'Bộ đề B1', icon: BookOpen },
];

function Login({ onLogin }) {
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setBusy(true); setError(null);
    const data = new FormData(event.currentTarget);
    try {
      const profile = await api('/auth/login', { method: 'POST', body: { email: data.get('email'), password: data.get('password') } });
      await api('/auth/csrf');
      onLogin(profile);
    } catch (err) { setError(err); } finally { setBusy(false); }
  }
  return <main className="login-layout"><section className="login-story"><Brand /><div><span className="pill">KHÔNG CHỈ TRA NGHĨA</span><h1>Hiểu hôm nay.<br />Nhớ ngày mai.<br /><em>Dùng được mỗi ngày.</em></h1><p>Một góc nhỏ để bạn hỏi, lưu lại điều hay và xây dựng tiếng Anh theo nhịp của riêng mình.</p><div className="story-line"><Sprout size={22} />Mỗi ngày một chút, rồi sẽ đi thật xa.</div></div><small>LearningEN · Không gian học tập cá nhân</small></section><section className="login-form"><div className="mobile-brand"><Brand /></div><span className="eyebrow">CHÀO MỪNG TRỞ LẠI</span><h2>Tiếp tục hành trình của bạn.</h2><p>Đăng nhập vào không gian học tập riêng.</p><form onSubmit={submit}><ErrorNotice error={error} /><label>Email<input name="email" type="email" autoComplete="username" required placeholder="Email tài khoản của bạn" /></label><label>Mật khẩu<input name="password" type="password" autoComplete="current-password" required placeholder="Nhập mật khẩu" /></label><button className="button primary full" disabled={busy}>{busy ? 'Đang đăng nhập…' : 'Vào góc học của tôi'}<ArrowUpRight size={18} /></button></form><div className="login-note"><ShieldCheck size={19} /><span>Chỉ tài khoản cá nhân được cấu hình trên máy chủ mới có thể đăng nhập. Không mở đăng ký công khai.</span></div></section></main>;
}

export default function App() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialError, setInitialError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    let active = true;
    api('/auth/me').then((data) => { if (active) setProfile(data); }).catch((error) => { if (active && error.status !== 401) setInitialError(error); }).finally(() => { if (active) setLoading(false); });
    const expire = () => { setProfile(null); navigate('/'); };
    window.addEventListener('session-expired', expire);
    return () => { active = false; window.removeEventListener('session-expired', expire); };
  }, [navigate]);
  async function logout() {
    try { await api('/auth/logout', { method: 'POST' }); setProfile(null); navigate('/'); }
    catch (error) { window.alert(error.message); }
  }
  if (loading) return <Loading text="Đang mở góc học của bạn…" />;
  if (!profile) return <><ErrorNotice error={initialError} /><Login onLogin={setProfile} /></>;
  return <div className="app-layout"><aside className="sidebar"><Brand /><div className="nav-label">GÓC HỌC TẬP</div><nav aria-label="Điều hướng chính">{navigation.map(({ to, label, icon: Icon }) => <NavLink end={to === '/'} key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><Icon size={20} /><span>{label}</span></NavLink>)}</nav><div className="sidebar-bottom"><div className="sidebar-note"><Sprout size={25} /><strong>Chậm mà chắc.</strong><p>Không cần hoàn hảo.<br />Chỉ cần tiếp tục.</p></div><NavLink className="nav-item" to="/settings"><Settings size={19} /><span>Cài đặt & Dữ liệu</span></NavLink><button className="nav-item logout" onClick={logout}><LogOut size={18} /><span>Đăng xuất</span></button></div></aside><div className="main-layout"><header className="topbar"><span className="topbar-label">Không gian học tập của bạn</span><div className="topbar-right"><span className="private-badge"><ShieldCheck size={15} />Riêng tư & cá nhân</span><NavLink to="/settings" className="profile-link"><span className="avatar">{(profile.displayName || profile.email || 'L').slice(0, 1).toUpperCase()}</span><span>{profile.displayName || profile.email}</span></NavLink></div></header><main className="content"><div hidden={location.pathname === '/b1-exam'}><StudyBar /></div><Routes><Route path="/" element={<Dashboard profile={profile} />} /><Route path="/assistant" element={<Assistant />} /><Route path="/notebook" element={<Notebook />} /><Route path="/reviews" element={<Reviews />} /><Route path="/progress" element={<Progress />} /><Route path="/lessons/:id" element={<Lesson />} /><Route path="/b1-exam" element={<B1Exam />} /><Route path="/settings" element={<Preferences profile={profile} onUpdate={setProfile} />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes><footer className="page-footer"><span>LearningEN · Học theo nhịp của bạn</span><span><CircleHelp size={14} />Hiểu thật. Nhớ lâu. Dùng được.</span></footer></main></div></div>;
}
