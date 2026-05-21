/* ── Helpers ───────────────────────────────────────────────────────────────── */
const md       = t => t ? marked.parse(t)       : '';
const mdInline = t => t ? marked.parseInline(t) : '';
const qs  = id => document.getElementById(id);
const $ = sel => document.querySelector(sel);
const $$ = sel => [...document.querySelectorAll(sel)];

function parseFrontmatter(text) {
  if (!text.startsWith('---')) return { meta: {}, content: text };
  const end = text.indexOf('---', 3);
  if (end === -1) return { meta: {}, content: text };
  const raw  = text.slice(3, end).trim();
  const body = text.slice(end + 3).trim();
  const meta = {};
  raw.split('\n').forEach(line => {
    const colon = line.indexOf(':');
    if (colon === -1) return;
    const key = line.slice(0, colon).trim();
    const val = line.slice(colon + 1).trim().replace(/^["']|["']$/g, '');
    if (val.startsWith('[') && val.endsWith(']')) {
      meta[key] = val.slice(1, -1).split(',').map(s =>
        s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    } else {
      meta[key] = val;
    }
  });
  return { meta, content: body };
}

function formatDate(str) {
  if (!str) return '';
  const d = new Date(str);
  if (isNaN(d)) return str;
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

function slug(filename) {
  return filename.replace(/\.md$/, '');
}

/* ── Navigation ────────────────────────────────────────────────────────────── */
const PAGES = [
  { href: 'index.html',       label: '首页',   key: 'home' },
  { href: 'team.html',        label: '团队',   key: 'team' },
  { href: 'activities.html',  label: '品牌活动', key: 'activities' },
  { href: 'sponsorship.html', label: '赞助公示', key: 'sponsorship' },
  { href: 'contact.html',     label: '联系我们', key: 'contact' },
];

function buildNav(active) {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  nav.innerHTML = `
    <div class="nav-inner">
      <a class="nav-logo" href="index.html">
        <div class="nav-logo-icon">支</div>
        <span>浙大研究生支教团</span>
      </a>
      <button class="nav-toggle" id="navToggle" aria-label="菜单">☰</button>
      <ul class="nav-links" id="navLinks">
        ${PAGES.map(p => `
          <li><a href="${p.href}"${p.key === active ? ' class="active"' : ''}>${p.label}</a></li>
        `).join('')}
      </ul>
    </div>
  `;

  document.getElementById('navToggle')?.addEventListener('click', () => {
    document.getElementById('navLinks')?.classList.toggle('open');
  });

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

/* ── Content Loading ───────────────────────────────────────────────────────── */
async function loadIndex(type) {
  try {
    const r = await fetch(`content/${type}/index.json`);
    if (!r.ok) return [];
    return await r.json();
  } catch { return []; }
}

async function loadPost(type, filename) {
  try {
    const r = await fetch(`content/${type}/${filename}`);
    if (!r.ok) return null;
    const text = await r.text();
    return parseFrontmatter(text);
  } catch { return null; }
}

/* ── Card Renderers ────────────────────────────────────────────────────────── */
function newsCardHTML(item, featured = false) {
  const coverContent = item.cover
    ? `<img src="${item.cover}" alt="${item.title}" loading="lazy">`
    : `<div style="font-size:2.5rem">📰</div>`;

  const tags = (item.tags || []);
  const tagHTML = tags.length
    ? `<span class="card-tag">${tags[0]}</span>`
    : '';

  return `
    <div class="card fade-in" onclick="location.href='detail.html?type=news&slug=${item._slug}'">
      <div class="card-cover">${coverContent}</div>
      <div class="card-body">
        ${tagHTML}
        <div class="card-title">${item.title || '未命名'}</div>
        ${item.summary ? `<div class="card-summary">${item.summary}</div>` : ''}
        <div class="card-footer">
          <span class="card-date">${formatDate(item.date)}</span>
          <span class="card-read-more">阅读全文 →</span>
        </div>
      </div>
    </div>`;
}

function memberCardHTML(item) {
  const photoContent = item.photo
    ? `<img src="${item.photo}" alt="${item.name}" loading="lazy">`
    : `<div style="font-size:3rem">👤</div>`;

  return `
    <div class="member-card fade-in" onclick="location.href='member.html?slug=${item._slug}'">
      <div class="member-photo">${photoContent}</div>
      <div class="member-info">
        <div class="member-name">${item.name || '未命名'}</div>
        <div class="member-role">${item.role || ''}${item.batch ? ' · ' + item.batch : ''}</div>
        ${item.service_location ? `<div class="member-location">${item.service_location}</div>` : ''}
      </div>
    </div>`;
}

function activityCardHTML(item) {
  const coverContent = item.cover
    ? `<img src="${item.cover}" alt="${item.title}" loading="lazy">`
    : `<div style="font-size:2.5rem">🎯</div>`;

  return `
    <div class="activity-card fade-in" onclick="location.href='activity.html?slug=${item._slug}'">
      <div class="activity-cover">
        ${coverContent}
        ${item.active === 'true' || item.active === true ? '<span class="activity-cover-badge">进行中</span>' : ''}
      </div>
      <div class="activity-body">
        <div class="activity-title">${item.title || '未命名'}</div>
        ${item.summary ? `<div class="activity-summary">${item.summary}</div>` : ''}
        <span class="activity-cta">了解详情 →</span>
      </div>
    </div>`;
}

function sponsorCardHTML(item) {
  const coverContent = item.cover
    ? `<img src="${item.cover}" alt="${item.title}" loading="lazy">`
    : `<div style="font-size:2rem">🤝</div>`;

  return `
    <div class="sponsor-card fade-in" onclick="location.href='detail.html?type=sponsorship&slug=${item._slug}'">
      <div class="sponsor-cover">${coverContent}</div>
      <div class="sponsor-body">
        ${item.amount ? `<div class="sponsor-amount">${item.amount}</div>` : ''}
        <div class="sponsor-title">${item.title || '未命名'}</div>
        ${item.sponsor ? `<div style="font-size:.85rem;color:var(--text-muted)">${item.sponsor}</div>` : ''}
        <div class="sponsor-date">${formatDate(item.date)}</div>
      </div>
    </div>`;
}

function emptyState(icon, text) {
  return `<div class="empty-state"><div class="empty-state-icon">${icon}</div>
    <div class="empty-state-text">${text}</div></div>`;
}

/* ── Page Builders ─────────────────────────────────────────────────────────── */
async function buildHome() {
  buildNav('home');

  const items = await loadIndex('news');

  // Hero right: show latest item
  const featured = qs('heroFeatured');
  if (featured && items.length) {
    const f = items[0];
    const img = f.cover
      ? `<img src="${f.cover}" alt="${f.title}" loading="lazy">`
      : '';
    featured.innerHTML = `
      <div class="hero-featured-img">${img}</div>
      <div class="hero-featured-label">最新动态</div>
      <div class="hero-featured-title">${f.title || ''}</div>
      <div class="hero-featured-date">${formatDate(f.date)}</div>`;
    featured.style.cursor = 'pointer';
    featured.onclick = () => location.href = `detail.html?type=news&slug=${f._slug}`;
  }

  const grid = qs('newsGrid');
  if (!grid) return;

  if (!items.length) {
    grid.innerHTML = emptyState('📭', '暂无动态，敬请期待');
    return;
  }

  grid.innerHTML = items.slice(0, 6).map((item, i) => newsCardHTML(item, i === 0)).join('');
  observeFadeIn();
}

async function buildTeam() {
  buildNav('team');

  const items = await loadIndex('team');
  const grid  = qs('teamGrid');
  if (!grid) return;

  if (!items.length) {
    grid.innerHTML = emptyState('👥', '团队成员即将公布');
    return;
  }

  grid.innerHTML = items.map(item => memberCardHTML(item)).join('');
  observeFadeIn();
}

async function buildActivities() {
  buildNav('activities');

  const items = await loadIndex('activities');
  const grid  = qs('activityGrid');
  if (!grid) return;

  if (!items.length) {
    grid.innerHTML = emptyState('🎯', '品牌活动正在筹备中');
    return;
  }

  grid.innerHTML = items.map(item => activityCardHTML(item)).join('');
  observeFadeIn();
}

async function buildSponsorship() {
  buildNav('sponsorship');

  const items = await loadIndex('sponsorship');
  const grid  = qs('sponsorGrid');
  if (!grid) return;

  if (!items.length) {
    grid.innerHTML = emptyState('🤝', '赞助信息即将公示');
    return;
  }

  grid.innerHTML = items.map(item => sponsorCardHTML(item)).join('');
  observeFadeIn();
}

function buildContact() {
  buildNav('contact');
}

/* ── Detail Page ───────────────────────────────────────────────────────────── */
async function buildDetail() {
  const params = new URLSearchParams(location.search);
  const type   = params.get('type') || 'news';
  const s      = params.get('slug');

  buildNav('');

  const titleMap = { news: '新闻动态', sponsorship: '赞助公示' };
  const backMap  = { news: 'index.html', sponsorship: 'sponsorship.html' };

  const heroEl    = qs('detailHero');
  const coverEl   = qs('detailCover');
  const contentEl = qs('postContent');

  if (!s) { if (contentEl) contentEl.innerHTML = '<p>找不到内容。</p>'; return; }

  const data = await loadPost(type, s + '.md');
  if (!data) { if (contentEl) contentEl.innerHTML = '<p>加载失败，请稍后重试。</p>'; return; }

  const { meta, content } = data;
  document.title = (meta.title || '详情') + ' — 浙大研究生支教团';

  if (heroEl) {
    heroEl.innerHTML = `
      <div class="detail-header-inner">
        <a class="back-link" href="${backMap[type] || 'index.html'}">${titleMap[type] || '返回'}</a>
        <span class="detail-category">${titleMap[type] || type}</span>
        <h1 class="detail-title">${meta.title || ''}</h1>
        <div class="detail-meta">
          ${meta.date ? `<span>${formatDate(meta.date)}</span>` : ''}
          ${meta.author ? `<span>${meta.author}</span>` : ''}
          ${(meta.tags || []).map ? (meta.tags || []).map(t => `<span>#${t}</span>`).join('') : ''}
        </div>
      </div>`;
  }

  if (coverEl && meta.cover) {
    coverEl.innerHTML = `<img src="${meta.cover}" alt="${meta.title || ''}">`;
  } else if (coverEl) {
    coverEl.style.display = 'none';
  }

  if (contentEl) contentEl.innerHTML = md(content);
}

/* ── Member Detail ─────────────────────────────────────────────────────────── */
async function buildMember() {
  buildNav('team');

  const s = new URLSearchParams(location.search).get('slug');
  const wrap = qs('memberWrap');
  if (!s || !wrap) return;

  const data = await loadPost('team', s + '.md');
  if (!data) { wrap.innerHTML = '<p>成员信息未找到。</p>'; return; }

  const { meta, content } = data;
  document.title = (meta.name || '成员') + ' — 浙大研究生支教团';

  const photoContent = meta.photo
    ? `<img src="${meta.photo}" alt="${meta.name}">`
    : `<div style="font-size:4rem">👤</div>`;

  wrap.insertAdjacentHTML('beforebegin', `<a class="back-link member-back" href="team.html">返回团队</a>`);
  wrap.innerHTML = `
    <div class="member-sidebar">
      <div class="member-photo-lg">${photoContent}</div>
      <div class="member-sidebar-name">${meta.name || ''}</div>
      <div class="member-sidebar-role">${meta.role || ''}${meta.batch ? ' · ' + meta.batch : ''}</div>
      ${meta.service_location ? `<div class="member-sidebar-location">${meta.service_location}</div>` : ''}
      ${meta.school ? `<span class="member-sidebar-school">🏫 ${meta.school}</span>` : ''}
    </div>
    <div class="post-body">${md(content)}</div>`;
}

/* ── Activity Detail ───────────────────────────────────────────────────────── */
async function buildActivityDetail() {
  buildNav('activities');

  const s = new URLSearchParams(location.search).get('slug');
  const heroEl    = qs('activityHero');
  const coverEl   = qs('activityCover');
  const contentEl = qs('activityContent');

  if (!s) return;

  const data = await loadPost('activities', s + '.md');
  if (!data) { if (contentEl) contentEl.innerHTML = '<p>加载失败。</p>'; return; }

  const { meta, content } = data;
  document.title = (meta.title || '活动') + ' — 浙大研究生支教团';

  if (heroEl) {
    heroEl.innerHTML = `
      <div class="detail-header-inner">
        <a class="back-link" href="activities.html">品牌活动</a>
        <span class="detail-category">品牌活动</span>
        <h1 class="detail-title">${meta.title || ''}</h1>
        <div class="detail-meta">
          ${meta.year ? `<span>${meta.year}年</span>` : ''}
          ${meta.active === 'true' ? '<span>进行中</span>' : ''}
        </div>
      </div>`;
  }

  if (coverEl && meta.cover) {
    coverEl.innerHTML = `<img src="${meta.cover}" alt="${meta.title || ''}">`;
  } else if (coverEl) {
    coverEl.style.display = 'none';
  }

  if (contentEl) contentEl.innerHTML = md(content);
}

/* ── Fade-in on scroll ─────────────────────────────────────────────────────── */
function observeFadeIn() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  $$('.fade-in').forEach(el => io.observe(el));
}

/* ── Router ────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'home')           buildHome();
  else if (page === 'team')      buildTeam();
  else if (page === 'activities') buildActivities();
  else if (page === 'sponsorship') buildSponsorship();
  else if (page === 'contact')   buildContact();
  else if (page === 'detail')    buildDetail();
  else if (page === 'member')    buildMember();
  else if (page === 'activity')  buildActivityDetail();
});
