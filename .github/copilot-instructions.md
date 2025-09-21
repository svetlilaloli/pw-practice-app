<!-- .github/copilot-instructions.md - Guidance for AI coding agents working on pw-practice-app -->
# pw-practice-app — Copilot instructions (concise)

Purpose: quickly orient an AI coding agent to this Playwright + Angular practice app so suggestions and edits match project conventions.

- Project snapshot: lightweight fork of akveo/ngx-admin used for Playwright UI automation practice. See `README.md`.

- Big picture architecture:
  - **Frontend**: Angular v14 app under `src/` (entry `src/main.ts`, module `src/app/app.module.ts`). UI uses Nebular and ngx-charts. Key UI pages live in `src/app/pages/`.
  - **Tests**: Playwright tests live in `tests/` and use `@playwright/test` fixtures extended by `test-options.ts`.
  - **Page objects**: reusable page abstractions live in `page-objects/` (e.g. `pageManager.ts`, `formLayoutsPage.ts`, `datepickerPage.ts`). Tests construct `new PageManager(page)` or use the `pageManager` fixture.
  - **Scripts & tooling**: `package.json` contains dev scripts; `playwright.config.ts` defines projects, reporter integrations (Argos, json/junit/html), and a `webServer` that runs `npm run start` (Angular dev server).

- Workflows & commands (Windows PowerShell examples):
  - Start dev server (for running Playwright with `webServer`):
    ```powershell
    npm run start
    ```
  - Run Playwright tests (chromium project defined in `playwright.config.ts`):
    ```powershell
    npx playwright test --project=chromium
    ```
  - Run specific test file (examples in `package.json`):
    ```powershell
    npx playwright test tests\usePageObjects.spec.ts --project=chromium
    ```
  - Run a single test/debug with trace/screenshots enabled via `playwright.config.ts` settings (use `--debug` or `--headed` as needed):
    ```powershell
    npx playwright test -g "navigate to form page" --project=chromium --headed
    ```

- Project-specific patterns and conventions:
  - Tests prefer Playwright "user-facing locators" (e.g. `getByRole`, `getByLabel`, `getByText`) over XPath; see `tests/firstTest.spec.ts`.
  - Page objects are grouped under `page-objects/`. The `PageManager` class composes page objects and exposes `navigateTo()`, `onFormLayoutsPage()`, etc. Use `new PageManager(page)` in quick tests or prefer the `pageManager` fixture defined in `test-options.ts` for cleaner fixture-based tests.
  - `test-options.ts` extends Playwright fixtures: `formLayoutsPage` does navigation setup; `pageManager` depends on that. If editing or adding fixtures, follow the same extend pattern.
  - Environment variants are selected via env vars read in `playwright.config.ts` (`DEV`, `STAGING`, `CI`). Base URL selection logic is in that file.
  - Reporters: Argos integration used for visual testing (`@argos-ci/playwright`), JSON/JUnit/HTML outputs are written to `test-results/` (check `playwright.config.ts`). Keep reporter config in sync if you add/remove reporters.
  - Screenshots and artifacts are stored under `screenshots/` and `playwright-report/` (playwright default). Tests sometimes use `page.screenshot()` and `argosScreenshot(page, label)`.

- Examples to follow when modifying tests or page objects:
  - Add a new page object: follow the pattern in `page-objects/formLayoutsPage.ts` (constructor(page), helper methods returning `Locator` or performing actions). Wire it into `PageManager` and update `page-objects/pageManager.ts`.
  - Add fixture that navigates to a page: mimic `formLayoutsPage` in `test-options.ts` (navigate before test, call `use(...)`, clean up after `use`).
  - When changing `playwright.config.ts`, preserve the `webServer` block and reporter entries unless intentionally changing CI behavior.

- Integration points & external dependencies to be mindful of:
  - Argos visual testing (`@argos-ci/playwright`) — used conditionally by `process.env.CI`. Don't remove without updating CI pipeline.
  - Environment variables: `DEV`, `STAGING`, `CI`, `USERNAME`, `PASSWORD` are read by tests/config. Use `dotenv` for local env when adding secrets.
  - The Angular dev server runs on `http://localhost:4200` by default — Playwright `webServer` expects `npm run start` to open that URL.

- Quick file references (examples):
  - `playwright.config.ts` — projects, reporters, baseURL logic, `webServer`.
  - `test-options.ts` — custom Playwright fixture definitions (`pageManager`).
  - `page-objects/pageManager.ts` — how page objects are composed and exposed.
  - `tests/*.spec.ts` — examples of locators, fixtures usage, Argos screenshots.

- When making code changes, follow these small rules:
  - Keep page-object methods synchronous in naming (use verbs) and accept `page` only via constructor. See `PageManager` and `helperBase.ts`.
  - Update `screenshots/` or `test-results/` only via tests; do not check large binary diffs into PRs.
  - If adding new npm scripts, mirror the `pageObjects-chrome` naming style in `package.json`.

If something above is unclear or you want an expanded section (e.g., CI pipeline, Argos usage, or a walkthrough adding a new page object + test), tell me which area to expand and I'll update this file.
