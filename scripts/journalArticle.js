// Engineering journal: turns one Markdown article into a page. Vanilla JS, no build step.
// Needs vendor/marked/marked.umd.js and vendor/highlightjs/highlight.min.js loaded first.
//
// Writing conventions (the full list is in docs/journal.md):
//  - "## Attempt 01 — Name [failed]" starts an attempt. The optional trailing [tag] sets how it is shown:
//    failed, partial, revised, optimized, final, abandoned.
//  - Inside "## Beyond the Solution", "### Experiment 01 — Name [kept]" starts an experiment.
//    Tags: kept, rejected, inconclusive.
//  - Fenced code takes a language: ```c, ```sql, ```java ... and an optional file name: ```c title="solution.c".
//  - ```text (or console, terminal, output) is shown as terminal output, without highlighting.
// Nothing here writes content. It only renders what the Markdown file says.

(() => {
	const LANGUAGE_LABELS = {
		c: 'C', cpp: 'C++', java: 'Java', sql: 'SQL', bash: 'Shell', sh: 'Shell', shell: 'Shell', python: 'Python', py: 'Python',
		javascript: 'JavaScript', js: 'JavaScript', typescript: 'TypeScript', ts: 'TypeScript', json: 'JSON', rust: 'Rust', go: 'Go',
		kotlin: 'Kotlin', makefile: 'Makefile', diff: 'Diff', yaml: 'YAML', xml: 'XML', markdown: 'Markdown'
	};
	const TERMINAL_LANGUAGES = new Set(['text', 'txt', 'plain', 'plaintext', 'console', 'terminal', 'output', 'shell-session']);
	const KIND_LABELS = {
		failed: 'Did not work', partial: 'Partly worked', revised: 'Revised approach', optimized: 'Optimized', final: 'Final solution',
		abandoned: 'Abandoned', kept: 'Kept', rejected: 'Rejected', inconclusive: 'Inconclusive'
	};
	const ATTEMPT_HEADING = /^attempt\s*\d+/i;
	const EXPERIMENT_HEADING = /^experiment\s*\d+/i;
	const KIND_TAG = /\s*\[([a-z-]+)\]\s*$/i;
	const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

	const escapeHtml = (value) => String(value ?? '')
		.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

	const slugify = (text) => text.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';

	let configured = false;

	const configureMarked = () => {
		if (configured) return;
		configured = true;
		// Raw HTML in an article is shown as text, never run. Fenced code keeps its full info string
		// (language plus optional title="...") for the code-block builder below.
		window.marked.use({
			gfm: true,
			renderer: {
				html: (token) => escapeHtml(token.text ?? token.raw ?? ''),
				code: (token) => `<pre data-info="${escapeHtml(token.lang ?? '')}"><code>${escapeHtml(token.text)}</code></pre>`
			}
		});
	};

	const parseMarkdown = (markdown) => {
		const parse = window.marked?.parse ?? window.marked?.marked?.parse;

		if (typeof parse !== 'function') {
			throw new Error('The Markdown parser did not load.');
		}

		return parse(markdown);
	};

	// "c title="solution.c"" -> { language: 'c', title: 'solution.c' }
	const parseInfo = (info) => {
		const match = /^\s*([^\s]*)\s*(.*)$/.exec(info);
		const title = /title\s*=\s*"([^"]*)"/.exec(match[2]);
		return { language: (match[1] || '').toLowerCase(), title: title ? title[1] : '' };
	};

	const copyText = async (text) => {
		if (navigator.clipboard?.writeText) {
			await navigator.clipboard.writeText(text);
			return;
		}

		const area = document.createElement('textarea');
		area.value = text;
		area.setAttribute('readonly', '');
		area.style.cssText = 'position:fixed;top:-1000px;opacity:0';
		document.body.append(area);
		area.select();

		try {
			if (!document.execCommand('copy')) throw new Error('Copy command was refused.');
		} finally {
			area.remove();
		}
	};

	const buildCodeBlock = (pre) => {
		const code = pre.querySelector('code');
		const text = code.textContent;
		const { language, title } = parseInfo(pre.dataset.info ?? '');
		const terminal = TERMINAL_LANGUAGES.has(language);
		const canHighlight = !terminal && language && window.hljs?.getLanguage(language);
		const figure = document.createElement('figure');
		figure.className = `code-block${terminal ? ' code-block--terminal' : ''}`;

		const caption = document.createElement('figcaption');
		const label = document.createElement('span');
		label.className = 'code-block__lang';
		label.textContent = terminal ? 'Output' : (LANGUAGE_LABELS[language] ?? (language || 'Code'));
		caption.append(label);

		if (title) {
			const name = document.createElement('span');
			name.className = 'code-block__title';
			name.textContent = title;
			caption.append(name);
		}

		const copy = document.createElement('button');
		copy.type = 'button';
		copy.className = 'code-copy';
		copy.textContent = 'Copy';
		copy.setAttribute('aria-label', `Copy ${label.textContent} code`);
		caption.append(copy);

		const body = document.createElement('pre');
		const inner = document.createElement('code');

		if (canHighlight) {
			// highlight.js produces the token spans from the declared language. Nothing is coloured by hand.
			inner.innerHTML = window.hljs.highlight(text, { language, ignoreIllegals: true }).value;
			inner.className = `hljs language-${language}`;
		} else {
			inner.textContent = text;
		}

		body.tabIndex = 0;
		body.append(inner);
		figure.append(caption, body);
		figure.dataset.code = text;
		return figure;
	};

	const isSafeUrl = (value, { allowRelative = true } = {}) => {
		if (!value) return false;
		if (value.startsWith('#')) return allowRelative;

		try {
			const url = new URL(value, location.href);
			if (url.origin === location.origin && !/^[a-z][a-z0-9+.-]*:/i.test(value)) return allowRelative;
			return SAFE_PROTOCOLS.has(url.protocol);
		} catch {
			return false;
		}
	};

	const sanitize = (root) => {
		root.querySelectorAll('a[href]').forEach((link) => {
			const href = link.getAttribute('href');

			if (!isSafeUrl(href)) {
				link.removeAttribute('href');
				return;
			}

			if (/^https?:/i.test(href)) {
				link.target = '_blank';
				link.rel = 'noreferrer';
			}
		});

		root.querySelectorAll('img').forEach((image) => {
			const src = image.getAttribute('src');

			if (!isSafeUrl(src) || /^mailto:/i.test(src)) {
				image.replaceWith(document.createTextNode(image.alt ? `[image: ${image.alt}]` : '[image removed]'));
				return;
			}

			image.loading = 'lazy';
		});

		root.querySelectorAll('table').forEach((table) => {
			const wrap = document.createElement('div');
			wrap.className = 'table-wrap';
			table.replaceWith(wrap);
			wrap.append(table);
		});
	};

	// Reads and removes a trailing [tag] from a heading, returning the tag (lower case) or ''.
	const takeKind = (heading) => {
		const match = KIND_TAG.exec(heading.textContent);
		if (!match) return '';
		const last = heading.lastChild;

		if (last?.nodeType === Node.TEXT_NODE) {
			last.textContent = last.textContent.replace(KIND_TAG, '');
		}

		return match[1].toLowerCase();
	};

	const addKindLabel = (heading, kind) => {
		if (!kind) return;
		const label = document.createElement('span');
		label.className = `kind-label kind-label--${KIND_LABELS[kind] ? kind : 'other'}`;
		label.textContent = KIND_LABELS[kind] ?? kind;
		heading.append(' ', label);
	};

	const sectionKind = (title, tag) => {
		if (ATTEMPT_HEADING.test(title)) return 'attempt';
		if (/^final working solution/i.test(title) || tag === 'final') return 'final';
		if (/^beyond the solution/i.test(title)) return 'beyond';
		if (/^reflection/i.test(title)) return 'reflection';
		return 'plain';
	};

	// Wraps "### Experiment NN" blocks (inside a section) in their own container.
	const wrapExperiments = (section) => {
		section.querySelectorAll(':scope > h3').forEach((heading) => {
			if (!EXPERIMENT_HEADING.test(heading.textContent)) return;
			const tag = heading.dataset.kind ?? '';
			const block = document.createElement('div');
			block.className = `experiment${tag ? ` experiment--${tag}` : ''}`;
			heading.before(block);
			block.append(heading);

			while (block.nextSibling && !/^H[23]$/.test(block.nextSibling.nodeName)) {
				block.append(block.nextSibling);
			}
		});
	};

	// Headings get ids, the [tag] is read, and content is grouped into one <section> per "##".
	const structure = (root, title) => {
		const toc = [];
		const used = new Set();
		const firstHeading = root.firstElementChild;

		// The page already shows the title from the index, so a leading "# Title" would repeat it.
		if (firstHeading?.tagName === 'H1' && firstHeading.textContent.trim().toLowerCase() === title.trim().toLowerCase()) {
			firstHeading.remove();
		}

		root.querySelectorAll('h2, h3, h4').forEach((heading) => {
			const tag = heading.tagName === 'H4' ? '' : takeKind(heading);
			const text = heading.textContent.trim();
			let id = slugify(text);

			for (let n = 2; used.has(id); n += 1) id = `${slugify(text)}-${n}`;

			used.add(id);
			heading.id = id;
			heading.dataset.kind = tag;
			addKindLabel(heading, tag);

			if (heading.tagName !== 'H4') toc.push({ id, text, level: Number(heading.tagName[1]) });
		});

		const fragment = document.createDocumentFragment();
		let current = null;
		let attempts = 0;

		[...root.childNodes].forEach((node) => {
			if (node.nodeName === 'H2') {
				const text = node.textContent;
				const tag = node.dataset.kind ?? '';
				const kind = sectionKind(text, tag);
				current = document.createElement('section');
				current.className = `journal-section journal-section--${kind}${kind === 'attempt' && tag ? ` journal-section--${tag}` : ''}`;
				if (kind === 'attempt') attempts += 1;
				fragment.append(current);
			} else if (!current) {
				current = document.createElement('section');
				current.className = 'journal-section journal-section--intro';
				fragment.append(current);
			}

			current.append(node);
		});

		fragment.querySelectorAll('.journal-section').forEach(wrapExperiments);
		root.append(fragment);
		return { toc, attempts };
	};

	const readingMinutes = (root) => {
		const clone = root.cloneNode(true);
		clone.querySelectorAll('.code-block').forEach((block) => block.remove());
		const words = clone.textContent.trim().split(/\s+/).filter(Boolean).length;
		return Math.max(1, Math.round(words / 200));
	};

	const buildToc = (toc) => {
		const nav = document.createElement('nav');
		nav.className = 'journal-toc';
		nav.setAttribute('aria-label', 'On this page');
		const heading = document.createElement('p');
		heading.className = 'journal-toc__title';
		heading.textContent = 'On this page';
		const list = document.createElement('ol');

		toc.forEach((item) => {
			const row = document.createElement('li');
			row.className = `journal-toc__item journal-toc__item--h${item.level}`;
			const link = document.createElement('a');
			link.href = `#${item.id}`;
			link.textContent = item.text;
			row.append(link);
			list.append(row);
		});

		nav.append(heading, list);
		return nav;
	};

	// Highlights the contents link for the section being read. Plain IntersectionObserver, no animation.
	const trackReading = (container, toc) => {
		if (!('IntersectionObserver' in window)) return;
		const links = new Map([...container.querySelectorAll('.journal-toc a')].map((link) => [link.hash.slice(1), link]));
		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;
				links.forEach((link) => link.removeAttribute('aria-current'));
				links.get(entry.target.id)?.setAttribute('aria-current', 'location');
			});
		}, { rootMargin: '-72px 0px -70% 0px' });

		toc.forEach((item) => {
			const heading = document.getElementById(item.id);
			if (heading) observer.observe(heading);
		});
	};

	const render = (markdown, { title = '' } = {}) => {
		configureMarked();
		const root = document.createElement('div');
		root.className = 'journal-article__body';
		root.innerHTML = parseMarkdown(markdown);
		sanitize(root);
		root.querySelectorAll('pre[data-info]').forEach((pre) => pre.replaceWith(buildCodeBlock(pre)));
		const { toc, attempts } = structure(root, title);

		root.addEventListener('click', async (event) => {
			const button = event.target.closest('.code-copy');
			if (!button) return;
			const original = button.textContent;

			try {
				await copyText(button.closest('.code-block').dataset.code);
				button.textContent = 'Copied';
			} catch {
				button.textContent = 'Copy failed';
			}

			setTimeout(() => { button.textContent = original; }, 1600);
		});

		return { element: root, toc, attempts, readingMinutes: readingMinutes(root) };
	};

	window.JournalArticle = { render, buildToc, trackReading };
})();
