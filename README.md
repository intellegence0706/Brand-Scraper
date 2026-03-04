Brand Scraper

Paste in a URL, get back the logo, colors, and fonts. That's it.

I built this because I kept manually inspecting stylesheets to pull brand assets for design work. Got tired of it, so now there's this.

How it works

1. You give it a URL
2. It scrapes the page HTML + external CSS via [Spider.cloud](https://spider.cloud)
3. It parses everything to find the logo, color palette, and font stack
4. Results show up progressively — logo first, then colors, then fonts

The extraction isn't perfect (no scraper is), but it does a decent job on most sites. It categorizes colors into primary, secondary, accent, and background based on brightness/saturation heuristics, and picks up fonts from `@font-face` rules, inline styles, and Google Fonts links.

Setup

You'll need Node.js 18+ and a Spider.cloud API key.

```bash
cp .env.local.example .env.local

npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

 Limitations

- Jobs live in memory only. Restart the server and they're gone.
- The "business type" selector on the homepage doesn't actually change extraction behavior yet. It's there for a future update.
- Color detection works best on sites that use CSS variables or straightforward stylesheets. Heavily JS-rendered sites with CSS-in-JS can be hit or miss.
- External CSS fetching is capped at 5 files and 500KB each, so massive stylesheets might get truncated.

Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- [css-tree](https://github.com/csstree/csstree) for parsing CSS
- Spider.cloud API for scraping
