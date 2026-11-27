// Run before pushing: node scripts/check-data.js
// Fails if a data file is missing a field that portfolio.js or roles.js reads.
const assert = require('node:assert');
const { readFileSync } = require('node:fs');

const load = (name, key) => {
	const items = JSON.parse(readFileSync(`${__dirname}/../data/${name}.json`, 'utf8'))[key];
	assert(Array.isArray(items) && items.length, `${name}.json: "${key}" must be a non-empty array`);
	return items;
};

const text = (item, field, where) => assert(typeof item[field] === 'string' && item[field], `${where}: "${field}" must be a non-empty string`);
const list = (item, field, where) => assert(Array.isArray(item[field]), `${where}: "${field}" must be an array`);

load('roles', 'roles').forEach((role, i) => {
	const where = `roles[${i}]`;
	['date', 'title', 'company'].forEach((f) => text(role, f, where));
	list(role, 'highlights', where);
	assert(role.highlights.length >= 1 && role.highlights.length <= 4, `${where}: "highlights" needs 1-4 entries`);
	role.highlights.forEach((h, j) => assert(typeof h === 'string' && h, `${where}.highlights[${j}] must be a non-empty string`));
});

load('initiatives', 'initiatives').forEach((item, i) => {
	const where = `initiatives[${i}]`;
	['name', 'role', 'organization', 'highlight', 'status', 'overview', 'contribution'].forEach((f) => text(item, f, where));
	['links', 'capabilities'].forEach((f) => list(item, f, where));
	assert(item.capabilities.length <= 4, `${where}: no more than 4 capability entries`);
	item.capabilities.forEach((c, j) => {
		if (typeof c === 'string') return text({ c }, 'c', `${where}.capabilities[${j}]`);
		text(c, 'name', `${where}.capabilities[${j}]`);
		assert(Array.isArray(c.items) && c.items.length, `${where}.capabilities[${j}]: "items" must be a non-empty array`);
	});
	if (item.stack) list(item, 'stack', where); // optional: undecided stacks are left out
	if (item.repository) ['text', 'url'].forEach((f) => text(item.repository, f, `${where}.repository`));
	item.links.forEach((link, j) => text(link, 'label', `${where}.links[${j}]`));
});


// Engineering Fundamentals: data/practice.json (LeetCode snapshot, repository, areas) and the journal index
// data/problems.json plus the Markdown articles it points to. The checks exist so that the data cannot overstate the work.
const { existsSync, readdirSync } = require('node:fs');
const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const categories = { 'Algorithms & Data Structures': 'algorithms', 'SQL & Database Engineering': 'sql', 'Software Design': 'software-design' };
const root = `${__dirname}/..`;

{
	const practice = JSON.parse(readFileSync(`${root}/data/practice.json`, 'utf8'));
	const { leetcode, repository, areas } = practice;

	if (leetcode?.username) {
		assert.strictEqual(leetcode.profileUrl, `https://leetcode.com/u/${leetcode.username}/`, 'leetcode.profileUrl must match username');
		assert(['manual', 'synced'].includes(leetcode.verification), 'leetcode.verification must be "manual" or "synced"');
		const snap = leetcode.snapshot;

		if (snap) {
			assert(isoDate.test(snap.asOf), 'leetcode.snapshot.asOf must be YYYY-MM-DD');
			['totalSolved', 'easy', 'medium', 'hard'].forEach((f) => assert(Number.isInteger(snap[f]) && snap[f] >= 0, `leetcode.snapshot.${f} must be a non-negative integer`));
			assert.strictEqual(snap.easy + snap.medium + snap.hard, snap.totalSolved, 'leetcode.snapshot: easy + medium + hard must equal totalSolved');
			(snap.recent ?? []).forEach((p, i) => {
				text(p, 'title', `leetcode.snapshot.recent[${i}]`);
				assert(p.url.startsWith('https://leetcode.com/problems/'), `leetcode.snapshot.recent[${i}].url must be a leetcode.com problem link`);
				assert(['Easy', 'Medium', 'Hard'].includes(p.difficulty), `leetcode.snapshot.recent[${i}].difficulty must be Easy, Medium or Hard`);
				if (p.solvedOn) assert(isoDate.test(p.solvedOn), `leetcode.snapshot.recent[${i}].solvedOn must be YYYY-MM-DD`);
			});
		}
	}

	text(repository, 'name', 'repository');
	if (repository.url) assert(/^https:\/\/[^\s]+$/.test(repository.url), 'repository.url must be an https URL');
	assert(Array.isArray(areas) && areas.length === 3, 'practice.areas must list the three areas');
	areas.forEach((area, i) => {
		['id', 'title', 'description', 'path'].forEach((f) => text(area, f, `practice.areas[${i}]`));
		assert(area.title in categories, `practice.areas[${i}].title must be one of the three journal categories`);
		assert(!('exercises' in area), `practice.areas[${i}]: exercises now live in data/problems.json`);
	});
}

{
	const index = JSON.parse(readFileSync(`${root}/data/problems.json`, 'utf8'));
	assert(Array.isArray(index.problems), 'problems.json: "problems" must be a list');
	const slugs = new Set();
	const referenced = new Set();

	index.problems.forEach((entry, i) => {
		const at = `problems[${i}] (${entry.slug ?? 'no slug'})`;
		assert(typeof entry.slug === 'string' && slugPattern.test(entry.slug), `${at}: slug must be lowercase words joined by hyphens`);
		assert(!slugs.has(entry.slug), `${at}: duplicate slug`);
		slugs.add(entry.slug);
		text(entry, 'title', at);
		assert(entry.category in categories, `${at}: category must be one of ${Object.keys(categories).join('; ')}`);
		assert(['documented', 'in-progress', 'planned'].includes(entry.status), `${at}: status must be documented, in-progress or planned`);
		if (entry.difficulty !== undefined) assert(['Easy', 'Medium', 'Hard'].includes(entry.difficulty), `${at}: difficulty must be Easy, Medium or Hard`);
		if (entry.date !== undefined) assert(isoDate.test(entry.date), `${at}: date must be YYYY-MM-DD`);
		if (entry.problemNumber !== undefined) assert(Number.isInteger(entry.problemNumber) && entry.problemNumber > 0, `${at}: problemNumber must be a positive integer`);
		if (entry.url !== undefined) assert(/^https:\/\/[^\s]+$/.test(entry.url), `${at}: url must be an https URL`);
		if (entry.tags !== undefined) assert(Array.isArray(entry.tags) && entry.tags.every((t) => typeof t === 'string' && t), `${at}: tags must be a list of strings`);
		['platform', 'language', 'summary', 'timeComplexity', 'spaceComplexity'].forEach((f) => { if (entry[f] !== undefined) text(entry, f, at); });

		if (entry.status === 'planned') {
			assert(entry.article === undefined && entry.date === undefined, `${at}: a planned entry must not have an article or a date`);
			return;
		}

		if (entry.status === 'documented') {
			assert(isoDate.test(entry.date ?? ''), `${at}: a documented entry needs a date`);
			assert(typeof entry.article === 'string', `${at}: a documented entry needs an article`);
		}

		if (entry.article === undefined) return;
		assert(/^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.test(entry.article), `${at}: article must be a file name like my-problem.md`);
		const file = `content/fundamentals/${categories[entry.category]}/${entry.article}`;
		referenced.add(file);
		assert(existsSync(`${root}/${file}`), `${at}: article file ${file} does not exist`);
		const markdown = readFileSync(`${root}/${file}`, 'utf8');
		assert(markdown.trim().length > 0, `${at}: ${file} is empty`);
		assert(/^## /m.test(markdown), `${at}: ${file} needs at least one "##" section`);

		if (entry.status === 'documented') {
			// The template is full of TODO prompts. A documented article must not still contain any.
			assert(!/TODO:/.test(markdown), `${at}: ${file} still contains TODO: prompts, so it cannot be documented`);
		}

		if (entry.attempts !== undefined) {
			const counted = (markdown.match(/^##\s+Attempt\s*\d+/gim) ?? []).length;
			assert.strictEqual(entry.attempts, counted, `${at}: "attempts" is ${entry.attempts} but the article has ${counted} "## Attempt NN" sections`);
		}
	});

	// Not an error: a Markdown file nobody links to is easy to forget, so say so.
	Object.values(categories).forEach((folder) => {
		const dir = `${root}/content/fundamentals/${folder}`;
		if (!existsSync(dir)) return;
		readdirSync(dir).filter((name) => name.endsWith('.md') && name !== 'README.md').forEach((name) => {
			if (!referenced.has(`content/fundamentals/${folder}/${name}`)) console.warn(`note: content/fundamentals/${folder}/${name} is not listed in data/problems.json`);
		});
	});
}

console.log('data ok');
