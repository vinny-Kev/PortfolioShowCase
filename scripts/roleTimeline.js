// The career link opens a native modal <dialog>: showModal() traps focus, makes the page inert and closes on Escape.
// Without JavaScript the link simply goes to the Experience section of the portfolio page.
const roleTrigger = document.querySelector('.role-trigger');
const careerModal = document.querySelector('#career-modal');
const careerTimeline = document.querySelector('#career-timeline');

const showRolesError = () => {
	const item = document.createElement('li');
	item.className = 'career-timeline__status';

	const link = document.createElement('a');
	link.className = 'text-link';
	link.href = 'main-page.html#experience';
	link.textContent = 'see Experience on the portfolio page';

	item.append('Career history couldn’t load. Close and try again, or ', link, '.');
	careerTimeline.replaceChildren(item);
};

const loadRoles = async () => {
	try {
		careerTimeline.replaceChildren(...(await fetchRoles()).map(createRoleItem));
		return true;
	} catch (error) {
		showRolesError();
		console.error(error);
		return false;
	}
};

if (roleTrigger && careerModal?.showModal && careerTimeline) {
	let rolesLoaded = false;

	roleTrigger.addEventListener('click', async (event) => {
		event.preventDefault();

		if (careerModal.open) {
			return;
		}

		careerModal.showModal();
		document.body.style.overflow = 'hidden';

		// A failed load is retried on the next open.
		if (!rolesLoaded) {
			rolesLoaded = await loadRoles();
		}
	});

	careerModal.addEventListener('close', () => {
		document.body.style.overflow = '';
		roleTrigger.focus();
	});

	careerModal.querySelector('.career-modal__close').addEventListener('click', () => careerModal.close());

	// A click on the dialog element itself is a click on the backdrop, outside the window.
	careerModal.addEventListener('click', (event) => {
		if (event.target === careerModal) {
			careerModal.close();
		}
	});
}
