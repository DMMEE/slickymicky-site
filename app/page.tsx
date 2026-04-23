"use client";

import { useEffect, useMemo, useState } from "react";

type AccessState = {
  freeUsed: boolean;
  paidUnlocks: number;
  subscriptionActive: boolean;
};

export default function HomePage() {
  const [name, setName] = useState("");
  const [suburb, setSuburb] = useState("");
  const [message, setMessage] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const [access, setAccess] = useState<AccessState>({
    freeUsed: false,
    paidUnlocks: 0,
    subscriptionActive: false,
  });

  const canSubmit = useMemo(() => {
    return name.trim().length > 0 && suburb.trim().length > 0;
  }, [name, suburb]);

  async function refreshAccess() {
    try {
      const res = await fetch("/api/access-status", { cache: "no-store" });
      const data = await res.json();

      setAccess({
        freeUsed: Boolean(data.freeUsed),
        paidUnlocks: Number(data.paidUnlocks || 0),
        subscriptionActive: Boolean(data.subscriptionActive),
      });
    } catch {
      setAccess({
        freeUsed: false,
        paidUnlocks: 0,
        subscriptionActive: false,
      });
    }
  }

  useEffect(() => {
    refreshAccess().finally(() => setIsHydrated(true));
  }, []);

  useEffect(() => {
    setDisplayedText("");

    if (!message) return;

    let index = 0;

    const interval = setInterval(() => {
      index += 1;
      setDisplayedText(message.slice(0, index));

      if (index >= message.length) {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [message]);

  const isLocked =
    access.freeUsed &&
    access.paidUnlocks === 0 &&
    !access.subscriptionActive;

  useEffect(() => {
    if (!isHydrated) return;
    setShowPaywall(isLocked);
  }, [isHydrated, isLocked]);

  async function handleGenerate() {
    if (loading) return;

    if (!name.trim() || !suburb.trim()) {
      alert("Enter your name and suburb first.");
      return;
    }

    if (isLocked) {
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

      if (!access.freeUsed) {
        await fetch("/api/use-free-reading", { method: "POST" });

        setAccess((prev) => ({
          ...prev,
          freeUsed: true,
        }));
      } else if (access.paidUnlocks > 0 && !access.subscriptionActive) {
        await fetch("/api/use-paid-unlock", { method: "POST" });

        setAccess((prev) => ({
          ...prev,
          paidUnlocks: Math.max(0, prev.paidUnlocks - 1),
        }));
      }

      await refreshAccess();
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
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h1 style={{ fontSize: "48px", marginBottom: "10px" }}>
            Slicky Micky
          </h1>
          <p style={{ opacity: 0.8 }}>
            Someone is noticing you more than you think.
          </p>
        </div>

        <div style={{ display: "grid", gap: "12px" }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            style={{
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "transparent",
              color: "#fff",
            }}
          />

          <input
            value={suburb}
            onChange={(e) => setSuburb(e.target.value)}
            placeholder="Your suburb"
            style={{
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "transparent",
              color: "#fff",
            }}
          />

          <button
            onClick={handleGenerate}
            disabled={loading || !canSubmit || isLocked}
            style={{
              padding: "14px",
              borderRadius: "10px",
              border: "none",
              cursor:
                loading || !canSubmit || isLocked
                  ? "not-allowed"
                  : "pointer",
              background: "#ffffff",
              color: "#000",
              fontWeight: 600,
              opacity: loading || !canSubmit || isLocked ? 0.7 : 1,
            }}
          >
            {loading
              ? "Reading..."
              : isLocked
              ? "Message Locked"
              : "Reveal Message"}
          </button>
        </div>

        {displayedText && (
          <div
            style={{
              marginTop: "30px",
              fontSize: "26px",
              textAlign: "center",
              minHeight: "80px",
            }}
          >
            {displayedText}
          </div>
        )}

        {isHydrated &&
          !displayedText &&
          access.freeUsed &&
          !access.subscriptionActive &&
          access.paidUnlocks > 0 && (
            <div
              style={{
                marginTop: "30px",
                textAlign: "center",
                fontSize: "18px",
              }}
            >
              Your next message is unlocked. Reveal it now.
            </div>
          )}

        {showPaywall &&
          isHydrated &&
          !access.subscriptionActive &&
          access.paidUnlocks === 0 && (
            <div style={{ marginTop: "30px", textAlign: "center" }}>
              <p>Your next message is locked.</p>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "center",
                }}
              >
                <button onClick={() => handleCheckout("single")}>
                  Pay $2.50 for Next Message
                </button>
                <button onClick={() => handleCheckout("sub")}>
                  Subscribe
                </button>
              </div>
            </div>
          )}

        <p style={{ marginTop: "40px", fontSize: "12px", opacity: 0.5 }}>
          This website is for entertainment purposes only.
        </p>
      </div>
    </main>
  );
}