const experienceList = document.querySelector('#experience-list');
const initiativesList = document.querySelector('#initiatives-list');

const createElement = (tag, className, text) => {
	const element = document.createElement(tag);

	if (className) {
		element.className = className;
	}

	if (text) {
		element.textContent = text;
	}

	return element;
};

const createDetail = (heading, ...children) => {
	const block = createElement('div', 'initiative-card__block');
	block.append(createElement('h4', '', heading), ...children);
	return block;
};

// A capability is a plain string or a named cluster: { name, items }.
const createList = (items, className) => {
	const list = createElement('ul', className);
	items.forEach((item) => {
		if (typeof item === 'string') {
			list.append(createElement('li', '', item));
			return;
		}

		const cluster = createElement('li');
		cluster.append(createElement('strong', '', `${item.name}:`), ` ${item.items.join(', ')}`);
		list.append(cluster);
	});
	return list;
};

const sentence = (text) => (/[.!?]$/.test(text) ? text : `${text}.`);

const createInitiativeCard = (initiative) => {
	const card = createElement('article', initiative.theme ? `initiative-card initiative-card--${initiative.theme}` : 'initiative-card');
	const header = createElement('div', 'initiative-card__header');

	if (initiative.mark) {
		const mark = createElement('img', 'initiative-card__mark');
		mark.src = initiative.mark;
		mark.alt = '';
		mark.width = 44;
		mark.height = 44;
		header.append(mark);
	}

	const heading = createElement('div');

	const label = initiative.label ?? (initiative.featured ? 'Featured initiative' : '');

	if (label) {
		heading.append(createElement('p', 'initiative-card__label', label));
	}

	heading.append(
		createElement('h3', '', initiative.name),
		createElement('p', 'initiative-card__role', `${initiative.role}, ${initiative.organization}`),
		createElement('p', 'initiative-card__highlight', initiative.highlight),
		createElement('p', 'initiative-card__status', initiative.status)
	);
	header.append(heading);
	card.append(header);

	const details = createElement('details', 'initiative-card__details');
	const summary = createElement('summary', '', 'Product details');
	const body = createElement('div', 'initiative-card__body');

	const actions = createElement('div', 'initiative-card__actions');
	initiative.links.forEach((link) => {
		// A link with an empty url is a placeholder: show it inert rather than ship a dead link.
		if (!link.url) {
			const label = link.placeholderText || (link.label.toLowerCase().includes('soon') ? link.label : `${link.label} (link coming soon)`);
			const pending = createElement('span', 'button-link button-link--pending', label);
			pending.setAttribute('aria-disabled', 'true');
			actions.append(pending);
			return;
		}

		const action = createElement('a', 'button-link', link.label);
		action.href = link.url;
		action.target = '_blank';
		action.rel = 'noreferrer';
		actions.append(action);
	});

	body.append(
		createDetail('Product overview', createElement('p', '', initiative.overview)),
		createDetail('My role', createElement('p', '', initiative.contribution)),
		createDetail('Core capabilities', createList(initiative.capabilities, 'initiative-card__capabilities')),
		createDetail('Current status', createElement('p', '', [initiative.status, initiative.statusNote].filter(Boolean).map(sentence).join(' '))),
		actions
	);

	if (initiative.stack) {
		body.insertBefore(createElement('p', 'initiative-card__stack', `Stack: ${initiative.stack.join(', ')}`), actions);
	}

	if (initiative.repository) {
		const repository = createElement('a', 'text-link', initiative.repository.text);
		repository.href = initiative.repository.url;
		repository.target = '_blank';
		repository.rel = 'noreferrer';
		body.append(repository);
	}

	details.append(summary, body);
	card.append(details);
	return card;
};

const fetchList = async (url, key) => {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Could not load ${url}: ${response.status}`);
	}

	const data = await response.json();
	return Array.isArray(data[key]) ? data[key] : [];
};

const fillSection = async (container, loadItems, createItem, statusTag, label) => {
	try {
		const items = await loadItems();
		container.replaceChildren(...items.map(createItem));
	} catch (error) {
		const status = createElement(statusTag, 'portfolio-status', `${label} couldn’t load. Reload the page, or get the same details from the `);
		const resume = createElement('a', 'text-link', 'résumé (PDF)');
		resume.href = 'assets/Kevin%20Maglaqui%20Resume.pdf';
		status.append(resume, '.');
		container.replaceChildren(status);
		console.error(error);
	}
};

const loadPortfolio = async () => {
	await Promise.all([
		fillSection(experienceList, fetchRoles, createRoleItem, 'li', 'Experience'),
		fillSection(initiativesList, () => fetchList('data/initiatives.json', 'initiatives'), createInitiativeCard, 'p', 'Initiatives')
	]);

	// Sections above the target grow once data arrives, so land on deep links again.
	document.getElementById(location.hash.slice(1))?.scrollIntoView();
};

loadPortfolio();
