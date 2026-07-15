/* ═══════════════════════════════════════════
   Iran Sales Dashboard — app.js
   ═══════════════════════════════════════════ */

'use strict';

// ── STATE ──────────────────────────────────
let SD         = {};        // province sales data
let allSales   = [];        // all transactions
let selP       = null;      // selected province id
let activeReg  = 'all';     // active region filter
let mData      = new Array(12).fill(0);   // monthly sales
let mWData     = new Array(12).fill(0);   // monthly weight
let mChart     = null;
let isDark     = false;
let products   = ['پوشاک','کفش','اکسسوری','سایر'];

// representatives: { repId: { id, provinceId, type, name, phone, natId, monthly: {"1403-1": amt, ...} } }
let reps = {};
let repIdCounter = 1;
let activeRepDetailId = null;

const STORAGE_KEY = 'iran_sales_v1';

// ── NUMBER FORMATTING ──────────────────────
function fmt(n, decimals = 1) {
  if (n === undefined || n === null || isNaN(n)) return '۰';
  const fixed = parseFloat(n).toFixed(decimals);
  // add thousands separator
  const parts = fixed.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

function fmtInt(n) {
  if (!n) return '۰';
  return parseInt(n).toLocaleString('fa-IR');
}

function fmtNum(n, decimals = 1) {
  // format with persian thousands separators
  const num = parseFloat(n || 0).toFixed(decimals);
  const [int, dec] = num.split('.');
  const intFormatted = int.replace(/\B(?=(\d{3})+(?!\d))/g, '،');
  return dec ? `${intFormatted}.${dec}` : intFormatted;
}

// ── LOCAL STORAGE ──────────────────────────
function saveToStorage() {
  try {
    const payload = {
      SD, allSales, mData, mWData, products, isDark,
      reps, repIdCounter,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('ذخیره‌سازی ناموفق:', e);
  }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const p = JSON.parse(raw);
    SD       = p.SD       || {};
    allSales = p.allSales || [];
    mData    = p.mData    || new Array(12).fill(0);
    mWData   = p.mWData   || new Array(12).fill(0);
    products = p.products || ['پوشاک','کفش','اکسسوری','سایر'];
    reps          = p.reps          || {};
    repIdCounter  = p.repIdCounter  || 1;
    if (p.isDark) {
      isDark = true;
      document.body.setAttribute('data-dark', '');
      document.getElementById('themeIco').textContent = '☀️';
      document.getElementById('themeTxt').textContent = 'لایت مود';
    }
    return true;
  } catch (e) {
    console.warn('بارگذاری ناموفق:', e);
    return false;
  }
}

function clearStorage() {
  if (!confirm('آیا مطمئن هستید؟ تمام داده‌ها پاک می‌شوند.')) return;
  localStorage.removeItem(STORAGE_KEY);
  SD = {}; allSales = []; mData = new Array(12).fill(0); mWData = new Array(12).fill(0);
  products = ['پوشاک','کفش','اکسسوری','سایر'];
  reps = {}; repIdCounter = 1;
  refresh();
  showToast('🗑 تمام داده‌ها پاک شدند');
}

// ── TOAST ──────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ── THEME ──────────────────────────────────
function toggleTheme() {
  isDark = !isDark;
  document.body.toggleAttribute('data-dark', isDark);
  document.getElementById('themeIco').textContent = isDark ? '☀️' : '🌙';
  document.getElementById('themeTxt').textContent = isDark ? 'لایت مود' : 'دارک مود';
  buildMap();
  if (mChart) {
    const tc = isDark ? '#4a5568' : '#94a3b8';
    const gc = isDark ? 'rgba(255,255,255,.03)' : 'rgba(0,0,0,.04)';
    mChart.options.scales.y.ticks.color = tc;
    mChart.options.scales.y.grid.color  = gc;
    mChart.options.scales.x.ticks.color = tc;
    mChart.update();
  }
  saveToStorage();
}

// ── PRODUCT MANAGER ────────────────────────
function renderProds() {
  const L = document.getElementById('prodList');
  L.innerHTML = products.map((p, i) =>
    `<div class="prod-chip">${p}<span class="prod-del" onclick="delProd(${i})">✕</span></div>`
  ).join('');
  const s = document.getElementById('fPr');
  if (s) {
    const cur = s.value;
    s.innerHTML = products.map(p => `<option value="${p}">${p}</option>`).join('');
    if (products.includes(cur)) s.value = cur;
  }
}

function addProd() {
  const inp = document.getElementById('prodInp');
  const v = inp.value.trim();
  if (!v || products.includes(v)) { inp.value = ''; return; }
  products.push(v);
  inp.value = '';
  renderProds();
  saveToStorage();
  showToast(`✅ محصول "${v}" اضافه شد`);
}

function delProd(i) {
  if (products.length <= 1) return;
  const name = products[i];
  products.splice(i, 1);
  renderProds();
  saveToStorage();
  showToast(`🗑 محصول "${name}" حذف شد`);
}

// ── MAP COLOR ──────────────────────────────
function getColor(amt, mx) {
  if (!amt || amt === 0) return 'var(--p0)';
  const r = amt / mx;
  if (r > .8)  return 'var(--p4)';
  if (r > .55) return 'var(--p3)';
  if (r > .3)  return 'var(--p2)';
  return 'var(--p1)';
}

// ── BUILD MAP ──────────────────────────────
function buildMap() {
  const svg = document.getElementById('imap');
  svg.innerHTML = '';
  const mx = Math.max(1, ...Object.values(SD).map(d => d.total || 0));
  const filtIds = activeReg === 'all' ? null : PDATA.filter(p => p.r === activeReg).map(p => p.id);

  // ocean background
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('width', '860'); bg.setAttribute('height', '580');
  bg.setAttribute('fill', isDark ? '#0a1929' : '#c2d8ea');
  bg.setAttribute('rx', '8');
  svg.appendChild(bg);

  PDATA.forEach(p => {
    const d   = SD[p.id], amt = d ? d.total : 0;
    const dim = filtIds && !filtIds.includes(p.id);
    const fill = dim ? (isDark ? '#131c28' : '#d5e5ef') : getColor(amt, mx);

    const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    el.setAttribute('d', p.path);
    el.setAttribute('fill', fill);
    el.setAttribute('stroke', isDark ? '#0d1117' : '#ffffff');
    el.setAttribute('stroke-width', selP === p.id ? '2.5' : '.7');
    if (selP === p.id) el.classList.add('sel');
    el.addEventListener('click', () => clickProv(p));
    el.addEventListener('mousemove', e => showTip(e, p, amt, d));
    el.addEventListener('mouseleave', () => { document.getElementById('tip').style.display = 'none'; });
    svg.appendChild(el);

    // province label
    const short = p.n.length > 5 ? p.n.slice(0, 4) + '…' : p.n;
    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt.setAttribute('x', p.cx); txt.setAttribute('y', p.cy + 3.5);
    txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('font-size', p.id === 'sistan' ? '7' : '8.5');
    txt.setAttribute('fill', amt > 0 && !dim ? '#fff' : (isDark ? '#4a5568' : '#6b7280'));
    txt.setAttribute('font-family', 'Vazirmatn, sans-serif');
    txt.setAttribute('font-weight', amt > 0 ? '600' : '400');
    txt.setAttribute('pointer-events', 'none');
    txt.textContent = short;
    svg.appendChild(txt);
  });
}

// ── TOOLTIP ────────────────────────────────
function showTip(e, p, amt, d) {
  const tt   = document.getElementById('tip');
  const rect = e.currentTarget.closest('.map-panel').getBoundingClientRect();
  const x    = e.clientX - rect.left + 13;
  const y    = e.clientY - rect.top  - 12;
  tt.style.left    = Math.min(x, rect.width - 178) + 'px';
  tt.style.top     = Math.max(y, 4) + 'px';
  tt.style.display = 'block';

  const provReps = reposOfProvince(p.id);
  const repHtml = provReps.length
    ? `<div class="tt-date">🧑‍💼 ${provReps.length} نماینده — ${fmtNum(provReps.reduce((s,r)=>s+repTotal(r),0))} م.ت</div>`
    : '';

  tt.innerHTML = `
    <div class="tt-name">${p.n}</div>
    <div class="tt-r"><span>💰 فروش کل</span>   <span class="tt-v">${fmtNum(amt)} م.ت</span></div>
    <div class="tt-r"><span>⚖️ وزن</span>        <span class="tt-v">${fmtNum(d ? d.weight : 0)} kg</span></div>
    <div class="tt-r"><span>👤 مشتریان</span>    <span class="tt-v">${fmtInt(d ? d.count : 0)} نفر</span></div>
    <div class="tt-r"><span>🔢 معاملات</span>    <span class="tt-v">${fmtInt(d ? d.txn : 0)}</span></div>
    ${d && d.count > 0 ? `<div class="tt-r"><span>📊 میانگین</span><span class="tt-v">${fmtNum(d.total / d.count)} م.ت</span></div>` : ''}
    ${d && d.lastDate  ? `<div class="tt-date">📅 آخرین فروش: ${d.lastDate}</div>` : ''}
    ${repHtml}
  `;
}

// ── PROVINCE CLICK ─────────────────────────
function clickProv(p) {
  selP = p.id;
  document.getElementById('selN').textContent = p.n;
  document.getElementById('fP').value = p.id;
  buildMap();
}

// ── REGION FILTER ──────────────────────────
function setReg(r, el) {
  activeReg = r;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('on'));
  el.classList.add('on');
  buildMap();
}

// ── MODAL ──────────────────────────────────
function openM() {
  document.getElementById('fD').value = new Date().toISOString().split('T')[0];
  document.getElementById('modal').classList.add('open');
}
function closeM() { document.getElementById('modal').classList.remove('open'); }

// ── ADD RECORD ─────────────────────────────
function addRec(pid, cust, amt, wt, prod, dt) {
  const p = PDATA.find(x => x.id === pid);
  if (!p) return false;
  if (!SD[pid]) SD[pid] = { total: 0, weight: 0, count: 0, txn: 0, lastDate: null };
  SD[pid].total  += amt;
  SD[pid].weight += (wt || 0);
  SD[pid].count++;
  SD[pid].txn++;
  if (dt) SD[pid].lastDate = dt;
  allSales.unshift({ name: cust, amount: amt, weight: wt || 0, province: p.n, product: prod, date: dt || '' });
  const m = dt ? new Date(dt).getMonth() : new Date().getMonth();
  if (m >= 0 && m < 12) { mData[m] += amt; mWData[m] += (wt || 0); }
  return true;
}

// ── SAVE FROM MODAL ────────────────────────
function doSave() {
  const pr = document.getElementById('fP').value;
  const cu = document.getElementById('fC').value.trim();
  const am = parseFloat(document.getElementById('fA').value);
  const wt = parseFloat(document.getElementById('fW').value) || 0;
  const pd = document.getElementById('fPr').value;
  const dt = document.getElementById('fD').value;
  if (!pr || !cu || !am || am <= 0) {
    alert('استان، نام مشتری و مبلغ الزامی است');
    return;
  }
  addRec(pr, cu, am, wt, pd, dt);
  refresh();
  saveToStorage();
  closeM();
  document.getElementById('fC').value = '';
  document.getElementById('fA').value = '';
  document.getElementById('fW').value = '';
  showToast('✅ فروش با موفقیت ثبت شد');
}

// ── REFRESH ALL UI ─────────────────────────
function refresh() {
  const tot  = Object.values(SD).reduce((s, d) => s + d.total,  0);
  const totW = Object.values(SD).reduce((s, d) => s + d.weight, 0);
  const cu   = Object.values(SD).reduce((s, d) => s + d.count,  0);
  const ap   = Object.keys(SD).length;

  document.getElementById('k1').textContent = fmtNum(tot);
  document.getElementById('k5').textContent = fmtNum(totW);
  document.getElementById('k2').textContent = fmtInt(cu);
  document.getElementById('k3').textContent = ap;

  updBars();
  updCusts();
  updChart();
  buildMap();
  document.getElementById('upd').textContent = 'به‌روزرسانی: ' + new Date().toLocaleTimeString('fa-IR');
}

// ── TOP PROVINCES BARS ─────────────────────
function updBars() {
  const sorted = Object.entries(SD).sort((a, b) => b[1].total - a[1].total).slice(0, 6);
  const mx  = sorted.length ? sorted[0][1].total : 1;
  const c   = document.getElementById('topB');
  if (!sorted.length) { c.innerHTML = '<div class="empty">هنوز داده‌ای ندارید</div>'; return; }
  const medals = ['🥇', '🥈', '🥉', '④', '⑤', '⑥'];
  c.innerHTML = sorted.map(([id, d], i) => {
    const p   = PDATA.find(x => x.id === id);
    const pct = Math.round(d.total / mx * 100);
    return `<div class="bar-row">
      <div class="bar-rank">${medals[i] || (i + 1)}</div>
      <div class="bar-lbl">${p ? p.n : id}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
      <div class="bar-val">${fmtNum(d.total)} م</div>
    </div>`;
  }).join('');
}

// ── CUSTOMER LIST ──────────────────────────
function updCusts() {
  const c = document.getElementById('cList');
  if (!allSales.length) { c.innerHTML = '<div class="empty">هنوز تراکنشی ثبت نشده</div>'; return; }
  c.innerHTML = allSales.slice(0, 10).map(s => `
    <div class="cust-row">
      <div>
        <div class="cust-name">${s.name}</div>
        <div class="cust-meta">${s.province} · ${s.product}${s.date ? ' · ' + s.date : ''}</div>
      </div>
      <div class="cust-amt">
        ${fmtNum(s.amount)} م<br>
        <span style="font-size:9px;color:var(--txt3)">${fmtNum(s.weight)} kg</span>
      </div>
    </div>`).join('');
}

// ── MONTHLY CHART ──────────────────────────
function updChart() {
  const MN  = ['فر','ار','خر','تیر','مر','شه','مه','آب','آذ','دی','به','اس'];
  const now = new Date().getMonth();
  const tc  = isDark ? '#4a5568' : '#94a3b8';
  const gc  = isDark ? 'rgba(255,255,255,.03)' : 'rgba(0,0,0,.04)';
  const bgs = mData.map((_, i) => i === now
    ? (isDark ? '#50b0f8' : '#1e4fb5')
    : (isDark ? '#1260a8' : '#5598cc'));

  if (!mChart) {
    mChart = new Chart(document.getElementById('mCh'), {
      type: 'bar',
      data: {
        labels: MN,
        datasets: [
          {
            label: 'فروش', data: [...mData], backgroundColor: bgs,
            borderRadius: 3, borderSkipped: false, yAxisID: 'y'
          },
          {
            label: 'وزن', data: [...mWData], type: 'line',
            borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,.1)',
            tension: .3, pointRadius: 2, borderWidth: 2, yAxisID: 'y2', fill: true
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y:  { beginAtZero: true, position: 'right',
                ticks: { font: { size: 9 }, color: tc, callback: v => fmtNum(v, 0) + 'م' },
                grid: { color: gc } },
          y2: { beginAtZero: true, position: 'left',
                ticks: { font: { size: 9 }, color: '#f59e0b', callback: v => fmtNum(v, 0) + 'k' },
                grid: { display: false } },
          x:  { ticks: { font: { size: 9, family: 'Vazirmatn' }, color: tc }, grid: { display: false } }
        }
      }
    });
  } else {
    mChart.data.datasets[0].data = [...mData];
    mChart.data.datasets[0].backgroundColor = bgs;
    mChart.data.datasets[1].data = [...mWData];
    mChart.options.scales.y.ticks.color  = tc;
    mChart.options.scales.y.grid.color   = gc;
    mChart.options.scales.x.ticks.color  = tc;
    mChart.update();
  }
}

// ═══════════════════════════════════════════
// REPRESENTATIVES (نمایندگان استان‌ها)
// ═══════════════════════════════════════════

function reposOfProvince(pid) {
  return Object.values(reps).filter(r => r.provinceId === pid);
}

function repTotal(rep) {
  return Object.values(rep.monthly || {}).reduce((s, v) => s + (v || 0), 0);
}

function openRepM() {
  populateRepProvinceSelect();
  document.getElementById('rName').value = '';
  document.getElementById('rPhone').value = '';
  document.getElementById('rNatId').value = '';
  const pSel = document.getElementById('rP');
  if (selP) pSel.value = selP;
  updateRepTypeLabels();
  document.getElementById('repModal').classList.add('open');
}
function closeRepM() { document.getElementById('repModal').classList.remove('open'); }

function populateRepProvinceSelect() {
  const sel = document.getElementById('rP');
  if (sel.options.length > 1) return;
  PDATA.forEach(p => {
    const o = document.createElement('option');
    o.value = p.id; o.textContent = p.n;
    sel.appendChild(o);
  });
}

function updateRepTypeLabels() {
  const type = document.querySelector('input[name="rType"]:checked').value;
  const isLegal = type === 'حقوقی';
  document.getElementById('rNameLbl').textContent = isLegal ? 'نام شرکت / نهاد' : 'نام و نام خانوادگی';
  document.getElementById('rIdLbl').textContent   = isLegal ? 'شناسه ملی / شماره ثبت' : 'کد ملی';
  document.getElementById('rName').placeholder    = isLegal ? 'مثلاً شرکت سرمو پوشش' : 'مثلاً علی محمدی';
}
document.addEventListener('change', e => {
  if (e.target.name === 'rType') updateRepTypeLabels();
});

function doSaveRep() {
  const pid   = document.getElementById('rP').value;
  const type  = document.querySelector('input[name="rType"]:checked').value;
  const name  = document.getElementById('rName').value.trim();
  const phone = document.getElementById('rPhone').value.trim();
  const natId = document.getElementById('rNatId').value.trim();

  if (!pid || !name) { alert('استان و نام نماینده الزامی است'); return; }

  const id = 'rep' + (repIdCounter++);
  reps[id] = { id, provinceId: pid, type, name, phone, natId, monthly: {} };

  renderReps();
  saveToStorage();
  closeRepM();
  showToast(`✅ نماینده "${name}" ثبت شد`);
}

function renderReps() {
  const c = document.getElementById('repList');
  const list = Object.values(reps);
  if (!list.length) { c.innerHTML = '<div class="empty">هنوز نماینده‌ای ثبت نشده</div>'; refreshRepSaleSelect(); return; }

  // sort by total sales desc
  list.sort((a, b) => repTotal(b) - repTotal(a));
  const grandTotal = list.reduce((s, r) => s + repTotal(r), 0);

  const summary = `<div class="rep-summary">👥 ${fmtInt(list.length)} نماینده &nbsp;·&nbsp; 💰 ${fmtNum(grandTotal)} میلیون تومان</div>`;

  c.innerHTML = summary + list.map(r => {
    const p = PDATA.find(x => x.id === r.provinceId);
    const total = repTotal(r);
    const badgeClass = r.type === 'حقوقی' ? 'rep-badge legal' : 'rep-badge';
    return `<div class="rep-row" onclick="openRepDetailM('${r.id}')">
      <div class="rep-info">
        <div class="rep-name">${r.name}</div>
        <div class="rep-meta">${p ? p.n : ''} <span class="${badgeClass}">${r.type}</span></div>
      </div>
      <div class="rep-total">${fmtNum(total)} م</div>
    </div>`;
  }).join('');

  refreshRepSaleSelect();
}

function refreshRepSaleSelect() {
  const sel = document.getElementById('rsRep');
  const cur = sel.value;
  const list = Object.values(reps);
  if (!list.length) {
    sel.innerHTML = '<option value="">ابتدا یک نماینده ثبت کنید</option>';
    return;
  }
  sel.innerHTML = '<option value="">انتخاب نماینده...</option>' + list.map(r => {
    const p = PDATA.find(x => x.id === r.provinceId);
    return `<option value="${r.id}">${r.name} — ${p ? p.n : ''}</option>`;
  }).join('');
  if (list.some(r => r.id === cur)) sel.value = cur;
}

function openRepSaleM() {
  if (!Object.keys(reps).length) {
    alert('ابتدا حداقل یک نماینده ثبت کنید');
    return;
  }
  refreshRepSaleSelect();
  document.getElementById('rsAmount').value = '';
  if (!document.getElementById('rsYear').value) {
    // rough Jalali year estimate fallback
    document.getElementById('rsYear').value = 1403;
  }
  document.getElementById('repSaleModal').classList.add('open');
}
function closeRepSaleM() { document.getElementById('repSaleModal').classList.remove('open'); }

function doSaveRepSale() {
  const repId  = document.getElementById('rsRep').value;
  const month  = document.getElementById('rsMonth').value;
  const year   = document.getElementById('rsYear').value.trim();
  const amount = parseFloat(document.getElementById('rsAmount').value);

  if (!repId || !year || !amount || amount <= 0) {
    alert('نماینده، سال و مبلغ الزامی است');
    return;
  }
  const rep = reps[repId];
  if (!rep) return;

  const key = `${year}-${month}`;
  rep.monthly[key] = (rep.monthly[key] || 0) + amount;

  renderReps();
  saveToStorage();
  closeRepSaleM();
  showToast(`✅ فروش نماینده "${rep.name}" ثبت شد`);
}

const JALALI_MONTHS = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];

function openRepDetailM(repId) {
  const rep = reps[repId];
  if (!rep) return;
  activeRepDetailId = repId;
  const p = PDATA.find(x => x.id === rep.provinceId);

  document.getElementById('rdTitle').textContent = (rep.type === 'حقوقی' ? '🏢 ' : '👤 ') + rep.name;
  document.getElementById('rdInfo').innerHTML = `
    <div class="rd-row"><span>استان</span><b>${p ? p.n : '—'}</b></div>
    <div class="rd-row"><span>نوع نماینده</span><b>${rep.type}</b></div>
    ${rep.phone ? `<div class="rd-row"><span>شماره تماس</span><b>${rep.phone}</b></div>` : ''}
    ${rep.natId ? `<div class="rd-row"><span>${rep.type === 'حقوقی' ? 'شناسه ملی' : 'کد ملی'}</span><b>${rep.natId}</b></div>` : ''}
    <div class="rd-row"><span>مجموع فروش</span><b style="color:var(--accent)">${fmtNum(repTotal(rep))} میلیون تومان</b></div>
  `;

  const entries = Object.entries(rep.monthly || {})
    .sort((a, b) => b[0].localeCompare(a[0]));

  const mDiv = document.getElementById('rdMonthly');
  if (!entries.length) {
    mDiv.innerHTML = '<div class="empty">هنوز فروش ماهانه ثبت نشده</div>';
  } else {
    mDiv.innerHTML = entries.map(([key, amt]) => {
      const [year, month] = key.split('-');
      const label = `${JALALI_MONTHS[+month]} ${year}`;
      return `<div class="rd-m-row"><span class="rd-m-label">${label}</span><span class="rd-m-val">${fmtNum(amt)} م</span></div>`;
    }).join('');
  }

  document.getElementById('repDetailModal').classList.add('open');
}
function closeRepDetailM() {
  document.getElementById('repDetailModal').classList.remove('open');
  activeRepDetailId = null;
}

function doDeleteRep() {
  if (!activeRepDetailId) return;
  const rep = reps[activeRepDetailId];
  if (!rep) return;
  if (!confirm(`حذف نماینده "${rep.name}"؟ این عمل قابل بازگشت نیست.`)) return;
  delete reps[activeRepDetailId];
  renderReps();
  saveToStorage();
  closeRepDetailM();
  showToast('🗑 نماینده حذف شد');
}

// ── PROVINCE NAME MATCHER ──────────────────
function matchProv(name) {
  name = (name || '').trim();
  const d = PDATA.find(p => p.n === name || p.id === name);
  if (d) return d.id;
  const aliases = {
    'تهران':'tehran','اصفهان':'isfahan','فارس':'fars',
    'خراسان رضوی':'khorasan_r','خوزستان':'khuzestan',
    'مازندران':'mazandaran','آذربایجان شرقی':'east_az',
    'آذربایجان غربی':'west_az','کرمانشاه':'kermanshah',
    'گیلان':'Gilan','لرستان':'lorestan','همدان':'hamedan',
    'بوشهر':'bushehr','زنجان':'zanjan','سمنان':'semnan',
    'هرمزگان':'hormozgan','سیستان و بلوچستان':'sistan',
    'کرمان':'kerman','یزد':'yazd','گلستان':'golestan',
    'اردبیل':'ardabil','کردستان':'kurdistan','ایلام':'ilam',
    'چهارمحال و بختیاری':'chahar','کهگیلویه و بویراحمد':'kohgiluyeh',
    'مرکزی':'markazi','قزوین':'qazvin','قم':'qom',
    'خراسان شمالی':'khorasan_n','خراسان جنوبی':'khorasan_s',
    'مشهد':'khorasan_r','تبریز':'east_az','شیراز':'fars',
    'اهواز':'khuzestan','رشت':'Gilan','ساری':'mazandaran',
    'گرگان':'golestan','زاهدان':'sistan','بندرعباس':'hormozgan',
    'البرز':'tehran','کرج':'tehran',
  };
  if (aliases[name]) return aliases[name];
  const f = PDATA.find(p => p.n.includes(name) || name.includes(p.n.slice(0, 4)));
  return f ? f.id : null;
}

// ── EXCEL / CSV READER ─────────────────────
function readXL(file) {
  const rd = new FileReader();
  rd.onload = e => {
    try {
      const wb   = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
      const ws   = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      let ok = 0, bad = 0;
      const isH = (rows[0] || []).some(h => /استان|province/i.test(String(h)));
      const start = isH ? 1 : 0;

      for (let i = start; i < rows.length; i++) {
        const r  = rows[i];
        if (!r || r.every(c => !c)) continue;
        // cols: استان | مشتری | مبلغ (م.ت) | وزن (kg) | محصول | تاریخ
        const pn = String(r[0] || '').trim();
        const cu = String(r[1] || '').trim();
        const am = parseFloat(String(r[2] || '').replace(/[,،\s]/g, ''));
        const wt = parseFloat(String(r[3] || '0').replace(/[,،\s]/g, '')) || 0;
        const pr = String(r[4] || 'سایر').trim();
        const dt = String(r[5] || '').trim();

        if (!pn || !cu || isNaN(am) || am <= 0) { bad++; continue; }
        const pid = matchProv(pn);
        if (!pid) { bad++; continue; }
        if (pr && !products.includes(pr)) products.push(pr);
        addRec(pid, cu, am, wt, pr, dt);
        ok++;
      }

      renderProds();
      refresh();
      saveToStorage();

      const st = document.getElementById('xlSt');
      if (ok > 0) {
        st.textContent = `✅ ${fmtInt(ok)} رکورد وارد شد${bad > 0 ? ` | ${bad} ناموفق` : ''}`;
        st.className   = 'status ok';
        showToast(`✅ ${fmtInt(ok)} رکورد وارد شد`);
      } else {
        st.textContent = 'هیچ رکوردی وارد نشد — فرمت را بررسی کنید';
        st.className   = 'status err';
      }
    } catch (err) {
      document.getElementById('xlSt').textContent = 'خطا در خواندن فایل';
      document.getElementById('xlSt').className   = 'status err';
      console.error(err);
    }
  };
  rd.readAsArrayBuffer(file);
}

// ── EXPORT sample template ─────────────────
function downloadTemplate() {
  const rows = [
    ['استان','نام مشتری','مبلغ (م.ت)','وزن (kg)','محصول','تاریخ'],
    ['تهران','علی محمدی','12.5','25','پوشاک','1403-01-15'],
    ['اصفهان','سارا احمدی','8','10','کفش','1403-02-20'],
    ['فارس','رضا کریمی','6.5','15','اکسسوری','1403-03-05'],
  ];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'فروش');
  XLSX.writeFile(wb, 'قالب_فروش_استانی.xlsx');
  showToast('📥 فایل قالب دانلود شد');
}

// ── EVENT LISTENERS ────────────────────────
document.getElementById('xlF').addEventListener('change', e => {
  if (e.target.files[0]) readXL(e.target.files[0]);
});

const dz = document.getElementById('dz');
dz.addEventListener('dragover',  e => { e.preventDefault(); dz.classList.add('drag'); });
dz.addEventListener('dragleave', () => dz.classList.remove('drag'));
dz.addEventListener('drop', e => {
  e.preventDefault(); dz.classList.remove('drag');
  if (e.dataTransfer.files[0]) readXL(e.dataTransfer.files[0]);
});

document.getElementById('modal').addEventListener('click', function (e) {
  if (e.target === this) closeM();
});
document.getElementById('repModal').addEventListener('click', function (e) {
  if (e.target === this) closeRepM();
});
document.getElementById('repSaleModal').addEventListener('click', function (e) {
  if (e.target === this) closeRepSaleM();
});
document.getElementById('repDetailModal').addEventListener('click', function (e) {
  if (e.target === this) closeRepDetailM();
});

document.getElementById('prodInp').addEventListener('keydown', e => {
  if (e.key === 'Enter') addProd();
});

// ── INIT ────────────────────────────────────
(function init() {
  // populate province select
  const sel = document.getElementById('fP');
  PDATA.forEach(p => {
    const o = document.createElement('option');
    o.value = p.id; o.textContent = p.n;
    sel.appendChild(o);
  });

  // load saved data
  const hadData = loadFromStorage();

  renderProds();
  renderReps();
  buildMap();
  updChart();

  if (hadData) {
    refresh();
    showToast('💾 داده‌های قبلی بارگذاری شد');
  }
})();
