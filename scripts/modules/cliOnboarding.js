(() => {
  const typingSpeed = 25;
  const highlightDuration = 5000;
  const tourSequence = ['intro', 'skills', 'tools', 'projects', 'support', 'contact', 'resume'];

  const USER_PROMPT = 'visitor@portfolio:~$ ';
  const GUIDE_PROMPT = 'guide@portfolio:~$ ';
  const PROMPT_SPACER = `${' '.repeat(Math.max(0, GUIDE_PROMPT.length - 2))}↳ `;

  let cliAPI = null;
  let launcher = null;
  let isGuideOpen = false;
  let messageQueue = [];
  let isTyping = false;
  let activeTimeouts = [];
  let currentHighlight = null;
  let highlightTimeout = null;
  let tourIndex = -1;

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
    quit: 'exit',
    close: 'exit',
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

    const normalized = trimmed.toLowerCase();
    const commandKey = resolveCommandKey(normalized);

    if (!commandKey) {
      enqueueMessage(`command not found: '${trimmed}'. try 'help'.`, { className: 'cli-line--hint' });
      return;
    }

    const command = COMMANDS[commandKey];
    if (command && typeof command.handler === 'function') {
      command.handler({});
    }
  };

  const attachInputListener = () => {
    if (!cliAPI) {
      return;
    }

    const { input } = cliAPI.elements;

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        const value = input.value;
        input.value = '';

        if (!value.trim()) {
          return;
        }

        appendUserLine(value);
        handleCommand(value);
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
    launcher = document.getElementById('cli-launcher');

    if (!cliAPI) {
      console.warn('[CLI] Onboarding cannot start because cliWindowAPI is missing.');
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

        if (launcher) {
          launcher.style.display = 'none';
        }

        enqueueMessage('guide daemon online :: session initialized.', { className: 'cli-line--system' });
        enqueueMessage("input ready :: try 'help', 'next', or 'exit'.", {
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

        if (launcher) {
          launcher.style.display = 'block';
        }
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
  });
})();
