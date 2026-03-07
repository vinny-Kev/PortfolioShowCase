(() => {
  const terminalApp = document.getElementById('terminal-app');
  const terminalIcon = document.getElementById('terminal-icon');
  const terminalHeader = terminalApp?.querySelector('.terminal-header');
  const minimizeButton = terminalApp?.querySelector('.min-btn');
  const closeButton = terminalApp?.querySelector('.close-btn');
  const output = document.getElementById('cli-output');
  const modal = document.querySelector('.modal');
  const confirmButton = document.querySelector('.btn-confirm');
  const cancelButton = document.querySelector('.btn-cancel');

  if (!terminalApp || !terminalIcon || !output || !terminalHeader || !minimizeButton || !closeButton || !modal || !confirmButton || !cancelButton) {
    console.warn('[Terminal] Required DOM elements are missing.');
    return;
  }

  let history = [];
  let historyIndex = -1;
  let dragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  const printLine = (text = '') => {
    output.innerHTML += `${text}\n`;
    output.scrollTop = output.scrollHeight;
  };

  const focusPrompt = () => {
    const activeInput = document.getElementById('active-input');
    if (!activeInput) {
      return;
    }

    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(activeInput);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    activeInput.focus();
  };

  const newPrompt = (defaultText = '') => {
    output.innerHTML += `<span class="prompt">kevinOS$ </span><span id="active-input" class="active-input" contenteditable="true">${defaultText}</span>`;
    focusPrompt();
  };

  const typeLine = (line, callback) => {
    let index = 0;

    const typeNext = () => {
      if (index < line.length) {
        output.innerHTML += line[index];
        index += 1;
        window.setTimeout(typeNext, 30);
        return;
      }

      output.innerHTML += '\n';
      if (typeof callback === 'function') {
        callback();
      }
    };

    typeNext();
  };

  const boot = () => {
    output.innerHTML = '';
    printLine('Welcome to KevinOS');
    typeLine('kevinOS$ kevin --help', () => {
      window.setTimeout(() => {
        printLine('Available commands:');
        printLine('  kevin --about    -> Go to portfolio');
        printLine('  kevin --help     -> Show this help menu');
        window.setTimeout(() => newPrompt('kevin --about'), 300);
      }, 250);
    });
  };

  const resetTerminal = () => {
    history = [];
    historyIndex = -1;
    output.innerHTML = '';
    boot();
  };

  const openTerminal = () => {
    terminalApp.classList.remove('hidden');
    terminalApp.style.zIndex = '20';
    focusPrompt();
  };

  const minimizeTerminal = () => {
    terminalApp.classList.add('hidden');
  };

  const closeTerminal = () => {
    resetTerminal();
    terminalApp.classList.add('hidden');
  };

  const handleCommand = (commandText) => {
    if (commandText === 'kevin --about') {
      modal.classList.remove('hidden');
      return;
    }

    if (commandText === 'kevin --help') {
      printLine('Available commands:');
      printLine('  kevin --about    -> Go to portfolio');
      printLine('  kevin --help     -> Show this help menu');
      newPrompt();
      return;
    }

    if (commandText) {
      printLine(`'${commandText}' is not recognized as an internal or external command.`);
      newPrompt();
      return;
    }

    newPrompt();
  };

  terminalIcon.addEventListener('click', openTerminal);
  minimizeButton.addEventListener('click', minimizeTerminal);
  closeButton.addEventListener('click', closeTerminal);

  confirmButton.addEventListener('click', () => {
    document.body.classList.add('fade-out');
    window.setTimeout(() => {
      window.location.href = 'main-page.html';
    }, 600);
  });

  cancelButton.addEventListener('click', () => {
    modal.classList.add('hidden');
    printLine('Command cancelled. Type "kevin --about" again.');
    newPrompt();
  });

  terminalHeader.addEventListener('mousedown', (event) => {
    dragging = true;
    dragOffsetX = event.clientX - terminalApp.offsetLeft;
    dragOffsetY = event.clientY - terminalApp.offsetTop;
  });

  document.addEventListener('mouseup', () => {
    dragging = false;
  });

  document.addEventListener('mousemove', (event) => {
    if (!dragging) {
      return;
    }

    terminalApp.style.left = `${event.clientX - dragOffsetX}px`;
    terminalApp.style.top = `${event.clientY - dragOffsetY}px`;
  });

  document.addEventListener('keydown', (event) => {
    const activeInput = document.getElementById('active-input');
    if (!activeInput) {
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const value = activeInput.textContent.trim();
      activeInput.removeAttribute('id');

      history.push(value);
      historyIndex = history.length;
      handleCommand(value);
      return;
    }

    if (event.key === 'ArrowUp' && history.length && historyIndex > 0) {
      historyIndex -= 1;
      activeInput.textContent = history[historyIndex];
      focusPrompt();
      return;
    }

    if (event.key === 'ArrowDown') {
      if (historyIndex < history.length - 1) {
        historyIndex += 1;
        activeInput.textContent = history[historyIndex];
      } else {
        activeInput.textContent = '';
        historyIndex = history.length;
      }
      focusPrompt();
    }
  });

  window.addEventListener('load', boot);
})();