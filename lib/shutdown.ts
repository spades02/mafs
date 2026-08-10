/**
 * Global offline / shutdown switch.
 *
 * Set `MAFS_OFFLINE=1` in the Vercel environment to take the whole product
 * offline. `proxy.ts` short-circuits every request with a static 503 *before*
 * any database, auth, or paid-API call happens — which is what makes it safe
 * to run the deployment while the Supabase project is paused. Nothing in the
 * offline path touches Postgres, OpenAI, SportsData, the Odds API, or Resend.
 *
 * To bring MAFS back up: remove the variable (or set it to `0`) and redeploy.
 *
 * NOTE: this value is read into the middleware/proxy bundle at build time, so
 * flipping it in the Vercel dashboard requires a redeploy to take effect.
 */
export const OFFLINE = process.env.MAFS_OFFLINE === "1";

/**
 * The static page served for every request while offline. Deliberately a plain
 * hand-written string with no imports, fonts, or assets: it must render with
 * zero backing services available.
 */
export const OFFLINE_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>MAFS — Temporarily Offline</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100dvh;
    display: grid;
    place-items: center;
    padding: 2rem calc(1.5rem + env(safe-area-inset-left)) 2rem calc(1.5rem + env(safe-area-inset-right));
    background: #0a192f;
    color: #ccd6f6;
    font: 16px/1.6 ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    text-align: center;
    -webkit-font-smoothing: antialiased;
  }
  .card { max-width: 30rem; }
  h1 {
    margin: 0 0 .75rem;
    font-size: clamp(1.5rem, 5vw, 2rem);
    letter-spacing: -.02em;
    color: #e6f1ff;
  }
  .mark {
    display: inline-block;
    margin-bottom: 1.5rem;
    padding: .35rem .85rem;
    border: 1px solid rgba(100,255,218,.35);
    border-radius: 999px;
    font-size: .75rem;
    font-weight: 700;
    letter-spacing: .18em;
    text-transform: uppercase;
    color: #64ffda;
  }
  p { margin: 0 0 1rem; color: #8892b0; }
  p.last { margin-bottom: 0; }
  a { color: #64ffda; }
</style>
</head>
<body>
  <div class="card">
    <div class="mark">MAFS</div>
    <h1>We're temporarily offline</h1>
    <p>MAFS is paused for maintenance. Analyses, simulations, and account access are unavailable right now.</p>
    <p class="last">Existing subscribers: your data is safe and nothing has been deleted. For billing questions, reach out and we'll sort it out.</p>
  </div>
</body>
</html>
`;
