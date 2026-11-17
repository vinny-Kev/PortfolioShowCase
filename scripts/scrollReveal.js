// Scroll-driven reveal animations and progress indicator.
// Reveals fire once per element. Respects prefers-reduced-motion and mobile tab layout.
(() => {
	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
	const mobile = window.matchMedia('(max-width: 640px)');

	// ── Scroll progress bar ──
	const progressBar = document.querySelector('.scroll-progress');

	if (progressBar) {
		const updateProgress = () => {
			const max = document.documentElement.scrollHeight - window.innerHeight;
			progressBar.style.width = max > 0
				? `${Math.min((window.scrollY / max) * 100, 100)}%`
				: '0%';
		};

		window.addEventListener('scroll', updateProgress, { passive: true });
		window.addEventListener('resize', updateProgress, { passive: true });
		updateProgress();
	}

	// ── Scroll reveal ──
	const shouldSkip = () => reducedMotion.matches || mobile.matches;

	const revealAll = () => {
		document.querySelectorAll('[data-reveal]:not(.revealed)').forEach((el) => el.classList.add('revealed'));
		document.querySelectorAll('.initiative-card:not(.revealed), .career-timeline__item:not(.revealed)').forEach((el) => el.classList.add('revealed'));
	};

	if (shouldSkip() || !('IntersectionObserver' in window)) {
		revealAll();
		return;
	}

	document.documentElement.classList.add('js-scroll-reveal');

	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add('revealed');
				observer.unobserve(entry.target);
			}
		});
	}, { threshold: 0.06, rootMargin: '0px 0px -50px 0px' });

	// Observe static sections with [data-reveal].
	if (!shouldSkip()) {
		document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));
	}

	// Watch for dynamically added initiative cards and timeline items.
	const watchContainer = (containerSelector, childSelector) => {
		const container = document.querySelector(containerSelector);
		if (!container) return;

		const observeElements = () => {
			container.querySelectorAll(`${childSelector}:not([data-observed])`).forEach((el, i) => {
				el.setAttribute('data-observed', '');

				if (shouldSkip()) {
					el.classList.add('revealed');
				} else {
					el.style.transitionDelay = `${i * 120}ms`;
					observer.observe(el);
				}
			});
		};

		observeElements();
		new MutationObserver(observeElements).observe(container, { childList: true });
	};

	watchContainer('#initiatives-list', '.initiative-card');
	watchContainer('#experience-list', '.career-timeline__item');

	// Handle viewport or motion-preference changes.
	mobile.addEventListener('change', () => { if (mobile.matches) revealAll(); });
	reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) revealAll(); });
})();
