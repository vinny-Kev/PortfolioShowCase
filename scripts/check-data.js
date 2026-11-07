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

load('roles', 'roles').forEach((role, i) => ['date', 'title', 'company'].forEach((f) => text(role, f, `roles[${i}]`)));

load('initiatives', 'initiatives').forEach((item, i) => {
	const where = `initiatives[${i}]`;
	['name', 'role', 'organization', 'status', 'overview', 'contribution'].forEach((f) => text(item, f, where));
	['links', 'capabilities'].forEach((f) => list(item, f, where));
	if (item.stack) list(item, 'stack', where); // optional: undecided stacks are left out
	if (item.repository) ['text', 'url'].forEach((f) => text(item.repository, f, `${where}.repository`));
	item.links.forEach((link, j) => text(link, 'label', `${where}.links[${j}]`));
});

load('projects', 'projects').forEach((project, i) => {
	const where = `projects[${i}]`;
	['title', 'tech'].forEach((f) => text(project, f, where));
	if (project.link) ['text', 'url'].forEach((f) => text(project.link, f, `${where}.link`));
	list(project, 'bullets', where);
	project.bullets.forEach((bullet, j) => text(bullet, 't', `${where}.bullets[${j}]`));
});

console.log('data ok');
