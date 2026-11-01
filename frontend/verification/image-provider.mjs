import http from 'node:http';

// Isolated protocol fixture, never imported by application runtime.
let failedRetryFixture = false;
const server = http.createServer((request, response) => {
  if (request.url === '/health') { response.writeHead(200); response.end('ready'); return; }
  let body = '';
  request.on('data', (chunk) => { body += chunk; });
  request.on('end', () => {
    try {
      const payload = JSON.parse(body);
      const parts = payload.messages.at(-1).content;
      if (!Array.isArray(parts) || !parts.some((part) => part.type === 'image_url' && /^data:image\/(png|jpeg);base64,/.test(part.image_url.url))) {
        response.writeHead(400); response.end('actual image required'); return;
      }
      if (parts[0].text.includes('retry protocol once') && !failedRetryFixture) {
        failedRetryFixture = true;
        response.writeHead(503); response.end('isolated one-time upstream failure'); return;
      }
      const task = JSON.parse(payload.messages[0].content.match(/"task":"([A-Z_]+)"/)[0].replace('"task":', ''));
      const answering = ['ANSWER_ONLY', 'DETAILED', 'PRACTICE'].includes(task);
      const detailed = task !== 'ANSWER_ONLY';
      const content = {
        kind: 'IMAGE_ANALYSIS', task, summary: answering ? '1. B. goes' : 'Gợi ý: chú ý chủ ngữ số ít.',
        extractedText: '1. She ___ to school every day. A. go B. goes C. going D. gone', warnings: [],
        questions: [{ number: '1', prompt: 'She ___ to school every day.', status: answering ? 'ANSWERED' : 'NO_ANSWER_REQUESTED',
          answer: answering ? 'B. goes' : null, explanation: detailed ? 'Thì hiện tại đơn, chủ ngữ She dùng động từ thêm -s.' : '',
          translation: detailed && task !== 'HINT' ? 'Cô ấy đi học mỗi ngày.' : '',
          options: task === 'HINT' || !detailed ? [] : [
            { label: 'A', text: 'go', verdict: answering ? 'INCORRECT' : 'UNDETERMINED', explanation: 'Dạng nguyên mẫu không phù hợp chủ ngữ này.' },
            { label: 'B', text: 'goes', verdict: answering ? 'CORRECT' : 'UNDETERMINED', explanation: 'Phù hợp ngôi thứ ba số ít.' },
            { label: 'C', text: 'going', verdict: answering ? 'INCORRECT' : 'UNDETERMINED', explanation: 'Thiếu trợ động từ.' },
            { label: 'D', text: 'gone', verdict: answering ? 'INCORRECT' : 'UNDETERMINED', explanation: 'Không phải dạng hiện tại đơn.' },
          ], knowledge: detailed ? ['Hiện tại đơn với he/she/it: động từ thêm -s/-es.'] : [], tips: detailed ? ['Nhận biết every day.'] : [] }],
        practice: task === 'PRACTICE' ? [{ prompt: 'He ___ home every evening. (walk/walks)', answer: 'walks', explanation: 'Ngôi thứ ba số ít.' }] : [],
      };
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(content) } }], usage: { prompt_tokens: 500, completion_tokens: 600 } }));
    } catch {
      response.writeHead(400); response.end('invalid fixture request');
    }
  });
});
server.listen(Number(process.env.VERIFY_PROVIDER_PORT || 15181), '127.0.0.1');
process.on('SIGTERM', () => server.close());
