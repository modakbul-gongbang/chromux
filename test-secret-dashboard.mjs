#!/usr/bin/env node
// Automated behavior suite (V2) for the secret-store DASHBOARD/APP surface —
// the opt-in add-on layered over the CLI-only base store (test-secret.mjs).
// No real Chrome, no real Bitwarden, no real biometrics/Hello/TTY: `bw` is the
// mock (test/mock-bin/bw), and the presence-proof providers run through their
// env-gated test hooks (CHROMUX_SECRET_TEST_PROOF, CHROMUX_HELLO_MOCK,
// app-proof stdin handshake). Covers the secret-agent v2 ops, the tiered
// /api/secrets/* boundary, the master-password no-residue exception, the
// expose per-action re-proof (incl. the simulated CDP-cookie attack), opt-in
// dormancy, the Windows Hello provider states, and the setup wizard.
//
// Usage: node test-secret-dashboard.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import http from 'node:http';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CHROMUX = path.join(HERE, 'chromux.mjs');
const MOCK_BIN = path.join(HERE, 'test', 'mock-bin');
const MOCK_BW = path.join(MOCK_BIN, 'bw');

let PASS = 0, FAIL = 0;
function check(desc, cond) { if (cond) { console.log(`  ✓ ${desc}`); PASS++; } else { console.log(`  ✗ ${desc}`); FAIL++; } }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ---------- helpers ----------
function agentReq(sock, op, payload = {}, timeoutMs = 2000) {
  return new Promise((resolve) => {
    let settled = false; const finish = (r) => { if (!settled) { settled = true; resolve(r); } };
    let s; try { s = net.createConnection(sock); } catch { finish({ ok: false, reason: 'not-running' }); return; }
    const timer = setTimeout(() => { try { s.destroy(); } catch {} finish({ ok: false, reason: 'timeout' }); }, timeoutMs);
    let buf = '';
    s.on('connect', () => s.write(JSON.stringify({ op, ...payload }) + '\n'));
    s.on('data', (c) => { buf += c; const i = buf.indexOf('\n'); if (i === -1) return; clearTimeout(timer); try { finish(JSON.parse(buf.slice(0, i))); } catch { finish({ ok: false }); } try { s.destroy(); } catch {} });
    s.on('error', () => { clearTimeout(timer); finish({ ok: false, reason: 'not-running' }); });
  });
}
async function spawnAgent(env) {
  const sock = path.join(env.CHROMUX_HOME, 'run', 'secret-agent.sock');
  const c = spawn('node', [CHROMUX, '--secret-agent'], { env, detached: true, stdio: 'ignore' });
  c.unref();
  for (let i = 0; i < 30; i++) { await sleep(100); if ((await agentReq(sock, 'status', {}, 400)).ok) return sock; }
  return null;
}
function reqHttp(port, method, pathname, { headers = {}, body } = {}) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const h = { ...headers }; // the secret header is added explicitly via HDR() so negative tests can omit it
    if (data) h['Content-Type'] = 'application/json';
    const r = http.request({ host: '127.0.0.1', port, method, path: pathname, headers: h }, (res) => {
      let buf = ''; res.on('data', c => buf += c); res.on('end', () => { let j = null; try { j = JSON.parse(buf); } catch {} resolve({ status: res.statusCode, json: j, headers: res.headers, raw: buf }); });
    });
    r.on('error', () => resolve({ status: 0, json: null, raw: '' }));
    if (data) r.write(data); r.end();
  });
}
const HDR = (extra = {}) => ({ 'X-Chromux-Secret': '1', ...extra });
async function startApp(env, extraArgs = [], stdinKey = null) {
  const child = spawn('node', [CHROMUX, 'app', '--host', '127.0.0.1', '--port', '0', ...extraArgs], { env, stdio: ['pipe', 'pipe', 'ignore'] });
  if (stdinKey) child.stdin.write(stdinKey + '\n');
  let port = 0;
  await new Promise((resolve) => { child.stdout.on('data', c => { const m = String(c).match(/127\.0\.0\.1:(\d+)/); if (m) { port = Number(m[1]); resolve(); } }); setTimeout(resolve, 4000); });
  return { child, port };
}
function walkForString(dir, needle) {
  let found = false;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isSocket()) continue;
    if (e.isDirectory()) { if (walkForString(full, needle)) found = true; continue; }
    try { if (fs.readFileSync(full, 'utf8').includes(needle)) { found = true; console.log(`    (leak: ${full})`); } } catch {}
  }
  return found;
}

async function main() {
  console.log('=== chromux secret dashboard/app: automated behavior suite ===');
  const workRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'chromux-secret-dash-'));

  // ============================================================
  // A. secret-agent v2 ops (edit sessions, approvals, consents, lifecycle)
  // ============================================================
  console.log('\n-- A. secret-agent edit-session / approval / consent ops --');
  {
    const home = path.join(workRoot, 'A'); fs.mkdirSync(home, { recursive: true });
    const env = { ...process.env, CHROMUX_HOME: home }; delete env.CHROMUX_PROFILE;
    const sock = await spawnAgent(env);
    check('agent spawns', !!sock);
    const mint = await agentReq(sock, 'mint-session', { ttlMs: 5000 });
    check('mint-session returns a token', mint.ok && typeof mint.token === 'string' && mint.token.length > 20);
    check('validate-session valid for a minted token', (await agentReq(sock, 'validate-session', { token: mint.token })).valid === true);
    check('validate-session rejects an unknown token', (await agentReq(sock, 'validate-session', { token: 'x' })).valid === false);
    check('status shows editSessions>0 while vault locked', (await agentReq(sock, 'status')).editSessions === 1);
    await agentReq(sock, 'revoke-session', { token: mint.token });
    check('validate-session invalid after revoke', (await agentReq(sock, 'validate-session', { token: mint.token })).valid === false);
    await sleep(120);
    check('agent exits when nothing is held', (await agentReq(sock, 'status', {}, 300)).ok === false);

    const sock2 = await spawnAgent(env);
    check('register-approval ok', (await agentReq(sock2, 'register-approval', { token: 'APPROVE-1', ttlMs: 5000 })).ok);
    const ex = await agentReq(sock2, 'exchange-approval', { token: 'APPROVE-1', sessionTtlMs: 5000 });
    check('exchange-approval mints a session', ex.ok && typeof ex.token === 'string');
    check('launch-token is single-use (re-exchange rejected)', (await agentReq(sock2, 'exchange-approval', { token: 'APPROVE-1' })).ok === false);
    const con = await agentReq(sock2, 'mint-consent', { action: 'reveal', host: 'github.com', ttlMs: 5000 });
    check('mint-consent returns a token', con.ok && typeof con.token === 'string');
    check('consume-consent rejects an action mismatch', (await agentReq(sock2, 'consume-consent', { token: con.token, action: 'totp', host: 'github.com' })).reason === 'consent-mismatch');
    check('consume-consent accepts a matching action', (await agentReq(sock2, 'consume-consent', { token: con.token, action: 'reveal', host: 'github.com' })).ok === true);
    check('consent is single-use', (await agentReq(sock2, 'consume-consent', { token: con.token, action: 'reveal', host: 'github.com' })).ok === false);
    await agentReq(sock2, 'lock'); await sleep(120);
    check('lock ends everything and the agent exits', (await agentReq(sock2, 'status', {}, 300)).ok === false);

    const approveNoTty = spawnSync('node', [CHROMUX, 'secret', 'approve'], { env, encoding: 'utf8', input: '' });
    check('secret approve without a TTY refuses', approveNoTty.status === 1 && /terminal/.test(approveNoTty.stderr));
  }

  // ============================================================
  // B. /api/secrets/* boundary, expose re-proof, no-residue
  // ============================================================
  console.log('\n-- B. /api/secrets/* tiers, expose re-proof, no-residue --');
  {
    const home = path.join(workRoot, 'B'); fs.mkdirSync(home, { recursive: true });
    const vault = path.join(workRoot, 'B-vault.json');
    fs.writeFileSync(vault, JSON.stringify({ items: [{ id: 'g1', name: 'chromux/global/github.com', login: { username: 'gh', password: 'SECRET-PW-B', uris: [{ uri: 'https://github.com' }] } }] }));
    const MASTER = 'MasterPW-no-leak-B';
    const env = { ...process.env, PATH: `${MOCK_BIN}:${process.env.PATH}`, CHROMUX_HOME: home, MOCK_BW_VAULT_FILE: vault, CHROMUX_SECRET_TEST_PROOF: '1' };
    delete env.CHROMUX_PROFILE;
    const { child, port } = await startApp(env);
    check('status app started', port > 0);

    check('missing X-Chromux-Secret header -> 403', (await reqHttp(port, 'GET', '/api/secrets/state', {})).status === 403);
    check('non-loopback Origin -> 403', (await reqHttp(port, 'GET', '/api/secrets/state', { headers: HDR({ Origin: 'https://evil.com' }) })).status === 403);
    check('loopback Origin + header -> ok', (await reqHttp(port, 'GET', '/api/secrets/state', { headers: HDR({ Origin: `http://127.0.0.1:${port}` }) })).status === 200);
    check('unknown /api/secrets route fails closed (403 untiered)', (await reqHttp(port, 'POST', '/api/secrets/nope', { headers: HDR(), body: {} })).json?.secret === 'untiered');
    check('manage without a session -> 403 no-session', (await reqHttp(port, 'POST', '/api/secrets/optin', { headers: HDR(), body: { enabled: true } })).json?.secret === 'no-session');

    const begin = await reqHttp(port, 'POST', '/api/secrets/session/begin', { headers: HDR(), body: { proof: 'test' } });
    const setCookie = begin.headers['set-cookie']?.[0] || '';
    check('session/begin (test) sets an httpOnly SameSite=Strict cookie', /HttpOnly/i.test(setCookie) && /SameSite=Strict/i.test(setCookie));
    const cookie = setCookie.split(';')[0];

    check('unlock (master password) succeeds', (await reqHttp(port, 'POST', '/api/secrets/unlock', { headers: HDR({ Cookie: cookie }), body: { masterPassword: MASTER } })).json?.unlocked === true);
    const list = await reqHttp(port, 'GET', '/api/secrets/list', { headers: HDR() });
    check('observe list shows host+scope, never values', list.json?.items?.[0]?.host === 'github.com' && !list.raw.includes('SECRET-PW-B'));

    check('reveal WITHOUT a fresh consent -> 403 consent-required', (await reqHttp(port, 'POST', '/api/secrets/reveal', { headers: HDR({ Cookie: cookie }), body: { host: 'github.com', field: 'password' } })).json?.secret === 'consent-required');
    const consent = await reqHttp(port, 'POST', '/api/secrets/consent/begin', { headers: HDR({ Cookie: cookie }), body: { proof: 'test', action: 'reveal', host: 'github.com' } });
    check('reveal WITH a fresh consent returns the value', (await reqHttp(port, 'POST', '/api/secrets/reveal', { headers: HDR({ Cookie: cookie }), body: { host: 'github.com', field: 'password', consent: consent.json.consent } })).json?.value === 'SECRET-PW-B');
    check('the CDP-agent attack (cookie+header, no fresh consent) is denied', (await reqHttp(port, 'POST', '/api/secrets/reveal', { headers: HDR({ Cookie: cookie }), body: { host: 'github.com', field: 'password' } })).json?.secret === 'consent-required');

    check('master password appears in NO file under CHROMUX_HOME (no-residue)', !walkForString(home, MASTER));
    const hist = await reqHttp(port, 'GET', '/api/secrets/history', { headers: HDR() });
    check('history shows a secret-resolve event with no value', hist.json?.events?.some(e => e.host === 'github.com') && !hist.raw.includes('SECRET-PW-B'));

    // AC3/AC5: register + delete round-trip through the panel endpoints under a
    // manage session, resolvable via the SAME shared resolver `fill --secret`
    // uses, and manage refused again once the session is revoked.
    check('register a credential via /api/secrets/set (manage)', (await reqHttp(port, 'POST', '/api/secrets/set', { headers: HDR({ Cookie: cookie }), body: { host: 'example.org', user: 'ex-user', password: 'ex-pw-B', scope: 'global' } })).json?.ok === true);
    const getReg = spawnSync('node', [CHROMUX, 'secret', 'get', 'example.org'], { env, encoding: 'utf8' });
    let getRegJson = null; try { getRegJson = JSON.parse(getReg.stdout); } catch {}
    check('a panel-registered credential resolves via the shared resolver (the fill --secret path)', getRegJson?.ok === true && getRegJson?.username === 'ex-user' && getRegJson?.host === 'example.org');
    check('delete a credential via /api/secrets/rm (manage)', (await reqHttp(port, 'POST', '/api/secrets/rm', { headers: HDR({ Cookie: cookie }), body: { host: 'example.org', scope: 'global' } })).json?.removed === true);
    const getGone = spawnSync('node', [CHROMUX, 'secret', 'get', 'example.org'], { env, encoding: 'utf8' });
    let goneJson = null; try { goneJson = JSON.parse(getGone.stdout); } catch {}
    check('after delete the credential no longer resolves (delete round-trip)', goneJson?.ok === false && goneJson?.secret === 'not-found');
    check('session/revoke clears the edit session', (await reqHttp(port, 'POST', '/api/secrets/session/revoke', { headers: HDR({ Cookie: cookie }) })).json?.revoked === true);
    check('after revoke, manage set is refused again (403 no-session)', (await reqHttp(port, 'POST', '/api/secrets/set', { headers: HDR({ Cookie: cookie }), body: { host: 'example.org', user: 'x', password: 'y' } })).status === 403);
    child.kill(); await sleep(120);

    // test-hook inertness
    const envNoProof = { ...env }; delete envNoProof.CHROMUX_SECRET_TEST_PROOF;
    const app2 = await startApp(envNoProof);
    check('test proof hook is INERT without its env var', (await reqHttp(app2.port, 'POST', '/api/secrets/session/begin', { headers: HDR(), body: { proof: 'test' } })).json?.secret === 'consent-unavailable');
    app2.child.kill(); await sleep(120);

    // native-macOS app-proof handshake
    const appKey = 'appkey-' + crypto.randomBytes(6).toString('hex');
    const app3 = await startApp(env, ['--app-proof-stdin'], appKey);
    check('native-macos WITHOUT the app-proof key -> unavailable', (await reqHttp(app3.port, 'POST', '/api/secrets/session/begin', { headers: HDR(), body: { proof: 'native-macos' } })).json?.ok === false);
    const nativeOk = await reqHttp(app3.port, 'POST', '/api/secrets/session/begin', { headers: HDR({ 'X-Chromux-App-Proof': appKey }), body: { proof: 'native-macos' } });
    check('native-macos WITH the app-proof key mints a session', nativeOk.json?.ok === true && typeof nativeOk.json?.token === 'string');
    check('native-macos session carries NO cookie (auth-header only)', !nativeOk.headers['set-cookie']);
    check('native-macos token works as an auth header', (await reqHttp(app3.port, 'POST', '/api/secrets/optin', { headers: HDR({ 'X-Chromux-Secret-Session': nativeOk.json.token }), body: { enabled: true } })).json?.ok === true);
    app3.child.kill(); await sleep(120);
  }

  // ============================================================
  // C. Windows Hello provider states (mocked PowerShell)
  // ============================================================
  console.log('\n-- C. Windows Hello provider states (mocked) --');
  {
    const home = path.join(workRoot, 'C'); fs.mkdirSync(home, { recursive: true });
    const base = { ...process.env, PATH: `${MOCK_BIN}:${process.env.PATH}`, CHROMUX_HOME: home, MOCK_BW_VAULT_FILE: path.join(workRoot, 'C-vault.json') };
    fs.writeFileSync(base.MOCK_BW_VAULT_FILE, JSON.stringify({ items: [] }));
    delete base.CHROMUX_PROFILE;
    const approve = await startApp({ ...base, CHROMUX_HELLO_MOCK: 'approve' });
    check('Hello approve -> session minted', (await reqHttp(approve.port, 'POST', '/api/secrets/session/begin', { headers: HDR(), body: { proof: 'windows-hello' } })).json?.ok === true);
    approve.child.kill(); await sleep(100);
    const deny = await startApp({ ...base, CHROMUX_HELLO_MOCK: 'deny' });
    check('Hello deny -> consent-denied', (await reqHttp(deny.port, 'POST', '/api/secrets/session/begin', { headers: HDR(), body: { proof: 'windows-hello' } })).json?.secret === 'consent-denied');
    deny.child.kill(); await sleep(100);
    const unavail = await startApp({ ...base, CHROMUX_HELLO_MOCK: 'unavailable' });
    check('Hello unavailable -> consent-unavailable (fallback hint)', (await reqHttp(unavail.port, 'POST', '/api/secrets/session/begin', { headers: HDR(), body: { proof: 'windows-hello' } })).json?.secret === 'consent-unavailable');
    unavail.child.kill(); await sleep(100);
  }

  // ============================================================
  // D. opt-in dormancy + CLI parity
  // ============================================================
  console.log('\n-- D. opt-in dormancy + CLI --');
  {
    const home = path.join(workRoot, 'D'); fs.mkdirSync(home, { recursive: true });
    const env = { ...process.env, PATH: `${MOCK_BIN}:${process.env.PATH}`, CHROMUX_HOME: home, MOCK_BW_VAULT_FILE: path.join(workRoot, 'D-vault.json'), CHROMUX_SECRET_TEST_PROOF: '1' };
    fs.writeFileSync(env.MOCK_BW_VAULT_FILE, JSON.stringify({ items: [] }));
    delete env.CHROMUX_PROFILE;
    const { child, port } = await startApp(env);
    const state0 = await reqHttp(port, 'GET', '/api/secrets/state', { headers: HDR() });
    check('fresh state: optedIn=false (surface dormant)', state0.json?.optedIn === false);
    // opt in requires a session (deliberate human action)
    const begin = await reqHttp(port, 'POST', '/api/secrets/session/begin', { headers: HDR(), body: { proof: 'test' } });
    const cookie = (begin.headers['set-cookie']?.[0] || '').split(';')[0];
    check('optin flips the flag', (await reqHttp(port, 'POST', '/api/secrets/optin', { headers: HDR({ Cookie: cookie }), body: { enabled: true } })).json?.optedIn === true);
    check('state now optedIn=true', (await reqHttp(port, 'GET', '/api/secrets/state', { headers: HDR() })).json?.optedIn === true);
    check('optout flips it back', (await reqHttp(port, 'POST', '/api/secrets/optin', { headers: HDR({ Cookie: cookie }), body: { enabled: false } })).json?.optedIn === false);
    child.kill(); await sleep(100);

    // CLI parity for opt-in and history-while-locked
    const optinCli = spawnSync('node', [CHROMUX, 'secret', 'optin'], { env, encoding: 'utf8' });
    check('CLI secret optin works', JSON.parse(optinCli.stdout).optedIn === true);
    const histLocked = spawnSync('node', [CHROMUX, 'secret', 'list', '--history', '--json'], { env, encoding: 'utf8' });
    check('CLI secret list --history works while locked (no unlock)', histLocked.status === 0 && JSON.parse(histLocked.stdout).ok === true);
  }

  // ============================================================
  // E. setup wizard (deterministic PATH: no host bw)
  // ============================================================
  console.log('\n-- E. setup wizard (fixture release server) --');
  {
    const nodeDir = path.dirname(process.execPath);
    const cleanPath = `${nodeDir}:/usr/bin:/bin`; // node + unzip, but NO bw
    const home = path.join(workRoot, 'E'); fs.mkdirSync(home, { recursive: true });
    const vault = path.join(workRoot, 'E-vault.json'); fs.writeFileSync(vault, JSON.stringify({ items: [] }));

    // fixture zip of the mock bw
    const zipDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bw-fix-'));
    fs.copyFileSync(MOCK_BW, path.join(zipDir, 'bw')); fs.chmodSync(path.join(zipDir, 'bw'), 0o755);
    const zipPath = path.join(workRoot, 'bw.zip');
    const zres = spawnSync('zip', ['-j', '-q', zipPath, path.join(zipDir, 'bw')], { encoding: 'utf8' });
    let wizardRan = zres.status === 0;
    if (!wizardRan) { console.log('  ! zip unavailable; skipping wizard section'); }
    else {
      const zipBytes = fs.readFileSync(zipPath);
      const zipSha = crypto.createHash('sha256').update(zipBytes).digest('hex');
      const server = http.createServer((req, res) => { if (req.url.startsWith('/bw.zip')) { res.writeHead(200); res.end(zipBytes); } else { res.writeHead(404); res.end(); } });
      await new Promise(r => server.listen(0, '127.0.0.1', r));
      const releaseUrl = `http://127.0.0.1:${server.address().port}/bw.zip`;
      const env = { PATH: cleanPath, CHROMUX_HOME: home, CHROMUX_SECRET_TEST_PROOF: '1', MOCK_BW_VAULT_FILE: vault, CHROMUX_BW_RELEASE_URL: releaseUrl, CHROMUX_BW_RELEASE_SHA256: zipSha };
      const { child, port } = await startApp(env);
      const cookie = ((await reqHttp(port, 'POST', '/api/secrets/session/begin', { headers: HDR(), body: { proof: 'test' } })).headers['set-cookie']?.[0] || '').split(';')[0];
      check('setup-state: bw not installed initially (clean PATH)', (await reqHttp(port, 'GET', '/api/secrets/setup-state', { headers: HDR() })).json?.bwInstalled === false);
      check('wizard/install verifies sha256 and installs', (await reqHttp(port, 'POST', '/api/secrets/wizard/install', { headers: HDR({ Cookie: cookie }) })).json?.ok === true && fs.existsSync(path.join(home, 'bin', 'bw')));
      const WIZ_MASTER = 'WizardMaster-no-leak-E-7x';
      check('wizard/login logs in + unlocks', (await reqHttp(port, 'POST', '/api/secrets/wizard/login', { headers: HDR({ Cookie: cookie }), body: { email: 'u@example.com', masterPassword: WIZ_MASTER } })).json?.unlocked === true);
      // AC4: the wizard-login master password (piped to `bw login` stdin) must
      // leave no residue in any file/log/state under CHROMUX_HOME either.
      check('wizard-login master password appears in NO file under CHROMUX_HOME (no-residue)', !walkForString(home, WIZ_MASTER));
      // AC10: the wizard flow ends with a credential registered AND resolvable
      // (uses the wizard-installed bw in ~/.chromux/bin, no mock on PATH).
      check('register a credential after the wizard (manage)', (await reqHttp(port, 'POST', '/api/secrets/set', { headers: HDR({ Cookie: cookie }), body: { host: 'wiz.example', user: 'wiz-user', password: 'wiz-pw', scope: 'global' } })).json?.ok === true);
      const wizGet = spawnSync('node', [CHROMUX, 'secret', 'get', 'wiz.example'], { env, encoding: 'utf8' });
      let wizJson = null; try { wizJson = JSON.parse(wizGet.stdout); } catch {}
      check('the wizard-registered credential resolves end-to-end (register + resolve)', wizJson?.ok === true && wizJson?.username === 'wiz-user');
      const l2 = await reqHttp(port, 'POST', '/api/secrets/wizard/login', { headers: HDR({ Cookie: cookie }), body: { email: '2fa@example.com', masterPassword: 'M' } });
      check('login requiring 2FA returns twofa-required', l2.json?.secret === 'twofa-required');
      check('login with the 2FA code succeeds', (await reqHttp(port, 'POST', '/api/secrets/wizard/login', { headers: HDR({ Cookie: cookie }), body: { email: '2fa@example.com', masterPassword: 'M', twofa: '123456' } })).json?.ok === true);
      child.kill(); await sleep(100);

      // checksum mismatch -> refuse + do NOT install
      const home2 = path.join(workRoot, 'E2'); fs.mkdirSync(home2, { recursive: true });
      const env2 = { ...env, CHROMUX_HOME: home2, CHROMUX_BW_RELEASE_SHA256: 'deadbeef'.repeat(8) };
      const app2 = await startApp(env2);
      const cookie2 = ((await reqHttp(app2.port, 'POST', '/api/secrets/session/begin', { headers: HDR(), body: { proof: 'test' } })).headers['set-cookie']?.[0] || '').split(';')[0];
      const bad = await reqHttp(app2.port, 'POST', '/api/secrets/wizard/install', { headers: HDR({ Cookie: cookie2 }) });
      check('wizard/install refuses a checksum mismatch', bad.json?.secret === 'checksum-mismatch');
      check('a checksum-mismatched binary is NOT installed/executed', !fs.existsSync(path.join(home2, 'bin', 'bw')));
      app2.child.kill(); await sleep(100);
      server.close();
    }
    try { fs.rmSync(zipDir, { recursive: true, force: true }); } catch {}
  }

  console.log(`\n=== RESULT: ${PASS} passed, ${FAIL} failed ===`);
  fs.rmSync(workRoot, { recursive: true, force: true });
  process.exit(FAIL === 0 ? 0 : 1);
}
main().catch((err) => { console.error('test-secret-dashboard.mjs crashed:', err); process.exit(1); });
