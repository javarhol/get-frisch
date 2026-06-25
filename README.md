# Get Frisch

Live water temperatures from USGS monitoring stations, with a color-coded swim-condition readout.

**[getfrisch.netlify.app](https://getfrisch.netlify.app)**

[![Donate via Venmo](https://img.shields.io/badge/Donate-Venmo-blue?style=for-the-badge&logo=venmo&logoColor=white)](https://venmo.com/u/JustinVarholick)

---

Get Frisch pulls live water temperature from USGS monitoring stations and displays it with color-coded themes and swim-condition advice — from "Too cold to swim." to "Great conditions. Get in."

Pick any USGS station that reports water temperature; save up to three favorites for one-tap switching.

## Install on Android

Open the site in Chrome on Android. The browser will offer an **Install app** prompt (or use the menu → **Add to Home screen**). The app then launches standalone with its own icon, no browser chrome.

The same install works on Chrome / Edge desktop and on iOS Safari ("Add to Home Screen").

## Tech Stack

- **React** + **Vite**
- **vite-plugin-pwa** — manifest + service worker
- **Netlify Functions** — serverless proxy to USGS
- **USGS Water Services API** — `parameterCd=00010` (water temperature)

## Local Development

```bash
npm install
npm run dev
```

To test the serverless functions locally, install the [Netlify CLI](https://docs.netlify.com/cli/get-started/):

```bash
npx netlify dev
```

## Roadmap

- Bubblewrap-built APK on GitHub Releases (so the app can be installed without the Play Store).
- F-Droid inclusion once the APK build is stable.
