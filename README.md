<p align="center">
  <img height="167" src="docs/logo-le-jardin-radial.svg" alt="Le Jardin Radial"/>
</p>

<p align="center">
  <em>A chromatic cartography of the blooming year.</em>
</p>

<p align="center">
  <b>LE JARDIN RADIAL</b> translates gardens into radial graphics that reveal, throughout the year, blooming cycles and their color patterns. Each visual composition anticipates the garden's unfolding over time, articulating botany and design into a sensitive and strategic reading, making the temporal and chromatic dimensions of the landscape visible.
</p>

<p align="center">
  <img width="100%" src="docs/screenshot.webp" alt="Screenshot"/>
</p>

<p align="center">
  <a href="https://jardin.pesce.cc"><strong>Live app</strong></a> · <a href="https://jardin.pesce.cc/components"><strong>Component library</strong></a>
</p>

## Features

- 🌸 Radial chart visualizing blooming cycles and color patterns across the year
- 🌿 Create custom flowers or choose from the built-in catalog
- ✏️ Toggle and rearrange flowers to compose your garden
- 🖼️ Export your garden as SVG or high-res PNG
- 🔗 Share gardens via link or save as a file
- 🌍 Available in French and English
- 👤 Personalized colors derived from your name

## Credits

Cultivated 🪴 with love by Tainah Drummond 👩‍🌾, in collaboration with João Pesce 👨‍💻 and Chandra Drummond 👩‍🎨, rooted in France 🇫🇷 and Brazil 🇧🇷.

## License

[![CC BY-NC-SA 4.0](https://img.shields.io/badge/license-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

This work is licensed under [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-nc-sa/4.0/).

---

## Development

Prerequisites: [Node.js](https://nodejs.org/) (v22+) and [pnpm](https://pnpm.io/)

```bash
pnpm install
pnpm dev            # app at localhost:5173
pnpm storybook      # components at localhost:6006
pnpm screenshot     # regenerate README screenshot
```

### Tech stack

<p align="center">
  TypeScript · React · Vite · D3.js · Tailwind CSS · Radix UI · Framer Motion · Zustand · Storybook
  <br/>
  <sub>Vitest · Playwright · ESLint · Prettier · Husky · commitlint</sub>
</p>

### Testing & quality

```bash
pnpm test          # unit tests
pnpm test:e2e      # functional, visual regression, and accessibility tests
pnpm lint          # linting
pnpm typecheck     # type checking
```

To update visual regression baselines after intentional UI changes:

```bash
pnpm test:update-snapshots
```
