// server.js — Square Payments API (Node 18+)
import express from "express";
import crypto from "crypto";

const app = express();
app.use(express.json());

const {
  SQUARE_ACCESS_TOKEN,           // Production access token
  SQUARE_ENV = "production",     // "production" | "sandbox"
  SQUARE_LOCATION_ID             // Your Production location id
} = process.env;

if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) {
  console.warn("⚠️  Missing SQUARE_ACCESS_TOKEN or SQUARE_LOCATION_ID in environment.");
}

const API_BASE = SQUARE_ENV === "production"
  ? "https://connect.squareup.com"
  : "https://connect.squareupsandbox.com";

// Create payment endpoint
app.post("/api/pay", async (req, res) => {
  try {
    const { sourceId, amount, currency="USD", fundLabel, buyerEmail, buyerName } = req.body;
    if (!sourceId || !amount) return res.status(400).json({ error: "Missing sourceId or amount" });

    const idempotencyKey = crypto.randomUUID();

    const body = {
      idempotency_key: idempotencyKey,
      source_id: sourceId,
      amount_money: { amount: Number(amount), currency },
      location_id: SQUARE_LOCATION_ID,
      note: fundLabel ? `Donation • ${fundLabel}` : "Donation",
      autocomplete: true,
      buyer_email_address: buyerEmail || undefined
    };

    const rsp = await fetch(`${API_BASE}/v2/payments`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
        // Optional: pin an API version with "Square-Version": "2025-07-17"
      },
      body: JSON.stringify(body)
    });

    const data = await rsp.json();
    if (!rsp.ok || data.errors) {
      const msg = data.errors?.[0]?.detail || "Square payment failed";
      return res.status(400).json({ error: msg, raw: data });
    }

    // Typical: persist data.payment to your DB here

    return res.json({ ok: true, payment: data.payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Serve static site from /public (place index.html, app.js, style.css, images/)
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ server on http://localhost:${PORT}`));
