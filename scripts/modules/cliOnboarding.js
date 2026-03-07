(() => {
  const typingSpeed = 25;
  const highlightDuration = 5000;
  const tourSequence = ['intro', 'skills', 'tools', 'projects', 'support', 'contact', 'resume'];

  const USER_PROMPT = 'visitor@portfolio:~$ ';
  const GUIDE_PROMPT = 'guide@portfolio:~$ ';
  const PROMPT_SPACER = `${' '.repeat(Math.max(0, GUIDE_PROMPT.length - 2))}↳ `;
  const ASCII_DIR = 'assets/ascii';

  let cliAPI = null;
  let isGuideOpen = false;
  let messageQueue = [];
  let isTyping = false;
  let activeTimeouts = [];
  let currentHighlight = null;
  let highlightTimeout = null;
  let tourIndex = -1;
  let commandHistory = [];
  let historyIndex = -1;
  let historyDraft = '';
  let plasmaIntervalId = null;
  let plasmaTimeoutId = null;
  const plasmaNotes = [
    'cool is it not?',
    'i wanna win',
    'lets build something cool',
    "i'm here for the love of the game",
    'I love building stuff like this cuz for once in my life I feel like what I want to happen happens',
  ];

  const pickRandomPlasmaNote = () => {
    const index = Math.floor(Math.random() * plasmaNotes.length);
    return plasmaNotes[index];
  };

  const sectionDefinitions = {
    intro: {
      selector: '#intro-card',
      message: 'highlight intro-card :: personal summary locked in.',
    },
    skills: {
      selector: '#languages-card',
      message: 'highlight languages-card :: core languages illuminated.',
    },
    tools: {
      selector: '#tools-card',
      message: 'highlight tools-card :: daily toolchain in focus.',
    },
    support: {
      selector: '#support-section',
      message: 'highlight support-section :: collaboration options expanded.',
    },
    contact: {
      selector: '#top-banner',
      message: 'highlight top-banner :: contact channels pinged.',
    },
  };

  const commandAliases = {
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
    portfolio: 'open',
    launch: 'open',
    quit: 'exit',
    close: 'exit',
    flowera: 'flower a',
    flowerb: 'flower b',
  };

  const revealPortfolio = () => {
    document.body.classList.add('app-ready');
    document.body.classList.remove('boot-cli-only');
  };

  const schedule = (fn, delay) => {
    const timeout = window.setTimeout(() => {
      activeTimeouts = activeTimeouts.filter((id) => id !== timeout);
      fn();
    }, delay);

    activeTimeouts.push(timeout);
    return timeout;
  };

  const clearScheduledTasks = () => {
    activeTimeouts.forEach((id) => window.clearTimeout(id));
    activeTimeouts = [];
  };

  const stopPlasma = () => {
    if (plasmaIntervalId) {
      window.clearInterval(plasmaIntervalId);
      plasmaIntervalId = null;
    }
    if (plasmaTimeoutId) {
      window.clearTimeout(plasmaTimeoutId);
      plasmaTimeoutId = null;
    }
  };

  const clearHighlight = () => {
    if (highlightTimeout) {
      window.clearTimeout(highlightTimeout);
      highlightTimeout = null;
    }

    if (currentHighlight) {
      currentHighlight.classList.remove('cli-highlight');
      currentHighlight = null;
    }
  };

  const highlightElement = (element) => {
    if (!element) {
      return false;
    }

    clearHighlight();

    element.classList.add('cli-highlight');
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    currentHighlight = element;

    highlightTimeout = schedule(() => {
      if (currentHighlight) {
        currentHighlight.classList.remove('cli-highlight');
        currentHighlight = null;
      }
    }, highlightDuration);

    return true;
  };

  const createPromptLine = (promptText, extraClasses = []) => {
    if (!cliAPI) {
      return null;
    }

    const line = document.createElement('div');
    line.classList.add('cli-line');

    const classes = Array.isArray(extraClasses) ? extraClasses : [extraClasses];
    classes.filter(Boolean).forEach((cls) => line.classList.add(cls));

    if (typeof promptText === 'string') {
      const promptSpan = document.createElement('span');
      promptSpan.classList.add('cli-prompt-label');
      promptSpan.textContent = promptText;
      line.appendChild(promptSpan);
    }

    const textSpan = document.createElement('span');
    textSpan.classList.add('cli-text');
    line.appendChild(textSpan);

    cliAPI.elements.content.appendChild(line);
    cliAPI.scrollToBottom();

    return { line, textSpan };
  };

  const appendUserLine = (value) => {
    if (!cliAPI) {
      return;
    }

    const promptLine = createPromptLine(USER_PROMPT, 'cli-line--input');
    if (promptLine) {
      promptLine.textSpan.textContent = value;
      cliAPI.scrollToBottom();
    }
  };

  const enqueueMessage = (text, options = {}) => {
    messageQueue.push({ text, options });
    if (!isTyping) {
      processQueue();
    }
  };

  const processQueue = () => {
    if (!messageQueue.length) {
      isTyping = false;
      return;
    }

    isTyping = true;
    const { text, options } = messageQueue.shift();
    typeMessage(text, options, () => {
      isTyping = false;
      processQueue();
    });
  };

  const typeMessage = (text, { prefix = '', speed = typingSpeed, className, prompt } = {}, done) => {
    if (!cliAPI) {
      return;
    }

    const promptText = prompt === null ? null : (typeof prompt === 'string' ? prompt : GUIDE_PROMPT);
    const classes = ['cli-line--output'];

    if (Array.isArray(className)) {
      className.filter(Boolean).forEach((cls) => classes.push(cls));
    } else if (typeof className === 'string' && className.trim()) {
      classes.push(className);
    }

    const promptLine = createPromptLine(promptText, classes);
    if (!promptLine) {
      return;
    }

    const span = promptLine.textSpan;
    span.classList.add('typing-cursor');

    const fullText = `${prefix || ''}${text}`;
    let index = 0;

    const typeChar = () => {
      if (index < fullText.length) {
        span.textContent += fullText.charAt(index);
        index += 1;
        cliAPI.scrollToBottom();
        schedule(typeChar, speed);
      } else {
        span.classList.remove('typing-cursor');
        cliAPI.scrollToBottom();
        if (typeof done === 'function') {
          done();
        }
      }
    };

    typeChar();
  };

  const renderAsciiFromFile = async (fileName) => {
    if (!cliAPI) {
      return;
    }

    stopPlasma();

    const win = cliAPI.elements.window;
    if (typeof cliAPI.show === 'function') {
      cliAPI.show();
    }
    if (typeof cliAPI.setMinimized === 'function') {
      cliAPI.setMinimized(false);
    }
    if (win) {
      win.classList.add('is-expanded');
    }

    cliAPI.clear();

    try {
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
        if (window.location.protocol === 'file:') {
          throw new Error('file protocol blocked fetch :: use a local server');
        }
        throw lastError || new Error('file not found');
      }

      if (!text.trim()) {
        enqueueMessage('ascii file is empty :: add content to the txt file.', { className: 'cli-line--hint' });
        return;
      }

      text.replace(/\r\n/g, '\n').split('\n').forEach((line) => {
        cliAPI.appendLine(line);
      });
    } catch (error) {
      enqueueMessage(`ascii load failed :: ${error.message}`, { className: 'cli-line--hint' });
      if (window.location.protocol === 'file:') {
        enqueueMessage('tip :: run a local server (e.g. `python -m http.server`) and open main-page.html from http://localhost', { className: 'cli-line--hint' });
      }
    }
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
      case 'diamond': {
        const manhattan = Math.abs(dx) + Math.abs(dy);
        return clamp01((Math.sin(manhattan * 0.35 - t) + 1) / 2);
      }
      case 'interference': {
        const d1 = Math.sqrt((dx + 8 * Math.cos(t * 0.7)) ** 2 + (dy + 6 * Math.sin(t * 0.7)) ** 2);
        const d2 = Math.sqrt((dx - 8 * Math.sin(t * 0.5)) ** 2 + (dy - 6 * Math.cos(t * 0.5)) ** 2);
        return clamp01((Math.sin(d1 * 0.45 - t) + Math.sin(d2 * 0.45 + t)) * 0.25 + 0.5);
      }
      case 'kaleidoscope': {
        const sym = Math.abs(Math.sin(angle * 4 + t * 0.3));
        return clamp01((Math.sin(r * 0.35 + sym * 6 + t) + 1) / 2);
      }
      case 'matrix': {
        const rain = Math.sin(y * 0.8 + t * 3) + Math.sin(x * 0.12 + t * 0.8);
        return clamp01(rain * 0.25 + 0.5);
      }
      case 'metaballs': {
        const p1 = 1 / (Math.sqrt((dx - 6 * Math.cos(t)) ** 2 + (dy - 5 * Math.sin(t)) ** 2) + 0.8);
        const p2 = 1 / (Math.sqrt((dx + 6 * Math.sin(t * 0.8)) ** 2 + (dy + 5 * Math.cos(t * 0.6)) ** 2) + 0.8);
        const p3 = 1 / (Math.sqrt((dx + 4 * Math.cos(t * 0.4)) ** 2 + (dy - 7 * Math.sin(t * 0.7)) ** 2) + 0.8);
        return clamp01((p1 + p2 + p3) * 0.55);
      }
      case 'moire': {
        const rings = Math.sin(r * 0.6 + t) + Math.sin(r * 0.63 - t * 1.1);
        return clamp01(rings * 0.25 + 0.5);
      }
      case 'pulse': {
        return clamp01((Math.sin(r * 0.6 - t * 2.4) + 1) / 2);
      }
      case 'ripple': {
        const ripple = Math.sin(r * 0.8 - t * 2.8) / (1 + r * 0.05);
        return clamp01(ripple * 0.5 + 0.5);
      }
      case 'spiral': {
        return clamp01((Math.sin(r * 0.3 + angle * 3 - t) + 1) / 2);
      }
      case 'tunnel': {
        const tunnel = Math.sin(r * 0.7 - t * 3.5 + angle * 2);
        return clamp01(tunnel * 0.5 + 0.5);
      }
      case 'vortex': {
        return clamp01((Math.sin(r * 0.45 + angle * 4 + t * 1.4) + 1) / 2);
      }
      case 'warp': {
        const warp = Math.sin((dx * dx + dy * dy) * 0.02 - t * 3);
        return clamp01(warp * 0.5 + 0.5);
      }
      case 'waves': {
        const waves = Math.sin(y * 0.5 + t * 2) + Math.sin((y + x * 0.2) * 0.25 + t);
        return clamp01(waves * 0.25 + 0.5);
      }
      case 'classic':
      default: {
        const val = Math.sin(x * 0.3 + t) + Math.sin(y * 0.3 - t) + Math.sin((x + y) * 0.2 + t * 0.7);
        return clamp01(val * 0.18 + 0.5);
      }
    }
  };

  const renderPlasmaFrame = (pattern, time, width, height, palette) => {
    const rows = [];
    for (let y = 0; y < height; y += 1) {
      let row = '';
      for (let x = 0; x < width; x += 1) {
        const value = computePlasmaValue(pattern, x, y, time, width, height);
        const index = Math.floor(value * (palette.length - 1));
        row += palette[index];
      }
      rows.push(row);
    }
    return rows.join('\n');
  };

  const showSection = (key) => {
    const definition = sectionDefinitions[key];
    if (!definition) {
      enqueueMessage('selector missing :: try scrolling manually.', { className: 'cli-line--hint' });
      return;
    }

    const element = document.querySelector(definition.selector);
    if (!element) {
      enqueueMessage('selector missing :: try scrolling manually.', { className: 'cli-line--hint' });
      return;
    }

    highlightElement(element);
    enqueueMessage(definition.message, { className: 'cli-line--system' });
  };

  const ensureProjectsPanelOpen = () => {
    const panel = document.getElementById('project-panel');
    if (!panel) {
      enqueueMessage('projects panel not detected :: use the Projects button manually.', { className: 'cli-line--hint' });
      return;
    }

    const isOpen = panel.style.width === '250px';

    if (!isOpen && typeof window.togglePanel === 'function') {
      window.togglePanel();
    }

    schedule(() => {
      highlightElement(panel);
      enqueueMessage('projects panel open :: browse repo links on the left rail.', { className: 'cli-line--system' });
    }, isOpen ? 0 : 350);
  };

  const showResumeInfo = () => {
    enqueueMessage('resume dispatch :: email kevinroymaglaqui29@gmail.com or hit the Hire Me card.', { className: 'cli-line--system' });
  };

  const exitGuide = () => {
    if (onboarding) {
      onboarding.close();
    }
  };

  const handleNext = () => {
    if (!tourSequence.length) {
      enqueueMessage('tour manifest empty :: nothing to iterate.', { className: 'cli-line--hint' });
      return;
    }

    tourIndex = (tourIndex + 1) % tourSequence.length;
    const nextKey = tourSequence[tourIndex];

    enqueueMessage(`tour step ${tourIndex + 1}/${tourSequence.length} :: ${nextKey}`, { className: 'cli-line--system' });

    const command = COMMANDS[nextKey];
    if (command && typeof command.handler === 'function') {
      command.handler({ fromTour: true });
    }
  };

  const COMMANDS = {
    help: {
      description: 'List available commands',
      handler: () => {
        enqueueMessage('help listing :: command → description', { className: 'cli-line--system' });
        Object.entries(COMMANDS)
          .filter(([, value]) => !value.hiddenInHelp)
          .forEach(([name, value]) => {
            const label = `${name}`.padEnd(10, ' ');
            enqueueMessage(`${label} - ${value.description || '—'}`, {
              prompt: PROMPT_SPACER,
              className: 'cli-line--hint',
              speed: 18,
            });
          });
      },
    },
    intro: {
      description: 'Highlight the introduction summary',
      handler: () => {
        tourIndex = tourSequence.indexOf('intro');
        showSection('intro');
      },
    },
    skills: {
      description: 'Show programming languages & primary skills',
      handler: () => {
        tourIndex = tourSequence.indexOf('skills');
        showSection('skills');
      },
    },
    tools: {
      description: 'Show tools and platforms I rely on',
      handler: () => {
        tourIndex = tourSequence.indexOf('tools');
        showSection('tools');
      },
    },
    support: {
      description: 'Show the support & hire-me section',
      handler: () => {
        tourIndex = tourSequence.indexOf('support');
        showSection('support');
      },
    },
    projects: {
      description: 'Open the projects navigation panel',
      handler: () => {
        tourIndex = tourSequence.indexOf('projects');
        ensureProjectsPanelOpen();
      },
    },
    contact: {
      description: 'Highlight how to reach me',
      handler: () => {
        tourIndex = tourSequence.indexOf('contact');
        showSection('contact');
      },
    },
    resume: {
      description: 'Get info on how to request my resume',
      handler: () => {
        tourIndex = tourSequence.indexOf('resume');
        showResumeInfo();
      },
    },
    next: {
      description: 'Advance to the next guided stop',
      handler: () => handleNext(),
    },
    exit: {
      description: 'Close this guide',
      handler: () => exitGuide(),
    },
    color: {
      description: 'Change accent color; prefix with `site`/`global`/`all` to tint whole page, or `cli`/`term` for just the terminal (a=cyan,b=green,c=red,1=blue,2=magenta,3=yellow)',
      handler: ({ args }) => {
        const map = {
          a: '#0ff', b: '#0f0', c: '#f00', d: '#b0b0b0',
          '1': '#00f', '2': '#f0f', '3': '#ff0',
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
        if (color) {
          if (target === 'root' || target === 'both') {
            document.documentElement.style.setProperty('--primary-color', color);
          }
          if (target === 'cli' || target === 'both') {
            const win = document.getElementById('cli-window');
            if (win) {
              win.style.setProperty('--cli-primary', color);
            }
          }
          let msg = `color set to ${code}`;
          if (target === 'both') {
            msg += ' (global+terminal)';
          }
          enqueueMessage(msg, { className: 'cli-line--system' });
        } else {
          enqueueMessage('invalid color code; try a b c 1 2 3', { className: 'cli-line--hint' });
        }
      },
    },
    pdf: {
      description: 'Download resume PDF',
      handler: () => {
        enqueueMessage('downloading resume...', { className: 'cli-line--system' });
        const a = document.createElement('a');
        a.href = 'assets/Kevin%20Maglaqui%20Resume.pdf';
        a.download = 'KevinRoyMaglaqui_Resume.pdf';
        a.click();
        enqueueMessage('resume opened in new tab', { className: 'cli-line--system' });
      },
    },
    clr: {
      description: 'Clear terminal output',
      handler: () => {
        stopPlasma();
        if (cliAPI) {
          cliAPI.clear();
          cliAPI.focusInput();
        }
      },
    },
    skull: {
      description: 'Draw a skull ASCII picture',
      handler: async () => {
        await renderAsciiFromFile('skull.txt');
      },
    },
    "flower a": {
      description: 'Draw a blossoming flower (A)',
      handler: async () => {
        await renderAsciiFromFile('flower-a.txt');
      },
    },
    "flower b": {
      description: 'Draw a blossoming flower (B)',
      handler: async () => {
        await renderAsciiFromFile('flower-b.txt');
      },
    },
    shape: {
      description: 'Draw a geometric shape',
      handler: async () => {
        await renderAsciiFromFile('shape.txt');
      },
    },
    impossible: {
      description: 'Draw an impossible figure',
      handler: async () => {
        await renderAsciiFromFile('impossible.txt');
      },
    },
    neofetch: {
      description: 'Show faux system info (neofetch style)',
      handler: async () => {
        await renderAsciiFromFile('neofetch.txt');
      },
    },
    plasma: {
      description: 'Play a heavy ascii plasma animation (requires confirm)',
      handler: ({ args }) => {
        stopPlasma();
        clearScheduledTasks();
        messageQueue = [];
        isTyping = false;
        const win = cliAPI.elements.window;
        const palette = ' .,:;irsXA253hMHGS#9B&@';
        const argList = args.map((arg) => arg.toLowerCase());
        const wantsHelp = argList.some((arg) => ['-h', '--help', '-help', 'help'].includes(arg));

        if (wantsHelp) {
          const patterns = [
            'checkerboard', 'classic', 'diamond', 'interference', 'kaleidoscope',
            'matrix', 'metaballs', 'moire', 'pulse', 'ripple',
            'spiral', 'tunnel', 'vortex', 'warp', 'waves',
          ];

          enqueueMessage('plasma format :: plasma -a <style> --yes', { className: 'cli-line--system' });
          enqueueMessage('==============================', { prompt: null, className: 'cli-line--system' });
          enqueueMessage('arg           | Desc', { prompt: null, className: 'cli-line--system' });
          enqueueMessage('==============================', { prompt: null, className: 'cli-line--system' });
          patterns.forEach((name) => {
            const label = name.padEnd(13, ' ');
            enqueueMessage(`${label} | animation ${name}`, { prompt: null, className: 'cli-line--hint' });
          });
          enqueueMessage('==============================', { prompt: null, className: 'cli-line--system' });
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
          enqueueMessage(
            `plasma command is heavy :: run "plasma -a ${patternName} --yes" to proceed`,
            { className: 'cli-line--hint' }
          );
          return;
        }

        if (typeof cliAPI.show === 'function') {
          cliAPI.show();
        }
        if (typeof cliAPI.setMinimized === 'function') {
          cliAPI.setMinimized(false);
        }
        if (win) {
          win.classList.add('is-expanded');
        }

        const contentEl = cliAPI.elements.content;
        contentEl.innerHTML = '';

        const plasmaFrameEl = document.createElement('pre');
        plasmaFrameEl.className = 'cli-plasma-frame';
        contentEl.appendChild(plasmaFrameEl);

        const notesEl = document.createElement('pre');
        notesEl.className = 'cli-plasma-notes';
        notesEl.textContent = `\n${pickRandomPlasmaNote()}`;
        contentEl.appendChild(notesEl);

        const computed = window.getComputedStyle(contentEl);
        const fontSizeRaw = Number.parseFloat(computed.fontSize || '14');
        const fontSize = Number.isFinite(fontSizeRaw) ? fontSizeRaw : 14;
        const lineHeightRaw = Number.parseFloat(computed.lineHeight || '');
        const lineHeight = Number.isFinite(lineHeightRaw) ? lineHeightRaw : (fontSize * 1.35);
        const charWidth = fontSize * 0.62;
        plasmaFrameEl.textContent = `loading plasma :: ${pattern}...`;

        const start = performance.now();
        const drawFrame = () => {
          const width = Math.min(130, Math.max(40, Math.floor(contentEl.clientWidth / charWidth) - 2));
          const height = Math.min(42, Math.max(16, Math.floor((contentEl.clientHeight * 0.66) / lineHeight)));
          const time = (performance.now() - start) / 550;
          const frame = renderPlasmaFrame(pattern, time, width, height, palette);
          plasmaFrameEl.textContent = frame;
        };

        drawFrame();
        plasmaIntervalId = window.setInterval(drawFrame, 80);
      },
    },
    open: {
      description: 'Open the main portfolio view',
      handler: () => {
        revealPortfolio();
        enqueueMessage('portfolio shell ready :: rendering interface.', { className: 'cli-line--system' });
        schedule(() => exitGuide(), 250);
      },
    },
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

  const handleCommand = (rawValue) => {
    const trimmed = rawValue.trim();
    if (!trimmed) {
      return;
    }

    const parts = trimmed.split(/\s+/);
    let commandKey = null;
    let commandPartsLength = 0;

    // Resolve the longest matching command key first to support multi-word commands.
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
      enqueueMessage(`command not found: '${trimmed}'. try 'help'.`, { className: 'cli-line--hint' });
      return;
    }

    const command = COMMANDS[commandKey];
    if (command && typeof command.handler === 'function') {
      command.handler({ raw: trimmed, args: parts.slice(commandPartsLength) });
    }
  };

  const attachInputListener = () => {
    if (!cliAPI) {
      return;
    }

    const { input } = cliAPI.elements;

    input.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
        if (plasmaIntervalId) {
          event.preventDefault();
          stopPlasma();
          enqueueMessage('^C plasma interrupted', { className: 'cli-line--system' });
          input.value = '';
          return;
        }
      }

      if (event.key === 'Enter') {
        const value = input.value;
        input.value = '';

        if (!value.trim()) {
          return;
        }

        commandHistory.push(value);
        historyIndex = commandHistory.length;
        historyDraft = '';

        appendUserLine(value);
        handleCommand(value);
      } else if (event.key === 'ArrowUp') {
        if (!commandHistory.length) {
          return;
        }

        event.preventDefault();

        if (historyIndex === commandHistory.length) {
          historyDraft = input.value;
        }

        historyIndex = Math.max(0, historyIndex - 1);
        input.value = commandHistory[historyIndex] || '';
      } else if (event.key === 'ArrowDown') {
        if (!commandHistory.length) {
          return;
        }

        event.preventDefault();
        historyIndex = Math.min(commandHistory.length, historyIndex + 1);

        if (historyIndex === commandHistory.length) {
          input.value = historyDraft;
        } else {
          input.value = commandHistory[historyIndex] || '';
        }
      } else if (event.key === 'Escape') {
        exitGuide();
      }
    });
  };

  const attachGlobalShortcuts = () => {
    document.addEventListener('keydown', (event) => {
      if (event.key === '/' && event.metaKey) {
        event.preventDefault();
        if (window.cliOnboarding) {
          window.cliOnboarding.open();
        }
      }
    });
  };

  const initialize = () => {
    cliAPI = window.cliWindowAPI || null;

    if (!cliAPI) {
      console.warn('[CLI] Onboarding cannot start because cliWindowAPI is missing.');
      revealPortfolio();
      return;
    }

    attachInputListener();
    attachGlobalShortcuts();

    onboarding = {
      open: () => {
        if (isGuideOpen) {
          cliAPI.focusInput();
          return;
        }

        isGuideOpen = true;
        tourIndex = -1;
        messageQueue = [];
        isTyping = false;
        clearScheduledTasks();
        clearHighlight();

        cliAPI.show();
        cliAPI.clear();
        cliAPI.focusInput();

        enqueueMessage('guide daemon online :: session initialized.', { className: 'cli-line--system' });
        enqueueMessage("input ready :: try 'open' to launch portfolio or 'help' for commands.", {
          className: 'cli-line--hint',
        });
      },
      close: () => {
        if (!isGuideOpen) {
          return;
        }

        isGuideOpen = false;
        clearScheduledTasks();
        clearHighlight();
        messageQueue = [];
        isTyping = false;

        cliAPI.hide();
        cliAPI.clear();
      },
      onCloseFromButton: () => {
        onboarding.close();
      },
    };

    window.cliOnboarding = onboarding;
  };

  let onboarding = null;

  document.addEventListener('DOMContentLoaded', () => {
    initialize();

    window.setTimeout(() => {
      if (window.cliOnboarding && typeof window.cliOnboarding.open === 'function') {
        window.cliOnboarding.open();
      }
    }, 120);

    window.setTimeout(() => {
      const wrapper = document.getElementById('page-wrapper');
      if (!wrapper) {
        return;
      }

      const computed = window.getComputedStyle(wrapper);
      if (computed.visibility === 'hidden' || Number.parseFloat(computed.opacity || '1') === 0) {
        revealPortfolio();
      }
    }, 1800);
  });
})();
