# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Multi-tenant **Point of Sale (POS) and E-commerce management system** built with Laravel 12 + React 19 + Inertia.js v2. The app manages sales, inventory, purchasing, financials, and a public product catalog. Business domain uses Spanish terminology (Venta, Compra, Bodega, etc.).

## Commands

```bash
# Start all dev services concurrently (server, queue, logs, Vite)
composer run dev

# Run all tests
php artisan test

# Run a single test file
php artisan test tests/Feature/ExampleTest.php

# Run tests matching a name filter
php artisan test --filter=testName

# Format PHP (run after changes)
vendor/bin/pint --dirty

# Format frontend
npm run format

# Lint frontend
npm run lint

# TypeScript type checking
npm run types

# Build frontend assets
npm run build
```

## Architecture

### Multi-Tenancy
Uses `stancl/tenancy` v3. Central domain handles authentication; tenant-specific databases hold all business data. Tenant routes are in `routes/tenant.php`, central routes in `routes/web.php`. Tenant migrations live in `database/migrations/tenant/`.

### Request Lifecycle
All pages use **Inertia.js** — Laravel controllers call `Inertia::render('PagePath', $props)`, and React components in `resources/js/pages/` receive those props directly. There are no separate API endpoints for page data.

### Backend Layers
- `app/Http/Controllers/` — thin controllers returning Inertia responses
- `app/Http/Requests/` — all validation lives here (Form Request classes, not inline)
- `app/Policies/` — authorization via Spatie/laravel-permission roles
- `app/Services/` — business logic
- `app/Jobs/` — queued operations (implement `ShouldQueue`)
- `app/Models/` — 47+ Eloquent models; use `Model::query()` not `DB::`, eager-load to prevent N+1

### Frontend Structure
- `resources/js/pages/` — Inertia page components (one file per route)
- `resources/js/components/` — reusable UI components (check here before creating new ones)
- `resources/js/layouts/` — page layout wrappers
- `resources/js/Contexts/` — React Context (CartContext for e-commerce)
- `resources/js/hooks/` — custom React hooks
- `resources/js/types/` — TypeScript type definitions
- Path alias `@/*` maps to `resources/js/*`

### Laravel 12 Structure
- No `app/Http/Middleware/` directory — middleware registered in `bootstrap/app.php`
- No `app/Console/Kernel.php` — commands in `app/Console/Commands/` auto-register
- `bootstrap/providers.php` for service providers
- Model casts defined in a `casts()` method, not `$casts` property

## Key Conventions

### PHP
- PHP 8 constructor property promotion in all `__construct()` methods
- Always use explicit return type declarations
- Use curly braces for all control structures
- PHPDoc blocks preferred over inline comments
- Enum keys are TitleCase
- Never use `env()` outside config files; use `config('key')` instead
- Use named routes and `route()` for URL generation

### Frontend
- Use `<Link>` from `@inertiajs/react` for navigation, not `<a>` tags
- Use `router.post/patch/put/delete` for form submissions, not HTML forms
- Tailwind v4: import with `@import "tailwindcss"`, not `@tailwind` directives
- Use gap utilities for spacing between list items, not margins
- Support `dark:` classes when existing components do
- Tailwind v4 opacity: use `bg-black/50` not `bg-opacity-50`

### Testing (Pest)
- All tests written with Pest v3: `php artisan make:test --pest <name>`
- Most tests are feature tests; unit tests only for isolated logic
- Test happy paths, failure paths, and edge cases
- Use `assertForbidden()`, `assertNotFound()` etc. over `assertStatus(403)`
- Use datasets for validation rule tests with repeated data
- Every code change requires a corresponding test

### Database
- Always include all existing column attributes when modifying a column in a migration
- Eager load relationships to prevent N+1 queries
- `Model::query()` preferred; raw `DB::` calls only for complex operations
