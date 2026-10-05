const roleTrigger = document.querySelector('.role-trigger');
const careerModal = document.querySelector('#career-modal');
const careerTimeline = document.querySelector('#career-timeline');
const careerNavigation = document.querySelector('#career-timeline-navigation');
const careerCloseButtons = document.querySelectorAll('[data-career-close]');
const rolesDataUrl = 'data/roles.json';

document.addEventListener('contextmenu', (event) => {
	event.preventDefault();
});

document.addEventListener('selectstart', (event) => {
	event.preventDefault();
});

const renderRoles = (roles) => {
	careerTimeline.replaceChildren();
	careerNavigation.replaceChildren();

	roles.forEach((role, index) => {
		const item = document.createElement('li');
		item.className = `career-timeline__item${role.current ? ' career-timeline__item--current' : ''}`;
		item.id = `career-role-${index + 1}`;

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

		const navigationButton = document.createElement('button');
		navigationButton.className = 'career-timeline__dot';
		navigationButton.type = 'button';
		navigationButton.setAttribute('aria-label', `View ${role.title} at ${role.company}`);
		navigationButton.setAttribute('aria-controls', item.id);
		navigationButton.addEventListener('click', () => {
			item.scrollIntoView({ behavior: 'smooth', block: 'start' });
		});
		careerNavigation.append(navigationButton);
	});

	const firstItem = careerTimeline.querySelector('.career-timeline__item');
	if (firstItem) {
		const syncTimelineHeight = () => {
			careerTimeline.style.height = `${firstItem.offsetHeight}px`;
		};

		syncTimelineHeight();
		new ResizeObserver(syncTimelineHeight).observe(firstItem);
	}
};

const observeActiveRole = () => {
	const roleItems = careerTimeline.querySelectorAll('.career-timeline__item');
	const navigationButtons = careerNavigation.querySelectorAll('.career-timeline__dot');

	if (!roleItems.length) {
		return;
	}

	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (!entry.isIntersecting) {
				return;
			}

			const activeIndex = [...roleItems].indexOf(entry.target);
			navigationButtons.forEach((button, index) => {
				const isActive = index === activeIndex;
				button.classList.toggle('career-timeline__dot--active', isActive);
				button.setAttribute('aria-current', isActive ? 'true' : 'false');
			});
		});
	}, {
		root: careerTimeline,
		threshold: 0.55
	});

	roleItems.forEach((item) => observer.observe(item));
};

const loadRoles = async () => {
	try {
		const response = await fetch(rolesDataUrl);

		if (!response.ok) {
			throw new Error(`Could not load roles: ${response.status}`);
		}

		const data = await response.json();
		renderRoles(Array.isArray(data.roles) ? data.roles : []);
		observeActiveRole();
	} catch (error) {
		careerTimeline.replaceChildren();
		const errorMessage = document.createElement('li');
		errorMessage.className = 'career-timeline__status';
		errorMessage.textContent = 'Roles could not be loaded. Check data/roles.json.';
		careerTimeline.append(errorMessage);
		console.error(error);
	}
};

if (roleTrigger && careerModal && careerTimeline && careerNavigation) {
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
