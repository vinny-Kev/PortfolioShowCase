// Engineering journal page: the index (listing, search, filters) and single articles, from one file.
// journal.html           -> the listing
// journal.html?p=<slug>  -> one article
// Data comes from data/problems.json (metadata) and content/fundamentals/<category>/<article>.md.
// Both locations can be overridden with data-index / data-content on #journal-root.

(() => {
	const root = document.querySelector('#journal-root');

	if (!root) return;

	const INDEX_URL = root.dataset.index || 'data/problems.json';
	const CONTENT_BASE = root.dataset.content || 'content/fundamentals/';
	const CATEGORIES = [
		{ id: 'algorithms', title: 'Algorithms & Data Structures' },
		{ id: 'sql', title: 'SQL & Database Engineering' },
		{ id: 'software-design', title: 'Software Design' }
	];
	const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
	const STATUSES = ['documented', 'in-progress', 'planned'];
	const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
	const ARTICLE_FILE = /^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;
	const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

	const el = (tag, className, text) => {
		const node = document.createElement(tag);
		if (className) node.className = className;
		if (text !== undefined) node.textContent = text;
		return node;
	};

	const categoryOf = (entry) => CATEGORIES.find((category) => category.title === entry.category);
	const articleUrl = (entry) => `${CONTENT_BASE}${categoryOf(entry).id}/${entry.article}`;
	const entryHref = (entry) => `journal.html?p=${encodeURIComponent(entry.slug)}`;

	const formatDate = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });

	// An entry that fails these checks is skipped, not rendered half-broken. check-data.js enforces the same rules.
	const entryProblem = (entry) => {
		if (!entry || typeof entry !== 'object') return 'not an object';
		if (typeof entry.slug !== 'string' || !SLUG.test(entry.slug)) return 'slug must be lowercase words joined by hyphens';
		if (typeof entry.title !== 'string' || !entry.title.trim()) return 'title is missing';
		if (!categoryOf(entry)) return `category must be one of: ${CATEGORIES.map((c) => c.title).join('; ')}`;
		if (!STATUSES.includes(entry.status)) return 'status must be documented, in-progress or planned';
		if (entry.difficulty !== undefined && !DIFFICULTIES.includes(entry.difficulty)) return 'difficulty must be Easy, Medium or Hard';
		if (entry.date !== undefined && !ISO_DATE.test(entry.date)) return 'date must be YYYY-MM-DD';
		if (entry.status !== 'planned' && entry.article !== undefined && !ARTICLE_FILE.test(entry.article)) return 'article must be a file name like my-problem.md';
		if (entry.tags !== undefined && !(Array.isArray(entry.tags) && entry.tags.every((tag) => typeof tag === 'string'))) return 'tags must be a list of strings';
		return '';
	};

	const loadIndex = async () => {
		const response = await fetch(INDEX_URL, { cache: 'no-cache' });

		if (!response.ok) throw new Error(`Could not load ${INDEX_URL}: ${response.status}`);

		const data = await response.json();

		if (!Array.isArray(data.problems)) throw new Error(`${INDEX_URL} must contain a "problems" list`);

		const entries = [];
		const seen = new Set();

		data.problems.forEach((entry, index) => {
			const problem = entryProblem(entry);

			if (problem) {
				console.warn(`Journal entry #${index + 1} skipped: ${problem}`);
			} else if (seen.has(entry.slug)) {
				console.warn(`Journal entry "${entry.slug}" skipped: duplicate slug`);
			} else {
				seen.add(entry.slug);
				entries.push(entry);
			}
		});

		return entries;
	};

	const message = (heading, body, linkHref, linkText) => {
		const box = el('div', 'journal-message');
		box.append(el('h2', '', heading), el('p', '', body));

		if (linkHref) {
			const link = el('a', 'text-link', linkText);
			link.href = linkHref;
			box.append(link);
		}

		return box;
	};

	const badge = (text, kind) => el('span', `journal-badge journal-badge--${kind}`, text);

	const badgesFor = (entry) => {
		const list = el('p', 'journal-badges');

		if (entry.difficulty) list.append(badge(entry.difficulty, `difficulty-${entry.difficulty.toLowerCase()}`));

		list.append(badge(entry.category, 'category'));

		if (entry.status !== 'documented') list.append(badge(entry.status === 'in-progress' ? 'In progress' : 'Planned', 'status'));

		return list;
	};

	const metaLine = (entry, extra = []) => {
		const parts = [];

		if (entry.platform) parts.push(entry.problemNumber ? `${entry.platform} #${entry.problemNumber}` : entry.platform);

		if (entry.language) parts.push(entry.language);

		if (entry.date) parts.push(formatDate(entry.date));

		parts.push(...extra);
		return el('p', 'journal-meta', parts.join(' · '));
	};

	const tagList = (tags = []) => {
		const list = el('ul', 'journal-tags');
		tags.forEach((tag) => list.append(el('li', '', tag)));
		return list;
	};

	/* ---------------- Listing ---------------- */

	const createEntry = (entry) => {
		const article = el('article', `journal-entry journal-entry--${entry.status}`);
		const heading = el('h3', 'journal-entry__title');

		if (entry.status === 'planned' || !entry.article) {
			heading.textContent = entry.title;
		} else {
			const link = el('a', '', entry.title);
			link.href = entryHref(entry);
			heading.append(link);
		}

		article.append(heading, badgesFor(entry), metaLine(entry, entry.attempts ? [`${entry.attempts} ${entry.attempts === 1 ? 'attempt' : 'attempts'}`] : []));

		if (entry.summary) article.append(el('p', 'journal-entry__summary', entry.summary));

		if (entry.tags?.length) article.append(tagList(entry.tags));

		return article;
	};

	const field = (labelText, control) => {
		const wrap = el('label', 'journal-filter');
		wrap.append(el('span', '', labelText), control);
		return wrap;
	};

	const select = (name, options, current) => {
		const control = el('select');
		control.name = name;
		control.append(new Option('All', ''));
		options.forEach((value) => control.append(new Option(value, value)));
		control.value = options.includes(current) ? current : '';
		return control;
	};

	const showListing = (entries) => {
		document.title = 'Engineering Journal | Kevin Roy Maglaqui';
		const params = new URLSearchParams(location.search);
		const header = el('header', 'journal-header');
		const back = el('a', 'text-link', 'Back to Fundamentals');
		back.href = 'main-page.html#fundamentals';
		header.append(
			back,
			el('h1', '', 'Engineering Journal'),
			el('p', 'journal-header__intro', 'How I arrive at solutions, not only the solutions: what I tried, where my reasoning broke, how I found out, and what I changed. Each entry is written from the work as it happened.')
		);

		if (!entries.length) {
			root.replaceChildren(header, message('No entries yet', 'The first articles will appear here when they are written.', 'main-page.html#fundamentals', 'Back to Fundamentals'));
			return;
		}

		const languages = [...new Set(entries.map((entry) => entry.language).filter(Boolean))].sort();
		const search = el('input');
		search.type = 'search';
		search.name = 'q';
		search.placeholder = 'Title, tag or topic';
		search.value = params.get('q') ?? '';
		const category = select('category', CATEGORIES.map((c) => c.title), params.get('category'));
		const difficulty = select('difficulty', DIFFICULTIES, params.get('difficulty'));
		const language = select('language', languages, params.get('language'));
		const clear = el('button', 'journal-clear', 'Clear filters');
		clear.type = 'button';

		const form = el('form', 'journal-filters');
		form.setAttribute('role', 'search');
		form.addEventListener('submit', (event) => event.preventDefault());
		form.append(field('Search', search), field('Category', category), field('Difficulty', difficulty), field('Language', language), clear);

		const status = el('p', 'journal-status');
		status.setAttribute('aria-live', 'polite');
		const results = el('div', 'journal-results');

		const matches = (entry) => {
			const query = search.value.trim().toLowerCase();
			const haystack = [entry.title, entry.summary, entry.platform, entry.language, entry.category, ...(entry.tags ?? [])].join(' ').toLowerCase();
			return (!query || haystack.includes(query))
				&& (!category.value || entry.category === category.value)
				&& (!difficulty.value || entry.difficulty === difficulty.value)
				&& (!language.value || entry.language === language.value);
		};

		const byDateDesc = (a, b) => (b.date ?? '').localeCompare(a.date ?? '');

		const update = () => {
			const visible = entries.filter(matches);
			const published = visible.filter((entry) => entry.status !== 'planned').sort(byDateDesc);
			const planned = visible.filter((entry) => entry.status === 'planned');
			const next = new URLSearchParams();

			[['q', search.value.trim()], ['category', category.value], ['difficulty', difficulty.value], ['language', language.value]]
				.forEach(([key, value]) => { if (value) next.set(key, value); });

			history.replaceState(null, '', next.size ? `?${next}` : location.pathname);
			status.textContent = `Showing ${visible.length} of ${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}.`;
			results.replaceChildren();

			if (!visible.length) {
				results.append(el('p', 'journal-empty', 'Nothing matches these filters.'));
				return;
			}

			published.forEach((entry) => results.append(createEntry(entry)));

			if (planned.length) {
				const details = el('details', 'journal-planned');
				details.append(el('summary', '', `Planned, not started (${planned.length})`));
				planned.forEach((entry) => details.append(createEntry(entry)));
				results.append(details);
			}
		};

		[search, category, difficulty, language].forEach((control) => control.addEventListener('input', update));
		clear.addEventListener('click', () => {
			search.value = '';
			[category, difficulty, language].forEach((control) => { control.value = ''; });
			update();
		});

		root.replaceChildren(header, form, status, results);
		update();
	};

	/* ---------------- Article ---------------- */

	const factList = (entry) => {
		const facts = [['Time', entry.timeComplexity], ['Space', entry.spaceComplexity]].filter(([, value]) => value);

		if (!facts.length) return null;

		const list = el('dl', 'journal-facts');
		facts.forEach(([label, value]) => {
			const row = el('div');
			row.append(el('dt', '', label), el('dd', '', value));
			list.append(row);
		});
		return list;
	};

	const articleHeader = (entry, extra) => {
		const header = el('header', 'journal-header');
		const back = el('a', 'text-link', 'Engineering Journal');
		back.href = 'journal.html';
		const title = el('h1', '', entry.title);
		header.append(back, title, badgesFor(entry), metaLine(entry, extra));

		if (entry.url && /^https:\/\//.test(entry.url)) {
			const source = el('a', 'text-link', `View the original problem on ${entry.platform || 'the source'}`);
			source.href = entry.url;
			source.target = '_blank';
			source.rel = 'noreferrer';
			const line = el('p', 'journal-source');
			line.append(source);
			header.append(line);
		}

		const facts = factList(entry);

		if (facts) header.append(facts);

		if (entry.tags?.length) header.append(tagList(entry.tags));

		return header;
	};

	const showArticle = async (entries, slug) => {
		const entry = entries.find((item) => item.slug === slug);

		if (!entry) {
			document.title = 'Entry not found | Engineering Journal';
			root.replaceChildren(message('Entry not found', 'There is no journal entry with that address.', 'journal.html', 'Open the journal index'));
			return;
		}

		document.title = `${entry.title} | Engineering Journal`;

		if (entry.summary) {
			document.querySelector('meta[name="description"]')?.setAttribute('content', entry.summary);
		}

		if (entry.status === 'planned' || !entry.article) {
			root.replaceChildren(articleHeader(entry, []), message('No article yet', 'This entry is planned. Nothing has been written for it.', 'journal.html', 'Back to the journal'));
			return;
		}

		let markdown;

		try {
			const response = await fetch(articleUrl(entry), { cache: 'no-cache' });

			if (!response.ok) throw new Error(`${articleUrl(entry)}: ${response.status}`);

			markdown = await response.text();

			if (!markdown.trim()) throw new Error(`${articleUrl(entry)} is empty`);
		} catch (error) {
			console.error(error);
			root.replaceChildren(articleHeader(entry, []), message('This article couldn’t be loaded', 'The entry exists in the index, but its Markdown file is missing or empty.', 'journal.html', 'Back to the journal'));
			return;
		}

		let rendered;

		try {
			rendered = window.JournalArticle.render(markdown, { title: entry.title });
		} catch (error) {
			console.error(error);
			root.replaceChildren(articleHeader(entry, []), message('This article couldn’t be displayed', 'The Markdown could not be rendered. Reload the page, and check that the Markdown files loaded.', 'journal.html', 'Back to the journal'));
			return;
		}

		const extra = [`${rendered.readingMinutes} min read`];

		if (rendered.attempts) extra.push(`${rendered.attempts} ${rendered.attempts === 1 ? 'attempt' : 'attempts'}`);

		const layout = el('div', 'journal-layout');
		const toc = window.JournalArticle.buildToc(rendered.toc);
		const wrapper = el('div', 'journal-article');
		wrapper.append(rendered.element);

		if (rendered.toc.length) {
			// A fold on phones, a sticky column on wide screens (the CSS decides which one is visible).
			const fold = el('details', 'journal-toc-fold');
			fold.append(el('summary', '', 'On this page'), toc.cloneNode(true));
			layout.append(fold, toc);
		}

		layout.append(wrapper);
		root.replaceChildren(articleHeader(entry, extra), layout);
		window.JournalArticle.trackReading(layout, rendered.toc);

		// Land on the section a deep link points to, now that the article exists.
		if (location.hash.length > 1) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
	};

	/* ---------------- Start ---------------- */

	const start = async () => {
		let entries;

		try {
			entries = await loadIndex();
		} catch (error) {
			console.error(error);
			document.title = 'Engineering Journal | Kevin Roy Maglaqui';
			root.replaceChildren(message('The journal couldn’t load', 'Reload the page. If it keeps happening, the index file may be missing.', 'main-page.html#fundamentals', 'Back to Fundamentals'));
			return;
		}

		const slug = new URLSearchParams(location.search).get('p');

		if (slug) {
			await showArticle(entries, slug);
		} else {
			showListing(entries);
		}
	};

	start();
})();
