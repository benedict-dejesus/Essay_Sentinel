# Deploy Essay Sentinel to GitHub Pages

## What This Version Is

Essay Sentinel is now a **static browser application**. It is mobile-first, desktop-friendly, and can be hosted from a GitHub repository with GitHub Pages. It has no required backend, database, login service, or document-upload endpoint. Reviews, settings, appearance preferences, and assignment rule sets stay in the visitor’s browser storage.

## Add the Project to Your Repository

Create an empty repository on GitHub, then copy the project files into the repository folder. Keep `.github/workflows/deploy-pages.yml`, `app.config.ts`, `package.json`, `pnpm-lock.yaml`, and the entire `app`, `assets`, `components`, `hooks`, `lib`, and `shared` folders. Commit and push to your repository’s `main` branch.

## Enable GitHub Pages

In the GitHub repository, open **Settings → Pages**. Under **Build and deployment**, choose **GitHub Actions** as the source. The included workflow runs whenever you push to `main`; it installs dependencies, exports the static site, creates a route fallback, and deploys the `dist` output to Pages.

For a repository named `essay-sentinel`, the published URL normally follows this pattern:

```text
https://<your-github-user-or-organization>.github.io/essay-sentinel/
```

The workflow automatically provides the repository path to the web export so assets and client-side routes resolve beneath that URL.

## Test Locally Before Pushing

Use a current Node.js 22 installation with Corepack enabled. From the project folder, run:

```bash
corepack enable
pnpm install --frozen-lockfile
EXPO_PUBLIC_BASE_URL=/essay-sentinel pnpm export:web
npx expo serve
```

Open the local URL shown by the final command. For a different repository name, replace `/essay-sentinel` with that repository’s name. The static output is written to `dist/`; do not edit its generated files directly.

## Use on a Phone

Open the GitHub Pages URL in Safari on iPhone or Chrome on Android. The layout adapts to a phone screen. Browser data such as saved reviews, custom rule sets, and appearance choices is kept separately per browser and device. There is no native installer for this static web version; bookmarking the site or adding it to a device home screen is the appropriate launch method.

## Browser-Only Document Imports

DOCX files are read in the browser for local text extraction. For PDFs, paste the student’s writing into the review form; this keeps the GitHub Pages build lightweight and avoids any document upload or server-side parser. The GitHub Pages site does not submit document contents to an Essay Sentinel server.
