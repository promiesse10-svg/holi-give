// server.js
// Express server for HOLI Give (Square Web Payments + static site)
// ESM (package.json: { "type": "module" })

import express from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { Client, Environment } from '@square/square';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// ---------- Config from env ----------
const {
  PORT = 3000,
  NODE_ENV = 'production',
  SQUARE_ENV = 'production', // 'production' or 'sandbox'
  SQUARE_ACCESS_TOKEN,       // required
  SQUARE_LOCATION_ID         // required
} = process.env;

if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) {
  console.warn('[WARN] Missing Square credentials. Set SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID.');
}

// ---------- Square client ----------
const sqClient = new Client({
  environment: SQUARE_ENV === 'production' ? Environment.Production : Environment.Sandbox,
  accessToken: SQUARE_ACCESS_TOKEN
});
const paymentsApi = sqClient.paymentsApi;

// ---------- Middleware ----------
app.set('trust proxy', 1);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// Serve static assets
app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html'],
  setHeaders(res, filePath) {
    // Allow embedding the Web Payments SDK flow iframes/etc.
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Cache static files lightly; HTML no-cache
    if (/\.(css|js|png|jpg|jpeg|gif|svg|ico)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
    } else {
      res.setHeader('Cache-Control', 'no-store');
    }
  }
}));

// Serve .well-known (Apple Pay merchant verification file)
app.use(
  '/.well-known',
  express.static(path.join(__dirname, 'public', '.well-known'), { dotfiles: 'allow' })
);

// Safety net explicit route (no extension)
app.get('/.well-known/apple-developer-merchantid-domain-association', (req, res) => {
  const f = path.join(__dirname, 'public', '.well-known', 'apple-developer-merchantid-domain-association');
  res.type('text/plain');
  res.sendFile(f);
});

// Health check
app.get(['/healthz', '/_health'], (req, res) => res.json({ ok: true, env: SQUARE_ENV }));

// ---------- Helpers ----------
function makeIdem() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ (crypto.randomBytes(1)[0] & (15 >> (c / 4)))).toString(16)
  );
}
function toInt(n) {
  const v = Number(n);
  return Number.isFinite(v) ? Math.trunc(v) : 0;
}

// ---------- Payments endpoint ----------
// Expects JSON: { sourceId, amount, currency, fund, fundLabel, buyerName, buyerEmail }
app.post('/api/pay', async (req, res) => {
  try {
    const {
      sourceId,
      amount,            // in cents (integer) OR dollars (float) — we normalize below
      currency = 'USD',
      fund,
      fundLabel,
      buyerName,
      buyerEmail
    } = req.body || {};

    if (!sourceId) {
      return res.status(400).json({ ok: false, error: 'Missing sourceId from Web Payments SDK' });
    }

    // Normalize amount: if <= 10,000 we assume dollars were sent (e.g., 25.00); if > 100, treat as cents
    let amountCents = 0;
    if (typeof amount === 'number' && Number.isFinite(amount)) {
      amountCents = amount > 1000 ? Math.trunc(amount) : Math.round(amount * 100);
    } else {
      return res.status(400).json({ ok: false, error: 'Invalid amount' });
    }

    if (amountCents < 100 || amountCents > 1_000_000) {
      return res.status(400).json({ ok: false, error: 'Amount out of range (min $1, max $10,000)' });
    }

    const noteParts = [];
    if (fundLabel) noteParts.push(`Fund: ${fundLabel}`);
    if (buyerName) noteParts.push(`Donor: ${buyerName}`);
    const note = noteParts.join(' • ') || 'HOLI Gift';

    const idem = makeIdem();

    const createReq = {
      idempotencyKey: idem,
      sourceId,                         // token from card/apple/google/cash app etc.
      amountMoney: {
        amount: BigInt(amountCents),    // Square SDK expects BigInt
        currency
      },
      locationId: SQUARE_LOCATION_ID,
      buyerEmailAddress: buyerEmail || undefined,
      note,
      autocomplete: true                // capture immediately
      // Tip: you can also set referenceId, statementDescriptionIdentifier, etc.
    };

    const { result } = await paymentsApi.createPayment(createReq);

    return res.json({
      ok: true,
      payment: {
        id: result?.payment?.id,
        status: result?.payment?.status,
        receiptUrl: result?.payment?.receiptUrl,
        amount: result?.payment?.amountMoney?.amount?.toString(),
        currency: result?.payment?.amountMoney?.currency
      }
    });
  } catch (err) {
    const code = err?.statusCode || 500;
    const msg =
      err?.result?.errors?.[0]?.detail ||
      err?.message ||
      'Payment failed';
    console.error('[Square createPayment error]', msg, err?.result || err);
    return res.status(code).json({ ok: false, error: msg });
  }
});

// ---------- Fallback to index.html ----------
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ---------- Start ----------
app.listen(PORT, () => {
  console.log(
    `[HOLI] Server running on port ${PORT} | Node env: ${NODE_ENV} | Square env: ${SQUARE_ENV} | Location: ${SQUARE_LOCATION_ID}`
  );
});
