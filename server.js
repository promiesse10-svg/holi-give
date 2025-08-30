// server.js — HOLI (Square + Apple Pay domain verify)
// Requires: "type": "module" in package.json
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { Client, Environment } from "@square/square";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ---- ENV ----
const {
  SQUARE_ACCESS_TOKEN,
  SQUARE_LOCATION_ID,
  SQUARE_ENV = "production",
  PORT = 3000,
} = process.env;

if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) {
  console.warn("⚠️  Missing SQUARE_ACCESS_TOKEN or SQUARE_LOCATION_ID env vars");
}

// ---- Square SDK ----
const client = new Client({
  accessToken: SQUARE_ACCESS_TOKEN,
  environment: SQUARE_ENV === "production" ? Environment.Production : Environment.Sandbox,
});

// ---- Middleware ----
app.use(express.json());

// Serve static assets (site)
app.use(
  express.static(path.join(__dirname, "public"), {
    // regular static hosting for everything in /public
  })
);

// Serve Apple Pay verification file (must allow dotfiles + exact path)
// Option A: static mount that allows dotfiles inside /.well-known
app.use(
  "/.well-known",
  express.static(path.join(__dirname, "public", ".well-known"), {
    dotfiles: "allow",
    setHeaders: (res) => {
      // text/plain is fine; avoid gzip transforms
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=300");
    },
  })
);

// Option B: explicit route (kept as a safety net; okay if both exist)
app.get("/.well-known/apple-developer-merchantid-domain-association", (req, res) => {
  res.sendFile(
    path.join(
      __dirname,
      "public",
      ".well-known",
      "apple-developer-merchantid-domain-association"
    ),
    (err) => {
      if (err) {
        res.status(err.statusCode || 500).end();
      }
    }
  );
});

// ---- Health check ----
app.get("/health", (_req, res) => res.json({ ok: true }));

// ---- Payments API (Card, Apple Pay, Google Pay, Cash App Pay, ACH, Gift Card, Afterpay) ----
app.post("/api/pay", async (req, res) => {
  try {
    const {
      sourceId,           // token from Web Payments SDK
      amount,             // integer cents
      currency = "USD",
      buyerEmail,
      buyerName,
      fund,
      fundLabel,
    } = req.body || {};

    if (!sourceId || !amount) {
      return res.status(400).json({ error: "Missing sourceId or amount" });
    }

    const idempotencyKey = crypto.randomUUID();

    const body = {
      idempotencyKey,
      sourceId,
      locationId: SQUARE_LOCATION_ID,
      amountMoney: { amount: Number(amount), currency },
      note: fundLabel ? `HOLI • ${fundLabel}` : "HOLI gift",
      buyerEmailAddress: buyerEmail,
      autocomplete: true, // capture immediately
    };

    const { result } = await client.paymentsApi.createPayment(body);
    return res.json({ ok: true, payment: result.payment });
  } catch (err) {
    const msg =
      err?.result?.errors?.[0]?.detail ||
      err?.message ||
      "Payment error";
    return res.status(400).json({ error: msg });
  }
});

// ---- Start ----
app.listen(PORT, () => {
  console.log(`✅ HOLI server running on http://localhost:${PORT}`);
  console.log("   Apple Pay verification file should be at:");
  console.log("   /.well-known/apple-developer-merchantid-domain-association");
});
