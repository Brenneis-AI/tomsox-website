# Tom Sox Website — Claude Memory

## Project
- Client: Charlottesville Tom Sox (Prospect League summer collegiate baseball)
- Platform: GoHighLevel (GHL)
- Stack: Vanilla HTML, CSS, JS only — no build tools, no dependencies

## GHL Deployment Notes
- HTML sections → pasted into GHL custom code blocks, one section per block
- CSS → pasted into Page CSS setting (no script tags needed)
- JS → pasted into Page Footer Tracking Code — **requires `<script>` tags to function**
- No global CSS or JS — each page is self-contained

## Repository Structure
- `pages/{slug}/section-*.html` — one file per GHL code block
- `pages/{slug}/page.css` — all page CSS
- `pages/{slug}/page.js` — all page JS (wrapped in `<script>` tags for GHL)
- `global/header.html`, `global/footer.html`

## Conventions
- All files require a comment header: File, Page, Section, Last Updated
- No embedded `<style>` or `<script>` in HTML section files
- Brand fonts: Oswald (headings), Arimo (body) — imported once in page.css
- Brand colors: `#84BD00` (green), `#1b365d` (navy)
- CSS variables defined in page.css :root — use them in page.css, raw hex acceptable in HTML

## Home Page Specifics
- `section-countdown.html` and `section-game-ticker.html` are new files split from the old `section-hero.html`
- Schedule, banner, and gallery data all come from the same Google Sheet via CSV export
- `page.js` contains: banner fetch IIFE, TomSoxHomePage (ticker/hero), countdown, gallery IIFE
