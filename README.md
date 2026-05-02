# Rudi Press

An independent zine publication website built with [Astro](https://astro.build), [Tailwind CSS 4](https://tailwindcss.com), and [daisyUI 5](https://daisyui.com).

## Tech Stack

- **Astro** - Static site generator
- **Tailwind CSS 4** - Utility-first CSS framework
- **daisyUI 5** - Component library for Tailwind
- **Cloudflare Pages** - Hosting platform

## Getting Started

### Prerequisites

- Node.js 22.12.0 or higher

### Installation

```bash
npm install
```

### Development

```bash
npx wrangler dev
```

This starts a local dev server at `http://localhost:8787`.

### Build

```bash
npm run build
```

This builds the site to `./dist/`.

### Deploy to Cloudflare Pages

```bash
npm run build && npx wrangler deploy
```

## Project Structure

```
src/
├── assets/           # Static assets
│   ├── zines/       # Zine cover images
│   ├── rudi-logo.png
│   └── rudi-title.png
├── components/     # Astro components
│   ├── LandingPage.astro
│   └── ZineCard.astro
├── data/            # Data files
│   └── zines.csv    # Zine data (title, image, author, etc.)
├── layouts/         # Page layouts
│   └── BaseLayout.astro
├── lib/             # Utility functions
│   └── csv.ts       # CSV parser
├── pages/           # Astro pages
│   └── index.astro
├── site-config.ts   # Site metadata (name, description, etc.)
└── types.ts         # TypeScript type definitions
```

## Adding/Editing Zines

Zines are stored in `src/data/zines.csv`. To add or edit a zine, update the CSV file with:

| Column | Required | Description |
|--------|----------|-------------|
| title | Yes | Zine title |
| imageFilename | Yes | Image filename from `src/assets/zines/` (without extension) |
| author | No | Author name |
| description | No | Zine description |
| uploadDate | No | Upload date |

Image files should be placed in `src/assets/zines/` with common extensions (.png, .jpg, .jpeg, .webp).

## Configuration

Site-wide configuration is in `src/site-config.ts`:
- Site name and description
- URL
- Social media handles
- OG image

## License

MIT