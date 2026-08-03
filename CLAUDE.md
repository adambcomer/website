# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this
repository.

## Overview

Adam Comer's personal website (adambcomer.com), a static site built with [Hugo](https://gohugo.io/)
and styled with Tailwind CSS v4. Content includes a home page, a blog (with a multi-part "Build a
Simple Database" series), photography albums, and healthcare-data reference pages.

## Commands

- `make install` — install npm dependencies
- `make dev` — run the Hugo dev server with live reload
- `make build` — production build (`hugo --minify`) into `public/`
- `make serve` — build, then serve `public/` with `npx serve`
- `make clean` — remove `public/` and `resources/` (Hugo's generated asset cache)
- `npm run format` — format the codebase with `oxfmt` (config in `.oxfmtrc.json`: no semicolons,
  single quotes, no trailing commas, prose-wrap always); no `make` target for this

There is no test suite or linter beyond `oxfmt` formatting.

## Architecture

**Styling pipeline**: `assets/main.css` is the single Tailwind entrypoint (`@import 'tailwindcss'`),
which pulls in the custom Material Design 3 theme from `assets/material/` (`tokens.css`,
`colors.module.css`, `typography.module.css`, `theme.light.css`, `theme.dark.css`). Tailwind content
scanning covers `./**/*.html` (all layout templates). CSS is compiled in `layouts/partials/css.html`
via Hugo's `css.TailwindCSS` pipe and inlined into `<head>` through a `templates.Defer` block in
`layouts/partials/head.html` — there is no separate compiled CSS file shipped. Class names like
`surface`, `on-surface-text`, `primary-text`, `secondary-container`, `display-large`,
`headline-small`, `title-large`, `body-large`, `label-large` are custom Material Design 3
tokens/typography utilities defined in the `material/*.css` files, not stock Tailwind classes.

**Content-type-driven layouts**: Hugo selects layouts by content section and an explicit `layout:`
front matter key, not by convention alone. Each content section under `content/` has a matching
directory under `layouts/`:

- `content/blog/*.md` → `layouts/blog/post.html` (front matter: `layout: post`, `author`,
  `createDate`, `updateDate`, `image`, `imageAlt`, `canonical`)
- `content/blog/simple-database/*` → `layouts/blog/simple-database/section.html` for the series
  index (front matter: `layout: simple-database`), individual posts still use
  `layouts/blog/post.html`
- `content/photography/**/_index.md` (year/month sections) → `layouts/photography/year.html` /
  `section.html`; leaf albums use `layouts/photography/album.html`, which reads a `photos` JSON
  resource (see below) rather than page bundle images
- `content/healthcare-data/*` → `layouts/healthcare-data/npi.html` / `section.html`
- Root pages (`experience.md`, `projects.md`, `_index.md`, `404.md`) map to `layouts/page/*.html`

**Photography albums**: each album under `assets/photography/<year>/<month>/photos.json` is a JSON
array of pre-generated `<picture>` source sets (srcset per image type, dimensions, alt/caption text)
that `layouts/photography/album.html` unmarshals and renders directly — photos are not processed
through Hugo image pipelines at build time the way blog cover images are.

**Head/meta partials**: `layouts/partials/head.html` is the general `<head>` (OpenGraph, JSON-LD
Person schema, Google Fonts, CSS). Blog posts and albums use their own head variants
(`blog-post-head.html`, `album-head.html`) for content-specific meta tags — check these when adding
new content types instead of assuming `head.html` covers everything.

**Images**: Hugo's image processing (`resources.Get` + `.Fill`/`.Resize`) is used for portrait and
blog cover images throughout layouts, generating resized/cropped variants cached under
`resources/_gen/`. `resources/` and `public/` are gitignored build artifacts — never hand-edit files
there.

**Blog content typography**: prose rendering (headings, paragraphs, lists, code blocks, images)
inside blog `.Content` is styled via `.blog-content` rules in `assets/main.css`, not Tailwind's
typography plugin.
