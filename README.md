# 🗺 Iran Provincial Sales Dashboard

An interactive, zero-dependency sales management dashboard for tracking and visualizing sales data across all 30 provinces of Iran — runs entirely in the browser, no server required.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🗺 **Interactive Map** | Accurate 30-province SVG map derived from real GeoJSON boundary data |
| 🎨 **Dark / Light Mode** | One-click theme switch with full CSS variable theming |
| 📊 **Excel & CSV Import** | Drag-and-drop file upload with automatic province name recognition |
| ✏️ **Manual Entry** | Sales entry form with click-to-select province from the map |
| 📦 **Product Manager** | Add and remove custom product categories on the fly |
| ⚖️ **Amount & Weight** | Track both sale value (million IRR) and weight (kg) per transaction |
| 📅 **Sale Date** | Log sale date and see the last sale date per province in the tooltip |
| 💾 **Auto-Save** | All data persisted in `localStorage` — survives browser restarts |
| 🔢 **Number Formatting** | Thousands separators on all numeric values |
| 📈 **Monthly Chart** | Combined bar (sales) + line (weight) chart by month |
| 🏆 **Province Ranking** | Top-6 provinces with animated progress bars |
| 🔍 **Regional Filter** | Filter map view by North / South / East / West / Center |

---

## 📁 File Structure

```
dashboard/
├── index.html       ← Page structure and markup
├── style.css        ← All styles + CSS custom properties (light & dark themes)
├── app.js           ← Application logic (storage, map, chart, Excel reader)
└── provinces.js     ← SVG province paths (generated from real GeoJSON data)
```

---

## 🚀 Getting Started

### Option 1 — Open Locally
1. Download the ZIP
2. Extract all files (all 4 files must be in the same folder)
3. Open `index.html` in any modern browser

> ⚠️ No internet connection, server, or installation needed.

### Option 2 — GitHub Pages
1. Fork this repository
2. Go to **Settings → Pages** and set source to the `main` branch
3. Visit `https://your-username.github.io/repo-name`

---

## 📋 Excel Import Format

| Column | Type | Example | Required |
|--------|------|---------|----------|
| Province | Text | Tehran | ✅ |
| Customer Name | Text | Ali Mohammadi | ✅ |
| Amount (M IRR) | Number | 12.5 | ✅ |
| Weight (kg) | Number | 25 | ❌ |
| Product | Text | Clothing | ❌ |
| Date | Date | 2024-04-04 | ❌ |

> 💡 Click **"📥 Excel Template"** in the app to download a ready-made sample file.

**Supported province names:** official Persian names (e.g. `آذربایجان شرقی`) or provincial capitals (e.g. `Tabriz`, `Mashhad`, `Shiraz`).

---

## 💾 Data Persistence

Data is stored in the browser's `localStorage`:

- Closing and reopening the file restores all previous data automatically
- Data is local to the browser and device it was entered on
- Use the **"🗑 Clear Data"** button to wipe everything (requires confirmation)

---

## 🛠 Tech Stack

| Library | Purpose |
|---------|---------|
| **HTML5 / CSS3 / Vanilla JS** | No frameworks — zero build step |
| **[Chart.js 4](https://www.chartjs.org/)** | Monthly sales & weight chart |
| **[SheetJS (xlsx)](https://sheetjs.com/)** | Excel and CSV file parsing |
| **GeoJSON → SVG** | Province boundaries from real geographic data |
| **localStorage API** | Client-side data persistence |
| **CSS Custom Properties** | Light / dark theme system |

---

## 📄 License

MIT — free for personal and commercial use.

---
---

# 🗺 پنل فروش استانی ایران

یک داشبورد تعاملی برای مدیریت و تحلیل فروش به تفکیک استان‌های ایران — بدون نیاز به سرور، کاملاً در مرورگر اجرا می‌شود.

---

## ✨ قابلیت‌ها

| قابلیت | توضیح |
|--------|-------|
| 🗺 **نقشه تعاملی** | نقشه دقیق ۳۰ استان ایران از روی داده‌های GeoJSON واقعی |
| 🎨 **دارک / لایت مود** | سوئیچ بین حالت روشن و تاریک با یک کلیک |
| 📊 **ورودی اکسل و CSV** | آپلود فایل با Drag & Drop، شناسایی خودکار نام استان‌ها |
| ✏️ **ثبت دستی** | فرم ثبت فروش با انتخاب استان از روی نقشه |
| 📦 **مدیریت محصولات** | افزودن و حذف محصولات سفارشی |
| ⚖️ **وزن و مبلغ** | ثبت همزمان مبلغ (میلیون تومان) و وزن (کیلوگرم) |
| 📅 **تاریخ فروش** | ثبت تاریخ + نمایش آخرین تاریخ فروش هر استان در tooltip |
| 💾 **ذخیره‌سازی خودکار** | داده‌ها در `localStorage` ذخیره می‌شوند، با بستن مرورگر پاک نمی‌شوند |
| 🔢 **فرمت اعداد** | جداکننده سه‌رقمی برای خوانایی بهتر |
| 📈 **نمودار ماهانه** | نمودار ستونی فروش + خط وزن به تفکیک ماه |
| 🏆 **رتبه‌بندی استان‌ها** | Top 6 استان با نوار پیشرفت |
| 🔍 **فیلتر منطقه‌ای** | فیلتر نقشه بر اساس شمال / جنوب / شرق / غرب / مرکز |

---

## 📁 ساختار فایل‌ها

```
dashboard/
├── index.html       ← صفحه اصلی (ساختار HTML)
├── style.css        ← تمام استایل‌ها + CSS Variables (تم روشن و تاریک)
├── app.js           ← منطق برنامه (ذخیره‌سازی، نقشه، نمودار، اکسل)
└── provinces.js     ← مختصات SVG استان‌ها (از GeoJSON واقعی)
```

---

## 🚀 نحوه استفاده

### روش ۱ — باز کردن مستقیم
۱. فایل ZIP را دانلود کنید
۲. Extract کنید (همه ۴ فایل باید کنار هم باشند)
۳. `index.html` را در مرورگر باز کنید

> ⚠️ به اینترنت، سرور یا نصب هیچ چیزی نیاز ندارید.

### روش ۲ — GitHub Pages
۱. این مخزن را Fork کنید
۲. در تنظیمات، GitHub Pages را روی شاخه `main` فعال کنید
۳. به آدرس `https://username.github.io/repo-name` بروید

---

## 📋 فرمت فایل اکسل ورودی

| ستون | نوع | مثال | الزامی؟ |
|------|-----|------|---------|
| استان | متن | تهران | ✅ |
| نام مشتری | متن | علی محمدی | ✅ |
| مبلغ (م.ت) | عدد | 12.5 | ✅ |
| وزن (kg) | عدد | 25 | ❌ |
| محصول | متن | پوشاک | ❌ |
| تاریخ | تاریخ | 1403-01-15 | ❌ |

> 💡 دکمه **«📥 قالب اکسل»** در برنامه، یک فایل نمونه آماده دانلود می‌کند.

**نام‌های استان پشتیبانی‌شده:** نام رسمی (مثل «آذربایجان شرقی») یا نام مرکز استان (مثل «تبریز»، «مشهد»، «شیراز»).

---

## 💾 ذخیره‌سازی داده‌ها

داده‌ها در `localStorage` مرورگر ذخیره می‌شوند:

- با بستن و باز کردن مجدد فایل، داده‌ها برمی‌گردند
- داده‌ها فقط در همان مرورگر و همان دستگاه موجودند
- دکمه **«🗑 پاک کردن داده‌ها»** همه چیز را پاک می‌کند (با تأییدیه)

---

## 🛠 تکنولوژی‌ها

| کتابخانه | کاربرد |
|---------|---------|
| **HTML5 / CSS3 / Vanilla JS** | بدون هیچ فریم‌ورکی |
| **[Chart.js 4](https://www.chartjs.org/)** | نمودار ماهانه فروش و وزن |
| **[SheetJS (xlsx)](https://sheetjs.com/)** | خواندن فایل‌های اکسل و CSV |
| **GeoJSON → SVG** | مرزهای واقعی استان‌ها از داده جغرافیایی |
| **localStorage API** | ذخیره‌سازی داده در مرورگر |
| **CSS Custom Properties** | سیستم تم روشن/تاریک |

---

## 📄 لایسنس

MIT — آزاد برای استفاده شخصی و تجاری
