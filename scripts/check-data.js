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

console.log('data ok');
