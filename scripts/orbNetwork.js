// Liquid orb network behind the page. Only exists on desktop widths: below that no canvas,
// context, or animation frame is ever created, and resizing down releases all of them.
const orbDesktopQuery = window.matchMedia('(min-width: 769px)');
const orbReducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

const orbColors = ['63, 163, 122', '92, 194, 147', '120, 214, 190'];
const orbAreaPerOrb = 38000;
const orbMinCount = 16;
const orbMaxCount = 44;
const orbLinkDistance = 190;
const orbLinkOpacity = 0.35;
const orbSpriteSize = 128;
const orbMaxPixelRatio = 1.5;

let orbCanvas = null;
let orbContext = null;
let orbSprites = [];
let orbs = [];
let orbFrame = null;
let orbLastTime = 0;
let orbWidth = 0;
let orbHeight = 0;

// Glows are painted once and stamped each frame, which is far cheaper than shadowBlur.
const createOrbSprite = (color) => {
	const sprite = document.createElement('canvas');
	sprite.width = orbSpriteSize;
	sprite.height = orbSpriteSize;

	const center = orbSpriteSize / 2;
	const context = sprite.getContext('2d');
	const glow = context.createRadialGradient(center, center, 0, center, center, center);
	glow.addColorStop(0, `rgba(${color}, 0.42)`);
	glow.addColorStop(0.36, `rgba(${color}, 0.34)`);
	glow.addColorStop(0.52, `rgba(${color}, 0.14)`);
	glow.addColorStop(1, `rgba(${color}, 0)`);
	context.fillStyle = glow;
	context.fillRect(0, 0, orbSpriteSize, orbSpriteSize);
	return sprite;
};

const createOrb = () => {
	// Most orbs are small and crisp; a few large, faint ones sit further back.
	const depth = Math.random() ** 2;
	const direction = Math.random() * Math.PI * 2;
	const speed = 5 + (1 - depth) * 11;

	return {
		x: Math.random() * orbWidth,
		y: Math.random() * orbHeight,
		driftX: Math.cos(direction) * speed,
		driftY: Math.sin(direction) * speed,
		swayRadius: 6 + Math.random() * 12,
		swaySpeed: 0.1 + Math.random() * 0.25,
		swayPhase: Math.random() * Math.PI * 2,
		size: 26 + depth * 150,
		opacity: 0.7 - depth * 0.45,
		sprite: Math.floor(Math.random() * orbColors.length)
	};
};

const resizeOrbCanvas = () => {
	const pixelRatio = Math.min(window.devicePixelRatio || 1, orbMaxPixelRatio);
	orbWidth = window.innerWidth;
	orbHeight = window.innerHeight;
	orbCanvas.width = Math.round(orbWidth * pixelRatio);
	orbCanvas.height = Math.round(orbHeight * pixelRatio);
	orbContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

	const count = Math.round(orbWidth * orbHeight / orbAreaPerOrb);
	const target = Math.min(orbMaxCount, Math.max(orbMinCount, count));
	orbs.length = Math.min(orbs.length, target);

	while (orbs.length < target) {
		orbs.push(createOrb());
	}
};

const moveOrbs = (seconds) => {
	orbs.forEach((orb) => {
		orb.swayPhase += orb.swaySpeed * seconds;
		orb.x += (orb.driftX + Math.cos(orb.swayPhase) * orb.swayRadius) * seconds;
		orb.y += (orb.driftY + Math.sin(orb.swayPhase * 1.3) * orb.swayRadius) * seconds;

		const margin = orb.size / 2;
		if (orb.x < -margin) orb.x = orbWidth + margin;
		if (orb.x > orbWidth + margin) orb.x = -margin;
		if (orb.y < -margin) orb.y = orbHeight + margin;
		if (orb.y > orbHeight + margin) orb.y = -margin;
	});
};

// At most 44 orbs means under 1,000 squared-distance checks a frame, so a spatial grid would
// cost more than it saves. Strength falls to zero at the threshold, so links fade in and out.
const drawOrbLinks = () => {
	const maxDistance = orbLinkDistance ** 2;
	orbContext.lineWidth = 0.8;

	for (let first = 0; first < orbs.length; first += 1) {
		for (let second = first + 1; second < orbs.length; second += 1) {
			const deltaX = orbs[first].x - orbs[second].x;
			const deltaY = orbs[first].y - orbs[second].y;
			const distance = deltaX * deltaX + deltaY * deltaY;

			if (distance < maxDistance) {
				const strength = 1 - Math.sqrt(distance) / orbLinkDistance;
				orbContext.strokeStyle = `rgba(${orbColors[0]}, ${strength * strength * orbLinkOpacity})`;
				orbContext.beginPath();
				orbContext.moveTo(orbs[first].x, orbs[first].y);
				orbContext.lineTo(orbs[second].x, orbs[second].y);
				orbContext.stroke();
			}
		}
	}
};

const drawOrbs = () => {
	orbContext.clearRect(0, 0, orbWidth, orbHeight);
	drawOrbLinks();

	orbs.forEach((orb) => {
		orbContext.globalAlpha = orb.opacity;
		orbContext.drawImage(orbSprites[orb.sprite], orb.x - orb.size / 2, orb.y - orb.size / 2, orb.size, orb.size);
	});
	orbContext.globalAlpha = 1;
};

const animateOrbs = (time) => {
	// A long gap means the tab was throttled; never let orbs jump across the screen.
	moveOrbs(Math.min((time - orbLastTime) / 1000, 0.05));
	orbLastTime = time;
	drawOrbs();
	orbFrame = requestAnimationFrame(animateOrbs);
};

const stopOrbLoop = () => {
	if (orbFrame !== null) {
		cancelAnimationFrame(orbFrame);
		orbFrame = null;
	}
};

const startOrbLoop = () => {
	if (orbFrame !== null || document.hidden || orbReducedMotionQuery.matches) {
		return;
	}

	orbLastTime = performance.now();
	orbFrame = requestAnimationFrame(animateOrbs);
};

const handleOrbVisibility = () => {
	if (document.hidden) {
		stopOrbLoop();
	} else {
		startOrbLoop();
	}
};

const handleOrbResize = () => {
	resizeOrbCanvas();
	drawOrbs();
};

const mountOrbNetwork = () => {
	orbCanvas = document.createElement('canvas');
	orbCanvas.className = 'orb-network';
	orbCanvas.setAttribute('aria-hidden', 'true');
	orbContext = orbCanvas.getContext('2d');
	orbSprites = orbColors.map(createOrbSprite);
	document.body.prepend(orbCanvas);

	handleOrbResize();
	window.addEventListener('resize', handleOrbResize);
	document.addEventListener('visibilitychange', handleOrbVisibility);
	startOrbLoop();
};

const unmountOrbNetwork = () => {
	stopOrbLoop();
	window.removeEventListener('resize', handleOrbResize);
	document.removeEventListener('visibilitychange', handleOrbVisibility);
	orbCanvas.remove();
	orbCanvas = null;
	orbContext = null;
	orbSprites = [];
	orbs = [];
};

const syncOrbNetwork = () => {
	if (orbDesktopQuery.matches && !orbCanvas) {
		mountOrbNetwork();
	} else if (!orbDesktopQuery.matches && orbCanvas) {
		unmountOrbNetwork();
	}
};

const syncOrbMotion = () => {
	if (!orbCanvas) {
		return;
	}

	if (orbReducedMotionQuery.matches) {
		stopOrbLoop();
		drawOrbs();
	} else {
		startOrbLoop();
	}
};

orbDesktopQuery.addEventListener('change', syncOrbNetwork);
orbReducedMotionQuery.addEventListener('change', syncOrbMotion);
syncOrbNetwork();
