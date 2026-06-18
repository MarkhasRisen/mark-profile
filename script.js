document.addEventListener('DOMContentLoaded', () => {
  initFolders();
  initToolbar();
});

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
