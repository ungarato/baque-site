/* ═══════════════════════════════════════════════════════════
   Baque landing — interações (sem dependências)
   ═══════════════════════════════════════════════════════════ */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Scroll progress + header state ──────────────────── */
const progress = document.getElementById('scrollProgress');
const header = document.getElementById('siteHeader');

function onScroll() {
  const h = document.documentElement;
  const scrolled = h.scrollTop;
  const max = h.scrollHeight - h.clientHeight;
  if (progress) progress.style.width = (max > 0 ? (scrolled / max) * 100 : 0) + '%';

  if (header) {
    if (scrolled > 40) { header.classList.remove('is-top'); header.classList.add('is-scrolled'); }
    else { header.classList.add('is-top'); header.classList.remove('is-scrolled'); }
  }
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ── Reveal on scroll ────────────────────────────────── */
const revealEls = document.querySelectorAll('.reveal');
if (reduceMotion) {
  revealEls.forEach((el) => el.classList.add('is-in'));
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
  revealEls.forEach((el) => io.observe(el));
}

/* ── Count-up numbers ────────────────────────────────── */
function animateCount(el) {
  const to = parseInt(el.dataset.to, 10) || 0;
  if (reduceMotion) { el.textContent = to; return; }
  const dur = 1100;
  const start = performance.now();
  function tick(now) {
    const t = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(eased * to);
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ── Progress rings ──────────────────────────────────── */
function fillRing(circle) {
  const pct = parseFloat(circle.dataset.pct) || 0;
  const r = circle.r.baseVal.value;
  const circ = 2 * Math.PI * r;
  circle.style.strokeDasharray = circ;
  if (reduceMotion) { circle.style.strokeDashoffset = circ * (1 - pct / 100); return; }
  circle.style.strokeDashoffset = circ;
  requestAnimationFrame(() => {
    circle.style.strokeDashoffset = circ * (1 - pct / 100);
  });
}

const counterIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.querySelectorAll('.count').forEach(animateCount);
    e.target.querySelectorAll('.ring-fg').forEach(fillRing);
    counterIO.unobserve(e.target);
  });
}, { threshold: 0.4 });

document.querySelectorAll('.s-counter, .tile-limit-ring').forEach((el) => counterIO.observe(el));

/* ── Magnetic buttons ────────────────────────────────── */
if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('.btn-mag').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

/* ── Hero device parallax (segue o mouse) ────────────── */
const heroDevice = document.getElementById('heroDevice');
const hero = document.getElementById('hero');
if (heroDevice && hero && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
  hero.addEventListener('mousemove', (e) => {
    const r = hero.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    heroDevice.style.setProperty('--rx', (py * -6) + 'deg');
    heroDevice.style.setProperty('--ry', (px * 10 - 7) + 'deg');
  });
  hero.addEventListener('mouseleave', () => {
    heroDevice.style.setProperty('--rx', '0deg');
    heroDevice.style.setProperty('--ry', '-7deg');
  });
}

/* ── Smooth anchor (respeita header fixo) ────────────── */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id === '#' || id === '#top') return;
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.pageYOffset - 60;
      window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  });
});
