import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Trash2, ZoomIn } from 'lucide-react';
import { ErrorNotice, Modal } from '../../components/Common';

export function imageUploadEnabled(capabilities) {
  return capabilities?.imageEnabled === true && capabilities?.imageModelConfigured === true
    && ['maxImages', 'maxImageBytes', 'maxTotalImageBytes', 'maxImagePixels'].every((key) => Number.isSafeInteger(capabilities[key]) && capabilities[key] > 0)
    && Array.isArray(capabilities.imageTasks) && capabilities.imageTasks.length > 0;
}
const size = (bytes) => `${Number((bytes / 1024 / 1024).toFixed(2))} MiB`;

function ImagePreview({ file, index, busy, onRemove }) {
  const [url, setUrl] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [zoom, setZoom] = useState(100);
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  return <li className="image-attachment">
    <button type="button" className="image-thumbnail" onClick={() => { setZoom(100); setExpanded(true); }} aria-label={`Phóng to ảnh ${index + 1}: ${file.name}`}><img src={url || undefined} alt={`Ảnh ${index + 1}: ${file.name}`} /><span><ZoomIn size={14} />Xem lớn</span></button>
    <div className="image-file-info"><strong>{index + 1}. {file.name}</strong><small>{size(file.size)}</small></div>
    <button type="button" className="icon-button" disabled={busy} onClick={onRemove} aria-label={`Bỏ ảnh ${index + 1}`}><Trash2 size={16} /></button>
    {expanded && <Modal title={`Ảnh ${index + 1}: ${file.name}`} onClose={() => setExpanded(false)}><div className="image-zoom-controls"><label>Độ phóng đại<select value={zoom} onChange={(event) => setZoom(Number(event.target.value))}>{[50, 100, 150, 200, 300].map((value) => <option key={value} value={value}>{value}%</option>)}</select></label></div><div className="image-zoom-viewport"><img style={{ width: `${zoom}%`, maxWidth: 'none' }} src={url || undefined} alt={`Bản lớn: ${file.name}`} /></div></Modal>}
  </li>;
}

export default function ImageAttachments({ capabilities, loading, files, onChange, busy, available, onReload }) {
  const [error, setError] = useState('');
  const section = useRef(null);
  function add(incoming) {
    if (!available || busy || !incoming.length) return;
    const next = [...files, ...incoming];
    let problem = '';
    if (next.length > capabilities.maxImages) problem = `Chỉ được gửi tối đa ${capabilities.maxImages} ảnh mỗi yêu cầu.`;
    else if (incoming.some((file) => !['image/jpeg', 'image/png'].includes(file.type))) problem = 'Chỉ nhận ảnh JPEG hoặc PNG. Không nhận SVG, GIF, PDF hay đường dẫn ảnh.';
    else if (incoming.some((file) => file.size === 0)) problem = 'Ảnh trống. Hãy chọn lại tệp JPEG hoặc PNG.';
    else if (incoming.some((file) => file.size > capabilities.maxImageBytes)) problem = `Mỗi ảnh không được quá ${size(capabilities.maxImageBytes)}.`;
    else if (next.reduce((total, file) => total + file.size, 0) > capabilities.maxTotalImageBytes) problem = `Tổng ảnh không được quá ${size(capabilities.maxTotalImageBytes)}.`;
    setError(problem);
    if (!problem) onChange(next);
  }
  function paste(event) {
    const incoming = Array.from(event.clipboardData?.items || []).filter((item) => item.kind === 'file').map((item) => item.getAsFile()).filter(Boolean);
    if (incoming.length && available && !busy) { event.preventDefault(); add(incoming); }
  }
  useEffect(() => {
    // Handle image paste throughout this composer, including its question textarea.
    const composer = section.current?.closest('form');
    composer?.addEventListener('paste', paste);
    return () => composer?.removeEventListener('paste', paste);
  });
  return <section ref={section} className="image-upload" aria-label="Ảnh bài tập">
    <div className="image-upload-heading"><h3><ImagePlus size={18} />Học từ ảnh bài tập</h3>{!loading && !available && <button type="button" className="text-link" disabled={busy} onClick={onReload}>Kiểm tra lại</button>}</div>
    {!available && <p className="muted small" role="status">{loading ? 'Đang kiểm tra khả năng đọc ảnh…' : 'Tải ảnh chưa khả dụng: chưa xác nhận được cấu hình và giới hạn đọc ảnh từ máy chủ. Bạn vẫn có thể gửi câu hỏi văn bản.'}</p>}
    <div className={`image-dropzone${!available ? ' unavailable' : ''}`} tabIndex={0} role="group" aria-label="Kéo thả hoặc dán ảnh tại đây" aria-disabled={!available || busy} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); add(Array.from(event.dataTransfer.files)); }}>
      <label>Chọn ảnh JPEG / PNG<input type="file" accept="image/jpeg,image/png" multiple disabled={!available || busy} onChange={(event) => { add(Array.from(event.target.files)); event.target.value = ''; }} /></label>
      <p className="muted small">Chọn nhiều ảnh, kéo thả hoặc nhấn Ctrl+V để dán ảnh. Ảnh được gửi theo thứ tự bên dưới.</p>
      {available && <p className="muted small">Tối đa {capabilities.maxImages} ảnh · {size(capabilities.maxImageBytes)}/ảnh · tổng {size(capabilities.maxTotalImageBytes)} · {capabilities.maxImagePixels.toLocaleString('vi-VN')} điểm ảnh/ảnh (máy chủ kiểm tra).</p>}
    </div>
    <ErrorNotice error={error} />
    {files.length > 0 && <ol className="image-attachments" aria-label="Thứ tự ảnh gửi">{files.map((file, index) => <ImagePreview key={index} file={file} index={index} busy={busy} onRemove={() => { setError(''); onChange(files.filter((_, position) => position !== index)); }} />)}</ol>}
    <p className="privacy-hint">Ảnh gốc không được lưu trong lịch sử hoặc bộ nhớ lưu trữ lâu dài của trình duyệt; ảnh được gửi tới nhà cung cấp AI đã cấu hình. Lịch sử có thể lưu nội dung trích xuất và lời giải. Cần xem lại chi tiết hình ảnh? Hãy đính kèm lại ảnh cho câu hỏi tiếp theo.</p>
  </section>;
}
