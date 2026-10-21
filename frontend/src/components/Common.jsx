import { AlertCircle, ArrowRight, LoaderCircle, Sprout, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Brand() {
  return <Link className="brand" to="/" aria-label="LearningEN - Trang chủ"><span className="brand-mark"><Sprout size={25} /></span><span>Learning<span className="brand-accent">EN</span><small>MỖI NGÀY, MỘT CHÚT TIẾN BỘ</small></span></Link>;
}

export function Loading({ text = 'Đang tải dữ liệu…' }) {
  return <div className="loading" role="status"><LoaderCircle className="spin" size={22} />{text}</div>;
}

export function ErrorNotice({ error }) {
  if (!error) return null;
  return <div className="notice error" role="alert"><AlertCircle size={19} /><span>{typeof error === 'string' ? error : error.message}</span></div>;
}

export function EmptyState({ icon: Icon = Sprout, title, children, action, to }) {
  return <div className="empty-state"><span className="empty-icon"><Icon size={30} /></span><h3>{title}</h3><p>{children}</p>{to && <Link className="button primary" to={to}>{action}<ArrowRight size={16} /></Link>}</div>;
}

export function PageHeading({ eyebrow, title, children, action }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{children && <p>{children}</p>}</div>{action}</div>;
}

export function Modal({ title, onClose, children }) {
  return <div className="modal-backdrop" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="modal" role="dialog" aria-modal="true" aria-label={title} onKeyDown={(event) => { if (event.key === 'Escape') onClose(); }}><header><h2>{title}</h2><button autoFocus className="icon-button" onClick={onClose} aria-label="Đóng"><X size={21} /></button></header>{children}</section></div>;
}
