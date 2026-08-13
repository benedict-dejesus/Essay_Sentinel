# Static Web Architecture

Essay Sentinel’s GitHub Pages version is a **browser-only, mobile-first web application**. The marker engine, appearance preference, rule sets, review history, statistics, and revision guidance run in the visitor’s browser. The app stores reviews, assignment profiles, and appearance settings in browser local storage; GitHub Pages receives no review data.

## Browser-Only Features

| Feature | Static web behavior |
| --- | --- |
| Essay analysis | Runs locally through fixed, visible deterministic rules. |
| Rule sets and saved reviews | Stored in the browser’s local storage for that browser profile. |
| DOCX import | Document bytes are read in the browser and extracted locally. PDF submissions should be pasted as text so the static site does not rely on an uploaded or server-side PDF parser. |
| Appearance preference | Stored locally and applied immediately at launch. |
| Hosting | Exported as static files and served from GitHub Pages. |

## Removed Runtime Dependencies

The GitHub Pages build does not rely on the project server, database, authentication endpoints, tRPC API, or document upload endpoint. These services cannot be required for a static Pages site. The retained UI does not send essay text to a server.

## Routing and Deployment

The web export uses a single-page application output so saved review routes can be handled in the browser. The GitHub Pages workflow writes a `404.html` copy of the export entry point for direct route refreshes. During a repository Pages deployment, the workflow supplies the repository name as the Expo Router base URL so assets and links resolve from `https://<owner>.github.io/<repository>/`.

## Privacy Boundary

> Essay Sentinel remains an educator review aid, not an authorship classifier. Browser-local processing and storage do not make marker findings definitive; assignment context and educator judgment remain required.
