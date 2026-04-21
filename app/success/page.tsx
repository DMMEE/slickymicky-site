"use client";

import { useEffect, useState } from "react";

export default function SuccessPage() {
  const [status, setStatus] = useState("Confirming payment...");

  useEffect(() => {
    let cancelled = false;

    async function confirmPayment() {
      try {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get("session_id");

        if (!sessionId) {
          setStatus("Missing payment details.");
          return;
        }

        const res = await fetch("/api/confirm-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        });

        const data = await res.json();

        if (!res.ok) {
          setStatus(data.error || "Could not confirm payment.");
          return;
        }

        if (cancelled) return;

        setStatus("Payment confirmed. Taking you back...");

        setTimeout(() => {
          if (!cancelled) {
            window.location.href = "/";
          }
        }, 1200);
      } catch {
        setStatus("Could not confirm payment.");
      }
    }

    confirmPayment();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#1e2232",
        color: "white",
        fontFamily: "Arial, Helvetica, sans-serif",
        padding: "24px",
      }}
    >
      <div
        style={{
          textAlign: "center",
          background: "white",
          color: "#111",
          padding: "40px 28px",
          borderRadius: "28px",
          maxWidth: "520px",
          width: "100%",
          boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
        }}
      >
        <p style={{ margin: 0, fontWeight: 700, letterSpacing: "0.14em" }}>
          Slicky Micky
        </p>

        <h1 style={{ marginTop: "14px", marginBottom: "10px" }}>
          Payment successful
        </h1>

        <p style={{ margin: 0, color: "#5f6574", lineHeight: 1.6 }}>
          {status}
        </p>
      </div>
    </main>
  );
}