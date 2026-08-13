# Replace Existing Repository Files

This archive contains the corrected Essay Sentinel source. It includes browser-safe delete confirmation panels, expanded deterministic polished-writing signals, the GitHub Pages workflow, and the Metro configuration fix required for static export.

## Apply the Update

Extract the archive into the root folder of the existing `Essay_Sentinel` Git repository and allow it to overwrite matching project files. The archive intentionally excludes `node_modules`, `.expo`, `dist`, and `.git`; do not delete the repository’s `.git` folder.

After extracting, open PowerShell in the repository folder and run:

```powershell
git add .
git commit -m "Update delete flows and review signals"
git push
```

The committed `.github/workflows/deploy-pages.yml` workflow triggers the GitHub Pages deployment. The included `metro.config.js` no longer forces NativeWind’s cache file to disk, preventing the earlier `web.css` Metro SHA-1 export failure.

## Important Use Boundary

The added polished-writing signals are review prompts based on visible vocabulary, sequencing, formatting, and structural patterns. They do not determine whether a student used AI or establish academic misconduct.
