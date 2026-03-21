@AGENTS.md

## Project

- **GitHub repo:** https://github.com/dragan-jovanovic-98/courtside-prototype
- **GitHub Pages:** https://dragan-jovanovic-98.github.io/courtside-prototype/
- **Auto-deploys:** Push to `main` triggers GitHub Actions → builds static export → deploys to Pages
- **Static export config:** The GitHub Actions workflow adds `output: 'export'` and `basePath: '/courtside-prototype'` at build time. Local `next.config.ts` does NOT include these so `npm run dev` works normally on localhost.
