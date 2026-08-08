#!/usr/bin/env node
// Browser/runtime verification (V3) for the secret-store DASHBOARD web panel:
// drives the real dashboard (served by `chromux app`) in a real headless
// Chrome and proves the opt-in DORMANCY -> opted-in OBSERVE rendering, with no
// secret value ever painted on the observe surface. Uses the mock `bw` and the
// env-gated test proof so no real vault/biometrics are involved. Complements
// the non-browser suite test-secret-dashboard.mjs (V2).
//
// Usage: node test-secret-dashboard-browser.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CHROMUX = path.join(HERE, 'chromux.mjs');
const MOCK_BIN = path.join(HERE, 'test', 'mock-bin');

const workRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'chromux-secret-dashb-'));
const chromuxHome = path.join(workRoot, 'home');
const vaultFile = path.join(workRoot, 'vault.json');
fs.mkdirSync(chromuxHome, { recursive: true });
const PASSWORD = 'dashboard-secret-pw-Zz9';
fs.writeFileSync(vaultFile, JSON.stringify({ items: [
  { id: 'd1', name: 'chromux/global/github.com', login: { username: 'gh-user', password: PASSWORD, uris: [{ uri: 'https://github.com' }] } },
] }));

const baseEnv = { ...process.env, PATH: `${MOCK_BIN}:${process.env.PATH}`, CHROMUX_HOME: chromuxHome, MOCK_BW_VAULT_FILE: vaultFile, CHROMUX_SECRET_TEST_PROOF: '1' };
delete baseEnv.CHROMUX_PROFILE;

let PASS = 0, FAIL = 0;
const check = (d, c) => { if (c) { console.log(`  ✓ ${d}`); PASS++; } else { console.log(`  ✗ ${d}`); FAIL++; } };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
function runCli(args, extraEnv = {}) { return spawnSync('node', [CHROMUX, ...args], { env: { ...baseEnv, ...extraEnv }, encoding: 'utf8' }); }
function apiReq(port, method, pathname, { headers = {}, body } = {}) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const h = { 'X-Chromux-Secret': '1', ...headers }; if (data) h['Content-Type'] = 'application/json';
    const r = http.request({ host: '127.0.0.1', port, method, path: pathname, headers: h }, (res) => { let b = ''; res.on('data', c => b += c); res.on('end', () => { let j = null; try { j = JSON.parse(b); } catch {} resolve({ status: res.statusCode, json: j, headers: res.headers }); }); });
    r.on('error', () => resolve({ status: 0 })); if (data) r.write(data); r.end();
  });
}

async function main() {
  console.log('=== chromux secret dashboard: browser/runtime verification (V3) ===');
  console.log(`workRoot: ${workRoot}`);

  // Serve the dashboard from the chromux CLI itself (no separate dev server).
  const app = spawn('node', [CHROMUX, 'app', '--host', '127.0.0.1', '--port', '0'], { env: baseEnv, stdio: ['ignore', 'pipe', 'ignore'] });
  let appUrl = null, port = 0;
  await new Promise((resolve) => { app.stdout.on('data', c => { const m = String(c).match(/(http:\/\/127\.0\.0\.1:(\d+)\/)/); if (m) { appUrl = m[1]; port = Number(m[2]); resolve(); } }); setTimeout(resolve, 4000); });
  check('status app is serving', !!appUrl);

  const profile = 'dashtest-' + process.pid;
  const profileEnv = { CHROMUX_PROFILE: profile };
  try {
    const launch = runCli(['launch', profile, '--headless'], profileEnv);
    check('headless profile launches', launch.status === 0);
    check('dashboard opens in real Chrome', runCli(['open', 'main', appUrl], profileEnv).status === 0);
    await sleep(800);

    // 1) DORMANT: not opted in -> only the "Set up secret store" entry
    runCli(['eval', 'main', `document.querySelector('[data-tab="secrets"]').click()`], profileEnv);
    await sleep(1500);
    const dormant = runCli(['eval', 'main', `document.querySelector('#secretsPanel').innerText`], profileEnv);
    check('secrets panel renders the DORMANT state before opt-in', /set up secret store/i.test(dormant.stdout) && !/github\.com/i.test(dormant.stdout));

    // 2) Opt in + unlock + verify via the API (the proof flows are V2-covered)
    const begin = await apiReq(port, 'POST', '/api/secrets/session/begin', { body: { proof: 'test' } });
    const cookie = (begin.headers['set-cookie']?.[0] || '').split(';')[0];
    check('edit-mode session mints via test proof', begin.json?.ok === true);
    check('optin succeeds', (await apiReq(port, 'POST', '/api/secrets/optin', { headers: { Cookie: cookie }, body: { enabled: true } })).json?.optedIn === true);
    check('unlock succeeds', (await apiReq(port, 'POST', '/api/secrets/unlock', { headers: { Cookie: cookie }, body: { masterPassword: 'MASTER' } })).json?.unlocked === true);

    // 3) OPTED-IN OBSERVE: reload, the panel shows lock state + the host list (no values)
    runCli(['open', 'main', appUrl], profileEnv);
    await sleep(800);
    runCli(['eval', 'main', `document.querySelector('[data-tab="secrets"]').click()`], profileEnv);
    await sleep(1800);
    const active = runCli(['eval', 'main', `document.querySelector('#secretsPanel').innerText`], profileEnv);
    check('opted-in panel no longer shows the dormant setup card', !/set up secret store/i.test(active.stdout));
    check('opted-in panel shows the registered host in the observe list', /github\.com/i.test(active.stdout));
    check('the observe surface never paints the secret value', !active.stdout.includes(PASSWORD));

    // 4) whole-page HTML must not contain the plaintext either
    const html = runCli(['eval', 'main', `document.documentElement.outerHTML`], profileEnv);
    check('the rendered page HTML never contains the plaintext password', !html.stdout.includes(PASSWORD));

    // 5) screenshot evidence
    const shotDir = path.join(HERE, 'agents', 'implement', 'chromux-secret-dashboard', 'artifacts', 'screenshots');
    fs.mkdirSync(shotDir, { recursive: true });
    const shot = path.join(shotDir, 'secret-dashboard-observe.png');
    const shotRes = runCli(['screenshot', 'main', shot], profileEnv);
    check('a screenshot of the opted-in panel is captured', shotRes.status === 0 && fs.existsSync(shot) && fs.statSync(shot).size > 0);

    runCli(['close', 'main'], profileEnv);
  } finally {
    runCli(['kill', profile], profileEnv);
    try { app.kill(); } catch {}
  }
  await apiReq(port, 'POST', '/api/secrets/session/revoke', {}).catch(() => {});
  console.log(`\n=== RESULT: ${PASS} passed, ${FAIL} failed ===`);
  fs.rmSync(workRoot, { recursive: true, force: true });
  process.exit(FAIL === 0 ? 0 : 1);
}
main().catch((err) => { console.error('test-secret-dashboard-browser.mjs crashed:', err); process.exit(1); });
