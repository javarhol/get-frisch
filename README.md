# Swim Acworth

Real-time water temperature for Lake Acworth, Georgia.

**[swimacworth.netlify.app](https://swimacworth.netlify.app)**

[![Donate via Venmo](https://img.shields.io/badge/Donate-Venmo-blue?style=for-the-badge&logo=venmo&logoColor=white)](https://venmo.com/u/JustinVarholick)

---

Swim Acworth pulls live water temperature from a USGS monitoring station and displays it with color-coded themes and swim-condition advice — from "Too cold to swim" to "Great conditions. Get in."

## Tech Stack

- **React** + **Vite**
- **Netlify Functions** (serverless proxy to USGS)
- **USGS Water Services API** — Station 02394000

## Local Development

```bash
npm install
npm run dev
```

To test the serverless function locally, install the [Netlify CLI](https://docs.netlify.com/cli/get-started/):

```bash
npx netlify dev
```
