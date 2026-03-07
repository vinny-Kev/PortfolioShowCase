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

  const ASCII_DIR = 'assets/ascii';
  const PROMPT = 'kevinOS$ ';
  const TOUR_SEQUENCE = ['intro', 'skills', 'tools', 'projects', 'support', 'contact', 'resume'];
  const plasmaNotes = [
    'cool is it not?',
    'i wanna win',
    'lets build something cool',
    "i'm here for the love of the game",
    'I love building stuff like this cuz for once in my life I feel like what I want to happen happens',
  ];

  const sectionTargets = {
    intro: 'intro-card',
    skills: 'languages-card',
    tools: 'tools-card',
    projects: 'project-panel',
    support: 'support-section',
    contact: 'top-banner',
    resume: 'support-section',
  };

  const commandAliases = {
    portfolio: 'open',
    launch: 'open',
    quit: 'exit',
    close: 'exit',
    flowera: 'flower a',
    flowerb: 'flower b',
    start: 'intro',
    summary: 'intro',
    language: 'skills',
    languages: 'skills',
    tech: 'tools',
    tool: 'tools',
    hire: 'support',
    supportme: 'support',
    connections: 'contact',
    socials: 'contact',
    project: 'projects',
  };

  let history = [];
  let historyIndex = -1;
  let historyDraft = '';
  let dragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let tourIndex = -1;
  let plasmaIntervalId = null;

  const escapeHtml = (value) => value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

  const printLine = (text = '') => {
    output.innerHTML += `${escapeHtml(text)}\n`;
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
    output.innerHTML += `<span class="prompt">${PROMPT}</span><span id="active-input" class="active-input" contenteditable="true">${escapeHtml(defaultText)}</span>`;
    focusPrompt();
  };

  const stopPlasma = () => {
    if (plasmaIntervalId) {
      window.clearInterval(plasmaIntervalId);
      plasmaIntervalId = null;
    }
  };

  const pickRandomPlasmaNote = () => plasmaNotes[Math.floor(Math.random() * plasmaNotes.length)];

  const openMainPage = (anchor) => {
    const hash = anchor ? `#${anchor}` : '';
    window.location.href = `main-page.html${hash}`;
  };

  const setPromptText = (value) => {
    const activeInput = document.getElementById('active-input');
    if (!activeInput) {
      return;
    }

    activeInput.textContent = value;
    focusPrompt();
  };

  const boot = () => {
    stopPlasma();
    output.innerHTML = '';
    printLine('Welcome to KevinOS');
    printLine('Type "help" to see all available commands.');
    newPrompt();
  };

  const resetTerminal = () => {
    history = [];
    historyIndex = -1;
    historyDraft = '';
    tourIndex = -1;
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

  const showHelp = () => {
    printLine('Available commands:');
    Object.entries(COMMANDS).forEach(([name, cmd]) => {
      if (cmd.hiddenInHelp) {
        return;
      }
      printLine(`  ${name.padEnd(12, ' ')} -> ${cmd.description}`);
    });
  };

  const resolveCommandKey = (input) => {
    if (COMMANDS[input]) {
      return input;
    }

    if (commandAliases[input]) {
      return commandAliases[input];
    }

    return null;
  };

  const renderAsciiFromFile = async (fileName) => {
    stopPlasma();
    output.innerHTML = '';

    const urls = [
      `${ASCII_DIR}/${fileName}`,
      `./${ASCII_DIR}/${fileName}`,
      `/assets/ascii/${fileName}`,
    ];

    let text = '';
    let lastError = null;

    for (const url of urls) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`status ${response.status}`);
        }
        text = await response.text();
        if (text) {
          break;
        }
      } catch (error) {
        lastError = error;
      }
    }

    if (!text) {
      printLine(`ascii load failed :: ${lastError ? lastError.message : 'file not found'}`);
      newPrompt();
      return;
    }

    text.replace(/\r\n/g, '\n').split('\n').forEach((line) => printLine(line));
    newPrompt();
  };

  const clamp01 = (value) => Math.max(0, Math.min(1, value));

  const resolvePlasmaPattern = (rawName) => {
    if (!rawName) {
      return 'classic';
    }

    const normalized = rawName.toLowerCase();
    const map = {
      checkerboard: 'checkerboard',
      classic: 'classic',
      diamond: 'diamond',
      interference: 'interference',
      kaleidoscope: 'kaleidoscope',
      matrix: 'matrix',
      metaballs: 'metaballs',
      moire: 'moire',
      pulse: 'pulse',
      ripple: 'ripple',
      spiral: 'spiral',
      tunnel: 'tunnel',
      vortex: 'vortex',
      warp: 'warp',
      waves: 'waves',
    };

    return map[normalized] || 'classic';
  };

  const computePlasmaValue = (pattern, x, y, t, width, height) => {
    const cx = width / 2;
    const cy = height / 2;
    const dx = x - cx;
    const dy = y - cy;
    const r = Math.sqrt(dx * dx + dy * dy) + 0.001;
    const angle = Math.atan2(dy, dx);

    switch (pattern) {
      case 'checkerboard': {
        const waves = Math.sin(x * 0.4 + t) + Math.sin(y * 0.4 - t);
        const checker = (Math.floor(x / 2) + Math.floor(y / 2)) % 2 === 0 ? 1 : -1;
        return clamp01((waves * 0.35 + checker * 0.35) + 0.5);
      }
      case 'diamond':
        return clamp01((Math.sin((Math.abs(dx) + Math.abs(dy)) * 0.35 - t) + 1) / 2);
      case 'interference': {
        const d1 = Math.sqrt((dx + 8 * Math.cos(t * 0.7)) ** 2 + (dy + 6 * Math.sin(t * 0.7)) ** 2);
        const d2 = Math.sqrt((dx - 8 * Math.sin(t * 0.5)) ** 2 + (dy - 6 * Math.cos(t * 0.5)) ** 2);
        return clamp01((Math.sin(d1 * 0.45 - t) + Math.sin(d2 * 0.45 + t)) * 0.25 + 0.5);
      }
      case 'kaleidoscope':
        return clamp01((Math.sin(r * 0.35 + Math.abs(Math.sin(angle * 4 + t * 0.3)) * 6 + t) + 1) / 2);
      case 'matrix':
        return clamp01((Math.sin(y * 0.8 + t * 3) + Math.sin(x * 0.12 + t * 0.8)) * 0.25 + 0.5);
      case 'metaballs': {
        const p1 = 1 / (Math.sqrt((dx - 6 * Math.cos(t)) ** 2 + (dy - 5 * Math.sin(t)) ** 2) + 0.8);
        const p2 = 1 / (Math.sqrt((dx + 6 * Math.sin(t * 0.8)) ** 2 + (dy + 5 * Math.cos(t * 0.6)) ** 2) + 0.8);
        const p3 = 1 / (Math.sqrt((dx + 4 * Math.cos(t * 0.4)) ** 2 + (dy - 7 * Math.sin(t * 0.7)) ** 2) + 0.8);
        return clamp01((p1 + p2 + p3) * 0.55);
      }
      case 'moire':
        return clamp01((Math.sin(r * 0.6 + t) + Math.sin(r * 0.63 - t * 1.1)) * 0.25 + 0.5);
      case 'pulse':
        return clamp01((Math.sin(r * 0.6 - t * 2.4) + 1) / 2);
      case 'ripple':
        return clamp01((Math.sin(r * 0.8 - t * 2.8) / (1 + r * 0.05)) * 0.5 + 0.5);
      case 'spiral':
        return clamp01((Math.sin(r * 0.3 + angle * 3 - t) + 1) / 2);
      case 'tunnel':
        return clamp01((Math.sin(r * 0.7 - t * 3.5 + angle * 2) + 1) / 2);
      case 'vortex':
        return clamp01((Math.sin(r * 0.45 + angle * 4 + t * 1.4) + 1) / 2);
      case 'warp':
        return clamp01((Math.sin((dx * dx + dy * dy) * 0.02 - t * 3) + 1) / 2);
      case 'waves':
        return clamp01((Math.sin(y * 0.5 + t * 2) + Math.sin((y + x * 0.2) * 0.25 + t)) * 0.25 + 0.5);
      case 'classic':
      default:
        return clamp01((Math.sin(x * 0.3 + t) + Math.sin(y * 0.3 - t) + Math.sin((x + y) * 0.2 + t * 0.7)) * 0.18 + 0.5);
    }
  };

  const renderPlasmaFrame = (pattern, time, width, height, palette) => {
    const rows = [];
    for (let y = 0; y < height; y += 1) {
      let row = '';
      for (let x = 0; x < width; x += 1) {
        const value = computePlasmaValue(pattern, x, y, time, width, height);
        row += palette[Math.floor(value * (palette.length - 1))];
      }
      rows.push(row);
    }
    return rows.join('\n');
  };

  const startPlasma = (pattern) => {
    stopPlasma();
    output.innerHTML = '<span id="plasma-frame"></span><span id="plasma-note"></span>';

    const frameEl = document.getElementById('plasma-frame');
    const noteEl = document.getElementById('plasma-note');
    if (!frameEl || !noteEl) {
      return;
    }

    noteEl.textContent = `\n\n${pickRandomPlasmaNote()}`;

    const palette = ' .,:;irsXA253hMHGS#9B&@';
    const style = window.getComputedStyle(output);
    const fontSizeRaw = Number.parseFloat(style.fontSize || '15');
    const fontSize = Number.isFinite(fontSizeRaw) ? fontSizeRaw : 15;
    const lineHeightRaw = Number.parseFloat(style.lineHeight || '');
    const lineHeight = Number.isFinite(lineHeightRaw) ? lineHeightRaw : (fontSize * 1.35);
    const charWidth = fontSize * 0.62;

    const start = performance.now();
    plasmaIntervalId = window.setInterval(() => {
      const width = Math.max(30, Math.floor(output.clientWidth / charWidth) - 2);
      const height = Math.max(12, Math.floor((output.clientHeight * 0.66) / lineHeight));
      const time = (performance.now() - start) / 550;
      frameEl.textContent = renderPlasmaFrame(pattern, time, width, height, palette);
    }, 80);
  };

  const COMMANDS = {
    help: {
      description: 'List available commands',
      handler: () => {
        showHelp();
      },
    },
    'kevin --help': {
      description: 'Alias to help',
      hiddenInHelp: true,
      handler: () => showHelp(),
    },
    open: {
      description: 'Open the main portfolio view',
      handler: () => openMainPage(),
    },
    'kevin --about': {
      description: 'Open portfolio permission modal',
      hiddenInHelp: true,
      handler: () => {
        modal.classList.remove('hidden');
      },
    },
    intro: {
      description: 'Open intro section in main portfolio',
      handler: () => openMainPage(sectionTargets.intro),
    },
    skills: {
      description: 'Open skills section in main portfolio',
      handler: () => openMainPage(sectionTargets.skills),
    },
    tools: {
      description: 'Open tools section in main portfolio',
      handler: () => openMainPage(sectionTargets.tools),
    },
    projects: {
      description: 'Open projects panel in main portfolio',
      handler: () => openMainPage(sectionTargets.projects),
    },
    support: {
      description: 'Open support section in main portfolio',
      handler: () => openMainPage(sectionTargets.support),
    },
    contact: {
      description: 'Open contact section in main portfolio',
      handler: () => openMainPage(sectionTargets.contact),
    },
    resume: {
      description: 'Open resume/contact area in main portfolio',
      handler: () => openMainPage(sectionTargets.resume),
    },
    next: {
      description: 'Cycle through guided portfolio sections',
      handler: () => {
        tourIndex = (tourIndex + 1) % TOUR_SEQUENCE.length;
        const nextKey = TOUR_SEQUENCE[tourIndex];
        printLine(`tour step ${tourIndex + 1}/${TOUR_SEQUENCE.length} :: ${nextKey}`);
        COMMANDS[nextKey].handler();
      },
    },
    exit: {
      description: 'Minimize terminal window',
      handler: () => {
        minimizeTerminal();
      },
    },
    color: {
      description: 'Change accent color (a,b,c,d,1,2,3) with optional target site/cli/all',
      handler: ({ args }) => {
        const map = {
          a: '#0ff',
          b: '#0f0',
          c: '#f00',
          d: '#b0b0b0',
          '1': '#00f',
          '2': '#f0f',
          '3': '#ff0',
        };

        let target = 'both';
        let codeArgIndex = 0;
        const first = args[0] ? args[0].toLowerCase() : '';

        if (['site', 'global', 'page', 'all'].includes(first)) {
          target = 'root';
          codeArgIndex = 1;
        } else if (['cli', 'term', 'terminal'].includes(first)) {
          target = 'cli';
          codeArgIndex = 1;
        }

        const code = args[codeArgIndex] ? args[codeArgIndex].toLowerCase() : '';
        const color = map[code] || null;
        if (!color) {
          printLine('invalid color code; try a b c d 1 2 3');
          return;
        }

        if (target === 'root' || target === 'both') {
          document.documentElement.style.setProperty('--primary-color', color);
          document.documentElement.style.setProperty('--terminal-border', color);
        }
        if (target === 'cli' || target === 'both') {
          terminalApp.style.borderColor = color;
        }

        let msg = `color set to ${code}`;
        if (target === 'both') {
          msg += ' (global+terminal)';
        }
        printLine(msg);
      },
    },
    pdf: {
      description: 'Download resume PDF',
      handler: () => {
        const a = document.createElement('a');
        a.href = 'assets/Kevin%20Maglaqui%20Resume.pdf';
        a.download = 'KevinRoyMaglaqui_Resume.pdf';
        a.click();
        printLine('resume opened in new tab');
      },
    },
    clr: {
      description: 'Clear terminal output',
      handler: () => {
        stopPlasma();
        output.innerHTML = '';
      },
    },
    skull: {
      description: 'Draw a skull ASCII picture',
      handler: async () => renderAsciiFromFile('skull.txt'),
      noPrompt: true,
    },
    'flower a': {
      description: 'Draw flower ASCII (A)',
      handler: async () => renderAsciiFromFile('flower-a.txt'),
      noPrompt: true,
    },
    'flower b': {
      description: 'Draw flower ASCII (B)',
      handler: async () => renderAsciiFromFile('flower-b.txt'),
      noPrompt: true,
    },
    shape: {
      description: 'Draw geometric shape ASCII',
      handler: async () => renderAsciiFromFile('shape.txt'),
      noPrompt: true,
    },
    impossible: {
      description: 'Draw impossible figure ASCII',
      handler: async () => renderAsciiFromFile('impossible.txt'),
      noPrompt: true,
    },
    neofetch: {
      description: 'Show neofetch ASCII details',
      handler: async () => renderAsciiFromFile('neofetch.txt'),
      noPrompt: true,
    },
    plasma: {
      description: 'Run plasma animation (use -help and --yes)',
      handler: ({ args }) => {
        const argList = args.map((arg) => arg.toLowerCase());
        const wantsHelp = argList.some((arg) => ['-h', '--help', '-help', 'help'].includes(arg));

        if (wantsHelp) {
          const patterns = [
            'checkerboard', 'classic', 'diamond', 'interference', 'kaleidoscope',
            'matrix', 'metaballs', 'moire', 'pulse', 'ripple',
            'spiral', 'tunnel', 'vortex', 'warp', 'waves',
          ];
          printLine('plasma format :: plasma -a <style> --yes');
          printLine('==============================');
          printLine('arg           | Desc');
          printLine('==============================');
          patterns.forEach((name) => printLine(`${name.padEnd(13, ' ')} | animation ${name}`));
          printLine('==============================');
          return;
        }

        const yes = argList.some((arg) => ['y', 'yes', '--yes', '-y', 'go', 'confirm'].includes(arg));
        let patternName = 'classic';
        const artIndex = argList.findIndex((arg) => arg === '-a' || arg === '--art');
        if (artIndex >= 0 && args[artIndex + 1]) {
          patternName = args[artIndex + 1];
        } else if (args[0] && !args[0].startsWith('-') && !['yes', 'y', 'go', 'confirm'].includes(argList[0])) {
          patternName = args[0];
        }

        const pattern = resolvePlasmaPattern(patternName);
        if (!yes) {
          printLine(`plasma command is heavy :: run \"plasma -a ${patternName} --yes\" to proceed`);
          return;
        }

        startPlasma(pattern);
      },
    },
  };

  const runCommand = async (rawValue) => {
    const trimmed = rawValue.trim();
    if (!trimmed) {
      return;
    }

    const parts = trimmed.split(/\s+/);
    let commandKey = null;
    let commandPartsLength = 0;

    for (let i = parts.length; i >= 1; i -= 1) {
      const candidate = parts.slice(0, i).join(' ').toLowerCase();
      const resolved = resolveCommandKey(candidate);
      if (resolved) {
        commandKey = resolved;
        commandPartsLength = i;
        break;
      }
    }

    if (!commandKey) {
      printLine(`'${trimmed}' is not recognized as an internal or external command.`);
      newPrompt();
      return;
    }

    const command = COMMANDS[commandKey];
    const result = command.handler({ raw: trimmed, args: parts.slice(commandPartsLength) });
    if (result instanceof Promise) {
      await result;
      return;
    }

    if (!command.noPrompt && commandKey !== 'exit' && commandKey !== 'open' && commandKey !== 'intro' && commandKey !== 'skills' && commandKey !== 'tools' && commandKey !== 'projects' && commandKey !== 'support' && commandKey !== 'contact' && commandKey !== 'resume' && commandKey !== 'next') {
      newPrompt();
    }
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
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c' && plasmaIntervalId) {
      event.preventDefault();
      stopPlasma();
      printLine('^C plasma interrupted');
      newPrompt();
      return;
    }

    const activeInput = document.getElementById('active-input');
    if (!activeInput) {
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const value = activeInput.textContent || '';
      activeInput.removeAttribute('id');
      output.innerHTML += '\n';

      if (!value.trim()) {
        newPrompt();
        return;
      }

      history.push(value.trim());
      historyIndex = history.length;
      historyDraft = '';
      runCommand(value.trim());
      return;
    }

    if (event.key === 'ArrowUp') {
      if (!history.length) {
        return;
      }
      event.preventDefault();

      if (historyIndex === history.length) {
        historyDraft = activeInput.textContent || '';
      }

      historyIndex = Math.max(0, historyIndex - 1);
      setPromptText(history[historyIndex] || '');
      return;
    }

    if (event.key === 'ArrowDown') {
      if (!history.length) {
        return;
      }
      event.preventDefault();

      historyIndex = Math.min(history.length, historyIndex + 1);
      if (historyIndex === history.length) {
        setPromptText(historyDraft);
      } else {
        setPromptText(history[historyIndex] || '');
      }
    }
  });

  window.addEventListener('load', boot);
})();
