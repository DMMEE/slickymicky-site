"use client";

import { useEffect, useMemo, useState } from "react";

type ResponseCategory =
  | "mystery"
  | "admiration"
  | "suspicion"
  | "ego"
  | "eerie"
  | "roast";

type MessageTier = "free" | "paid" | "subscription";

type AccessState = {
  freeUsed: boolean;
  paidUnlocks: number;
  subscriptionActive: boolean;
};

const liveUsers = [
  "Sarah • Brisbane",
  "Daniel • Melbourne",
  "Emily • Sydney",
  "Josh • Perth",
  "Mia • Adelaide",
  "Luca • Geelong",
  "Sophie • Richmond",
  "Noah • Ballarat",
  "Ava • London",
  "Leo • Toronto",
  "Mason • Auckland",
  "Chloe • Singapore",
];

const freeMessages = [
  "{name}, someone noticed something about you recently.",
  "{name}, someone has been thinking about you more than they expected to.",
  "{name}, someone realised something about you the other day.",
  "{name}, someone has replayed a moment they had with you a few times now.",
  "{name}, someone has been quietly paying attention to you.",
  "{name}, someone noticed the way you reacted to something recently.",
];

const paidMessages = [
  "{name}, the person behind this keeps replaying a small moment with you.",
  "{name}, someone noticed something subtle about you.",
  "{name}, someone has been watching you quietly.",
  "{name}, the person thinking about you feels closer than you realise.",
  "{name}, someone has built a version of you in their mind.",
];

const subMessages = [
  "{name}, the person behind this feels drawn to you more than they expected.",
  "{name}, someone has gone from curiosity to something deeper.",
  "{name}, someone has been imagining what it would be like to talk to you.",
  "{name}, someone keeps noticing you even when they try not to.",
];

const conversionHooks = [
  "There’s more to this. The next message gets closer.",
  "You’re only seeing part of it. The next message explains why.",
  "Someone has been noticing you longer than you realise.",
  "You might already have someone in mind.",
  "This connection isn’t random.",
  "The next message gets more direct.",
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatText(value: string) {
  return value
    .trim()
    .split(" ")
    .filter(Boolean)
    .map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(" ");
}

function buildResponse(name: string, tier: MessageTier) {
  const formattedName = formatText(name);

  const pool =
    tier === "free"
      ? freeMessages
      : tier === "paid"
      ? paidMessages
      : subMessages;

  let message = randomFrom(pool).replaceAll("{name}", formattedName);

  const hook = randomFrom(conversionHooks);

  return `${message} ${hook}`;
}

export default function HomePage() {
  const [name, setName] = useState("");
  const [suburb, setSuburb] = useState("");
  const [thinking, setThinking] = useState(false);
  const [response, setResponse] = useState("");
  const [typed, setTyped] = useState("");
  const [rolling, setRolling] = useState(liveUsers[0]);
  const [isHydrated, setIsHydrated] = useState(false);

  const [access, setAccess] = useState<AccessState>({
    freeUsed: false,
    paidUnlocks: 0,
    subscriptionActive: false,
  });

  const canSubmit = useMemo(() => {
    return name.trim().length > 0 && suburb.trim().length > 0;
  }, [name, suburb]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRolling(randomFrom(liveUsers));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  async function refreshAccess() {
    const res = await fetch("/api/access-status", { cache: "no-store" });
    const data = await res.json();
    setAccess({
      freeUsed: Boolean(data.freeUsed),
      paidUnlocks: Number(data.paidUnlocks || 0),
      subscriptionActive: Boolean(data.subscriptionActive),
    });
  }

  useEffect(() => {
    refreshAccess().finally(() => setIsHydrated(true));
  }, []);

  useEffect(() => {
    if (!response) return;

    setTyped("");
    let i = 0;

    const interval = setInterval(() => {
      i++;
      setTyped(response.slice(0, i));

      if (i >= response.length) clearInterval(interval);
    }, 16);

    return () => clearInterval(interval);
  }, [response]);

  const canReveal =
    !access.freeUsed || access.paidUnlocks > 0 || access.subscriptionActive;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!canSubmit || !canReveal || !isHydrated) return;

    let tier: MessageTier = "free";

    if (access.subscriptionActive) tier = "subscription";
    else if (access.freeUsed && access.paidUnlocks > 0) tier = "paid";

    setThinking(true);
    setResponse("");
    setTyped("");

    const built = buildResponse(name, tier);

    setTimeout(async () => {
      setThinking(false);
      setResponse(built);

      if (tier === "free") {
        await fetch("/api/use-free-reading", { method: "POST" });
      } else if (tier === "paid") {
        await fetch("/api/use-paid-unlock", { method: "POST" });
      }

      await refreshAccess();
    }, 1200);
  }

  async function handleCheckout(type: "single" | "sub") {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type, name, suburb }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    }
  }

  return (
    <main className="page-shell">

      <div className="live-users">
        <div className="live-title">Live Users</div>
        <div className="live-row">
          <span className="live-dot" />
          <span className="live-name">{rolling}</span>
        </div>
      </div>

      <section className="hero-card">

        <p className="brand-top">Slicky Micky</p>

        <h1 className="hero-title">Slide into my DMs</h1>

        <p className="hero-subtitle">
          Slicky knows you, more than you think
        </p>

        <form className="form-stack" onSubmit={handleSubmit}>

          <div className="field">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="field">
            <input
              type="text"
              placeholder="Suburb"
              value={suburb}
              onChange={(e) => setSuburb(e.target.value)}
            />
          </div>

          {isHydrated && canReveal && (
            <button className="reveal-button" type="submit">
              {thinking ? "Revealing..." : "Reveal My Message"}
            </button>
          )}

        </form>

        <div className="message-wrap">

          {thinking && (
            <div className="message-box">Slicky is thinking...</div>
          )}

          {!thinking && typed && (
            <div className="message-box">
              {typed}
              <span className="cursor" />
            </div>
          )}

        </div>

        {access.freeUsed &&
          !thinking &&
          !access.subscriptionActive &&
          access.paidUnlocks === 0 && (
            <div className="paywall">

              <button
                className="unlock-button"
                onClick={() => handleCheckout("single")}
              >
                Unlock Another Message — $2
              </button>

              <button
                className="subscribe-button"
                onClick={() => handleCheckout("sub")}
              >
                Subscribe for Unlimited Access
              </button>

            </div>
          )}

        <div
          style={{
            marginTop: "40px",
            fontSize: "12px",
            color: "#777",
            textAlign: "center",
          }}
        >
          This website is for entertainment purposes only
        </div>

      </section>

    </main>
  );
}