
const SUFFIXES = [
  ['DTg', 1e99],
  ['UTg', 1e96], ['Tg', 1e93],
  ['NoVt', 1e90], ['OcVt', 1e87], ['SpVt', 1e84], ['SxVt', 1e81],
  ['QnVt', 1e78], ['QdVt', 1e75],
  ['TVt', 1e72], ['DVt', 1e69], ['UVt', 1e66], ['Vt', 1e63],
  ['NoDe', 1e60], ['OcDe', 1e57], ['SpDe', 1e54], ['SxDe', 1e51],
  ['QnDe', 1e48], ['QdDe', 1e45], ['TDe', 1e42], ['DDe', 1e39],
  ['UDe', 1e36], ['De', 1e33], ['No', 1e30], ['Oc', 1e27],
  ['Sp', 1e24], ['Sx', 1e21], ['Qn', 1e18], ['Qd', 1e15],
  ['T', 1e12], ['B', 1e9], ['M', 1e6], ['K', 1e3],
];

function parseShort(str) {
  str = (str || '').trim();
  if (!str) return NaN;
  if (/^[\d.]+e[+\-]?\d+$/i.test(str)) return parseFloat(str);
  for (const [suf, mul] of SUFFIXES) {
    const re = new RegExp('^([\\d.]+)\\s*' + suf + '$', 'i');
    const m = str.match(re);
    if (m) return parseFloat(m[1]) * mul;
  }
  return parseFloat(str);
}

function toShort(n) {
  if (n === 0) return '0';
  if (n < 0) return '-' + toShort(-n);
  for (const [suf, mul] of SUFFIXES) {
    if (n >= mul) return (n / mul).toFixed(2).replace(/\.?0+$/, '') + suf;
  }
  if (n >= 1) return n.toFixed(2).replace(/\.?0+$/, '');
  return n.toExponential(2);
}

function toSci(n) {
  if (n === 0) return '0';
  return n.toExponential(4);
}


function formatDuration(seconds) {
  if (!isFinite(seconds) || seconds <= 0) return '—';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (d > 365) return Math.floor(d / 365) + 'y ' + (d % 365) + 'd';
  if (d > 0) return d + 'd ' + h + 'h';
  if (h > 0) return h + 'h ' + m + 'm';
  if (m > 0) return m + 'm ' + s + 's';
  return s + 's';
}

function parseTimeString(str) {
  str = (str || '').trim();
  if (!str) return 0;

  const asNum = parseShort(str);
  if (!isNaN(asNum) && /^[\d.eE+\-]+$/.test(str)) return asNum;
  if (!isNaN(asNum) && asNum > 0 && !/[dhms]/i.test(str)) return asNum;

  let total = 0;
  const dayMatch = str.match(/([\d.]+)\s*d/i);
  const hourMatch = str.match(/([\d.]+)\s*h/i);
  const minMatch = str.match(/([\d.]+)\s*m(?!s)/i);
  const secMatch = str.match(/([\d.]+)\s*s/i);

  if (dayMatch) total += parseFloat(dayMatch[1]) * 86400;
  if (hourMatch) total += parseFloat(hourMatch[1]) * 3600;
  if (minMatch) total += parseFloat(minMatch[1]) * 60;
  if (secMatch) total += parseFloat(secMatch[1]);

  if (total === 0 && !isNaN(parseFloat(str))) return parseFloat(str);

  return total;
}


function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('open');
  document.getElementById('menuBtn').classList.toggle('open');
}

function toggleTutorial() {
  const modal = document.getElementById('tutorialModal');
  if (modal.classList.contains('hidden')) {
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  } else {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
}

function switchTab(tabId) {
  document.querySelectorAll('[id^="tab-"]').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  document.getElementById('tab-' + tabId).classList.remove('hidden');
  event.target.classList.add('active');
}


const RARE_RUNE_TIERS = [
  { name: 'Prismatic Slime', constant: 3.5625e13 },
  { name: 'Deep Freeze', constant: 3.5625e22 },
  { name: 'Genesis Slime', constant: 2.700118e40 },
];

function rrCalc() {
  const rps = parseShort(document.getElementById('rr-rps').value) || 0;
  const bulk = parseShort(document.getElementById('rr-bulk').value) || 0;
  const clone = parseInt(document.getElementById('rr-clone').value) || 0;
  const currentTier = parseInt(document.getElementById('rr-tierInput').value) || 1;

  const resultPanel = document.getElementById('rr-resultPanel');
  const banner = document.getElementById('rr-resultBanner');
  const table = document.getElementById('rr-projectionsTable');

  if (rps <= 0 || bulk <= 0 || clone <= 0) {
    resultPanel.classList.add('hidden');
    return;
  }

  const speed = rps / bulk / clone;

  let target;
  if (speed < RARE_RUNE_TIERS[0].constant) {
    target = RARE_RUNE_TIERS[0];
  } else if (speed < RARE_RUNE_TIERS[1].constant) {
    target = RARE_RUNE_TIERS[1];
  } else {
    target = RARE_RUNE_TIERS[2];
  }

  const perfectBulk = Math.floor(target.constant / speed);
  const cloneVal = parseInt(document.getElementById('rr-clone').value) || 1;
  const raresPerSec = cloneVal / 30;

  resultPanel.classList.remove('hidden');
  banner.innerHTML = `
    <div class="label">Set Your Bulk To</div>
    <div class="value">${perfectBulk}</div>
    <div class="sub">for ${target.name} · Speed: ${toShort(speed)}/s · ~${(raresPerSec * 60).toFixed(1)} rare/min</div>
  `;

  table.innerHTML = '';
  const header = document.createElement('div');
  header.className = 'tier-row header-row';
  header.innerHTML = '<span class="tier-col tier-num">Tier</span><span class="tier-col tier-req">Perfect Bulk</span><span class="tier-col tier-boost">Runes Needed</span><span class="tier-col tier-rps">Rune</span><span class="tier-col tier-time">Time</span>';
  table.appendChild(header);

  const currentSpeedMulti = Math.pow(1.13, currentTier - 1);
  const currentThreshold = currentTier > 1 ? Math.round(2 * Math.pow(1.5, currentTier - 1)) : 0;

  for (let t = currentTier; t <= Math.min(currentTier + 12, 30); t++) {
    const tierMulti = Math.pow(1.13, t - 1);
    const tierSpeed = speed * tierMulti / currentSpeedMulti;

    let tierTarget;
    if (tierSpeed < RARE_RUNE_TIERS[0].constant) {
      tierTarget = RARE_RUNE_TIERS[0];
    } else if (tierSpeed < RARE_RUNE_TIERS[1].constant) {
      tierTarget = RARE_RUNE_TIERS[1];
    } else {
      tierTarget = RARE_RUNE_TIERS[2];
    }

    const tierBulk = Math.floor(tierTarget.constant / tierSpeed);

    const tierThreshold = Math.round(2 * Math.pow(1.5, t - 1));
    const runesFromCurrent = tierThreshold - currentThreshold;
    const timeFromNow = runesFromCurrent / raresPerSec;

    const prevThreshold = t > 1 ? Math.round(2 * Math.pow(1.5, t - 2)) : 0;
    const runesIncremental = tierThreshold - prevThreshold;

    const row = document.createElement('div');
    row.className = 'tier-row' + (t === currentTier ? ' current' : '');

    if (t === 30) {
      row.innerHTML = `
        <span class="tier-col tier-num"><strong>T${t}</strong></span>
        <span class="tier-col tier-req" style="color:var(--accent);">MAX</span>
        <span class="tier-col tier-boost">—</span>
        <span class="tier-col tier-rps">—</span>
        <span class="tier-col tier-time" style="color:var(--accent);">${t === currentTier ? 'Complete' : '—'}</span>
      `;
    } else {
      row.innerHTML = `
        <span class="tier-col tier-num"><strong>T${t}</strong></span>
        <span class="tier-col tier-req">${tierBulk}</span>
        <span class="tier-col tier-boost">${runesIncremental}</span>
        <span class="tier-col tier-rps">${tierTarget.name}</span>
        <span class="tier-col tier-time">${t === currentTier ? 'Current' : formatDuration(timeFromNow)}</span>
      `;
    }
    table.appendChild(row);
  }
}

function rolledReq(tier) { return 100 * Math.pow(1.4, tier - 1); }
function rolledBoost(tier) { return Math.pow(1.1, tier - 1); }

function rolledCalc() {
  const currentRolled = parseShort(document.getElementById('rolled-current').value) || 0;
  const rps = parseShort(document.getElementById('rolled-rps').value) || 0;

  const table = document.getElementById('rolled-table');
  const summary = document.getElementById('rolled-summary');
  table.innerHTML = '';

  let actualTier = 1;
  for (let t = 1; t <= 1000; t++) {
    if (currentRolled >= rolledReq(t)) actualTier = t + 1;
    else break;
  }

  const currentBoost = rolledBoost(actualTier);
  const baseRPS = rps > 0 ? rps / currentBoost : 0;

  const nextReq = rolledReq(actualTier);
  const remaining = Math.max(0, nextReq - currentRolled);
  const timeToNext = rps > 0 ? remaining / rps : Infinity;

  if (currentRolled > 0) {
    summary.innerHTML = `
      <div class="label">Current Tier</div>
      <div class="value">${actualTier}</div>
      <div class="sub">Boost: x${toShort(currentBoost)} Rune Bulk${rps > 0 ? ' · Next tier in ' + formatDuration(timeToNext) : ''}</div>
    `;
    summary.style.display = '';
  } else {
    summary.style.display = 'none';
  }

  const header = document.createElement('div');
  header.className = 'tier-row header-row';
  header.innerHTML = '<span class="tier-col tier-num">Tier</span><span class="tier-col tier-req">Runes Required</span><span class="tier-col tier-boost">Boost</span>' + (baseRPS > 0 ? '<span class="tier-col tier-rps">RPS After</span>' : '') + '<span class="tier-col tier-time">Time</span>';
  table.appendChild(header);

  const startTier = currentRolled > 0 ? Math.max(1, actualTier - 2) : 1;
  const endTier = currentRolled > 0 ? Math.min(actualTier + 15, 1000) : 20;

  let cumulativeTime = 0;
  if (rps > 0 && currentRolled > 0 && currentRolled < nextReq) {
    cumulativeTime = remaining / rps;
  }

  const tierTimes = {};
  tierTimes[actualTier] = cumulativeTime;

  for (let t = actualTier + 1; t <= endTier; t++) {
    const rpsAtTier = baseRPS * rolledBoost(t);
    const runesBetween = rolledReq(t) - rolledReq(t - 1);
    const timeForSegment = rpsAtTier > 0 ? runesBetween / rpsAtTier : Infinity;
    cumulativeTime += timeForSegment;
    tierTimes[t] = cumulativeTime;
  }

  for (let t = startTier; t <= endTier; t++) {
    const req = rolledReq(t);
    const boost = rolledBoost(t);
    const completed = currentRolled >= req;

    let timeDisplay;
    if (completed) {
      timeDisplay = 'Done';
    } else if (rps > 0 && tierTimes[t] !== undefined) {
      timeDisplay = formatDuration(tierTimes[t]);
    } else if (rps > 0) {
      timeDisplay = '—';
    } else {
      timeDisplay = toShort(req);
    }

    const rpsAtThisTier = baseRPS * boost;
    const rpsDisplay = baseRPS > 0 ? `<span class="tier-col tier-rps">${toShort(rpsAtThisTier)}/s</span>` : '';

    const row = document.createElement('div');
    row.className = 'tier-row' + (t === actualTier && currentRolled > 0 ? ' current' : '') + (completed ? ' completed' : '');
    row.innerHTML = `
      <span class="tier-col tier-num"><strong>T${t}</strong></span>
      <span class="tier-col tier-req">${toShort(req)}</span>
      <span class="tier-col tier-boost">x${toShort(boost)}</span>
      ${rpsDisplay}
      <span class="tier-col tier-time ${completed ? 'done' : ''}">${timeDisplay}</span>
    `;
    table.appendChild(row);
  }
}

function luckReq(tier) { return tier * 5; }
function luckBoost(tier) { return Math.pow(3, tier - 1); }

function luckCalc() {
  const currentRarity = parseInt(document.getElementById('luck-rarity').value) || 0;

  const table = document.getElementById('luck-table');
  const summary = document.getElementById('luck-summary');
  table.innerHTML = '';

  let actualTier = Math.min(Math.floor(currentRarity / 5) + 1, 101);
  if (currentRarity <= 0) actualTier = 1;

  const nextReq = actualTier <= 100 ? luckReq(actualTier) : null;
  const remaining = nextReq ? Math.max(0, nextReq - currentRarity) : 0;

  if (currentRarity > 0) {
    summary.innerHTML = `
      <div class="label">Current Tier</div>
      <div class="value">${Math.min(actualTier, 100)}</div>
      <div class="sub">Boost: x${toShort(luckBoost(Math.min(actualTier, 100)))} Luck · ${actualTier > 100 ? 'All tiers complete!' : 'Need rarity ' + nextReq + ' for next tier (' + remaining + ' more)'}</div>
    `;
    summary.style.display = '';
  } else {
    summary.style.display = 'none';
  }

  const header = document.createElement('div');
  header.className = 'tier-row header-row';
  header.innerHTML = '<span class="tier-col tier-num">Tier</span><span class="tier-col tier-req">Rarity Required</span><span class="tier-col tier-boost">Luck Boost</span><span class="tier-col tier-time">Status</span>';
  table.appendChild(header);

  const startTier = currentRarity > 0 ? Math.max(1, actualTier - 3) : 1;
  const endTier = currentRarity > 0 ? Math.min(actualTier + 15, 100) : 20;

  for (let t = startTier; t <= endTier; t++) {
    const req = luckReq(t);
    const boost = luckBoost(t);
    const completed = currentRarity >= req;

    const row = document.createElement('div');
    row.className = 'tier-row' + (t === actualTier && currentRarity > 0 ? ' current' : '') + (completed ? ' completed' : '');
    row.innerHTML = `
      <span class="tier-col tier-num"><strong>T${t}</strong></span>
      <span class="tier-col tier-req">Rarity ${req}</span>
      <span class="tier-col tier-boost">x${toShort(boost)}</span>
      <span class="tier-col tier-time ${completed ? 'done' : ''}">${completed ? 'Done' : currentRarity > 0 ? 'Need ' + (req - currentRarity) + ' more' : 'Rarity ' + req}</span>
    `;
    table.appendChild(row);
  }
}

const TIME_REQS = [600, 1800, 3600, 7200, 18000, 36000, 86400, 172800, 259200, 360000, 604800, 1080000];

function timeCalc() {
  const currentTime = parseTimeString(document.getElementById('time-current').value);

  const table = document.getElementById('time-table');
  const summary = document.getElementById('time-summary');
  table.innerHTML = '';

  let actualTier = 0;
  for (let t = 0; t < TIME_REQS.length; t++) {
    if (currentTime >= TIME_REQS[t]) actualTier = t + 1;
    else break;
  }

  const nextReq = actualTier < TIME_REQS.length ? TIME_REQS[actualTier] : null;
  const remaining = nextReq ? Math.max(0, nextReq - currentTime) : 0;

  if (currentTime > 0) {
    summary.innerHTML = `
      <div class="label">Current Tier</div>
      <div class="value">${actualTier + 1}</div>
      <div class="sub">Boost: +${actualTier} Walkspeed · ${nextReq ? 'Next tier in ' + formatDuration(remaining) : 'All tiers complete!'}</div>
    `;
    summary.style.display = '';
  } else {
    summary.style.display = 'none';
  }

  const header = document.createElement('div');
  header.className = 'tier-row header-row';
  header.innerHTML = '<span class="tier-col tier-num">Tier</span><span class="tier-col tier-req">Time Required</span><span class="tier-col tier-boost">Walkspeed</span><span class="tier-col tier-time">Status</span>';
  table.appendChild(header);

  for (let t = 0; t < TIME_REQS.length; t++) {
    const req = TIME_REQS[t];
    const completed = currentTime >= req;
    const rem = Math.max(0, req - currentTime);

    const row = document.createElement('div');
    row.className = 'tier-row' + (t === actualTier && currentTime > 0 ? ' current' : '') + (completed ? ' completed' : '');
    row.innerHTML = `
      <span class="tier-col tier-num"><strong>T${t + 1}</strong></span>
      <span class="tier-col tier-req">${formatDuration(req)}</span>
      <span class="tier-col tier-boost">+${t + 1}</span>
      <span class="tier-col tier-time ${completed ? 'done' : ''}">${completed ? 'Done' : currentTime > 0 ? formatDuration(rem) + ' left' : formatDuration(req)}</span>
    `;
    table.appendChild(row);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  timeCalc();
  luckCalc();
  rolledCalc();
});
