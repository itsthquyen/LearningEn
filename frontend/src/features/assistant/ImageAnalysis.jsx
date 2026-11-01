import { Save } from 'lucide-react';

export const imageTasks = [
  { code: 'ANSWER_ONLY', label: 'Chỉ đáp án' },
  { code: 'DETAILED', label: 'Giải chi tiết ABCD' },
  { code: 'HINT', label: 'Gợi ý' },
  { code: 'TRANSLATE', label: 'Dịch đề' },
  { code: 'TRANSCRIBE', label: 'Chép nội dung' },
  { code: 'PRACTICE', label: 'Luyện thêm' },
];
const text = (value) => typeof value === 'string' ? value : '';
const strings = (value) => Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];
const objects = (value) => Array.isArray(value) ? value.filter((item) => item && typeof item === 'object' && !Array.isArray(item)) : [];
const statuses = { ANSWERED: 'Đã phân tích', NEEDS_CLEARER_IMAGE: 'Cần ảnh rõ hơn', NEEDS_CONTEXT: 'Cần thêm ngữ cảnh', NO_ANSWER_REQUESTED: 'Không yêu cầu đáp án' };
const verdicts = { CORRECT: 'Đúng', INCORRECT: 'Sai', UNDETERMINED: 'Chưa xác định' };

export function parseImageAnalysis(content) {
  if (typeof content !== 'string') return null;
  let value;
  try { value = JSON.parse(content); } catch { return null; }
  if (!value || value.kind !== 'IMAGE_ANALYSIS') return null;
  const task = text(value.task);
  const noAnswer = !['ANSWER_ONLY', 'DETAILED', 'PRACTICE'].includes(task);
  return {
    kind: 'IMAGE_ANALYSIS', task, summary: text(value.summary), extractedText: text(value.extractedText), warnings: strings(value.warnings),
    questions: objects(value.questions).map((question) => {
      const serverStatus = Object.hasOwn(statuses, question.status) ? question.status : 'NEEDS_CONTEXT';
      const status = noAnswer && serverStatus === 'ANSWERED' ? 'NO_ANSWER_REQUESTED' : serverStatus;
      return {
        number: text(question.number) || (typeof question.number === 'number' ? String(question.number) : ''),
        prompt: text(question.prompt), status,
        answer: !noAnswer && status === 'ANSWERED' ? text(question.answer) : '',
        explanation: text(question.explanation), translation: text(question.translation),
        options: objects(question.options).map((option) => ({
          label: text(option.label), text: text(option.text), explanation: text(option.explanation),
          verdict: !noAnswer && status === 'ANSWERED' && Object.hasOwn(verdicts, option.verdict) ? option.verdict : 'UNDETERMINED',
        })),
        knowledge: strings(question.knowledge), tips: strings(question.tips),
      };
    }),
    practice: task === 'PRACTICE' ? objects(value.practice).map((item) => ({ prompt: text(item.prompt), answer: text(item.answer), explanation: text(item.explanation) })) : [],
  };
}

export function imageAnalysisText(result, includePracticeAnswers = false) {
  return [
    imageTasks.find((task) => task.code === result.task)?.label, result.summary,
    ...result.warnings.map((warning) => `Lưu ý: ${warning}`),
    result.extractedText && `Nội dung đọc từ ảnh:\n${result.extractedText}`,
    ...result.questions.map((question) => [
      `Câu ${question.number}: ${question.prompt}`, statuses[question.status],
      question.answer && `Đáp án AI đề xuất: ${question.answer}`, question.explanation,
      ...question.options.map((option) => `${option.label}. ${option.text} - ${verdicts[option.verdict]}${option.explanation ? `: ${option.explanation}` : ''}`),
      question.translation && `Bản dịch: ${question.translation}`,
      ...question.knowledge.map((item) => `Kiến thức: ${item}`), ...question.tips.map((item) => `Mẹo: ${item}`),
    ].filter(Boolean).join('\n')),
    ...result.practice.map((item) => `Luyện tập: ${item.prompt}${includePracticeAnswers ? `\n${item.answer}\n${item.explanation}` : '\n(Đáp án ẩn, mở trong ứng dụng)'}`),
  ].filter(Boolean).join('\n\n');
}

function notebookQuestion(question) {
  return {
    expression: question.prompt.slice(0, 500),
    meaning: [question.answer && `Đáp án AI đề xuất: ${question.answer}`, question.explanation, question.translation, ...question.knowledge].filter(Boolean).join('\n').slice(0, 2000),
    context: question.prompt.slice(0, 4000),
    notes: ['AI tạo - cần kiểm tra', ...question.tips].join('\n').slice(0, 8000), reviewEnabled: false,
  };
}

export default function ImageAnalysis({ result, onSave }) {
  return <div className="image-analysis">
    <p className="image-analysis-task">{imageTasks.find((task) => task.code === result.task)?.label || 'Phân tích ảnh'}</p>
    {result.summary && <p className="preserve-space">{result.summary}</p>}
    {result.warnings.length > 0 && <section className="image-warnings" aria-label="Lưu ý từ phân tích"><h3>Cần lưu ý</h3><ul>{result.warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul></section>}
    {result.extractedText && <details><summary>Nội dung đọc từ ảnh</summary><p className="preserve-space">{result.extractedText}</p></details>}
    {result.questions.map((question, index) => <section className="image-question" key={index} aria-label={`Câu ${question.number || index + 1}`}>
      <div className="image-question-heading"><h3>Câu {question.number || index + 1}</h3><span className={`image-question-status status-${question.status}`}>{statuses[question.status]}</span></div>
      {question.prompt && <p className="preserve-space">{question.prompt}</p>}
      {question.answer && <p className="image-answer"><strong>Đáp án AI đề xuất: {question.answer}</strong></p>}
      {question.explanation && <p className="preserve-space">{question.explanation}</p>}
      {question.options.length > 0 && <ul className="image-options">{question.options.map((option, optionIndex) => <li key={optionIndex} className={`verdict-${option.verdict}`}><div><strong>{option.label}. {option.text}</strong><span>{verdicts[option.verdict]}</span></div>{option.explanation && <p className="preserve-space">{option.explanation}</p>}</li>)}</ul>}
      {question.translation && <section><h4>Bản dịch</h4><p className="preserve-space">{question.translation}</p></section>}
      {question.knowledge.length > 0 && <section><h4>Kiến thức cần nhớ</h4><ul>{question.knowledge.map((item, itemIndex) => <li key={itemIndex}>{item}{onSave && <button type="button" className="text-link" aria-label={`Lưu kiến thức ${itemIndex + 1} của câu ${question.number || index + 1}`} onClick={() => onSave({ ...notebookQuestion(question), expression: item.slice(0, 500), meaning: item.slice(0, 2000) })}><Save size={14} />Lưu kiến thức</button>}</li>)}</ul></section>}
      {question.tips.length > 0 && <section><h4>Mẹo làm bài</h4><ul>{question.tips.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}</ul></section>}
      {onSave && <button type="button" className="text-link" onClick={() => onSave(notebookQuestion(question))}><Save size={14} />Lưu câu {question.number || index + 1} vào sổ tay</button>}
    </section>)}
    {result.practice.length > 0 && <section className="image-practice"><h3>Tự luyện thêm</h3>{result.practice.map((item, index) => <div key={index}><p className="preserve-space">{item.prompt}</p><details><summary>Xem đáp án luyện tập {index + 1}</summary><p className="preserve-space">{item.answer}</p><p className="preserve-space">{item.explanation}</p></details></div>)}</section>}
    <p className="muted small">AI có thể đọc sai ảnh hoặc giải sai. Hãy kiểm tra đề, lựa chọn và lời giải trước khi ghi nhớ.</p>
  </div>;
}
