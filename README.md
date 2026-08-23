# Flavr

AI-powered recipe generator — turn what's already in your kitchen into a recipe worth cooking. Built with Next.js, Supabase, and the Anthropic Claude API.

## Why this exists

Most recipe apps assume you already know what you want to cook and make you search for it. Flavr works the other way: tell it what you have on hand, your dietary constraints, and how much time you've got, and it generates a recipe that actually fits — instead of forty recipes you'd need to shop for first.

This is the current, actively developed version of Flavr (v2). It replaces two earlier prototypes:
- [`flavr.`](https://github.com/GeraldBonsu/flavr.) — the original consumer MVP (React + Vite + Firebase)
- [`flavr-website`](https://github.com/GeraldBonsu/flavr-website) — the marketing site and investor deck

## Tech stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Supabase (auth + database)
- Anthropic Claude SDK for recipe generation
- Stripe for payments
- Tailwind CSS 4
- next-intl for i18n
- Sentry for error tracking

## Getting started

```bash
npm install
npm run dev
```

Requires Supabase, Anthropic, and Stripe API keys as environment variables (see `.env.local` / ask the maintainer for a template).
