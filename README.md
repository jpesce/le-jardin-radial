<p align="center">
  <img height="167" src="docs/logo-le-jardin-radial.gif" alt="Le Jardin Radial"/>
</p>

<p align="center">
  <b>LE JARDIN RADIAL</b> translates gardens into radial graphics that reveal, throughout the year, blooming cycles and their color patterns. Each visual composition anticipates the garden's unfolding over time, articulating botany and design into a sensitive and strategic reading, making the temporal and living dimension of the landscape visible.
</p>

<p align="center">
  <img width="100%" src="docs/screenshot.png" alt="Screenshot"/>
</p>

## Features

- 🌸 Radial chart showing when each flower blooms throughout the year
- 🌷 24 flowers spanning all seasons with unique bloom colors
- ✏️ Show, hide, and reorder flowers on the chart
- 🏷️ Flower names along each ring and details on hover
- 🌿 Create your own flowers with custom bloom schedules
- 📋 Choose which flowers to work with from the catalog
- 🔗 Share your garden with a link or save it as a file
- 👁️ Preview shared gardens before saving them
- 🌍 Available in French and English
- 👤 Personalize with your name — each name gets unique colors
- ✨ Smooth animations throughout

## Getting started

Prerequisites: [Node.js](https://nodejs.org/) (v18+) and [pnpm](https://pnpm.io/)

```bash
pnpm install
pnpm dev
```

## Tech stack

- **Vite** — dev server and build
- **React** — UI
- **D3.js** — radial chart
- **Framer Motion** — animations
- **Lucide** — icons
- **lz-string** — URL sharing via compressed state

## Testing

```bash
pnpm test          # unit tests (vitest)
pnpm test:e2e      # functional + visual regression tests (playwright)
```

To update visual regression baselines after intentional UI changes:

```bash
pnpm exec playwright test e2e/visual.spec.js --update-snapshots
```

## Credits

Cultivated 🪴 with love by Tainah Drummond 👩‍🌾, in collaboration with João Pesce 👨‍💻 and Chandra Drummond 👩‍🎨, rooted in France 🇫🇷 and Brazil 🇧🇷.
