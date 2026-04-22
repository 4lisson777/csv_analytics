# csv_analytics

Compare and merge CSV files — single-page client-side tool. No backend.

## Setup

```bash
npm install
npx playwright install chromium   # only needed if you want to run e2e tests
```

## Run the app

The app uses ES modules, so it **must be served over HTTP** (browsers block
`<script type="module">` over the `file://` protocol). Opening `index.html`
directly will fail with CORS errors.

```bash
npm start
```

Then open <http://localhost:3001>.

## Run the tests

```bash
npm test               # runs the full Playwright suite (Chromium)
npm run test:report    # opens the HTML report from the last run
```

The Playwright config auto-starts the static server, so you don't need to
run `npm start` separately when testing.
