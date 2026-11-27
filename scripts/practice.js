// Engineering Fundamentals section (the files keep their original "practice" names).
// Renders data/practice.json (LeetCode snapshot, repository, area descriptions) and the journal index
// data/problems.json into #practice-content. Uses createElement from portfolio.js, so load this after it.
//
// Data honesty rules, enforced here and by scripts/check-data.js:
//  - Counts are computed from the journal index, never typed in by hand.
//  - "Documented" means a published journal article exists for the entry. "In progress" and "planned" are
//    always labelled as such and never counted as documented.
//  - The LeetCode figures are a dated, hand-copied snapshot, and the section says so.

const practiceContent = document.querySelector('#practice-content');
const practiceDataUrl = 'data/practice.json';
const journalIndexUrl = 'data/problems.json';

const externalLink = (url, text, className = 'text-link') => {
	const link = createElement('a', className, text);
	link.href = url;
	link.target = '_blank';
	link.rel = 'noreferrer';
	return link;
};

const formatDate = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

const repositoryUrl = (data, path) => {
	const base = data.repository?.url;
	return base ? `${base.replace(/\/$/, '')}/tree/main/${path}` : null;
};

// One row per journal entry. Entries with an article link to it; planned ones are plain text.
const createExerciseRow = (entry) => {
	const row = createElement('li', `practice-row practice-row--${entry.status}`);
	let title;

	if (entry.article && entry.status !== 'planned') {
		title = createElement('a', '', entry.title);
		title.href = `journal.html?p=${encodeURIComponent(entry.slug)}`;
	} else {
		title = createElement('span', '', entry.title);
	}

	title.classList.add('practice-row__title');
	const meta = [entry.platform, entry.difficulty, entry.language].filter(Boolean);

	if (entry.status === 'documented' && entry.date) {
		meta.push(formatDate(entry.date));
	}

	if (entry.status === 'in-progress') {
		meta.push('In progress');
	}

	row.append(title, createElement('span', 'practice-row__meta', meta.join(' · ')));
	return row;
};

const createExerciseList = (entries, className) => {
	const list = createElement('ul', className);
	list.append(...entries.map(createExerciseRow));
	return list;
};

const createAreaBand = (area, data, entries) => {
	const band = createElement('article', 'practice-area');
	const mine = entries.filter((entry) => entry.category === area.title);
	const documented = mine.filter((entry) => entry.status === 'documented');
	const inProgress = mine.filter((entry) => entry.status === 'in-progress');
	const planned = mine.filter((entry) => entry.status === 'planned');

	band.append(createElement('h3', '', area.title), createElement('p', 'practice-area__description', area.description));

	// The counts are derived from the journal index, so they can never run ahead of the work.
	band.append(createElement('p', 'practice-area__counts', `${documented.length} documented · ${inProgress.length} in progress`));

	const target = repositoryUrl(data, area.path);

	if (target) {
		band.append(externalLink(target, `Browse ${area.path}/ in the repository`));
	}

	if (documented.length) {
		band.append(createExerciseList(documented, 'practice-list'));
	}

	if (inProgress.length) {
		band.append(createElement('h4', 'practice-area__sub', 'In progress'), createExerciseList(inProgress, 'practice-list'));
	}

	if (!documented.length && !inProgress.length) {
		band.append(createElement('p', 'practice-area__empty', 'Nothing documented here yet.'));
	}

	if (planned.length) {
		const details = createElement('details', 'practice-area__planned');
		details.append(createElement('summary', '', `Planned, not started (${planned.length})`), createExerciseList(planned, 'practice-list'));
		band.append(details);
	}

	return band;
};

const createLeetcodeBlock = (leetcode) => {
	const block = createElement('div', 'practice-leetcode');
	block.append(createElement('h3', '', 'LeetCode'));

	if (!leetcode.snapshot) {
		block.append(createElement('p', 'practice-area__description', 'Problem statistics are not published here yet.'), externalLink(leetcode.profileUrl, `${leetcode.username} on LeetCode`));
		return block;
	}

	const { snapshot } = leetcode;
	const stats = createElement('dl', 'practice-stats');
	[['Solved', snapshot.totalSolved], ['Easy', snapshot.easy], ['Medium', snapshot.medium], ['Hard', snapshot.hard]].forEach(([label, value]) => {
		const stat = createElement('div');
		stat.append(createElement('dt', '', label), createElement('dd', '', String(value)));
		stats.append(stat);
	});
	block.append(stats);

	block.append(createElement('p', 'practice-note', `Snapshot copied by hand from my public profile on ${formatDate(snapshot.asOf)}. The profile is the source of truth.`));

	if (snapshot.recent?.length) {
		const list = createElement('ul', 'practice-list');
		snapshot.recent.forEach((problem) => {
			const row = createElement('li', 'practice-row');
			row.append(externalLink(problem.url, problem.title), createElement('span', 'practice-row__meta', [problem.difficulty, problem.solvedOn && formatDate(problem.solvedOn)].filter(Boolean).join(' · ')));
			list.append(row);
		});
		block.append(createElement('h4', 'practice-area__sub', 'Recently solved'), list);
	}

	block.append(externalLink(leetcode.profileUrl, `${leetcode.username} on LeetCode`));
	return block;
};

const createPracticeLegend = () => {
	const legend = createElement('p', 'practice-legend');
	legend.append(
		createElement('strong', '', 'How to read this: '),
		'This is ongoing work, not a finished checklist, so it only shows what exists. LeetCode figures are a dated snapshot copied by hand. "Documented" means the full write-up is published in the engineering journal. "In progress" means started and not finished. Planned work is listed separately and is never counted.'
	);
	return legend;
};

const createJournalLink = (entries) => {
	// A link to an empty journal helps nobody, so it only appears once there is something to read.
	if (!entries.some((entry) => entry.status !== 'planned' && entry.article)) {
		return null;
	}

	const line = createElement('p', 'practice-journal');
	const link = createElement('a', 'button-link', 'Open the engineering journal');
	link.href = 'journal.html';
	line.append(link);
	return line;
};

const renderPractice = (data, entries) => {
	const parts = [createPracticeLegend()];
	const journalLink = createJournalLink(entries);

	if (journalLink) {
		parts.push(journalLink);
	}

	parts.push(...data.areas.map((area) => createAreaBand(area, data, entries)));

	if (data.leetcode?.username) {
		parts.push(createLeetcodeBlock(data.leetcode));
	}

	const repo = data.repository;
	const footer = createElement('p', 'practice-repo');

	if (repo?.url) {
		footer.append('Code lives in ', externalLink(repo.url, repo.name), '.');
	} else {
		footer.append(`The ${repo?.name ?? 'practice'} repository is not published yet.`);
	}

	parts.push(footer);
	practiceContent.replaceChildren(...parts);
};

const fetchJson = async (url) => {
	const response = await fetch(url, { cache: 'no-cache' });

	if (!response.ok) {
		throw new Error(`Could not load ${url}: ${response.status}`);
	}

	return response.json();
};

const loadPractice = async () => {
	if (!practiceContent) {
		return;
	}

	try {
		const data = await fetchJson(practiceDataUrl);
		let entries = [];

		try {
			const index = await fetchJson(journalIndexUrl);
			// Same rules as the journal page: known category and status, and the first entry wins a duplicate slug.
			const categories = new Set(data.areas.map((area) => area.title));
			const statuses = new Set(['documented', 'in-progress', 'planned']);
			const seen = new Set();
			entries = (Array.isArray(index.problems) ? index.problems : []).filter((entry) => {
				const valid = entry && entry.slug && entry.title && categories.has(entry.category) && statuses.has(entry.status) && !seen.has(entry.slug);

				if (valid) {
					seen.add(entry.slug);
				}

				return valid;
			});
		} catch (error) {
			// The section still shows the LeetCode snapshot and areas if the journal index is unavailable.
			console.error(error);
		}

		renderPractice(data, entries);
	} catch (error) {
		const status = createElement('p', 'portfolio-status', 'Engineering Fundamentals couldn’t load. Reload the page.');
		practiceContent.replaceChildren(status);
		console.error(error);
	}
};

loadPractice();
