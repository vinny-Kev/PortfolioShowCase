# Portfolio Refresh Notes (March 2026)

## What was implemented

### Mobile + UI refresh
- Added a mobile-first bento-style layout for `main-page.html` cards.
- Reworked responsive behavior for banners, cards, project controls, and CLI window.
- Updated theme token palette for a cleaner professional dark cyber-tech feel.
- Replaced emoji-heavy control labels with clean text labels.

### Faux CLI and startup flow
- Boot now starts in faux CLI mode on `main-page.html` (`boot-cli-only`).
- Added `open` command in CLI onboarding to reveal main portfolio UI.
- Auto-opens onboarding guide on page load.
- Added CLI minimize button and improved close/minimize stability.

### Faux OS app additions (`index.html`)
- Added working Calculator app (`scripts/modules/calculator.js`).
- Added File Explorer app with project links (`scripts/modules/fileExplorer.js`).
- Added taskbar icons/buttons for new apps.
- Cleaned terminal logic and scoped controls in `scripts/modules/terminal.js`.

### Performance + CLS
- Switched CSS links to preload + onload pattern with noscript fallback.
- Added image dimensions and lazy loading/decoding hints.
- Added `content-visibility` and `contain-intrinsic-size` for cards.

## Manual verification checklist
- Desktop: open `index.html` and verify Terminal, Notepad, Calculator, File Explorer open/close.
- Desktop: run `kevin --about` in faux terminal and confirm modal navigation to `main-page.html`.
- Main page: on load, faux CLI is visible and content hidden until `open` command.
- Main page: theme toggle updates labels and colors consistently.
- Mobile widths (360 / 375 / 412): confirm no horizontal scrolling and bento collapses cleanly.
- Check project panel button no longer follows scroll.
- Confirm no major CLS while images/assets load.
