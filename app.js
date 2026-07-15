<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>پنل فروش استانی ایران</title>
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body>

<div class="wrap">

  <!-- ── TOPBAR ───────────────────────────── -->
  <div class="topbar">
    <div>
      <div class="ttl">🗺 پنل فروش استانی ایران</div>
      <div class="sub" id="upd">در حال بارگذاری...</div>
    </div>
    <div class="top-r">
      <button class="theme-btn" id="themeBtn" onclick="toggleTheme()">
        <span id="themeIco">🌙</span>
        <span id="themeTxt">دارک مود</span>
      </button>
      <button class="theme-btn" onclick="downloadTemplate()" title="دانلود قالب اکسل">
        📥 قالب اکسل
      </button>
      <button class="theme-btn" onclick="clearStorage()" title="پاک کردن همه داده‌ها" style="color:#dc2626">
        🗑 پاک کردن داده‌ها
      </button>
      <div class="tabs">
        <div class="tab on"  onclick="setReg('all',this)">همه</div>
        <div class="tab"     onclick="setReg('north',this)">شمال</div>
        <div class="tab"     onclick="setReg('south',this)">جنوب</div>
        <div class="tab"     onclick="setReg('west',this)">غرب</div>
        <div class="tab"     onclick="setReg('east',this)">شرق</div>
        <div class="tab"     onclick="setReg('center',this)">مرکز</div>
      </div>
    </div>
  </div>

  <!-- ── KPIs ─────────────────────────────── -->
  <div class="kpis">
    <div class="kpi">
      <div class="kpi-ico">💰</div>
      <div class="kpi-lbl">کل فروش</div>
      <div class="kpi-val" id="k1">۰</div>
      <div class="kpi-sub">میلیون تومان</div>
    </div>
    <div class="kpi">
      <div class="kpi-ico">⚖️</div>
      <div class="kpi-lbl">کل وزن</div>
      <div class="kpi-val" id="k5">۰</div>
      <div class="kpi-sub">کیلوگرم</div>
    </div>
    <div class="kpi">
      <div class="kpi-ico">👥</div>
      <div class="kpi-lbl">تعداد مشتریان</div>
      <div class="kpi-val" id="k2">۰</div>
      <div class="kpi-sub">نفر</div>
    </div>
    <div class="kpi">
      <div class="kpi-ico">📍</div>
      <div class="kpi-lbl">استان‌های فعال</div>
      <div class="kpi-val" id="k3">۰</div>
      <div class="kpi-sub">از ۳۰ استان</div>
    </div>
  </div>

  <!-- ── MAIN GRID ─────────────────────────── -->
  <div class="main">

    <!-- MAP -->
    <div class="map-panel">
      <div class="map-hdr">
        <div class="map-ttl">نقشه فروش به تفکیک استان</div>
        <div class="map-hint">روی استان کلیک یا هاور کنید</div>
      </div>
      <div style="position:relative">
        <svg class="imap" id="imap" viewBox="0 0 860 580" width="100%"></svg>
        <div id="tip"></div>
      </div>
      <div class="legend">
        <div class="leg"><div class="leg-box" style="background:var(--p0)"></div>بدون فروش</div>
        <div class="leg"><div class="leg-box" style="background:var(--p1)"></div>کم</div>
        <div class="leg"><div class="leg-box" style="background:var(--p2)"></div>متوسط</div>
        <div class="leg"><div class="leg-box" style="background:var(--p3)"></div>زیاد</div>
        <div class="leg"><div class="leg-box" style="background:var(--p4)"></div>خیلی زیاد</div>
      </div>
    </div>

    <!-- SIDE PANEL -->
    <div class="side">

      <!-- ورودی داده -->
      <div class="card">
        <div class="card-ttl">📂 ورودی داده</div>
        <div class="upload-zone" id="dz" onclick="document.getElementById('xlF').click()">
          <div class="upload-ico">📊</div>
          <div class="upload-txt">اکسل یا CSV</div>
          <div class="upload-hint">بکش اینجا یا کلیک کن</div>
        </div>
        <input type="file" id="xlF" accept=".xlsx,.xls,.csv" style="display:none">
        <div class="status" id="xlSt">ستون‌ها: استان · مشتری · مبلغ · وزن · محصول · تاریخ</div>
        <div class="sel-prov">
          <span style="color:var(--txt3);font-size:10px">استان انتخابی از نقشه:</span>
          <span id="selN" style="font-weight:600;font-size:11px">—</span>
        </div>
        <button class="add-btn" onclick="openM()">＋ ثبت دستی فروش</button>
      </div>

      <!-- مدیریت محصولات -->
      <div class="card">
        <div class="card-ttl">📦 مدیریت محصولات</div>
        <div class="prod-list" id="prodList"></div>
        <div class="prod-row">
          <input class="prod-inp" id="prodInp" type="text" placeholder="نام محصول جدید...">
          <button class="prod-add" onclick="addProd()">+ افزودن</button>
        </div>
      </div>

      <!-- نمایندگان استان‌ها -->
      <div class="card">
        <div class="card-ttl">🧑‍💼 نمایندگان استان‌ها</div>
        <div class="rep-list" id="repList"><div class="empty">هنوز نماینده‌ای ثبت نشده</div></div>
        <button class="add-btn" onclick="openRepM()">＋ افزودن نماینده</button>
        <button class="add-btn ghost" onclick="openRepSaleM()">📈 ثبت فروش ماهانه نماینده</button>
      </div>

      <!-- برترین استان‌ها -->
      <div class="card">
        <div class="card-ttl">🏆 برترین استان‌ها</div>
        <div id="topB"><div class="empty">هنوز داده‌ای ندارید</div></div>
      </div>

      <!-- آخرین تراکنش‌ها -->
      <div class="card">
        <div class="card-ttl">🕐 آخرین تراکنش‌ها</div>
        <div class="cust-list" id="cList">
          <div class="empty">هنوز تراکنشی ثبت نشده</div>
        </div>
      </div>

      <!-- نمودار ماهانه -->
      <div class="card">
        <div class="card-ttl">📅 فروش و وزن ماهانه</div>
        <div style="position:relative;height:100px">
          <canvas id="mCh"></canvas>
        </div>
      </div>

    </div><!-- /side -->
  </div><!-- /main -->
</div><!-- /wrap -->

<!-- ── TOAST ──────────────────────────────── -->
<div class="toast" id="toast"></div>

<!-- ── MODAL ──────────────────────────────── -->
<div class="modal-bg" id="modal">
  <div class="modal">
    <div class="modal-ttl">📝 ثبت فروش جدید</div>
    <div class="fl">
      <label>استان</label>
      <select id="fP"><option value="">انتخاب استان...</option></select>
    </div>
    <div class="fl">
      <label>نام مشتری</label>
      <input type="text" id="fC" placeholder="نام کامل مشتری">
    </div>
    <div class="fl">
      <label>مبلغ فروش (میلیون تومان)</label>
      <input type="number" id="fA" placeholder="مثلاً ۵.۵" min="0" step="0.1">
    </div>
    <div class="fl">
      <label>وزن (کیلوگرم)</label>
      <input type="number" id="fW" placeholder="مثلاً ۱۰" min="0" step="0.1">
    </div>
    <div class="fl">
      <label>محصول</label>
      <select id="fPr"></select>
    </div>
    <div class="fl">
      <label>تاریخ فروش</label>
      <input type="date" id="fD">
    </div>
    <div class="mbtns">
      <button class="btn-c" onclick="closeM()">انصراف</button>
      <button class="btn-s" onclick="doSave()">✓ ذخیره</button>
    </div>
  </div>
</div>

<!-- ── MODAL: افزودن نماینده ─────────────── -->
<div class="modal-bg" id="repModal">
  <div class="modal">
    <div class="modal-ttl">🧑‍💼 افزودن نماینده استان</div>
    <div class="fl">
      <label>استان</label>
      <select id="rP"><option value="">انتخاب استان...</option></select>
    </div>
    <div class="fl">
      <label>نوع نماینده</label>
      <div class="radio-row">
        <label class="radio-opt"><input type="radio" name="rType" value="حقیقی" checked> شخص حقیقی</label>
        <label class="radio-opt"><input type="radio" name="rType" value="حقوقی"> شخص حقوقی</label>
      </div>
    </div>
    <div class="fl">
      <label id="rNameLbl">نام و نام خانوادگی</label>
      <input type="text" id="rName" placeholder="مثلاً علی محمدی">
    </div>
    <div class="fl">
      <label>شماره تماس</label>
      <input type="text" id="rPhone" placeholder="مثلاً 09121234567">
    </div>
    <div class="fl">
      <label id="rIdLbl">کد ملی</label>
      <input type="text" id="rNatId" placeholder="اختیاری">
    </div>
    <div class="mbtns">
      <button class="btn-c" onclick="closeRepM()">انصراف</button>
      <button class="btn-s" onclick="doSaveRep()">✓ ثبت نماینده</button>
    </div>
  </div>
</div>

<!-- ── MODAL: ثبت فروش ماهانه نماینده ────── -->
<div class="modal-bg" id="repSaleModal">
  <div class="modal">
    <div class="modal-ttl">📈 ثبت فروش ماهانه نماینده</div>
    <div class="fl">
      <label>نماینده</label>
      <select id="rsRep"><option value="">ابتدا استان و نماینده را انتخاب کنید...</option></select>
    </div>
    <div class="fl">
      <label>ماه</label>
      <select id="rsMonth">
        <option value="0">فروردین</option><option value="1">اردیبهشت</option>
        <option value="2">خرداد</option><option value="3">تیر</option>
        <option value="4">مرداد</option><option value="5">شهریور</option>
        <option value="6">مهر</option><option value="7">آبان</option>
        <option value="8">آذر</option><option value="9">دی</option>
        <option value="10">بهمن</option><option value="11">اسفند</option>
      </select>
    </div>
    <div class="fl">
      <label>سال</label>
      <input type="number" id="rsYear" placeholder="مثلاً 1403" min="1390" max="1420">
    </div>
    <div class="fl">
      <label>مبلغ فروش (میلیون تومان)</label>
      <input type="number" id="rsAmount" placeholder="مثلاً ۴۵" min="0" step="0.1">
    </div>
    <div class="mbtns">
      <button class="btn-c" onclick="closeRepSaleM()">انصراف</button>
      <button class="btn-s" onclick="doSaveRepSale()">✓ ثبت فروش</button>
    </div>
  </div>
</div>

<!-- ── MODAL: جزئیات نماینده ─────────────── -->
<div class="modal-bg" id="repDetailModal">
  <div class="modal" style="width:400px">
    <div class="modal-ttl" id="rdTitle">🧑‍💼 جزئیات نماینده</div>
    <div id="rdInfo" class="rd-info"></div>
    <div class="rd-section-ttl">📊 فروش ماهانه</div>
    <div id="rdMonthly" class="rd-monthly"></div>
    <div class="mbtns">
      <button class="btn-c" onclick="closeRepDetailM()">بستن</button>
      <button class="btn-s ghost-danger" onclick="doDeleteRep()">🗑 حذف نماینده</button>
    </div>
  </div>
</div>

<!-- ── SCRIPTS ────────────────────────────── -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
<script src="provinces.js"></script>
<script src="app.js"></script>

</body>
</html>
