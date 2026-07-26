const state = {
  data: null,
  selectedProfile: null,
  selectedProfiles: new Set(),
  profileSearch: '',
  profileStatusFilter: 'all',
  tab: 'timeline',
  secrets: {
    active: false,
    state: null,
    list: null,
    history: null,
    setup: null,
    editExpiresAt: 0,
    lastSignature: '',
    pending: false,
    fallback: false,
    wizardBusy: false,
    wizard: { email: '', showTwofa: false },
  },
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function fmtTime(value) {
  if (!value) return '-';
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function fmtShortTime(value) {
  if (!value) return '-';
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function fmtBytes(value) {
  if (!Number.isFinite(value) || value < 0) return '-';
  if (value < 1024) return `${value} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let size = value;
  let unit = -1;
  do {
    size /= 1024;
    unit += 1;
  } while (size >= 1024 && unit < units.length - 1);
  return `${size >= 100 ? Math.round(size) : size.toFixed(1)} ${units[unit]}`;
}

function text(value) {
  if (value === null || value === undefined || value === '') return '-';
  return String(value);
}

function escapeHtml(value) {
  return text(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('is-visible');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('is-visible'), 3200);
}

// In-page confirmation. window.confirm() returns false without prompting inside
// an unconfigured WKWebView (the menu bar app), which silently swallowed every
// destructive action; this modal works in any browser or embedded webview.
function confirmModalOpen() {
  return !$('#confirmModal').hidden;
}

function confirmDialog(message) {
  return new Promise((resolve) => {
    const overlay = $('#confirmModal');
    const okBtn = $('#confirmModalConfirm');
    const cancelBtn = $('#confirmModalCancel');
    $('#confirmModalMessage').textContent = message;
    overlay.hidden = false;
    const cleanup = (result) => {
      overlay.hidden = true;
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      overlay.removeEventListener('mousedown', onBackdrop);
      document.removeEventListener('keydown', onKey);
      resolve(result);
    };
    const onOk = () => cleanup(true);
    const onCancel = () => cleanup(false);
    const onBackdrop = (event) => { if (event.target === overlay) cleanup(false); };
    const onKey = (event) => {
      if (event.key === 'Escape') cleanup(false);
      else if (event.key === 'Enter') cleanup(true);
    };
    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
    overlay.addEventListener('mousedown', onBackdrop);
    document.addEventListener('keydown', onKey);
    okBtn.focus();
  });
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const body = await res.json();
  if (!res.ok || body.ok === false) {
    const err = body.error || body.result?.stderr || `HTTP ${res.status}`;
    throw new Error(err);
  }
  return body;
}

async function refresh() {
  state.data = await api('/api/state');
  const profiles = orderedProfiles(state.data.profiles || []);
  const profileNames = new Set(profiles.map(profile => profile.name));
  state.selectedProfiles = new Set([...state.selectedProfiles].filter(name => profileNames.has(name)));
  if (!state.selectedProfile || !profiles.some(profile => profile.name === state.selectedProfile)) {
    state.selectedProfile = profiles[0]?.name || null;
  }
  render();
}

function selectedProfile() {
  return (state.data?.profiles || []).find(profile => profile.name === state.selectedProfile) || null;
}

function profileEvents() {
  return (state.data?.activity?.events || []).filter(event => event.profile === state.selectedProfile);
}

function profileTimeline() {
  return (state.data?.activity?.timeline || []).filter(group => group.profile === state.selectedProfile);
}

function statusPill(status) {
  const value = status || 'stopped';
  const className = String(value).replace(/[^a-z0-9_-]/gi, '-');
  return `<span class="pill ${escapeHtml(className)}">${escapeHtml(value)}</span>`;
}

function shortUrl(value) {
  if (!value) return '';
  try {
    const url = new URL(value);
    const pathText = `${url.pathname}${url.search}`.replace(/\/$/, '');
    if (!pathText || pathText === '/') return url.hostname;
    const compactPath = pathText.length > 54 ? `${pathText.slice(0, 51)}...` : pathText;
    return `${url.hostname}${compactPath}`;
  } catch {
    return String(value).length > 64 ? `${String(value).slice(0, 61)}...` : String(value);
  }
}

function isProfileActive(profile) {
  return profile?.status === 'running'
    || (profile?.activeTabs ?? 0) > 0
    || profile?.daemon?.status === 'ok'
    || profile?.daemon?.status === 'running';
}

function profileSortRank(profile) {
  if (isProfileActive(profile)) return 0;
  if (profile?.status === 'stale') return 1;
  if (profile?.status === 'error') return 2;
  return 3;
}

function orderedProfiles(profiles) {
  return [...profiles].sort((a, b) => {
    const rankDelta = profileSortRank(a) - profileSortRank(b);
    if (rankDelta !== 0) return rankDelta;
    return a.name.localeCompare(b.name);
  });
}

function visibleProfiles() {
  const query = state.profileSearch.trim().toLowerCase();
  return orderedProfiles(state.data?.profiles || []).filter(profile => {
    const active = isProfileActive(profile);
    if (state.profileStatusFilter === 'active' && !active) return false;
    if (state.profileStatusFilter === 'stopped' && active) return false;
    if (!query) return true;
    return [
      profile.name,
      profile.status,
      profile.daemon?.status,
      profile.userDataDir,
    ].filter(Boolean).some(value => String(value).toLowerCase().includes(query));
  });
}

function renderProfiles() {
  const list = $('#profileList');
  const allProfiles = state.data?.profiles || [];
  const profiles = visibleProfiles();
  const selectedCount = state.selectedProfiles.size;
  const visibleSelectedCount = profiles.filter(profile => state.selectedProfiles.has(profile.name)).length;
  $('#profileCount').textContent = allProfiles.length;
  $('#profileDiskTotal').textContent = fmtBytes(allProfiles.reduce((sum, profile) => sum + (profile.diskUsageBytes || 0), 0));
  $('#eventCount').textContent = state.data?.activity?.totalEvents || 0;
  $('#homePath').textContent = state.data?.chromuxHome || '';
  $('#profileSearch').value = state.profileSearch;
  $$('[data-status-filter]').forEach(button => {
    button.classList.toggle('is-active', button.dataset.statusFilter === state.profileStatusFilter);
  });
  $('#bulkBar').hidden = selectedCount === 0;
  $('#selectedProfileCount').textContent = `${selectedCount} / ${profiles.length}`;
  $('#selectedProfileCount').title = `${selectedCount} selected of ${profiles.length} shown`;
  $('#deleteSelectedProfiles').disabled = selectedCount === 0;
  $('#selectAllProfiles').checked = profiles.length > 0 && visibleSelectedCount === profiles.length;
  $('#selectAllProfiles').indeterminate = visibleSelectedCount > 0 && visibleSelectedCount < profiles.length;

  if (!profiles.length) {
    list.innerHTML = allProfiles.length
      ? '<div class="empty-state">No matching profiles</div>'
      : '<div class="empty-state">No profiles</div>';
    return;
  }

  list.innerHTML = profiles.map(profile => `
    <div class="profile-item ${profile.name === state.selectedProfile ? 'is-active' : ''} ${state.selectedProfiles.has(profile.name) ? 'is-selected' : ''}">
      <label class="profile-check" title="Select profile">
        <input type="checkbox" data-select-profile="${escapeHtml(profile.name)}" ${state.selectedProfiles.has(profile.name) ? 'checked' : ''}>
      </label>
      <button class="profile-main" data-profile="${escapeHtml(profile.name)}">
        <span class="profile-name">${escapeHtml(profile.name)}</span>
        <span class="profile-meta">${escapeHtml(profile.daemon?.status)} daemon / ${escapeHtml(profile.activeTabs)} tabs / ${escapeHtml(fmtBytes(profile.diskUsageBytes))}</span>
      </button>
      ${statusPill(profile.status)}
    </div>
  `).join('');

  $$('.profile-main').forEach(button => {
    button.addEventListener('click', () => {
      state.selectedProfile = button.dataset.profile;
      render();
    });
  });
  $$('[data-select-profile]').forEach(input => {
    input.addEventListener('change', () => {
      if (input.checked) {
        state.selectedProfiles.add(input.dataset.selectProfile);
      } else {
        state.selectedProfiles.delete(input.dataset.selectProfile);
      }
      renderProfiles();
    });
  });
}

function factRows(rows) {
  return rows.map(([key, value]) => `<dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd>`).join('');
}

function renderProfileDetail() {
  const profile = selectedProfile();
  $('#selectedName').textContent = profile?.name || 'No profile';
  $('#summaryStatus').textContent = profile?.status || '-';
  $('#summaryDaemon').textContent = profile?.daemon?.status || '-';
  $('#summarySessions').textContent = profile?.daemon?.sessions ?? '-';
  $('#summaryModified').textContent = profile?.modifiedAt ? fmtTime(profile.modifiedAt) : '-';

  const disabled = profile ? '' : 'disabled';
  $('#profileActions').innerHTML = `
    <button data-action="launch-headed" class="primary" ${disabled}>Launch headed</button>
    <button data-action="open-foreground" ${disabled}>Open foreground</button>
    <button data-action="stop-daemon" ${disabled}>Stop daemon</button>
    <button data-action="kill" class="danger" ${disabled}>Kill profile</button>
  `;
  $$('#profileActions button').forEach(button => {
    button.addEventListener('click', () => runProfileAction(button.dataset.action));
  });

  $('#runtimeFacts').innerHTML = factRows([
    ['PID', profile?.pid],
    ['Port', profile?.port],
    ['Launch mode', profile?.launchMode],
    ['Active tabs', profile?.activeTabs],
    ['Paused', profile?.paused ? 'yes' : 'no'],
    ['Disk usage', fmtBytes(profile?.diskUsageBytes)],
    ['User data dir', profile?.userDataDir],
    ['Reason', profile?.reason],
  ]);

  const events = profileEvents();
  const tasks = new Set(events.map(event => event.task).filter(Boolean));
  const hosts = new Set(events.map(event => event.host).filter(Boolean));
  $('#activityFacts').innerHTML = factRows([
    ['Events', events.length],
    ['Tasks', tasks.size],
    ['Hosts', hosts.size],
    ['Retention', state.data?.activity?.config?.retentionDays],
    ['Aggregate commands', Object.keys(state.data?.activity?.aggregates?.byCommand || {}).length],
  ]);
}

async function runProfileAction(action) {
  const profile = selectedProfile();
  if (!profile) return;
  try {
    const body = await api(`/api/profiles/${encodeURIComponent(profile.name)}/action`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
    toast(body.result?.stderr || body.result?.stdout || `${action} complete`);
    await refresh();
  } catch (err) {
    toast(err.message);
  }
}

async function deleteSelectedProfiles() {
  const profiles = [...state.selectedProfiles];
  if (!profiles.length) return;
  const preview = profiles.slice(0, 6).join(', ');
  const suffix = profiles.length > 6 ? ` and ${profiles.length - 6} more` : '';
  if (!(await confirmDialog(`Delete ${profiles.length} profile${profiles.length === 1 ? '' : 's'} and local profile files?\n\n${preview}${suffix}`))) return;
  try {
    const body = await api('/api/profiles/delete', {
      method: 'POST',
      body: JSON.stringify({ profiles }),
    });
    toast(`Deleted ${body.deleted} profile${body.deleted === 1 ? '' : 's'}`);
    state.selectedProfiles.clear();
    await refresh();
  } catch (err) {
    toast(err.message);
    await refresh();
  }
}

function renderTabs() {
  $$('.tab-button').forEach(button => {
    button.classList.toggle('is-active', button.dataset.tab === state.tab);
    button.onclick = () => selectTab(button.dataset.tab);
  });
  $$('.tab-view').forEach(view => view.classList.remove('is-active'));
  $(`#${state.tab}View`).classList.add('is-active');
  state.secrets.active = state.tab === 'secrets';
}

function renderTimeline() {
  const list = $('#timelineList');
  const groups = profileTimeline();
  if (!groups.length) {
    list.innerHTML = '<div class="empty-state">No timeline entries</div>';
    return;
  }
  list.innerHTML = groups.map(group => `
    <article class="timeline-card">
      <div class="timeline-head">
        <div class="timeline-heading">
          <div class="timeline-title">${escapeHtml(group.label)}</div>
          <div class="timeline-subtitle">${escapeHtml(fmtTime(group.startedAt))}${group.startedAt !== group.endedAt ? ` - ${escapeHtml(fmtTime(group.endedAt))}` : ''}</div>
        </div>
        ${statusPill(group.errorCount ? 'failed' : 'ok')}
      </div>
      <div class="timeline-chips" aria-label="Timeline summary">
        <span>${escapeHtml(group.eventCount)} events</span>
        <span>${escapeHtml(group.commands.join(' -> ') || '-')}</span>
        <span>${escapeHtml(group.hosts.join(', ') || 'no host')}</span>
        ${group.derived ? '<span>derived session</span>' : ''}
      </div>
      <div class="timeline-events">
        ${group.events.map(event => `
          <div class="timeline-event ${event.ok ? '' : 'has-error'}">
            <span class="event-dot" aria-hidden="true"></span>
            <span class="event-time">${escapeHtml(fmtShortTime(event.timestamp))}</span>
            <span class="event-command">${escapeHtml(event.command)}</span>
            <span class="event-target">${event.redacted ? '[redacted]' : escapeHtml(shortUrl(event.url || event.title || ''))}</span>
          </div>
        `).join('')}
      </div>
    </article>
  `).join('');
}

function renderRawLog() {
  const body = $('#rawLogBody');
  const events = profileEvents();
  if (!events.length) {
    body.innerHTML = '<tr><td colspan="7">No raw events</td></tr>';
    return;
  }
  body.innerHTML = events.map(event => `
    <tr>
      <td>${escapeHtml(fmtTime(event.timestamp))}</td>
      <td>${escapeHtml(event.command)}</td>
      <td>${escapeHtml(event.task)}</td>
      <td>${escapeHtml(event.session)}</td>
      <td class="url-cell">${event.redacted ? '[redacted]' : escapeHtml(event.url)}<br>${event.redacted ? '' : escapeHtml(event.title)}</td>
      <td>${event.ok ? 'ok' : escapeHtml(event.error)}</td>
      <td>${(event.siteKnowledgePaths || []).map(escapeHtml).join('<br>') || '-'}</td>
    </tr>
  `).join('');
}

function renderLifecycle() {
  const retention = state.data?.activity?.config?.retentionDays ?? 90;
  $('#retentionSelect').value = String(retention);
  const tasks = state.data?.activity?.tasks || [];
  $('#taskSelect').innerHTML = tasks.length
    ? tasks.map(task => `<option value="${escapeHtml(task)}">${escapeHtml(task)}</option>`).join('')
    : '<option value="">No Task</option>';
}

async function saveRetention() {
  try {
    await api('/api/activity/config', {
      method: 'POST',
      body: JSON.stringify({ retentionDays: $('#retentionSelect').value }),
    });
    toast('Retention saved');
    await refresh();
  } catch (err) {
    toast(err.message);
  }
}

function lifecycleScope(kind) {
  if (kind.endsWith('all')) return { type: 'all' };
  if (kind.endsWith('profile')) return { type: 'profile', profile: state.selectedProfile };
  return { type: 'task', task: $('#taskSelect').value };
}

async function runLifecycle(kind) {
  const action = kind.startsWith('delete') ? 'delete' : 'redact';
  const scope = lifecycleScope(kind);
  if (scope.type === 'task' && !scope.task) {
    toast('No Task selected');
    return;
  }
  if (action === 'delete' && !(await confirmDialog(`Confirm ${kind.replace('-', ' ')}?`))) return;
  try {
    const result = await api(`/api/activity/${action}`, {
      method: 'POST',
      body: JSON.stringify(scope),
    });
    toast(`${action} complete`);
    state.data.activity = result.activity;
    render();
  } catch (err) {
    toast(err.message);
  }
}

/* ---- secret store --------------------------------------------------- */
// Every secret request carries the X-Chromux-Secret guard header and rides
// the same-origin httpOnly session cookie (set by session/exchange). The JS
// never sees or stores the session token, and revealed values live only in
// the DOM for a few seconds before being cleared.

const SECRET_HEADERS = { 'Content-Type': 'application/json', 'X-Chromux-Secret': '1' };

function fmtDuration(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return '0:00';
  const total = Math.floor(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

async function secretApi(path, options = {}) {
  const { method = 'GET', body } = options;
  let data;
  try {
    const res = await fetch(path, {
      method,
      credentials: 'same-origin',
      headers: SECRET_HEADERS,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    try { data = await res.json(); } catch { data = {}; }
    if (data && typeof data === 'object') data.httpStatus = res.status;
  } catch (err) {
    data = { ok: false, error: err.message };
  }
  return data || { ok: false };
}

// Structured denials look like {ok:false, secret:'<reason>', next:'<hint>'};
// always prefer the human-facing `next` hint when surfacing them.
function secretDenied(data, fallback) {
  return data?.next || data?.secret || data?.error || fallback || 'Secret request failed';
}

function secretState() { return state.secrets.state; }

function secretEditActive() {
  const s = secretState();
  if (!s) return false;
  if (Number(s.ttlRemainingMs) > 0) return true;
  return Array.isArray(s.editSessions) && s.editSessions.length > 0;
}

function secretCanNativeProof() {
  const providers = secretState()?.consentProviders || [];
  return providers.includes('windows-hello') || providers.includes('test');
}

function secretConsentProof() {
  const providers = secretState()?.consentProviders || [];
  if (providers.includes('windows-hello')) return 'windows-hello';
  if (providers.includes('test')) return 'test';
  return secretState()?.platform === 'win32' ? 'windows-hello' : 'test';
}

function secretInputFocused() {
  const el = document.activeElement;
  const panel = $('#secretsPanel');
  return !!el && !!panel && panel.contains(el)
    && ['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName);
}

// Enter edit mode. On a platform with a native in-browser proof (windows-hello
// on win32, or `test` in dev) we begin a session and exchange its token for the
// httpOnly cookie in-page. Otherwise there is no native prompt, so we surface
// the launch-token fallback: the user runs `chromux secret approve`, which
// reopens the dashboard with ?approve=<token>.
async function secretBeginEdit() {
  if (!secretCanNativeProof()) {
    state.secrets.fallback = true;
    renderSecrets(true);
    toast('Run `chromux secret approve` in a terminal to enter edit mode.');
    return false;
  }
  const begun = await secretApi('/api/secrets/session/begin', {
    method: 'POST',
    body: { proof: secretConsentProof() },
  });
  if (!begun.ok) {
    state.secrets.fallback = true;
    renderSecrets(true);
    toast(secretDenied(begun, 'Consent unavailable'));
    return false;
  }
  const exchanged = await secretApi('/api/secrets/session/exchange', {
    method: 'POST',
    body: { token: begun.token },
  });
  if (!exchanged.ok) {
    toast(secretDenied(exchanged, 'Could not start edit mode'));
    return false;
  }
  state.secrets.fallback = false;
  toast('Edit mode active');
  await refreshSecrets(true);
  return true;
}

async function secretRevokeEdit() {
  const r = await secretApi('/api/secrets/session/revoke', { method: 'POST' });
  if (!r.ok) { toast(secretDenied(r, 'Could not revoke edit mode')); return; }
  toast('Edit mode ended');
  await refreshSecrets(true);
}

// Opt in requires an edit-mode session, so ensure one first; on the fallback
// platform this shows the launch-token instructions and returns until the user
// has approved and re-entered edit mode.
async function secretSetup() {
  if (!secretEditActive()) {
    await secretBeginEdit();
    if (!secretEditActive()) return;
  }
  const r = await secretApi('/api/secrets/optin', { method: 'POST', body: { enabled: true } });
  if (!r.ok) { toast(secretDenied(r, 'Could not enable secret store')); return; }
  toast('Secret store enabled');
  await refreshSecrets(true);
}

async function secretOptOut() {
  if (!(await confirmDialog('Disable the secret store? Stored credentials stay in your vault but chromux stops using them.'))) return;
  const r = await secretApi('/api/secrets/optin', { method: 'POST', body: { enabled: false } });
  if (!r.ok) { toast(secretDenied(r, 'Could not disable secret store')); return; }
  toast('Secret store disabled');
  await refreshSecrets(true);
}

async function secretUnlock() {
  const masterPassword = $('#secMaster')?.value || '';
  if (!masterPassword) { toast('Enter your master password'); return; }
  const r = await secretApi('/api/secrets/unlock', { method: 'POST', body: { masterPassword } });
  if (!r.ok) { toast(secretDenied(r, 'Unlock failed')); return; }
  const field = $('#secMaster');
  if (field) field.value = '';
  toast('Vault unlocked');
  await refreshSecrets(true);
}

async function secretSet() {
  const host = ($('#secHost')?.value || '').trim();
  const user = $('#secUser')?.value || '';
  const password = $('#secPass')?.value || '';
  const totp = ($('#secTotp')?.value || '').trim();
  const scope = ($('#secScope')?.value || '').trim();
  if (!host || !user || !password) { toast('Host, username, and password are required'); return; }
  const body = { host, user, password };
  if (totp) body.totp = totp;
  if (scope && scope.toLowerCase() !== 'global') body.scope = scope;
  const r = await secretApi('/api/secrets/set', { method: 'POST', body });
  if (!r.ok) { toast(secretDenied(r, 'Could not save credential')); return; }
  ['#secHost', '#secUser', '#secPass', '#secTotp', '#secScope'].forEach(id => {
    const el = $(id);
    if (el) el.value = '';
  });
  toast(`${r.updated ? 'Updated' : 'Saved'} credential for ${r.host || host}`);
  await refreshSecrets(true);
}

async function secretRemove(host, scope) {
  const label = scope && scope.toLowerCase() !== 'global' ? `${host} (${scope})` : host;
  if (!(await confirmDialog(`Delete stored credential for ${label}?`))) return;
  const body = { host };
  if (scope && scope.toLowerCase() !== 'global') body.scope = scope;
  const r = await secretApi('/api/secrets/rm', { method: 'POST', body });
  if (!r.ok) { toast(secretDenied(r, 'Could not delete credential')); return; }
  toast(`Removed ${host}`);
  await refreshSecrets(true);
}

// Exposing a value always takes two proofs: a fresh consent from consent/begin,
// then the reveal/totp call carrying that consent. The value is shown briefly
// in the row and never stored in client state.
async function secretReveal(host, field, scope, slot) {
  const consentRes = await secretApi('/api/secrets/consent/begin', {
    method: 'POST',
    body: { proof: secretConsentProof(), action: 'reveal', host, field },
  });
  if (!consentRes.ok) { toast(secretDenied(consentRes, 'Consent unavailable')); return; }
  const body = { host, field, consent: consentRes.consent };
  if (scope && scope.toLowerCase() !== 'global') body.scope = scope;
  const r = await secretApi('/api/secrets/reveal', { method: 'POST', body });
  if (!r.ok) { toast(secretDenied(r, 'Reveal blocked')); return; }
  showSecretValue(slot, r.value);
}

async function secretTotp(host, scope, slot) {
  const consentRes = await secretApi('/api/secrets/consent/begin', {
    method: 'POST',
    body: { proof: secretConsentProof(), action: 'totp', host },
  });
  if (!consentRes.ok) { toast(secretDenied(consentRes, 'Consent unavailable')); return; }
  const body = { host, consent: consentRes.consent };
  if (scope && scope.toLowerCase() !== 'global') body.scope = scope;
  const r = await secretApi('/api/secrets/totp', { method: 'POST', body });
  if (!r.ok) { toast(secretDenied(r, 'TOTP blocked')); return; }
  showSecretValue(slot, r.value);
  try {
    await navigator.clipboard.writeText(r.value);
    toast('TOTP copied to clipboard');
  } catch {
    toast('TOTP revealed');
  }
}

async function secretWizardInstall() {
  state.secrets.wizardBusy = true;
  renderSecrets(true);
  const r = await secretApi('/api/secrets/wizard/install', { method: 'POST' });
  state.secrets.wizardBusy = false;
  if (!r.ok) { toast(secretDenied(r, 'Install failed')); await refreshSecrets(true); return; }
  toast('Bitwarden CLI installed');
  await refreshSecrets(true);
}

async function secretWizardLogin() {
  const email = ($('#secWizEmail')?.value || '').trim();
  const masterPassword = $('#secWizPass')?.value || '';
  const twofa = ($('#secWizTwofa')?.value || '').trim();
  if (!email || !masterPassword) { toast('Email and master password are required'); return; }
  state.secrets.wizard.email = email;
  const body = { email, masterPassword };
  if (twofa) body.twofa = twofa;
  const r = await secretApi('/api/secrets/wizard/login', { method: 'POST', body });
  if (!r.ok) {
    if (r.secret === 'twofa-required') {
      state.secrets.wizard.showTwofa = true;
      renderSecrets(true);
      toast(secretDenied(r, 'Enter your two-factor code'));
      return;
    }
    toast(secretDenied(r, 'Login failed'));
    return;
  }
  state.secrets.wizard.showTwofa = false;
  toast('Logged in and vault unlocked');
  await refreshSecrets(true);
}

// Reveal an exposed value into its row slot, then clear it after a short window.
// The value is never written to client state.
function showSecretValue(slot, value) {
  const el = document.querySelector(`.secret-value[data-slot="${slot}"]`);
  if (!el) return;
  clearTimeout(el._secretTimer);
  el.textContent = text(value);
  el.classList.add('is-shown');
  el._secretTimer = setTimeout(() => {
    el.textContent = '';
    el.classList.remove('is-shown');
  }, 10000);
}

// On page load, exchange a launch-token (?approve=<token>) for the session
// cookie, then strip it from the URL so it is not left in history/bookmarks.
async function secretConsumeApproveToken() {
  const url = new URL(window.location.href);
  const token = url.searchParams.get('approve');
  if (!token) return false;
  const r = await secretApi('/api/secrets/session/exchange', { method: 'POST', body: { token } });
  url.searchParams.delete('approve');
  history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  if (!r.ok) toast(secretDenied(r, 'Approval token rejected'));
  return true;
}

async function refreshSecrets(force = false) {
  const s = await secretApi('/api/secrets/state');
  state.secrets.state = s;
  if (s?.ok && s.optedIn) {
    const [list, history, setup] = await Promise.all([
      secretApi('/api/secrets/list'),
      secretApi('/api/secrets/history'),
      secretApi('/api/secrets/setup-state'),
    ]);
    state.secrets.list = list;
    state.secrets.history = history;
    state.secrets.setup = setup;
  } else {
    state.secrets.list = null;
    state.secrets.history = null;
    state.secrets.setup = null;
  }
  if (s?.ok) state.secrets.editExpiresAt = Date.now() + Math.max(0, Number(s.ttlRemainingMs) || 0);
  renderSecrets(force);
}

function secretSignature() {
  const s = state.secrets.state;
  if (!s || !s.ok) return `err:${s?.secret || s?.error || 'unavailable'}`;
  const list = state.secrets.list;
  const setup = state.secrets.setup;
  return [
    s.optedIn, s.unlocked, secretEditActive(),
    list?.locked, (list?.items || []).length,
    setup?.bwInstalled, setup?.loggedIn,
    state.secrets.wizardBusy, state.secrets.wizard.showTwofa,
    state.secrets.fallback && !secretCanNativeProof(),
    (state.secrets.history?.events || []).length,
  ].join('|');
}

// Poll refreshes re-render only on a material state change, and never while a
// secret input is focused, so the credential/register forms are not wiped from
// under the user mid-entry. User actions pass force=true.
function renderSecrets(force = false) {
  const panel = $('#secretsPanel');
  if (!panel) return;
  const signature = secretSignature();
  if (!force && signature === state.secrets.lastSignature) { updateSecretTtl(); return; }
  if (!force && secretInputFocused()) { state.secrets.pending = true; updateSecretTtl(); return; }
  state.secrets.pending = false;
  state.secrets.lastSignature = signature;
  panel.innerHTML = buildSecretsHtml();
  updateSecretTtl();
}

function updateSecretTtl() {
  const el = document.getElementById('secretTtl');
  if (!el) return;
  if (!secretEditActive()) { el.textContent = 'inactive'; return; }
  const remaining = state.secrets.editExpiresAt - Date.now();
  el.textContent = remaining > 0 ? fmtDuration(remaining) : 'expiring...';
}

function secretPillHtml(variant, label) {
  return `<span class="pill ${variant}">${escapeHtml(label)}</span>`;
}

function secretFallbackHtml() {
  return `<p class="secret-fallback">No in-browser approval on this platform. Run <code>chromux secret approve</code> in a terminal; it reopens this dashboard and unlocks edit mode.</p>`;
}

function buildSecretsHtml() {
  const s = state.secrets.state;
  if (!s || !s.ok) {
    return `<div class="empty-state">Secret store unavailable${s?.next ? ` - ${escapeHtml(s.next)}` : ''}</div>`;
  }
  if (!s.optedIn) return secretDormantHtml();
  return [
    secretStatusHtml(),
    secretWizardHtml(),
    secretUnlockHtml(),
    secretManageHtml(),
    secretListHtml(),
    secretHistoryHtml(),
  ].join('');
}

// Opt-in dormancy: until opted in, the tab shows only this card. Nothing else
// secret-related renders.
function secretDormantHtml() {
  const edit = secretEditActive();
  const showFallback = state.secrets.fallback && !secretCanNativeProof();
  return `
    <div class="secret-section secret-dormant">
      <h3>Secret store</h3>
      <p class="secret-note">Store site logins in your local vault so chromux can fill them during browser work. Nothing is enabled until you opt in.</p>
      <div class="secret-actions">
        <button class="primary" data-secret="setup">${edit ? 'Enable secret store' : 'Set up secret store'}</button>
        ${edit ? '<button data-secret="revoke">Revoke edit mode</button>' : ''}
      </div>
      ${showFallback ? secretFallbackHtml() : ''}
    </div>`;
}

function secretStatusHtml() {
  const s = state.secrets.state;
  const setup = state.secrets.setup;
  const edit = secretEditActive();
  const backend = setup
    ? (setup.bwInstalled ? (setup.loggedIn ? 'ready' : 'needs login') : 'not installed')
    : '-';
  return `
    <div class="secret-section secret-status">
      <div class="secret-status-head">
        <h3>Secret store</h3>
        <div class="secret-actions">
          ${edit
            ? `${secretPillHtml('ok', 'edit mode')}<button data-secret="revoke">Revoke edit mode</button>`
            : '<button class="primary" data-secret="begin">Edit mode</button>'}
        </div>
      </div>
      <div class="secret-facts">
        <div>
          <label>Vault</label>
          ${secretPillHtml(s.unlocked ? 'ok' : 'locked', s.unlocked ? 'unlocked' : 'locked')}
        </div>
        <div>
          <label>Edit session</label>
          <strong id="secretTtl">${edit ? fmtDuration(state.secrets.editExpiresAt - Date.now()) : 'inactive'}</strong>
        </div>
        <div>
          <label>Backend</label>
          <strong>${escapeHtml(backend)}</strong>
        </div>
        <div>
          <label>Platform</label>
          <strong>${escapeHtml(s.platform || '-')}</strong>
        </div>
      </div>
      ${state.secrets.fallback && !secretCanNativeProof() ? secretFallbackHtml() : ''}
    </div>`;
}

function secretWizardHtml() {
  const setup = state.secrets.setup;
  if (!setup || (setup.bwInstalled && setup.loggedIn)) return '';
  if (!secretEditActive()) {
    return `<div class="secret-section"><h3>Setup</h3><p class="secret-note">Enter edit mode to install and sign in to the Bitwarden backend.</p></div>`;
  }
  const steps = [];
  steps.push(`
    <div class="secret-step">
      <div class="secret-step-title">1. Bitwarden CLI ${setup.bwInstalled ? secretPillHtml('ok', 'installed') : secretPillHtml('locked', 'missing')}</div>
      ${setup.bwInstalled
        ? `<p class="secret-note">${setup.bwPath ? escapeHtml(setup.bwPath) : 'Installed.'}</p>`
        : `<button class="primary" data-secret="wizard-install" ${state.secrets.wizardBusy ? 'disabled' : ''}>${state.secrets.wizardBusy ? 'Installing...' : 'Install Bitwarden CLI'}</button>`}
    </div>`);
  if (setup.bwInstalled && !setup.loggedIn) {
    const w = state.secrets.wizard;
    steps.push(`
      <div class="secret-step">
        <div class="secret-step-title">2. Sign in</div>
        <div class="secret-form-grid">
          <label class="field"><span>Email</span><input id="secWizEmail" type="email" value="${escapeHtml(w.email || '')}" autocomplete="off"></label>
          <label class="field"><span>Master password</span><input id="secWizPass" type="password" autocomplete="off"></label>
          ${w.showTwofa ? '<label class="field"><span>Two-factor code</span><input id="secWizTwofa" type="text" inputmode="numeric" autocomplete="off"></label>' : ''}
        </div>
        <button class="primary" data-secret="wizard-login">${w.showTwofa ? 'Verify and sign in' : 'Sign in'}</button>
      </div>`);
  }
  return `<div class="secret-section"><h3>Setup wizard</h3>${steps.join('')}</div>`;
}

function secretUnlockHtml() {
  const s = state.secrets.state;
  if (!secretEditActive() || s.unlocked) return '';
  return `
    <div class="secret-section">
      <h3>Unlock vault</h3>
      <p class="secret-note">The vault is locked. Enter your master password to read and reveal credentials.</p>
      <div class="secret-inline-form">
        <input id="secMaster" type="password" placeholder="Master password" autocomplete="off">
        <button class="primary" data-secret="unlock">Unlock</button>
      </div>
    </div>`;
}

function secretManageHtml() {
  if (!secretEditActive()) return '';
  return `
    <div class="secret-section">
      <div class="secret-status-head">
        <h3>Add or update credential</h3>
        <button class="danger" data-secret="optin-disable">Disable store</button>
      </div>
      <div class="secret-form-grid">
        <label class="field"><span>Host</span><input id="secHost" type="text" placeholder="example.com" autocomplete="off"></label>
        <label class="field"><span>Scope</span><input id="secScope" type="text" placeholder="global" autocomplete="off"></label>
        <label class="field"><span>Username</span><input id="secUser" type="text" autocomplete="off"></label>
        <label class="field"><span>Password</span><input id="secPass" type="password" autocomplete="off"></label>
        <label class="field"><span>TOTP secret (optional)</span><input id="secTotp" type="text" autocomplete="off"></label>
      </div>
      <button class="primary" data-secret="set">Save credential</button>
    </div>`;
}

function secretListHtml() {
  const list = state.secrets.list;
  const edit = secretEditActive();
  let inner;
  if (!list || list.locked) {
    inner = `<div class="empty-state">Vault is locked. ${edit ? 'Unlock the vault above to list stored credentials.' : 'Enter edit mode and unlock the vault to list stored credentials.'}</div>`;
  } else if (!(list.items || []).length) {
    inner = '<div class="empty-state">No stored credentials yet.</div>';
  } else {
    inner = `<div class="secret-cred-list">${list.items.map((item, i) => secretCredRow(item, i, edit)).join('')}</div>`;
  }
  return `<div class="secret-section"><h3>Stored credentials</h3>${inner}</div>`;
}

function secretCredRow(item, i, edit) {
  const host = escapeHtml(item.host);
  const scope = item.scope || 'global';
  const scopeAttr = escapeHtml(scope);
  const slotUser = `slot-${i}-username`;
  const slotPass = `slot-${i}-password`;
  const slotTotp = `slot-${i}-totp`;
  return `
    <div class="secret-cred-row">
      <div class="secret-cred-id">
        <span class="secret-cred-host">${host}</span>
        ${secretPillHtml('', scope)}
      </div>
      ${edit ? `
      <div class="secret-cred-actions">
        <button data-secret="reveal" data-host="${host}" data-scope="${scopeAttr}" data-field="username" data-out="${slotUser}">Reveal user</button>
        <button data-secret="reveal" data-host="${host}" data-scope="${scopeAttr}" data-field="password" data-out="${slotPass}">Reveal password</button>
        <button data-secret="totp" data-host="${host}" data-scope="${scopeAttr}" data-out="${slotTotp}">Copy TOTP</button>
        <button class="danger" data-secret="rm" data-host="${host}" data-scope="${scopeAttr}">Delete</button>
      </div>
      <div class="secret-reveal-slots">
        <span class="secret-value" data-slot="${slotUser}"></span>
        <span class="secret-value" data-slot="${slotPass}"></span>
        <span class="secret-value" data-slot="${slotTotp}"></span>
      </div>` : ''}
    </div>`;
}

function secretHistoryHtml() {
  const events = state.secrets.history?.events || [];
  if (!events.length) {
    return '<div class="secret-section"><h3>Usage history</h3><div class="empty-state">No secret activity recorded.</div></div>';
  }
  const rows = events.slice().reverse().map(ev => `
    <tr>
      <td>${escapeHtml(fmtTime(ev.timestamp))}</td>
      <td>${escapeHtml(ev.host)}</td>
      <td>${escapeHtml(ev.scope || 'global')}</td>
      <td>${escapeHtml(ev.field || '-')}</td>
      <td>${escapeHtml(ev.outcome || (ev.ok ? 'ok' : 'denied'))}</td>
      <td>${ev.ok ? secretPillHtml('ok', 'ok') : secretPillHtml('failed', 'fail')}</td>
    </tr>`).join('');
  return `
    <div class="secret-section">
      <h3>Usage history</h3>
      <div class="table-wrap">
        <table class="secret-history-table">
          <thead>
            <tr><th>Time</th><th>Host</th><th>Scope</th><th>Field</th><th>Outcome</th><th>Result</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}

function onSecretClick(event) {
  const btn = event.target.closest('[data-secret]');
  const panel = $('#secretsPanel');
  if (!btn || !panel || !panel.contains(btn)) return;
  const d = btn.dataset;
  switch (d.secret) {
    case 'setup': secretSetup(); break;
    case 'begin': secretBeginEdit(); break;
    case 'revoke': secretRevokeEdit(); break;
    case 'optin-disable': secretOptOut(); break;
    case 'unlock': secretUnlock(); break;
    case 'set': secretSet(); break;
    case 'rm': secretRemove(d.host, d.scope); break;
    case 'reveal': secretReveal(d.host, d.field, d.scope, d.out); break;
    case 'totp': secretTotp(d.host, d.scope, d.out); break;
    case 'wizard-install': secretWizardInstall(); break;
    case 'wizard-login': secretWizardLogin(); break;
    default: break;
  }
}

function selectTab(tab) {
  state.tab = tab;
  renderTabs();
  if (tab === 'secrets') refreshSecrets(true).catch(() => {});
}

function render() {
  renderProfiles();
  renderProfileDetail();
  renderTabs();
  renderTimeline();
  renderRawLog();
  renderLifecycle();
}

$('#refreshButton').addEventListener('click', refresh);
$('#profileSearch').addEventListener('input', (event) => {
  state.profileSearch = event.target.value;
  renderProfiles();
});
$$('[data-status-filter]').forEach(button => {
  button.addEventListener('click', () => {
    state.profileStatusFilter = button.dataset.statusFilter;
    renderProfiles();
  });
});
$('#selectAllProfiles').addEventListener('change', (event) => {
  const profiles = visibleProfiles();
  state.selectedProfiles = event.target.checked
    ? new Set([...state.selectedProfiles, ...profiles.map(profile => profile.name)])
    : new Set([...state.selectedProfiles].filter(name => !profiles.some(profile => profile.name === name)));
  renderProfiles();
});
$('#deleteSelectedProfiles').addEventListener('click', deleteSelectedProfiles);
$('#saveRetention').addEventListener('click', saveRetention);
$$('[data-lifecycle]').forEach(button => {
  button.addEventListener('click', () => runLifecycle(button.dataset.lifecycle));
});

$('#secretsPanel').addEventListener('click', onSecretClick);

refresh().catch(err => toast(err.message));

// If reopened via `chromux secret approve` (?approve=<token>), exchange the
// launch token for the session cookie, strip the query param, and jump to the
// Secrets tab so the newly unlocked edit mode is visible.
secretConsumeApproveToken()
  .then(consumed => { if (consumed) selectTab('secrets'); })
  .catch(() => {});

// Keep the open dashboard live: poll state so profiles created or deleted
// elsewhere show up without a manual reload. Skip while the user is mid-search,
// mid-confirm, or the tab is hidden, and never overlap in-flight refreshes.
const AUTO_REFRESH_MS = 5000;
let autoRefreshInFlight = false;
setInterval(async () => {
  if (document.hidden || confirmModalOpen()) return;
  if (document.activeElement === $('#profileSearch')) return;
  if (autoRefreshInFlight) return;
  autoRefreshInFlight = true;
  try {
    await refresh();
  } catch {
    // Silent for background polls; the manual refresh button surfaces errors.
  } finally {
    autoRefreshInFlight = false;
  }
}, AUTO_REFRESH_MS);

// Keep the Secrets tab live while it is active: refresh lock state / TTL /
// history without wiping in-progress form entry (renderSecrets guards on a
// focused input and only re-renders on material change).
let secretPollInFlight = false;
setInterval(async () => {
  if (document.hidden || !state.secrets.active || confirmModalOpen()) return;
  if (secretInputFocused()) { updateSecretTtl(); return; }
  if (secretPollInFlight) return;
  secretPollInFlight = true;
  try {
    await refreshSecrets(false);
  } catch {
    // Silent for background polls; user actions surface their own errors.
  } finally {
    secretPollInFlight = false;
  }
}, AUTO_REFRESH_MS);

// Tick the edit-session countdown once a second (text-only, no re-render).
setInterval(updateSecretTtl, 1000);
