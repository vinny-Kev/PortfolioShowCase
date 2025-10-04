(() => {
  if (window.cliWindowInitialized) {
    return;
  }

  window.cliWindowInitialized = true;

  const cliWindow = document.getElementById('cli-window');
  const cliClose = document.getElementById('cli-close');
  const cliContent = document.getElementById('cli-content');
  const cliInput = document.getElementById('cli-input');

  if (!cliWindow || !cliClose || !cliContent || !cliInput) {
    console.warn('[CLI] Required elements were not found.');
    return;
  }

  const focusInput = () => {
    cliInput.focus({ preventScroll: true });
  };

  const scrollToBottom = () => {
    cliContent.scrollTop = cliContent.scrollHeight;
  };

  const show = () => {
    cliWindow.style.display = 'flex';
    cliWindow.setAttribute('aria-hidden', 'false');
    focusInput();
  };

  const hide = () => {
    cliWindow.style.display = 'none';
    cliWindow.setAttribute('aria-hidden', 'true');
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

  cliClose.addEventListener('click', () => {
    hide();
    if (window.cliOnboarding && typeof window.cliOnboarding.onCloseFromButton === 'function') {
      window.cliOnboarding.onCloseFromButton();
    }
  });

  window.cliWindowAPI = {
    elements: {
      window: cliWindow,
      content: cliContent,
      input: cliInput,
      closeButton: cliClose,
    },
    show,
    hide,
    clear,
    appendLine,
    focusInput,
    scrollToBottom,
  };
})();