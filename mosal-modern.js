(() => {
  'use strict';

  const months = ['كانون الثاني','شباط','آذار','نيسان','أيار','حزيران','تموز','آب','أيلول','تشرين الأول','تشرين الثاني','كانون الأول'];
  const demo = {
    kpis: [
      { icon:'♙', label:'إجمالي السكان', value:'4.82M', change:'+2.8%', color:'#2563eb', soft:'#e7efff' },
      { icon:'◈', label:'المشتغلون', value:'1.36M', change:'+5.2%', color:'#0f766e', soft:'#e3f7f2' },
      { icon:'▣', label:'المساعدات الموزعة', value:'86.4K', change:'+12.1%', color:'#d97706', soft:'#fff3db' },
      { icon:'↗', label:'فرص العمل الجديدة', value:'18.7K', change:'+8.4%', color:'#7c3aed', soft:'#f0eaff' }
    ],
    sectors: [
      ['♿','رعاية ذوي الإعاقة',84],['♡','الرعاية الاجتماعية',76],['⚖','المنظمات غير الحكومية',68],['⌂','التنمية الريفية',72],['⚒','التفتيش العمالي',61],['▤','سوق العمل والبطالة',79],['✚','التأمينات الاجتماعية',73],['◫','المساعدات الإنسانية',88]
    ],
    ranking: [['دمشق',88],['ريف دمشق',82],['اللاذقية',78],['حلب',74],['حمص',69],['درعا',64]],
    trend: [54,58,56,64,68,66,72,75,71,78,81,84]
  };

  const $ = (selector) => document.querySelector(selector);
  const state = { gov: 'all', month: 'all', dark: localStorage.getItem('mosal-theme') === 'dark' };

  function renderKpis() {
    $('#kpiGrid').innerHTML = demo.kpis.map(item => `
      <article class="panel kpi-card" style="--kpi-color:${item.color};--kpi-soft:${item.soft}">
        <div class="kpi-top"><span class="kpi-icon">${item.icon}</span><span class="kpi-change">${item.change}</span></div>
        <div class="kpi-value">${item.value}</div><div class="kpi-label">${item.label}</div>
      </article>`).join('');
  }

  function renderTrend() {
    const chart = $('#trendChart');
    chart.innerHTML = demo.trend.map(value => `<div class="bar-column"><span class="bar-value">${value}%</span><span class="bar" style="--bar-height:${value}%"></span></div>`).join('');
    $('#chartLabels').innerHTML = months.map(month => `<span>${month.slice(0,3)}</span>`).join('');
  }

  function renderSectors() {
    $('#sectorGrid').innerHTML = demo.sectors.map(([icon, name, score]) => `
      <article class="sector-card"><div class="sector-head"><span class="sector-icon">${icon}</span><strong class="sector-score">${score}%</strong></div><h3>${name}</h3><p>${score >= 80 ? 'أداء متميز وعلى المسار' : score >= 70 ? 'نتائج مستقرة مع مجال للتحسين' : 'يحتاج إلى متابعة إضافية'}</p><div class="meter"><span style="width:${score}%"></span></div></article>`).join('');
  }

  function renderRanking() {
    const multiplier = state.gov === 'all' ? 1 : .96;
    $('#rankingList').innerHTML = demo.ranking.map(([name, score], index) => {
      const adjusted = Math.round(score * multiplier);
      return `<div class="ranking-item"><span class="rank-number">${index + 1}</span><div><div class="ranking-name">${name}</div><div class="ranking-bar"><span style="width:${adjusted}%"></span></div></div><strong class="ranking-score">${adjusted}%</strong></div>`;
    }).join('');
  }

  function updateFilters() {
    const govLabel = state.gov === 'all' ? 'جميع المحافظات' : state.gov;
    const monthLabel = state.month === 'all' ? 'كل الأشهر' : state.month;
    $('#filterStatus').textContent = state.gov === 'all' ? `عرض ${govLabel} · ${monthLabel}` : `عرض بيانات ${govLabel} · ${monthLabel}`;
    renderRanking();
    $('#lastSync').textContent = `آخر تحديث: ${new Intl.DateTimeFormat('ar', { dateStyle:'medium', timeStyle:'short' }).format(new Date())}`;
  }

  function setTheme(dark) {
    state.dark = dark;
    document.body.classList.toggle('dark', dark);
    $('#themeToggle').textContent = dark ? '☀' : '☾';
    $('#themeToggle').title = dark ? 'الوضع النهاري' : 'الوضع الليلي';
    localStorage.setItem('mosal-theme', dark ? 'dark' : 'light');
  }

  function parseCsv(text) {
    const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);
    if (!lines.length) return 0;
    const delimiter = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ',';
    return Math.max(lines.length - 1, 0);
  }

  function bindEvents() {
    $('#themeToggle').addEventListener('click', () => setTheme(!state.dark));
    $('#govSelect').addEventListener('change', (event) => { state.gov = event.target.value; updateFilters(); });
    $('#periodSelect').addEventListener('change', (event) => { state.month = event.target.value; updateFilters(); });
    $('#resetFilters').addEventListener('click', () => { state.gov = 'all'; state.month = 'all'; $('#govSelect').value = 'all'; $('#periodSelect').value = 'all'; updateFilters(); });
    $('#csvInput').addEventListener('change', async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const rows = parseCsv(await file.text());
      $('#uploadStatus').textContent = `تمت قراءة ${rows.toLocaleString('ar')} سجل من ${file.name}`;
      $('#lastSync').textContent = 'آخر تحديث: بعد استيراد الملف مباشرة';
    });
    const sidebar = $('#sidebar');
    const scrim = $('#scrim');
    const closeMenu = () => { sidebar.classList.remove('open'); scrim.classList.remove('open'); };
    $('#menuToggle').addEventListener('click', () => { sidebar.classList.add('open'); scrim.classList.add('open'); });
    $('#sidebarClose').addEventListener('click', closeMenu);
    scrim.addEventListener('click', closeMenu);
    document.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', closeMenu));
    $('#expandSectors').addEventListener('click', (event) => { const expanded = event.currentTarget.dataset.expanded === 'true'; event.currentTarget.dataset.expanded = String(!expanded); event.currentTarget.textContent = expanded ? 'عرض التفاصيل' : 'إخفاء التفاصيل'; $('#sectorGrid').classList.toggle('compact', !expanded); });
  }

  function init() {
    renderKpis(); renderTrend(); renderSectors(); renderRanking(); bindEvents(); setTheme(state.dark); $('#footerYear').textContent = new Date().getFullYear();
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
