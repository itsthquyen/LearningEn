import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import { spawn, spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
fs.mkdirSync(path.join(root,'work/e2e'),{recursive:true});
const children=[];const streams=[];
async function port() { const socket=net.createServer();await new Promise(resolve=>socket.listen(0,'127.0.0.1',resolve));const value=socket.address().port;await new Promise(resolve=>socket.close(resolve));return value; }
function start(command,args,cwd,env,name) {
  const stream=fs.createWriteStream(path.join(root,`work/e2e/${name}.log`));streams.push(stream);
  const child=spawn(command,args,{cwd,env:{...process.env,...env},windowsHide:true,stdio:['ignore','pipe','pipe']});child.stdout.pipe(stream);child.stderr.pipe(stream);children.push(child);return child;
}
async function ready(url,child) { for(let i=0;i<90;i++) { if(child.exitCode!==null)throw new Error(`Service exited ${child.exitCode}: ${url}`);try { const response=await fetch(url);if(response.status<500)return; } catch {}await new Promise(resolve=>setTimeout(resolve,500)); }throw new Error(`Service did not become ready: ${url}`); }
const provider=http.createServer((req,res)=>{req.resume();req.on('end',()=>{res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({choices:[{message:{content:'Tôi mong nhận được phản hồi từ bạn.'}}],usage:{prompt_tokens:100,completion_tokens:25}}));});});
try {
  await new Promise(resolve=>provider.listen(0,'127.0.0.1',resolve));const backendPort=await port(),frontendPort=await port();
  const email='e2e@example.test',password=randomUUID();
  const backend=start('java',['-jar',path.join(root,'backend/target/learningen-backend-0.0.1-SNAPSHOT.jar'),'--spring.profiles.active=dev','--spring.datasource.url=jdbc:h2:mem:e2e;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1'],root,{BOOTSTRAP_EMAIL:email,BOOTSTRAP_PASSWORD:password,BACKEND_PORT:String(backendPort),COOKIE_SECURE:'false',CORS_ORIGINS:`http://127.0.0.1:${frontendPort}`,AI_BASE_URL:`http://127.0.0.1:${provider.address().port}/v1`,AI_API_KEY:'isolated-test-only',AI_MODEL:'isolated-test-provider',AI_DAILY_REQUESTS:'100'},'backend');
  await ready(`http://127.0.0.1:${backendPort}/api/v1/auth/csrf`,backend);
  const frontend=start(process.execPath,[path.join(root,'frontend/node_modules/vite/bin/vite.js'),'--host','127.0.0.1','--strictPort'],path.join(root,'frontend'),{FRONTEND_PORT:String(frontendPort),BACKEND_URL:`http://127.0.0.1:${backendPort}`},'frontend');
  await ready(`http://127.0.0.1:${frontendPort}`,frontend);
  const runner=spawn(process.execPath,[path.join(root,'frontend/node_modules/@playwright/test/cli.js'),'test'],{cwd:path.join(root,'frontend'),env:{...process.env,E2E_FRONTEND_URL:`http://127.0.0.1:${frontendPort}`,E2E_EMAIL:email,E2E_PASSWORD:password},windowsHide:true,stdio:'inherit'});
  const code=await new Promise((resolve,reject)=>{runner.once('error',reject);runner.once('exit',resolve);});process.exitCode=code||0;
} catch(error) { console.error(error.message);process.exitCode=1; }
finally {
  for(const child of children) if(child.exitCode===null) {
    if(process.platform==='win32') spawnSync('taskkill.exe',['/PID',String(child.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'});
    else child.kill();
    child.stdout?.destroy();child.stderr?.destroy();
  }
  provider.closeAllConnections();provider.close();for(const stream of streams)stream.end();
}
