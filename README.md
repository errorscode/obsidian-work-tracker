markdown
# Obsidian Work Tracker (Heatmap)

This simple Obsidian plugin renders a GitHub-style calendar heatmap showing per-day activity for Markdown files in your vault.

## Features
- Shows work in 3 formats (yearly,montly,weekly)
- Each day is a square; color intensity shows number of modified markdown files that day
- No external servers — data is collected locally from the vault
- a color picker in the settings alongside 

## Build & Install
1. Put the project folder in a development folder on your machine.
2. Install dev tools (rollup + typescript). Example:
   ```bash
   npm install
   ```
3. Build:
   ```bash
   npm run build
   ```
4. Copy the produced plugin folder (with `manifest.json` and `dist/main.js`) into your vault's `.obsidian/plugins/obsidian-work-tracker/` folder.
5. Reload Obsidian, then enable the plugin in Settings → Community plugins.
