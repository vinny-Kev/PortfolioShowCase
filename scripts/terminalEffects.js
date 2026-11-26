// Terminal effects: typewriter with box cursor for the hero. Hover effects are CSS only (glow and underline sweep).
// Respects prefers-reduced-motion and accessibility standards.
(() => {
	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

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

	// ── Initial Hero Typing on Page Load ──
	window.addEventListener('DOMContentLoaded', () => {
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
