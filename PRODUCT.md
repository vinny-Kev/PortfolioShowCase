# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Recruiters and hiring engineers evaluating Kevin Roy V. Maglaqui for backend and infrastructure roles, in the Philippines and remote. They arrive from a résumé, LinkedIn or GitHub link, often skimming between candidates, and need to decide quickly whether to interview him.

## Product Purpose

A personal portfolio at kevinroymaglaqui.is-a.dev that earns the interview. Success means a visitor understands within seconds that Kevin is a software engineer who builds real systems, finds the evidence without digging, and contacts him by email or downloads the résumé.

## Positioning

Founder-engineer. Kevin builds and ships systems on his own: he is founder and technical lead of Bean, and he created Tangerine. He also works as a software engineer on a payments backend. The lead story is the builder; employment is supporting credibility, not the headline.

Headline: "Software Engineer | Backend & Infrastructure | ML Engineer". Not presented as DevOps-only, and not as a fresh graduate.

## Operating Context

- Two pages: `index.html` (business card with career timeline) and `main-page.html` (initiatives, experience, contact). The mobile app layout applies below 641px.
- Content lives in `data/roles.json` and `data/initiatives.json`, rendered by `scripts/roles.js` and `scripts/portfolio.js`. `node scripts/check-data.js` validates the data before pushing.
- The résumé PDF at `assets/Kevin Maglaqui Resume.pdf` must state the same facts as the site.
- Hosted as a static site on the is-a.dev subdomain (`CNAME`).

## Capabilities and Constraints

- Static HTML, CSS and vanilla JavaScript, with no build step or framework. The site must work and stay readable without JavaScript.
- Employer confidentiality (Paynamics Technologies Inc.): no internal product, module, client or endpoint names, no architecture, and no vulnerability specifics.
- Official job titles appear exactly: "Junior Software Engineer" (Paynamics, Jul 2026 to present) and "Software / IT Support Engineer Intern" (Global Transco ICT Solutions, Jan to Jun 2026).
- Claims are evidence-based. Every claim has a source in `career-materials/claim-ledger.md` (kept out of git) or in a public repository.

## Brand Commitments

- Name: Kevin Roy V. Maglaqui (Kevin Roy Maglaqui on the site).
- Bean's company name is "Bean Enterprise Solutions", confirmed 2026-11-11. The product is "Bean Enterprise Management System". The site and résumé currently say "Bean Enterprise System Solutions" and must be corrected.
- The initiative marks (`assets/bean-mark.svg`, `assets/tangerine-mark.svg`, `assets/slu-cca-mark.svg`) and each initiative's own brand colours belong to those products.
- Visual reference: the user named piergorelli.com (Awwwards listing) as inspiration. It is a reference only: do not copy its layout, type, motion or assets.

## Evidence on Hand

- **Paynamics:** a backend module (CRUD endpoints, audit logging, postback sync) and remediation of security-testing findings. The source is private, so there are no screenshots or code.
- **Global Transco:** OTP report generation cut from about 5 minutes to under 1 second; a 3-node Proxmox HA cluster; Lighthouse scores raised from about 30 to 70-100 across 26+ pages.
- **Bean:** public backend repo `github.com/vinny-Kev/bean-backend-public-v1` and the website `bean.enterprises`. The platform is in development toward a pilot.
- **Tangerine:** private source, with a showcase site at `tangerine-showcase.vercel.app`. In development.
- **SLU CCA Ticketing System:** deployed on university servers, with a demo at `slu-cca.vercel.app`. Kevin was the requirements analyst and QA.
- **Absences:** there are no testimonials, user counts, revenue, client logos or production metrics for Bean or Tangerine. Do not fabricate them.

## Product Principles

1. Evidence over adjectives. Show the system and the result, not a claim about skill.
2. The builder leads. Bean and Tangerine prove that Kevin ships independently, and the employment record backs it up.
3. Honest status. In-development work is labelled as such, and private work says it is private.
4. Ten-second legibility. A skimming recruiter gets the positioning, the strongest proof and the contact route without opening anything.
5. Nothing confidential, nothing invented.

## Accessibility & Inclusion

WCAG 2.2 AA: keyboard-operable dialogs and tabs, visible focus, 24px minimum targets, no hover-only triggers, reduced-motion support, and a usable no-JavaScript fallback.
