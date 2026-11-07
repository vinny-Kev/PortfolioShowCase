const experienceList = document.querySelector('#experience-list');
const initiativesList = document.querySelector('#initiatives-list');
const projectsList = document.querySelector('#projects-list');

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

const createList = (items, className) => {
	const list = createElement('ul', className);
	items.forEach((item) => list.append(createElement('li', '', item)));
	return list;
};

const createInitiativeCard = (initiative) => {
	const card = createElement('article', 'initiative-card');
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

	if (initiative.featured) {
		heading.append(createElement('p', 'initiative-card__label', 'Featured initiative'));
	}

	heading.append(
		createElement('h3', '', initiative.name),
		createElement('p', 'initiative-card__role', `${initiative.role}, ${initiative.organization}`),
		createElement('p', 'initiative-card__status', initiative.status)
	);
	header.append(heading);
	card.append(header);

	const details = createElement('details', 'initiative-card__details');
	const summary = createElement('summary', '', 'Product details');
	const body = createElement('div', 'initiative-card__body');

	const actions = createElement('div', 'initiative-card__actions');
	initiative.links.forEach((link) => {
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
		createDetail('Current status', createElement('p', '', `${initiative.status} ${initiative.statusNote}`)),
		createElement('p', 'initiative-card__stack', `Stack: ${initiative.stack.join(', ')}`),
		actions
	);

	details.append(summary, body);
	card.append(details);
	return card;
};

const createProject = (project) => {
	const item = createElement('article', 'project-item');
	item.append(
		createElement('h3', '', project.title),
		createElement('p', 'project-item__tech', project.tech),
		createList(project.bullets.map((bullet) => bullet.t))
	);

	if (project.link) {
		const link = createElement('a', 'text-link', project.link.text);
		link.href = project.link.url;
		link.target = '_blank';
		link.rel = 'noreferrer';
		item.append(link);
	}

	return item;
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
		container.replaceChildren(createElement(statusTag, 'portfolio-status', `${label} could not be loaded.`));
		console.error(error);
	}
};

const loadPortfolio = async () => {
	await Promise.all([
		fillSection(experienceList, fetchRoles, createRoleItem, 'li', 'Experience'),
		fillSection(initiativesList, () => fetchList('data/initiatives.json', 'initiatives'), createInitiativeCard, 'p', 'Initiatives'),
		fillSection(projectsList, () => fetchList('data/projects.json', 'projects'), createProject, 'p', 'Projects')
	]);

	// Sections above the target grow once data arrives, so land on deep links again.
	document.getElementById(location.hash.slice(1))?.scrollIntoView();
};

loadPortfolio();
