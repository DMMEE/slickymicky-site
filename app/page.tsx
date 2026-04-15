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

const freePools: Record<ResponseCategory, string[]> = {
  mystery: [
    "{name}, someone noticed something about you recently.",
    "{name}, someone has been thinking about you more than they expected to.",
    "{name}, someone realised something about you the other day.",
    "{name}, someone has replayed a moment they had with you a few times now.",
    "{name}, someone has been quietly paying attention to you.",
    "{name}, someone noticed the way you reacted to something recently.",
  ],
  admiration: [
    "{name}, someone keeps noticing you in ways they did not expect to.",
    "{name}, someone has been more affected by you than they meant to be.",
    "{name}, someone noticed something about you that keeps pulling them back in.",
    "{name}, there is someone who finds you harder to ignore than they want to admit.",
    "{name}, someone has been thinking about your energy more than they should.",
  ],
  suspicion: [
    "{name}, someone around you is pretending not to notice you, but they do.",
    "{name}, someone has been holding back what they really think of you.",
    "{name}, someone knows more about this than they are letting on.",
    "{name}, someone nearby has been acting casual, but their attention keeps returning to you.",
    "{name}, someone is trying not to make it obvious that they have been watching you.",
  ],
  ego: [
    "{name}, someone noticed how much space you take up without even trying.",
    "{name}, someone sees more confidence in you than you realise.",
    "{name}, someone noticed the effect you have before you even said anything.",
    "{name}, someone thinks you leave a much stronger impression than most people do.",
    "{name}, someone has been thinking about the way people react to you.",
  ],
  eerie: [
    "{name}, this is not the first time someone has been thinking about you lately.",
    "{name}, someone noticed something about you before you noticed it yourself.",
    "{name}, this didn’t come out of nowhere.",
    "{name}, someone has been carrying a thought about you longer than you realise.",
    "{name}, the timing of this is less random than it looks.",
  ],
  roast: [
    "{name}, someone thinks you are very good at pretending not to care.",
    "{name}, someone noticed you acting mysterious when you were really just curious.",
    "{name}, someone thinks you overthink things that were never that deep.",
    "{name}, someone around you reckons your confidence shows up before the evidence does.",
    "{name}, someone thinks you make small moments feel far more dramatic than they need to.",
  ],
};

const paidPools: Record<ResponseCategory, string[]> = {
  mystery: [
    "{name}, the person behind this keeps replaying a small moment with you.",
    "{name}, someone noticed something subtle about you that most people would miss.",
    "{name}, the person thinking about you keeps going back to one detail they caught.",
    "{name}, someone has been watching you quietly for longer than you would expect.",
    "{name}, the person behind this feels closer than you realise.",
  ],
  admiration: [
    "{name}, the person thinking about you did not expect to feel pulled in this quickly.",
    "{name}, someone has gone from curiosity into attraction, and they are trying not to let you see it.",
    "{name}, the person behind this has imagined what it would be like to talk to you properly.",
    "{name}, someone has been more drawn to you than they are comfortable admitting.",
    "{name}, this is not casual attention anymore.",
  ],
  suspicion: [
    "{name}, the person behind this is careful, guarded, and trying to stay unread while learning more about you.",
    "{name}, someone has been watching your choices closely, and their silence says more than their words would.",
    "{name}, this is connected to someone who is hiding their real angle.",
    "{name}, the person thinking about you wants to know more without giving much away.",
    "{name}, someone is trying to stay in control of what you notice about them.",
  ],
  ego: [
    "{name}, the person behind this notices your effect on people, and they do not think you understand how strong it really is.",
    "{name}, someone sees you as more influential than you give yourself credit for.",
    "{name}, someone keeps noticing how easily you stay in their mind.",
    "{name}, the person tied to this thinks your presence hits harder than most people’s.",
    "{name}, someone has realised that you affect a room without trying.",
  ],
  eerie: [
    "{name}, the strange part is that the person behind this felt the shift before anything was said aloud.",
    "{name}, this feels connected to something that has already started moving beneath the surface.",
    "{name}, someone has been thinking about you at odd moments, and it keeps happening.",
    "{name}, this connection feels unfinished in a way that keeps pulling them back to you.",
    "{name}, the person behind this already knows they should let it go, but they are not doing that.",
  ],
  roast: [
    "{name}, the person behind this thinks you act unbothered while very obviously noticing everything.",
    "{name}, someone reckons you love subtle attention, provided it is still clearly about you.",
    "{name}, the person thinking about you can tell you enjoy being watched a little more than you admit.",
    "{name}, someone thinks you are very good at acting cool while quietly hoping for more.",
    "{name}, the person behind this finds your whole mysterious routine a lot less subtle than you think.",
  ],
};

const subscriptionPools: Record<ResponseCategory, string[]> = {
  mystery: [
    "{name}, the energy around this points to someone who has gone from noticing you to quietly wanting more from the connection.",
    "{name}, this has become more than a passing thought for the person behind it.",
    "{name}, someone has been building curiosity into attachment, and they are closer to acting than they were before.",
    "{name}, the person tied to this keeps returning to the same thought about you, and it is not fading.",
  ],
  admiration: [
    "{name}, this feels like genuine fascination now, not just attraction.",
    "{name}, someone has gone from admiring you to imagining what it would feel like if you noticed them back.",
    "{name}, the person behind this feels pulled in by more than your appearance.",
    "{name}, someone has started reading more into your presence than they intended to.",
  ],
  suspicion: [
    "{name}, the person behind this wants access to you without fully revealing themselves.",
    "{name}, someone is still hiding the real reason they keep paying attention to you.",
    "{name}, this feels tied to somebody who wants to stay close enough to notice you without being noticed in return.",
    "{name}, the person behind this is more strategic than emotional, but you still got into their head.",
  ],
  ego: [
    "{name}, the person behind this thinks your effect is stronger than you realise.",
    "{name}, someone sees you as the kind of person who changes the mood without asking for attention.",
    "{name}, the person tied to this thinks you leave a mark whether you mean to or not.",
    "{name}, someone has decided you are much harder to forget than they expected.",
  ],
  eerie: [
    "{name}, this connection feels strangely timed, like both sides have been sensing it before anything was said aloud.",
    "{name}, someone has already attached meaning to something small you did, and it is lingering.",
    "{name}, the person behind this has started reading signs into you that they cannot quite explain.",
    "{name}, something about this has already started unfolding, and the other person knows it too.",
  ],
  roast: [
    "{name}, the person behind this thinks you are very good at pretending you are chill while clearly narrating the entire situation in your head.",
    "{name}, someone reckons you enjoy being the unanswered question in somebody else’s mind.",
    "{name}, the person behind this thinks you act mysterious mostly because you like knowing people are still thinking about you.",
    "{name}, someone has definitely noticed that you like to seem hard to read while making sure you are still impossible to ignore.",
  ],
};

const conversionHooks = [
  "There’s more to this. The next message gets closer.",
  "You’re only seeing part of it. The next message explains why.",
  "There’s something about this they haven’t shown yet. The next message is more direct.",
  "You’re closer to the truth than you think. The next message makes it clearer.",
  "That’s only the beginning of it. The next message goes deeper.",
  "You might already have someone in mind. The next message will confirm it.",
  "You probably felt this before reading it. The next message explains why.",
  "This didn’t come out of nowhere. The next message reveals why it started.",
  "Someone has been noticing you longer than you realise. The next message gets closer to who it is.",
  "There’s something they haven’t said yet. The next message reveals it.",
  "This connection isn’t random. The next message explains why.",
  "They noticed more than you think. The next message gets specific.",
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatText(value: string) {
  return value
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function weightedCategory(): ResponseCategory {
  const roll = Math.random() * 100;
  if (roll < 28) return "mystery";
  if (roll < 48) return "admiration";
  if (roll < 68) return "suspicion";
  if (roll < 78) return "ego";
  if (roll < 88) return "eerie";
  return "roast";
}

function maybeAddSuburbIntro(name: string, suburb: string) {
  if (Math.random() >= 0.18) return "";

  const intros = [
    `${name}, someone around ${suburb} has been thinking about you.`,
    `${name}, someone near ${suburb} noticed more than they should have.`,
    `${name}, this started with someone not far from ${suburb}.`,
  ];

  return randomFrom(intros);
}

function buildResponse(name: string, suburb: string, tier: MessageTier) {
  const formattedName = formatText(name);
  const formattedSuburb = formatText(suburb);
  const category = weightedCategory();

  const pool =
    tier === "free"
      ? freePools[category]
      : tier === "paid"
      ? paidPools[category]
      : subscriptionPools[category];

  const intro = maybeAddSuburbIntro(formattedName, formattedSuburb);
  const baseMessage = randomFrom(pool)
    .replaceAll("{name}", formattedName)
    .replaceAll("{suburb}", formattedSuburb);

  const hook = randomFrom(conversionHooks);

  return [intro, baseMessage, hook].filter(Boolean).join(" ");
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
      i += 1;
      setTyped(response.slice(0, i));

      if (i >= response.length) {
        clearInterval(interval);
      }
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

    const built = buildResponse(name, suburb, tier);

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
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type, name, suburb }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Checkout failed");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      alert("Something went wrong starting checkout.");
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
              id="name"
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
            />
          </div>

          <div className="field">
            <input
              id="suburb"
              type="text"
              placeholder="Suburb"
              value={suburb}
              onChange={(e) => setSuburb(e.target.value)}
              maxLength={32}
            />
          </div>

          {isHydrated && canReveal && (
            <button
              className="reveal-button"
              type="submit"
              disabled={!canSubmit || thinking}
            >
              {thinking ? "Revealing..." : "Reveal My Message"}
            </button>
          )}
        </form>

        <div className="message-wrap">
          {!thinking && !typed && !access.freeUsed && (
            <div className="message-box placeholder">
              Your message will appear here.
            </div>
          )}

          {!thinking &&
            !typed &&
            access.freeUsed &&
            !access.subscriptionActive &&
            access.paidUnlocks === 0 &&
            isHydrated && (
              <div className="message-box placeholder">
                Your free weekly message has already been used.
              </div>
            )}

          {!thinking &&
            !typed &&
            access.freeUsed &&
            !access.subscriptionActive &&
            access.paidUnlocks > 0 &&
            isHydrated && (
              <div className="message-box placeholder">
                You have {access.paidUnlocks} paid message
                {access.paidUnlocks === 1 ? "" : "s"} ready to reveal.
              </div>
            )}

          {!thinking && !typed && access.subscriptionActive && isHydrated && (
            <div className="message-box placeholder">
              Subscription active. Unlimited messages unlocked.
            </div>
          )}

          {thinking && (
            <div className="message-box thinking">Slicky is thinking...</div>
          )}

          {!thinking && typed && (
            <div className="message-box result">
              {typed}
              <span className="cursor" />
            </div>
          )}
        </div>

        {access.freeUsed &&
          !thinking &&
          isHydrated &&
          !access.subscriptionActive &&
          access.paidUnlocks === 0 && (
            <div className="paywall">
              <button
                className="unlock-button"
                type="button"
                onClick={() => handleCheckout("single")}
              >
                Unlock Another Message -- $2
              </button>

              <button
                className="subscribe-button"
                type="button"
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