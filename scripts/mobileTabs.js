// On phones the page works like an app: the nav is a bottom tab bar and one section shows at a time.
// On wider screens the CSS ignores data-tab and the nav links scroll as normal anchors.
const tabTitles = { initiatives: 'Initiatives', experience: 'Experience', contact: 'Contact' };
const tabLinks = document.querySelectorAll('.site-nav a');
const tabTitle = document.querySelector('#app-bar-title');
const mobileQuery = window.matchMedia('(max-width: 640px)');

const tabFromHash = () => (location.hash.slice(1) in tabTitles ? location.hash.slice(1) : 'initiatives');

const showTab = (id) => {
	document.body.dataset.tab = id;
	tabTitle.textContent = tabTitles[id];

	tabLinks.forEach((link) => {
		if (mobileQuery.matches && link.hash === `#${id}`) {
			link.setAttribute('aria-current', 'page');
		} else {
			link.removeAttribute('aria-current');
		}
	});
};

tabLinks.forEach((link) => {
	link.addEventListener('click', (event) => {
		if (!mobileQuery.matches) {
			return;
		}

		event.preventDefault();

		if (link.hash !== location.hash) {
			history.pushState(null, '', link.hash);
		}

		showTab(link.hash.slice(1));
		window.scrollTo(0, 0);
	});
});

window.addEventListener('hashchange', () => showTab(tabFromHash()));
mobileQuery.addEventListener('change', () => showTab(tabFromHash()));
showTab(tabFromHash());
