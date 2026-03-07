(() => {
  if (window.cliWindowInitialized) {
    return;
  }

  window.cliWindowInitialized = true;

  const cliWindow = document.getElementById('cli-window');
  const cliClose = document.getElementById('cli-close');
  const cliMinimize = document.getElementById('cli-minimize');
  const cliAccordionToggle = document.getElementById('cli-accordion-toggle');
  const cliResizeHandle = document.getElementById('cli-resize-handle');
  const cliContent = document.getElementById('cli-content');
  const cliInput = document.getElementById('cli-input');
  const cliLine = document.getElementById('cli-line');

  if (!cliWindow || !cliContent || !cliInput || !cliLine) {
    console.warn('[CLI] Required elements were not found.');
    return;
  }

  let isMinimized = false;
  let isResizing = false;
  let resizeStartX = 0;
  let resizeStartY = 0;
  let resizeStartWidth = 0;
  let resizeStartHeight = 0;

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

  if (cliResizeHandle) {
    cliResizeHandle.addEventListener('mousedown', (event) => {
      if (!cliWindow.classList.contains('is-expanded') || isMinimized) {
        return;
      }

      event.preventDefault();
      isResizing = true;
      resizeStartX = event.clientX;
      resizeStartY = event.clientY;
      resizeStartWidth = cliWindow.offsetWidth;
      resizeStartHeight = cliWindow.offsetHeight;
    });
  }

  document.addEventListener('mousemove', (event) => {
    if (!isResizing) {
      return;
    }

    const nextWidth = Math.max(420, resizeStartWidth + (event.clientX - resizeStartX));
    const nextHeight = Math.max(260, resizeStartHeight + (event.clientY - resizeStartY));

    cliWindow.style.width = `${nextWidth}px`;
    cliWindow.style.height = `${nextHeight}px`;
  });

  document.addEventListener('mouseup', () => {
    isResizing = false;
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