# Kindred character list

## Run on your phone (same Wi-Fi)

Run this on the computer hosting the app:

```bash
npm run dev:lan
```

Vite prints a `Network` address such as `http://192.168.1.20:5173`. Open that address on your phone while it is connected to the same Wi-Fi network. If Windows asks, allow Node.js through the **Private networks** firewall.

## Share a temporary public link

With the LAN server running, open a second terminal and run:

```bash
npm run tunnel
```

It prints an HTTPS URL that can be opened from the global web. The link is temporary and works only while both commands keep running. `localtunnel` may ask for a tunnel password, which is the public IP address shown on its page.

## Publish permanently

Build the static site:

```bash
npm run build
```

Upload the generated `dist` directory to any static host, such as GitHub Pages, Cloudflare Pages, Netlify, or Vercel. Use HTTPS in production so the service worker and installable PWA features are enabled.
