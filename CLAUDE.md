# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

This is the **Charlottesville Tom Sox** website — a Prospect League summer collegiate baseball team based in Charlottesville, VA. Built and maintained by Brenneis AI.

- **Client:** Charlottesville Tom Sox
- **Platform:** GoHighLevel (GHL)
- **Stack:** Vanilla HTML, CSS, and JavaScript only
- **No build process, no package manager, no dependencies**

## Deployment Workflow

This site lives in GHL. Code is deployed by copy/paste:
- HTML sections are pasted into GHL custom code blocks one section at a time
- CSS is pasted into the individual page's Custom CSS setting in GHL
- JS is pasted into the individual page's footer tracking code in GHL
- There is no global CSS or JS — each page manages its own

## Repository Structure

pages/ — one folder per page, named to match GHL page slug
  section-*.html — one file per HTML code block
  page.css — page-level CSS
  page.js — page-level JS
global/
  header.html
  footer.html
CLAUDE.md

## Conventions

### File Naming
- All files use kebab-case: section-hero.html, page.css
- Page folders named to match GHL page slugs: home, roster, schedule
- Section files prefixed with section-: section-hero.html, section-sponsors.html

### Code Headers
Every file must begin with a comment header:
<!--
  File: filename.html
  Page: Which GHL page this belongs to
  Section: What this section does
  Last Updated: YYYY-MM-DD
-->

### GHL Notes
- Each section-*.html file = one GHL custom code block
- Keep sections self-contained
- CSS and JS are never embedded in HTML files
- When outputting code ready for GHL, flag clearly: HTML BLOCK / PAGE CSS / PAGE JS

## Claude Code Behavior Instructions

### Non-Negotiable Rules
- Vanilla HTML, CSS, and JS only
- Never embed CSS or JS inside HTML section files
- Always add the comment header to every file
- Never create package.json, node_modules, or any build files

### Quality Check Before Finishing Any Task
- Every file has a comment header
- No inline CSS or JS in HTML files
- CSS is in page.css, JS is in page.js
- Code is clean and ready to paste directly into GHL