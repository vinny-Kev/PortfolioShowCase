// Engineering Fundamentals section (the files keep their original "practice" names).
// Renders data/practice.json into #practice-content.
// Uses createElement from portfolio.js, so load this script after it.
//
// Data honesty rules, enforced here and by scripts/check-data.js:
//  - Counts are computed from the exercise lists, never typed in by hand.
//  - Only exercises with status "documented" count as completed, and each must link to its write-up.
//  - "in-progress" and "planned" are always labelled as such and never counted as completed.
//  - The LeetCode figures are a dated, hand-copied snapshot, and the section says so.

const practiceContent = document.querySelector('#practice-content');
const practiceDataUrl = 'data/practice.json';

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

// One row per exercise: title (linked when it has a write-up), then a meta line.
const createExerciseRow = (exercise) => {
	const row = createElement('li', `practice-row practice-row--${exercise.status}`);
	const title = exercise.solutionUrl ? externalLink(exercise.solutionUrl, exercise.title) : createElement('span', '', exercise.title);
	title.classList.add('practice-row__title');

	const meta = [exercise.source, exercise.difficulty, exercise.topic].filter(Boolean);

	if (exercise.status === 'documented' && exercise.completedOn) {
		meta.push(formatDate(exercise.completedOn));
	}

	if (exercise.status === 'in-progress') {
		meta.push('In progress');
	}

	row.append(title, createElement('span', 'practice-row__meta', meta.join(' · ')));

	if (exercise.complexity && exercise.status === 'documented') {
		row.append(createElement('span', 'practice-row__meta', `Complexity: ${exercise.complexity}`));
	}

	return row;
};

const createExerciseList = (exercises, className) => {
	const list = createElement('ul', className);
	list.append(...exercises.map(createExerciseRow));
	return list;
};

const createAreaBand = (area, data) => {
	const band = createElement('article', 'practice-area');
	const documented = area.exercises.filter((item) => item.status === 'documented');
	const inProgress = area.exercises.filter((item) => item.status === 'in-progress');
	const planned = area.exercises.filter((item) => item.status === 'planned');

	band.append(createElement('h3', '', area.title), createElement('p', 'practice-area__description', area.description));

	// The counts are derived from the lists above, so they can never run ahead of the work.
	band.append(createElement('p', 'practice-area__counts', `${documented.length} documented · ${inProgress.length} in progress`));

	const target = repositoryUrl(data, area.path);

	if (target) {
		band.append(externalLink(target, `Browse ${area.path}/ in the repository`));
	} else {
		const pending = createElement('span', 'button-link button-link--pending', 'Repository link coming soon');
		pending.setAttribute('aria-disabled', 'true');
		band.append(pending);
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
		'This is ongoing work, not a finished checklist, so it only shows what exists. LeetCode figures are a dated snapshot copied by hand. "Documented" means the solution and write-up are published in the repository. "In progress" means started and not finished. Planned work is listed separately and is never counted.'
	);
	return legend;
};

const renderPractice = (data) => {
	const parts = [createPracticeLegend(), ...data.areas.map((area) => createAreaBand(area, data))];

	if (data.leetcode?.username) {
		parts.push(createLeetcodeBlock(data.leetcode));
	}

	const repo = data.repository;
	const footer = createElement('p', 'practice-repo');

	if (repo?.url) {
		footer.append('All solutions live in ', externalLink(repo.url, repo.name), '.');
	} else {
		footer.append(`The ${repo?.name ?? 'practice'} repository is not published yet.`);
	}

	parts.push(footer);
	practiceContent.replaceChildren(...parts);
};

const loadPractice = async () => {
	if (!practiceContent) {
		return;
	}

	try {
		const response = await fetch(practiceDataUrl, { cache: 'no-cache' });

		if (!response.ok) {
			throw new Error(`Could not load ${practiceDataUrl}: ${response.status}`);
		}

		renderPractice(await response.json());
	} catch (error) {
		const status = createElement('p', 'portfolio-status', 'Engineering Fundamentals couldn’t load. Reload the page.');
		practiceContent.replaceChildren(status);
		console.error(error);
	}
};

loadPractice();
