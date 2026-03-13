// components/Form.tsx
"use client";

import { useMemo, useState } from "react";

type CheckoutType = "payment" | "subscription";

export default function Form() {
  const [name, setName] = useState("");
  const [suburb, setSuburb] = useState("");
  const [question, setQuestion] = useState("");

  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState<null | CheckoutType>(null);

  const canGenerate = useMemo(() => {
    return name.trim().length > 0 && suburb.trim().length > 0;
  }, [name, suburb]);

  async function generateMessage() {
    try {
      setError("");
      setMessage("");
      setLoadingGenerate(true);

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          suburb: suburb.trim(),
          question: question.trim(),
        }),
      });

      const raw = await res.text();
      let data: any = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = { raw };
      }

      if (!res.ok) {
        setError(data?.message || data?.error || data?.raw || "Generate failed.");
        return;
      }

      setMessage(data?.message || "");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Check console.");
    } finally {
      setLoadingGenerate(false);
    }
  }

  async function goCheckout(type: CheckoutType) {
    try {
      setError("");
      setLoadingCheckout(type);

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      const raw = await res.text();
      let data: any = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = { raw };
      }

      if (!res.ok) {
        console.error("Checkout failed:", res.status, data);
        setError(data?.error || data?.raw || `Checkout failed (${res.status})`);
        return;
      }

      if (!data?.url) {
        console.error("No checkout URL returned:", data);
        setError(data?.error || data?.raw || "No checkout URL returned.");
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setError("Checkout failed. Check console.");
    } finally {
      setLoadingCheckout(null);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(0,0,0,0.25)",
          }}
        />
        <input
          value={suburb}
          onChange={(e) => setSuburb(e.target.value)}
          placeholder="Your suburb"
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(0,0,0,0.25)",
          }}
        />
      </div>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask something… (optional)"
        rows={3}
        style={{
          padding: 12,
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.2)",
          background: "rgba(0,0,0,0.25)",
          resize: "vertical",
        }}
      />

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={generateMessage}
          disabled={!canGenerate || loadingGenerate || loadingCheckout !== null}
          style={{
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.25)",
            cursor: "pointer",
            opacity: !canGenerate || loadingGenerate || loadingCheckout !== null ? 0.6 : 1,
          }}
        >
          {loadingGenerate ? "Generating..." : "Get message"}
        </button>

        <button
          type="button"
          onClick={() => goCheckout("payment")}
          disabled={loadingGenerate || loadingCheckout !== null}
          style={{
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.25)",
            cursor: "pointer",
            opacity: loadingGenerate || loadingCheckout !== null ? 0.6 : 1,
          }}
        >
          {loadingCheckout === "payment" ? "Redirecting..." : "Buy 1 message ($2)"}
        </button>

        <button
          type="button"
          onClick={() => goCheckout("subscription")}
          disabled={loadingGenerate || loadingCheckout !== null}
          style={{
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.25)",
            cursor: "pointer",
            opacity: loadingGenerate || loadingCheckout !== null ? 0.6 : 1,
          }}
        >
          {loadingCheckout === "subscription" ? "Redirecting..." : "Subscribe"}
        </button>
      </div>

      <div style={{ fontSize: 12, opacity: 0.75 }}>
        For entertainment purposes only. Not professional advice.
      </div>

      {error && (
        <div
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid rgba(255,0,0,0.35)",
            background: "rgba(255,0,0,0.08)",
          }}
        >
          {error}
        </div>
      )}

      {message && (
        <div
          style={{
            padding: 14,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(0,0,0,0.28)",
            whiteSpace: "pre-wrap",
            lineHeight: 1.35,
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}