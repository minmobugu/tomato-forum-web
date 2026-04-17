# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

This is a Vue 3 + TypeScript + Vite frontend for a game-sharing community product called 小番茄. The current app is mock-data driven: services in `src/services/` resolve data from `src/mock/`, and Pinia stores coordinate that data for views and shared layout UI.

## Common commands

Run all commands from `tomato-web/`.

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Build production bundle: `npm run build`
- Preview built app: `npm run preview`
- Lint: `npm run lint`
- Run tests once: `npm run test`
- Run a single test file: `npx vitest run src/test/community.spec.ts`
- Run a single test by name: `npx vitest run src/test/community.spec.ts -t "returns fallback post when post id is missing"`

## Tooling and runtime

- Node.js 20+ is required (`package.json`).
- Vite config lives in `vite.config.ts` and defines the `@` alias for `src/`.
- Vitest runs in `jsdom` with globals enabled.
- ESLint uses flat config in `eslint.config.js` for Vue SFCs and TypeScript.

## Architecture

### App shell and routing

- `src/main.ts` creates the app, installs Pinia and Vue Router, and loads global SCSS.
- `src/App.vue` is intentionally thin and renders `src/layouts/MainLayout.vue`.
- `MainLayout` is the persistent app shell: top navigation, search overlay, auth modal, route-aware headings, and top-level event listeners all live there.
- Route views are lazy-loaded in `src/router/index.ts`.
- Auth-gated pages (`messages`, `publish`, `profile`) use router `meta.requiresAuth`; the global `beforeEach` guard opens the auth modal and stores the intended destination instead of navigating.

### Data flow

The codebase follows a simple frontend layering:

1. `src/types/` defines the shared domain models.
2. `src/mock/` contains seeded community and auth data.
3. `src/services/` exposes async APIs over the mock data.
4. `src/stores/` owns app state, derived data, and mutations.
5. `src/views/` and `src/components/` render the UI and call store actions.

When adding new behavior, keep domain shaping in the store layer rather than pushing it down into views.

### State management

- `src/stores/community.ts` is the central content store. It bootstraps homepage data, provides filtered/trending/latest post views, tracks message read state, manages post interactions, loads post detail data, and creates newly published posts in-memory.
- `src/stores/auth.ts` owns session state, auth modal visibility, login mode, submit/loading flags, error messaging, and post-login redirect resumption.
- `src/stores/pinia.ts` exports the singleton Pinia instance so the router guard can access stores outside component setup.

### Views and shared UI

- `src/views/home/HomeView.vue` composes the homepage from store-backed sections: hero, events, channel filters, game spotlights, and post feed.
- `src/views/post/PostDetailView.vue` loads a single post plus shared comments state and reuses the global interaction state for like/favorite buttons.
- `src/views/publish/PublishView.vue` handles draft editing, media object URLs, and hands final publish logic to the community store.
- `src/views/messages/MessagesView.vue` renders topbar message data as a full page and routes users to posts or other destinations.
- `src/views/profile/ProfileView.vue` combines seeded profile data with a subset of the shared post feed.
- `src/components/layout/` contains the topbar panels used by the persistent shell rather than by individual pages.

### Search and auth behavior

- Global search is implemented in `src/layouts/MainLayout.vue`, not in the router or a dedicated page. Search results are derived in-memory from `posts`, `featuredGames`, `feedChannels`, and `profile` already loaded into the community store.
- Login is modal-based. Protected navigation is interrupted by the router guard, then resumed by `authStore.resumeProtectedNavigation()` after successful login.

## Testing notes

- Current test coverage is small and service-focused (`src/test/community.spec.ts`).
- Since services currently wrap mock data, store behavior and route/auth flows are more important regression surfaces than service internals.

## Styling

- Global styles live in `src/assets/styles/main.scss`.
- The app relies heavily on reusable semantic class names (`panel-card`, `page-grid`, `content-stack`, etc.) shared across views and components; check existing patterns before adding page-specific structure.
