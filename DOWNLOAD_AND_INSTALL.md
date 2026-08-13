# Download and Host Essay Sentinel

The downloaded ZIP is the source project for a **static web application**. It contains the site code, launcher assets, deterministic marker rules, and GitHub Pages workflow; it does not contain a native mobile installer.

To host the app, add the extracted project to your own GitHub repository, enable GitHub Pages through GitHub Actions, and push to `main`. The included workflow exports the `dist` site and deploys it to Pages. For the full process, read [GITHUB_PAGES_DEPLOYMENT.md](./GITHUB_PAGES_DEPLOYMENT.md).

Educators and students can open the resulting Pages URL in a phone or desktop browser. Mobile users can add a browser shortcut to the Home Screen. The existing launcher artwork remains in `assets/images/icon.png` and related asset files, but it is used as site branding rather than a native app launcher package.
