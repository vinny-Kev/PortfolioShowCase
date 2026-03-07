(() => {
  if (window.cliWindowInitialized) {
    return;
  }

  window.cliWindowInitialized = true;

  const cliWindow = document.getElementById('cli-window');
  const cliClose = document.getElementById('cli-close');
  const cliMinimize = document.getElementById('cli-minimize');
  const cliAccordionToggle = document.getElementById('cli-accordion-toggle');
  const cliResizeHandles = Array.from(document.querySelectorAll('.cli-resize-handle'));
  const cliContent = document.getElementById('cli-content');
  const cliInput = document.getElementById('cli-input');
  const cliLine = document.getElementById('cli-line');

  if (!cliWindow || !cliContent || !cliInput || !cliLine) {
    console.warn('[CLI] Required elements were not found.');
    return;
  }

  let isMinimized = false;
  let isResizing = false;
  let resizePointerId = null;
  let resizeDir = 'se';
  let resizeStartX = 0;
  let resizeStartY = 0;
  let resizeStartWidth = 0;
  let resizeStartHeight = 0;
  let resizeStartLeft = 0;
  let resizeStartTop = 0;

  const focusInput = () => {
    cliInput.focus({ preventScroll: true });
  };

  const scrollToBottom = () => {
    cliContent.scrollTop = cliContent.scrollHeight;
  };

  const show = () => {
    cliWindow.style.display = 'flex';
    cliWindow.setAttribute('aria-hidden', 'false');
    if (isMinimized) {
      setMinimized(false);
    }
    focusInput();
  };

  const hide = () => {
    cliWindow.style.display = 'none';
    setMinimized(true);
    // collapse expanded state when hiding so it resets next show
    cliWindow.classList.remove('is-expanded');
    cliWindow.style.width = '';
    cliWindow.style.height = '';
    cliWindow.style.left = '';
    cliWindow.style.top = '';
    cliWindow.style.right = '';
    cliWindow.style.bottom = '';
    cliWindow.setAttribute('aria-hidden', 'true');
    isResizing = false;
  };

  const setMinimized = (value) => {
    isMinimized = Boolean(value);

    if (isMinimized) {
      cliWindow.classList.add('is-minimized');
      cliContent.style.display = 'none';
      cliLine.style.display = 'none';
      if (cliAccordionToggle) {
        cliAccordionToggle.setAttribute('aria-expanded', 'false');
      }
      return;
    }

    cliWindow.classList.remove('is-minimized');
    cliContent.style.display = 'block';
    cliLine.style.display = 'flex';
    if (cliAccordionToggle) {
      cliAccordionToggle.setAttribute('aria-expanded', 'true');
    }
    focusInput();
  };

  const clear = () => {
    cliContent.innerHTML = '';
  };

  const appendLine = (text, { className, asHTML } = {}) => {
    const line = document.createElement('div');

    if (className) {
      line.classList.add(className);
    }

    if (asHTML) {
      line.innerHTML = text;
    } else {
      line.textContent = text;
    }

    cliContent.appendChild(line);
    scrollToBottom();
    return line;
  };

  // If focus is lost, allow clicking the window to refocus input.
  cliWindow.addEventListener('pointerdown', (event) => {
    if (isMinimized) {
      return;
    }

    const target = event.target;
    if (target && typeof target.closest === 'function') {
      if (target.closest('button') || target.closest('.cli-resize-handle') || target.closest('#cli-input')) {
        return;
      }
    }

    focusInput();
  });

  if (cliClose) {
    cliClose.addEventListener('click', () => {
      hide();
      if (window.cliOnboarding && typeof window.cliOnboarding.onCloseFromButton === 'function') {
        window.cliOnboarding.onCloseFromButton();
      }
    });
  }

  if (cliMinimize) {
    cliMinimize.addEventListener('click', () => {
      setMinimized(!isMinimized);
    });
  }

  if (cliAccordionToggle) {
    cliAccordionToggle.addEventListener('click', () => {
      setMinimized(!isMinimized);
    });
  }

  const startResize = (event, dir) => {
    if (isMinimized) {
      return;
    }

    if (typeof event.button === 'number' && event.button !== 0) {
      return;
    }

    event.preventDefault();
    isResizing = true;
    resizePointerId = event.pointerId;
    resizeDir = dir || 'se';
    resizeStartX = event.clientX;
    resizeStartY = event.clientY;

    const rect = cliWindow.getBoundingClientRect();
    resizeStartWidth = rect.width;
    resizeStartHeight = rect.height;
    resizeStartLeft = rect.left;
    resizeStartTop = rect.top;

    // Switch to explicit left/top positioning for consistent corner resizing.
    cliWindow.style.left = `${resizeStartLeft}px`;
    cliWindow.style.top = `${resizeStartTop}px`;
    cliWindow.style.right = 'auto';
    cliWindow.style.bottom = 'auto';

    cliWindow.classList.add('is-expanded');
    document.body.style.userSelect = 'none';
  };

  const moveResize = (event) => {
    if (!isResizing || resizePointerId !== event.pointerId) {
      return;
    }

    const dx = event.clientX - resizeStartX;
    const dy = event.clientY - resizeStartY;

    let nextWidth = resizeStartWidth;
    let nextHeight = resizeStartHeight;
    let nextLeft = resizeStartLeft;
    let nextTop = resizeStartTop;

    if (resizeDir.includes('e')) {
      nextWidth = resizeStartWidth + dx;
    }
    if (resizeDir.includes('s')) {
      nextHeight = resizeStartHeight + dy;
    }
    if (resizeDir.includes('w')) {
      nextWidth = resizeStartWidth - dx;
      nextLeft = resizeStartLeft + dx;
    }
    if (resizeDir.includes('n')) {
      nextHeight = resizeStartHeight - dy;
      nextTop = resizeStartTop + dy;
    }

    const minWidth = 420;
    const minHeight = 260;

    const margin = 8;
    const viewportWidth = window.innerWidth || 0;
    const viewportHeight = window.innerHeight || 0;
    const maxWidth = Math.max(minWidth, viewportWidth - margin * 2);
    const maxHeight = Math.max(minHeight, viewportHeight - margin * 2);

    if (nextWidth < minWidth) {
      if (resizeDir.includes('w')) {
        nextLeft -= (minWidth - nextWidth);
      }
      nextWidth = minWidth;
    }
    if (nextHeight < minHeight) {
      if (resizeDir.includes('n')) {
        nextTop -= (minHeight - nextHeight);
      }
      nextHeight = minHeight;
    }

    if (nextWidth > maxWidth) {
      if (resizeDir.includes('w')) {
        nextLeft += (nextWidth - maxWidth);
      }
      nextWidth = maxWidth;
    }

    if (nextHeight > maxHeight) {
      if (resizeDir.includes('n')) {
        nextTop += (nextHeight - maxHeight);
      }
      nextHeight = maxHeight;
    }

    // Keep the window fully reachable in the viewport.
    const minLeft = margin;
    const minTop = margin;
    const maxLeft = Math.max(margin, viewportWidth - margin - nextWidth);
    const maxTop = Math.max(margin, viewportHeight - margin - nextHeight);
    nextLeft = Math.min(Math.max(nextLeft, minLeft), maxLeft);
    nextTop = Math.min(Math.max(nextTop, minTop), maxTop);

    cliWindow.style.width = `${nextWidth}px`;
    cliWindow.style.height = `${nextHeight}px`;
    cliWindow.style.left = `${nextLeft}px`;
    cliWindow.style.top = `${nextTop}px`;
  };

  const stopResize = (event) => {
    if (!isResizing) {
      return;
    }

    if (event && resizePointerId !== null && event.pointerId !== resizePointerId) {
      return;
    }

    isResizing = false;
    resizePointerId = null;
    document.body.style.userSelect = '';
  };

  cliResizeHandles.forEach((handle) => {
    handle.addEventListener('pointerdown', (event) => {
      const dir = handle.getAttribute('data-dir') || 'se';
      startResize(event, dir);
      handle.setPointerCapture(event.pointerId);
    });
    handle.addEventListener('pointermove', moveResize);
    handle.addEventListener('pointerup', stopResize);
    handle.addEventListener('pointercancel', stopResize);
  });

  const expand = () => {
    cliWindow.classList.add('is-expanded');
  };

  const restore = () => {
    cliWindow.classList.remove('is-expanded');
  };

  window.cliWindowAPI = {
    elements: {
      window: cliWindow,
      content: cliContent,
      input: cliInput,
      closeButton: cliClose || null,
    },
    show,
    hide,
    clear,
    setMinimized,
    appendLine,
    focusInput,
    scrollToBottom,
    expand,
    restore,
  };
})();