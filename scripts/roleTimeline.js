const roleTrigger = document.querySelector('.role-trigger');
const careerModal = document.querySelector('#career-modal');
const careerTimeline = document.querySelector('#career-timeline');
const careerCloseButtons = document.querySelectorAll('[data-career-close]');
const rolesDataUrl = 'data/roles.json';

const renderRoles = (roles) => {
	careerTimeline.replaceChildren();

	roles.forEach((role) => {
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

		careerTimeline.append(item);
	});
};

const loadRoles = async () => {
	try {
		const response = await fetch(rolesDataUrl);

		if (!response.ok) {
			throw new Error(`Could not load roles: ${response.status}`);
		}

		const data = await response.json();
		renderRoles(Array.isArray(data.roles) ? data.roles : []);
	} catch (error) {
		careerTimeline.replaceChildren();
		const errorMessage = document.createElement('li');
		errorMessage.className = 'career-timeline__status';
		errorMessage.textContent = 'Roles could not be loaded. Check data/roles.json.';
		careerTimeline.append(errorMessage);
		console.error(error);
	}
};

if (roleTrigger && careerModal && careerTimeline) {
	let previousFocusedElement;
	let rolesLoaded = false;
	let rolesLoading;

	const closeCareerModal = () => {
		careerModal.hidden = true;
		document.body.style.overflow = '';
		previousFocusedElement?.focus();
	};

	const openCareerModal = async () => {
		if (!careerModal.hidden) {
			return;
		}

		if (!rolesLoaded) {
			rolesLoading ??= loadRoles();
			await rolesLoading;
			rolesLoaded = true;
		}

		previousFocusedElement = document.activeElement;
		careerModal.hidden = false;
		document.body.style.overflow = 'hidden';
		careerModal.querySelector('.career-modal__close').focus();
	};

	roleTrigger.addEventListener('click', openCareerModal);
	roleTrigger.addEventListener('mouseenter', openCareerModal);

	careerCloseButtons.forEach((closeButton) => {
		closeButton.addEventListener('click', closeCareerModal);
	});

	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape' && !careerModal.hidden) {
			closeCareerModal();
		}
	});
}
