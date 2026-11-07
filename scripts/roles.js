const rolesDataUrl = 'data/roles.json';

const fetchRoles = async () => {
	const response = await fetch(rolesDataUrl);

	if (!response.ok) {
		throw new Error(`Could not load roles: ${response.status}`);
	}

	const data = await response.json();
	return Array.isArray(data.roles) ? data.roles : [];
};

const createRoleItem = (role) => {
	const item = document.createElement('li');
	item.className = `career-timeline__item${role.current ? ' career-timeline__item--current' : ''}`;

	const date = document.createElement('span');
	date.className = 'career-timeline__date';
	date.textContent = role.date;

	const title = document.createElement('h3');
	title.textContent = role.title;

	const company = document.createElement('p');
	company.textContent = role.company;

	item.append(date, title, company);

	if (role.description) {
		const description = document.createElement('p');
		description.className = 'career-timeline__description';
		description.textContent = role.description;
		item.append(description);
	}

	return item;
};
