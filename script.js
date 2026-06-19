document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initFolders();
  initToolbar();
  initGallery();
});

function initTheme() {
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');

  // Respect saved preference, otherwise respect OS preference, otherwise dark
  if (saved) {
    root.setAttribute('data-theme', saved);
  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    root.setAttribute('data-theme', 'light');
  }

  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  function doToggle() {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  }

  toggle.addEventListener('click', doToggle);
  toggle.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); doToggle(); }
  });
}

function initFolders() {
  document.querySelectorAll('.folder').forEach(folder => {
    const head = folder.querySelector('.folder-head');
    if (!head) return;
    head.addEventListener('click', () => toggleFolder(folder));
    head.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleFolder(folder);
      }
    });
  });
}

function toggleFolder(folder) {
  const isOpen = folder.classList.contains('open');
  const head = folder.querySelector('.folder-head');
  const wrap = folder.querySelector('.folder-wrap');
  const arrow = head.querySelector('.fh-arrow');

  if (isOpen) {
    folder.classList.remove('open');
    head.setAttribute('aria-expanded', 'false');
    wrap.style.maxHeight = wrap.scrollHeight + 'px';
    requestAnimationFrame(() => { wrap.style.maxHeight = '0'; });
    if (arrow) arrow.textContent = 'OPEN';
  } else {
    folder.classList.add('open');
    head.setAttribute('aria-expanded', 'true');
    wrap.style.maxHeight = wrap.scrollHeight + 'px';
    const onEnd = () => {
      if (folder.classList.contains('open')) wrap.style.maxHeight = 'none';
      wrap.removeEventListener('transitionend', onEnd);
    };
    wrap.addEventListener('transitionend', onEnd);
    if (arrow) arrow.textContent = 'CLOSE';
  }
}

function initGallery() {
  const items = document.querySelectorAll('.gallery-item');
  if (!items.length) return;

  // Add zoom icon to each item
  items.forEach(item => {
    const icon = document.createElement('div');
    icon.className = 'gallery-zoom-icon';
    icon.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>';
    item.appendChild(icon);
  });

  // Build lightbox DOM
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = `
    <div class="lightbox-img-wrap"><img id="lb-img" src="" alt=""></div>
    <button class="lb-btn lb-prev" aria-label="Previous">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
    </button>
    <button class="lb-btn lb-next" aria-label="Next">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
    </button>
    <button class="lb-close" aria-label="Close">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
    <div class="lb-counter" id="lb-counter"></div>
  `;
  document.body.appendChild(lb);

  const lbImg = lb.querySelector('#lb-img');
  const lbCounter = lb.querySelector('#lb-counter');
  const srcs = Array.from(items).map(el => el.querySelector('img').src);
  let current = 0;

  function open(index) {
    current = index;
    lbImg.src = srcs[current];
    lbCounter.textContent = `${current + 1} / ${srcs.length}`;
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lb.classList.remove('active');
    document.body.style.overflow = '';
  }

  function prev() { open((current - 1 + srcs.length) % srcs.length); }
  function next() { open((current + 1) % srcs.length); }

  items.forEach((item, i) => item.addEventListener('click', () => open(i)));
  lb.querySelector('.lb-prev').addEventListener('click', e => { e.stopPropagation(); prev(); });
  lb.querySelector('.lb-next').addEventListener('click', e => { e.stopPropagation(); next(); });
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });

  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('active')) return;
    if (e.key === 'ArrowLeft') prev();
    else if (e.key === 'ArrowRight') next();
    else if (e.key === 'Escape') close();
  });
}

function initToolbar() {
  const openAllBtn = document.getElementById('openAll');
  const closeAllBtn = document.getElementById('closeAll');
  const folders = document.querySelectorAll('.folder');

  if (openAllBtn) {
    openAllBtn.addEventListener('click', () => {
      folders.forEach((folder, i) => {
        setTimeout(() => {
          if (!folder.classList.contains('open')) toggleFolder(folder);
        }, i * 80);
      });
    });
  }

  if (closeAllBtn) {
    closeAllBtn.addEventListener('click', () => {
      folders.forEach((folder, i) => {
        setTimeout(() => {
          if (folder.classList.contains('open')) toggleFolder(folder);
        }, i * 50);
      });
    });
  }
}
