// Terminal effects: Text hover scramble, typewriter with box cursor, and scroll typing.
// Respects prefers-reduced-motion and accessibility standards.
(() => {
	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
	const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
	const chars = '01ABCDEF_/#><*!%';

	// ── Typewriter with Box Cursor ──
	const typewriteTerminal = (element, callback, customSpeed) => {
		if (!element || reducedMotion.matches) {
			if (callback) callback();
			return;
		}

		const fullText = element.dataset.fullText || element.textContent.trim();
		element.dataset.fullText = fullText;
		element.textContent = '';

		const cursor = document.createElement('span');
		cursor.className = 'terminal-box-cursor';
		cursor.textContent = '▋';
		cursor.setAttribute('aria-hidden', 'true');
		element.append(cursor);

		let charIndex = 0;
		const len = fullText.length;
		// Fast adaptive step so paragraphs complete in ~350-500ms
		const step = customSpeed || (len > 250 ? 5 : (len > 120 ? 3 : (len > 50 ? 2 : 1)));

		const timer = setInterval(() => {
			charIndex = Math.min(charIndex + step, len);
			element.textContent = fullText.slice(0, charIndex);
			element.append(cursor);

			if (charIndex >= len) {
				clearInterval(timer);
				setTimeout(() => {
					cursor.remove();
					if (callback) callback();
				}, 280);
			}
		}, 18);
	};

	window.typewriteTerminal = typewriteTerminal;

	// ── Text Hover Scramble ──
	const scrambleText = (element) => {
		if (reducedMotion.matches || isTouchDevice || element.dataset.scrambling === 'true') {
			return;
		}

		const original = element.dataset.originalText || element.textContent;
		if (!element.dataset.originalText) {
			element.dataset.originalText = original;
		}

		element.dataset.scrambling = 'true';
		let iteration = 0;
		const totalLength = original.length;

		const interval = setInterval(() => {
			element.textContent = original
				.split('')
				.map((char, index) => {
					if (char === ' ' || char === '\n' || char === '—' || char === '·' || char === '/') return char;
					if (index < iteration) return original[index];
					return chars[Math.floor(Math.random() * chars.length)];
				})
				.join('');

			iteration += Math.max(1, Math.floor(totalLength / 14));

			if (iteration >= totalLength) {
				clearInterval(interval);
				element.textContent = original;
				element.dataset.scrambling = 'false';
			}
		}, 24);
	};

	// Attach hover scramble to interactive and display text
	const attachHoverEffects = () => {
		if (reducedMotion.matches || isTouchDevice) return;

		const selectors = [
			'.section-index',
			'.slogan',
			'h1',
			'h2:not(#initiatives-title):not(#experience-title):not(#contact-title)',
			'.cta-eyebrow',
			'.button-link',
			'.role-trigger',
			'.site-nav a'
		];

		document.querySelectorAll(selectors.join(',')).forEach((el) => {
			if (!el.dataset.hoverReady) {
				el.dataset.hoverReady = 'true';
				el.addEventListener('mouseenter', () => scrambleText(el));
			}
		});

		// Also watch dynamically created initiative headings
		const container = document.querySelector('#initiatives-list');
		if (container) {
			new MutationObserver(() => {
				container.querySelectorAll('h3:not([data-hover-ready])').forEach((el) => {
					el.dataset.hoverReady = 'true';
					el.addEventListener('mouseenter', () => scrambleText(el));
				});
			}).observe(container, { childList: true });
		}
	};

	// ── Initial Hero Typing on Page Load ──
	window.addEventListener('DOMContentLoaded', () => {
		attachHoverEffects();

		if (!reducedMotion.matches) {
			const heroIndex = document.querySelector('.portfolio-header .section-index');
			const slogan = document.querySelector('.portfolio-header .slogan');

			if (heroIndex) {
				typewriteTerminal(heroIndex, () => {
					if (slogan) typewriteTerminal(slogan, null, 1);
				}, 1);
			}
		}
	});
})();
