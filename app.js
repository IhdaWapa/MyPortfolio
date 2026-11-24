/**
 * app.js — Logika utama portfolio (notebook/editorial redesign)
 * Fixed: CHIP_CYCLE dipindah ke atas, reveal lebih robust
 */

/* ================================================================
   KONSTANTA GLOBAL (harus di atas sebelum semua fungsi)
   ================================================================ */
const STORAGE_KEY = 'portfolio_v3';
const CHIP_CYCLE  = ['chip-yellow', 'chip-green', 'chip-pink', 'chip-blue'];

const CAT = {
  game:   { label: 'Game (itch.io)', dot: '#f5c842', icon: '🎮' },
  '3d':   { label: '3D',            dot: '#3ecf5e', icon: '🧊' },
  design: { label: 'Desain Grafis', dot: '#ff4d8d', icon: '🎨' },
};

/* ================================================================
   STORAGE
   ================================================================ */
function loadData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; }
}
function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}
function getData() {
  return loadData() || {
    profile: {
      heroName:        'NAMA KAMU',
      heroRole:        'Game Developer',
      heroCity:        'Indonesia',
      heroStatement:   'Saya bikin game yang terasa hidup',
      aboutText:       'Saya mahasiswa Teknologi Game semester 5 yang terlalu excited soal game design. ✨ Saya peduli detail kecil, edge case yang sering dilupakan, dan bikin karya yang beneran bikin orang senang. 🎯',
      contactLead:     'Lagi cari magang atau kolaborasi? Langsung kontak saya!',
      contactEmail:    'email@example.com',
      contactLinkedin: 'https://linkedin.com',
      contactItch:     'https://namauser.itch.io',
      footerName:      'Nama Kamu',
      avatar:          '',
    },
    skills: [
      { label: 'Unity',         emoji: '🎮', color: 'chip-yellow' },
      { label: 'Blender',       emoji: '🧊', color: 'chip-green'  },
      { label: 'Godot',         emoji: '🕹️', color: 'chip-pink'   },
      { label: 'Unreal Engine', emoji: '⚡', color: 'chip-blue'   },
      { label: 'Photoshop',     emoji: '🎨', color: 'chip-yellow' },
      { label: 'Illustrator',   emoji: '✏️', color: 'chip-green'  },
      { label: 'C#',            emoji: '💻', color: 'chip-pink'   },
      { label: 'GDScript',      emoji: '🐍', color: 'chip-blue'   },
    ],
    projects: JSON.parse(JSON.stringify(PROJECTS_DEFAULT)),
  };
}

/* ================================================================
   STATE
   ================================================================ */
let STATE     = getData();
let editMode  = false;
let activeTab = 0;

/* ================================================================
   SCROLL REVEAL — langsung visible kalau sudah di viewport
   ================================================================ */
function initReveal() {
  const els = document.querySelectorAll('.reveal');

  // Fallback: paksa visible setelah 800ms agar konten tidak terkunci
  const fallback = setTimeout(() => {
    els.forEach(el => el.classList.add('visible'));
  }, 800);

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const delay = +(e.target.dataset.delay || 0);
      setTimeout(() => e.target.classList.add('visible'), delay);
      obs.unobserve(e.target);
    });
    // Kalau semua sudah visible, batalkan fallback
    if ([...els].every(el => el.classList.contains('visible'))) {
      clearTimeout(fallback);
    }
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

  els.forEach(el => obs.observe(el));
}

/* ================================================================
   ACTIVE NAV PILL ON SCROLL
   ================================================================ */
function initNavHighlight() {
  const navPills = document.querySelectorAll('.nav-pill');
  const sectionIds = ['hero', 'about', 'projects', 'contact'];
  const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

  window.addEventListener('scroll', () => {
    let current = 0;
    sections.forEach((sec, i) => {
      if (window.scrollY >= sec.offsetTop - 140) current = i;
    });
    navPills.forEach((p, i) => {
      p.classList.toggle('nav-pill-active', i === current);
    });
  }, { passive: true });
}

/* ================================================================
   PROFILE
   ================================================================ */
function applyProfile() {
  const p = STATE.profile;

  const fields = {
    heroName:        p.heroName,
    heroRole:        p.heroRole,
    heroCity:        p.heroCity,
    heroStatement:   p.heroStatement,
    aboutText:       p.aboutText,
    contactLead:     p.contactLead,
    contactEmail:    p.contactEmail,
    contactLinkedin: p.contactLinkedin,
    contactItch:     p.contactItch,
    footerName:      p.footerName,
  };
  Object.entries(fields).forEach(([field, val]) => {
    document.querySelectorAll(`[data-field="${field}"]`).forEach(el => {
      el.textContent = val;
    });
  });

  // Link hrefs
  const emailLink = document.getElementById('emailLink');
  if (emailLink) emailLink.href = 'mailto:' + p.contactEmail;
  const liLink    = document.getElementById('linkedinLink');
  if (liLink)    liLink.href    = p.contactLinkedin;
  const itchLink  = document.getElementById('itchLink');
  if (itchLink)  itchLink.href  = p.contactItch;

  // Nav icon buttons
  const navEmail = document.getElementById('navEmailBtn');
  const navLi    = document.getElementById('navLinkedinBtn');
  const navItch  = document.getElementById('navItchBtn');
  if (navEmail) navEmail.href = 'mailto:' + p.contactEmail;
  if (navLi)    navLi.href    = p.contactLinkedin;
  if (navItch)  navItch.href  = p.contactItch;

  // Avatars
  const img1 = document.getElementById('avatarImg1');
  const img2 = document.getElementById('avatarImg2');
  const ph1  = document.getElementById('polaroidPlaceholder1');
  const ph2  = document.getElementById('aboutPlaceholder');

  [img1, img2].forEach(img => {
    if (!img) return;
    if (p.avatar) { img.src = p.avatar; img.classList.remove('hidden'); }
    else           { img.classList.add('hidden'); }
  });
  if (ph1) ph1.classList.toggle('hidden', !!p.avatar);
  if (ph2) ph2.classList.toggle('hidden', !!p.avatar);

  // Footer year
  const fy = document.getElementById('footerYear');
  if (fy) fy.textContent = new Date().getFullYear();
}

/* ================================================================
   SKILLS
   ================================================================ */
function renderSkills() {
  const container = document.getElementById('skillTags');
  if (!container) return;
  container.innerHTML = '';

  STATE.skills.forEach((skill, i) => {
    const colorClass = skill.color || CHIP_CYCLE[i % CHIP_CYCLE.length];
    const span = document.createElement('span');
    span.className = 'skill-chip ' + colorClass;
    if (editMode) span.classList.add('chip-removable');

    const emojiSpan = document.createElement('span');
    emojiSpan.className = 'chip-emoji';
    emojiSpan.textContent = skill.emoji || '';

    span.textContent = skill.label + ' ';
    span.appendChild(emojiSpan);

    if (editMode) {
      span.style.cursor = 'pointer';
      span.title = 'Klik untuk hapus';
      span.addEventListener('click', () => {
        STATE.skills.splice(i, 1);
        saveData(STATE);
        renderSkills();
      });
    }
    container.appendChild(span);
  });
}

/* ================================================================
   PROJECT TABS
   ================================================================ */
function renderTabs() {
  const container = document.getElementById('projTabs');
  if (!container) return;
  container.innerHTML = '';
  if (!STATE.projects.length) return;

  STATE.projects.forEach((proj, idx) => {
    const cat = CAT[proj.category] || CAT.game;
    const btn = document.createElement('button');
    btn.className = 'proj-tab' + (idx === activeTab ? ' active' : '');
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', String(idx === activeTab));

    const dot = document.createElement('span');
    dot.className = 'proj-tab-dot';
    dot.style.background = cat.dot;
    btn.appendChild(dot);
    btn.appendChild(document.createTextNode(
      ' ★ PROJECT ' + String(idx + 1).padStart(2, '0')
    ));
    btn.addEventListener('click', () => {
      activeTab = idx;
      renderTabs();
      renderPanel();
    });
    container.appendChild(btn);
  });
}

/* ================================================================
   PROJECT PANEL
   ================================================================ */
function renderPanel() {
  const container = document.getElementById('projPanel');
  if (!container) return;
  container.innerHTML = '';

  if (!STATE.projects.length) {
    container.innerHTML = `
      <div style="grid-column:1/-1;display:flex;flex-direction:column;align-items:center;
        justify-content:center;gap:.75rem;padding:4rem;color:var(--dark-muted);
        font-size:.9rem;text-align:center;min-height:260px;">
        <span style="font-size:3rem">📭</span>
        Belum ada proyek.${editMode ? '<br><strong style="color:var(--yellow)">Klik Tambah Proyek Baru di bawah.</strong>' : ''}
      </div>`;
    return;
  }

  if (activeTab >= STATE.projects.length) activeTab = 0;
  const proj = STATE.projects[activeTab];
  const cat  = CAT[proj.category] || CAT.game;

  /* — Info column — */
  const info = document.createElement('div');
  info.className = 'proj-info';

  // Meta header: Category badge + Date (natural flow, no collisions)
  const metaHeader = document.createElement('div');
  metaHeader.className = 'proj-meta-header';

  const catBadge = document.createElement('span');
  catBadge.className = 'proj-cat-badge cat-' + (proj.category || 'game');
  catBadge.innerHTML = `<span>${cat.icon}</span> ${cat.label.toUpperCase()}`;
  metaHeader.appendChild(catBadge);

  if (proj.date) {
    const dateEl = document.createElement('div');
    dateEl.className = 'proj-date';
    dateEl.textContent = proj.date;
    metaHeader.appendChild(dateEl);
  }
  info.appendChild(metaHeader);

  const titleEl = document.createElement('h3');
  titleEl.className = 'proj-title-proj';
  titleEl.textContent = proj.title;
  info.appendChild(titleEl);

  if (proj.desc) {
    const descEl = document.createElement('p');
    descEl.className = 'proj-desc-proj';
    descEl.textContent = proj.desc;
    info.appendChild(descEl);
  }

  if (proj.tags && proj.tags.length) {
    const tagsEl = document.createElement('div');
    tagsEl.className = 'proj-tags-proj';
    proj.tags.forEach(t => {
      const s = document.createElement('span');
      s.className = 'proj-tag';
      s.textContent = t;
      tagsEl.appendChild(s);
    });
    info.appendChild(tagsEl);
  }

  if (proj.link) {
    const a = document.createElement('a');
    a.className = 'proj-view-link';
    a.href = proj.link;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', 'Lihat proyek ' + proj.title);
    a.textContent = 'VIEW PROJECT →';
    info.appendChild(a);
  }

  if (editMode) {
    const acts = document.createElement('div');
    acts.className = 'proj-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'proj-edit-btn';
    editBtn.textContent = '✎ Edit';
    editBtn.addEventListener('click', () => openProjectModal(activeTab));

    const delBtn = document.createElement('button');
    delBtn.className = 'proj-del-btn';
    delBtn.textContent = '✕ Hapus';
    delBtn.addEventListener('click', () => deleteProject(activeTab));

    acts.appendChild(editBtn);
    acts.appendChild(delBtn);
    info.appendChild(acts);
  }

  container.appendChild(info);

  /* — Image column — */
  const imgPanel = document.createElement('div');
  imgPanel.className = 'proj-image-panel';

  if (proj.image) {
    const img = document.createElement('img');
    img.src = proj.image;
    img.alt = proj.title + ' screenshot';
    img.loading = 'lazy';
    img.onerror = () => img.replaceWith(makePanelPlaceholder(cat));
    imgPanel.appendChild(img);
  } else {
    imgPanel.appendChild(makePanelPlaceholder(cat));
  }

  container.appendChild(imgPanel);
}

function makePanelPlaceholder(cat) {
  const wrap = document.createElement('div');
  wrap.className = 'proj-image-placeholder';
  wrap.innerHTML = `<span class="ph-icon">${cat.icon}</span><span class="ph-label">TAMBAHKAN SCREENSHOT</span>`;
  return wrap;
}

/* ================================================================
   PROJECT MODAL
   ================================================================ */
const projectModal = document.getElementById('projectModal');
const projectForm  = document.getElementById('projectForm');
const modalTitle   = document.getElementById('modalTitle');
const editIndexEl  = document.getElementById('editIndex');

function openProjectModal(idx = null) {
  modalTitle.textContent = idx === null ? 'Tambah Proyek' : 'Edit Proyek';
  editIndexEl.value = idx !== null ? String(idx) : '';

  if (idx !== null) {
    const p = STATE.projects[idx];
    document.getElementById('projTitle').value    = p.title    || '';
    document.getElementById('projCategory').value = p.category || '';
    document.getElementById('projDate').value     = p.date     || '';
    document.getElementById('projDesc').value     = p.desc     || '';
    document.getElementById('projLink').value     = p.link     || '';
    document.getElementById('projImage').value    = p.image    || '';
    document.getElementById('projTags').value     = (p.tags || []).join(', ');
  } else {
    projectForm.reset();
  }
  clearFormErrors(projectForm);
  projectModal.classList.remove('hidden');
  document.getElementById('projTitle').focus();
}

function closeProjectModal() {
  projectModal.classList.add('hidden');
  projectForm.reset();
}

document.getElementById('addProjectBtn')?.addEventListener('click', () => openProjectModal());
document.getElementById('modalClose')?.addEventListener('click', closeProjectModal);
document.getElementById('modalCancel')?.addEventListener('click', closeProjectModal);
projectModal?.addEventListener('click', e => { if (e.target === projectModal) closeProjectModal(); });

projectForm?.addEventListener('submit', e => {
  e.preventDefault();
  if (!validateProjectForm()) return;

  const idx = editIndexEl.value !== '' ? +editIndexEl.value : null;
  const entry = {
    title:    document.getElementById('projTitle').value.trim(),
    category: document.getElementById('projCategory').value,
    date:     document.getElementById('projDate').value.trim(),
    desc:     document.getElementById('projDesc').value.trim(),
    link:     document.getElementById('projLink').value.trim(),
    image:    document.getElementById('projImage').value.trim(),
    tags:     document.getElementById('projTags').value.split(',').map(t => t.trim()).filter(Boolean),
  };

  if (idx !== null) {
    STATE.projects[idx] = entry;
    activeTab = idx;
  } else {
    STATE.projects.push(entry);
    activeTab = STATE.projects.length - 1;
  }

  saveData(STATE);
  closeProjectModal();
  renderTabs();
  renderPanel();
});

function validateProjectForm() {
  let ok = true;
  const title = document.getElementById('projTitle');
  const cat   = document.getElementById('projCategory');
  clearFormErrors(projectForm);
  if (!title.value.trim()) { showFieldError(title, 'Judul wajib diisi.'); ok = false; }
  if (!cat.value)           { showFieldError(cat,   'Pilih kategori.');    ok = false; }
  return ok;
}

function deleteProject(idx) {
  if (!confirm(`Hapus proyek "${STATE.projects[idx].title}"?`)) return;
  STATE.projects.splice(idx, 1);
  if (activeTab >= STATE.projects.length) activeTab = Math.max(0, STATE.projects.length - 1);
  saveData(STATE);
  renderTabs();
  renderPanel();
}

function showFieldError(field, msg) {
  field.classList.add('error');
  const err = document.createElement('span');
  err.className = 'field-error';
  err.textContent = msg;
  field.parentElement.appendChild(err);
}
function clearFormErrors(form) {
  form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  form.querySelectorAll('.field-error').forEach(el => el.remove());
}

/* ================================================================
   PROFILE MODAL
   ================================================================ */
const profileModal = document.getElementById('profileModal');
const profileForm  = document.getElementById('profileForm');

function openProfileModal() {
  const p = STATE.profile;
  document.getElementById('pName').value      = p.heroName        || '';
  document.getElementById('pRole').value      = p.heroRole        || '';
  document.getElementById('pCity').value      = p.heroCity        || '';
  document.getElementById('pStatement').value = p.heroStatement   || '';
  document.getElementById('pAbout').value     = p.aboutText       || '';
  document.getElementById('pEmail').value     = p.contactEmail    || '';
  document.getElementById('pLinkedin').value  = p.contactLinkedin || '';
  document.getElementById('pItch').value      = p.contactItch     || '';
  document.getElementById('pAvatar').value    = p.avatar          || '';
  profileModal.classList.remove('hidden');
  document.getElementById('pName').focus();
}
function closeProfileModal() { profileModal.classList.add('hidden'); }

document.getElementById('editProfileBtn')?.addEventListener('click', openProfileModal);
document.getElementById('profileModalClose')?.addEventListener('click', closeProfileModal);
document.getElementById('profileCancel')?.addEventListener('click', closeProfileModal);
profileModal?.addEventListener('click', e => { if (e.target === profileModal) closeProfileModal(); });

profileForm?.addEventListener('submit', e => {
  e.preventDefault();
  const p = STATE.profile;
  p.heroName        = document.getElementById('pName').value.trim()      || p.heroName;
  p.heroRole        = document.getElementById('pRole').value.trim()      || p.heroRole;
  p.heroCity        = document.getElementById('pCity').value.trim()      || p.heroCity;
  p.heroStatement   = document.getElementById('pStatement').value.trim() || p.heroStatement;
  p.aboutText       = document.getElementById('pAbout').value.trim()     || p.aboutText;
  p.contactEmail    = document.getElementById('pEmail').value.trim()     || p.contactEmail;
  p.contactLinkedin = document.getElementById('pLinkedin').value.trim()  || p.contactLinkedin;
  p.contactItch     = document.getElementById('pItch').value.trim()      || p.contactItch;
  p.avatar          = document.getElementById('pAvatar').value.trim();
  p.footerName      = p.heroName;
  saveData(STATE);
  applyProfile();
  closeProfileModal();
});

/* ================================================================
   EDIT MODE
   ================================================================ */
const editToggle  = document.getElementById('editToggle');
const editToolbar = document.getElementById('editToolbar');
const saveEditBtn = document.getElementById('saveEditBtn');
const clearBtn    = document.getElementById('clearStorageBtn');
const addSkillBtn = document.getElementById('addSkillBtn');

function setEditMode(active) {
  editMode = active;
  editToggle.setAttribute('aria-pressed', String(active));

  document.querySelectorAll('.edit-only').forEach(el => el.classList.toggle('hidden', !active));
  document.querySelectorAll('.editable').forEach(el => {
    el.contentEditable = active ? 'true' : 'false';
  });

  if (active) {
    editToolbar.classList.remove('hidden');
  } else {
    editToolbar.classList.add('hidden');
    // Simpan perubahan inline
    document.querySelectorAll('.editable').forEach(el => {
      const field = el.dataset.field;
      if (!field) return;
      const val = el.textContent.trim();
      if (field === 'footerName') {
        STATE.profile.heroName   = val;
        STATE.profile.footerName = val;
      } else if (STATE.profile[field] !== undefined) {
        STATE.profile[field] = val;
      }
    });
    saveData(STATE);
    applyProfile();
  }
  renderTabs();
  renderPanel();
  renderSkills();
}

editToggle?.addEventListener('click', () => setEditMode(!editMode));
saveEditBtn?.addEventListener('click', () => setEditMode(false));

clearBtn?.addEventListener('click', () => {
  if (!confirm('Reset semua data ke default?')) return;
  localStorage.removeItem(STORAGE_KEY);
  STATE = getData();
  activeTab = 0;
  setEditMode(false);
  applyProfile();
  renderTabs();
  renderPanel();
  renderSkills();
});

addSkillBtn?.addEventListener('click', () => {
  const name  = prompt('Nama skill baru:');
  if (!name || !name.trim()) return;
  const emoji = prompt('Emoji (opsional):') || '';
  const idx   = STATE.skills.length % CHIP_CYCLE.length;
  STATE.skills.push({ label: name.trim(), emoji, color: CHIP_CYCLE[idx] });
  saveData(STATE);
  renderSkills();
});

/* ================================================================
   KEYBOARD
   ================================================================ */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (!projectModal.classList.contains('hidden')) closeProjectModal();
    if (!profileModal.classList.contains('hidden')) closeProfileModal();
    if (editMode) setEditMode(false);
  }
  if (!e.target.matches('input, textarea, select, [contenteditable]')) {
    if (e.key === 'ArrowRight' && STATE.projects.length > 0) {
      activeTab = (activeTab + 1) % STATE.projects.length;
      renderTabs(); renderPanel();
    }
    if (e.key === 'ArrowLeft' && STATE.projects.length > 0) {
      activeTab = (activeTab - 1 + STATE.projects.length) % STATE.projects.length;
      renderTabs(); renderPanel();
    }
  }
});

/* ================================================================
   INIT
   ================================================================ */
applyProfile();
renderSkills();
renderTabs();
renderPanel();
initReveal();
initNavHighlight();
