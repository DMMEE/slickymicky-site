"use client";

import { useEffect, useState } from "react";

type AccessState = {
  freeUsed: boolean;
  hasOneOffAccess: boolean;
  hasSubscription: boolean;
};

export default function HomePage() {
  const [name, setName] = useState("");
  const [suburb, setSuburb] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const [access, setAccess] = useState<AccessState>({
    freeUsed: false,
    hasOneOffAccess: false,
    hasSubscription: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem("slicky_access");

    if (saved) {
      try {
        setAccess(JSON.parse(saved));
      } catch {
        localStorage.removeItem("slicky_access");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("slicky_access", JSON.stringify(access));
  }, [access]);

  async function handleGenerate() {
    if (loading) return;

    if (!name.trim() || !suburb.trim()) {
      alert("Enter your name and suburb first.");
      return;
    }

    const allowed =
      !access.freeUsed || access.hasOneOffAccess || access.hasSubscription;

    if (!allowed) {
      setShowPaywall(true);
      return;
    }

    setLoading(true);
    setMessage("");
    setShowPaywall(false);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          suburb: suburb.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate message.");
      }

      setMessage(data.message);

      if (!access.freeUsed && !access.hasOneOffAccess && !access.hasSubscription) {
        setAccess((prev) => ({
          ...prev,
          freeUsed: true,
        }));
      }

      if (access.hasOneOffAccess && !access.hasSubscription) {
        setAccess((prev) => ({
          ...prev,
          hasOneOffAccess: false,
        }));
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckout(type: "single" | "sub") {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          name: name.trim(),
          suburb: suburb.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || "Checkout failed.");
      }

      window.location.href = data.url;
    } catch (error) {
      alert(error instanceof Error ? error.message : "Checkout failed.");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #1a1a1a 0%, #0d0d0d 45%, #050505 100%)",
        color: "#f5f5f5",
        padding: "40px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "760px",
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.04)",
          borderRadius: "22px",
          padding: "36px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              opacity: 0.68,
            }}
          >
            Entertainment Reading
          </p>

          <h1
            style={{
              margin: "12px 0 10px",
              fontSize: "52px",
              lineHeight: 1,
              letterSpacing: "0.03em",
            }}
          >
            Slicky Micky
          </h1>

          <p
            style={{
              margin: "0 auto",
              maxWidth: "520px",
              fontSize: "18px",
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.82)",
            }}
          >
            Enter your name and suburb. Get one unsettling little message that
            feels a bit too close.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gap: "14px",
            marginTop: "24px",
          }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            style={{
              width: "100%",
              padding: "16px 18px",
              fontSize: "16px",
              borderRadius: "14px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              outline: "none",
            }}
          />

          <input
            value={suburb}
            onChange={(e) => setSuburb(e.target.value)}
            placeholder="Your suburb"
            style={{
              width: "100%",
              padding: "16px 18px",
              fontSize: "16px",
              borderRadius: "14px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              outline: "none",
            }}
          />

          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              marginTop: "4px",
              padding: "16px 18px",
              fontSize: "16px",
              fontWeight: 600,
              borderRadius: "14px",
              border: "none",
              cursor: loading ? "default" : "pointer",
              background: loading
                ? "rgba(255,255,255,0.18)"
                : "linear-gradient(135deg, #f4f4f4 0%, #bdbdbd 100%)",
              color: "#090909",
              transition: "0.2s ease",
            }}
          >
            {loading ? "Reading you..." : "Reveal My Message"}
          </button>
        </div>

        {!message && !showPaywall && (
          <div
            style={{
              marginTop: "16px",
              textAlign: "center",
              fontSize: "13px",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            First message is free.
          </div>
        )}

        {message && (
          <div
            style={{
              marginTop: "28px",
              padding: "22px",
              borderRadius: "18px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.05)",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "28px",
                lineHeight: 1.45,
                textAlign: "center",
                color: "#ffffff",
              }}
            >
              {message}
            </p>
          </div>
        )}

        {showPaywall && (
          <div
            style={{
              marginTop: "28px",
              padding: "24px",
              borderRadius: "18px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.05)",
            }}
          >
            <p
              style={{
                margin: "0 0 10px",
                fontSize: "22px",
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              You felt that one, didn’t you?
            </p>

            <p
              style={{
                margin: "0 auto 20px",
                maxWidth: "520px",
                fontSize: "15px",
                lineHeight: 1.6,
                textAlign: "center",
                color: "rgba(255,255,255,0.76)",
              }}
            >
              Your free message is gone. Unlock another one, or get ongoing
              access and keep going.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <button
                onClick={() => handleCheckout("single")}
                style={{
                  padding: "16px",
                  borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.08)",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "15px",
                  fontWeight: 600,
                }}
              >
                Buy 1 More Message
              </button>

              <button
                onClick={() => handleCheckout("sub")}
                style={{
                  padding: "16px",
                  borderRadius: "14px",
                  border: "none",
                  background: "linear-gradient(135deg, #ffffff 0%, #d9d9d9 100%)",
                  color: "#090909",
                  cursor: "pointer",
                  fontSize: "15px",
                  fontWeight: 700,
                }}
              >
                Start Subscription
              </button>
            </div>
          </div>
        )}

        <p
          style={{
            marginTop: "30px",
            textAlign: "center",
            fontSize: "12px",
            color: "rgba(255,255,255,0.48)",
          }}
        >
          This website is for entertainment purposes only.
        </p>
      </div>
    </main>
  );
}