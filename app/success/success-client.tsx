"use client";

import { useEffect } from "react";

export default function SuccessClient({ type }: { type: string }) {
  useEffect(() => {
    const saved = localStorage.getItem("slicky_access");

    let access = {
      freeUsed: true,
      hasOneOffAccess: false,
      hasSubscription: false,
    };

    if (saved) {
      try {
        access = JSON.parse(saved);
      } catch {}
    }

    if (type === "single") {
      access.hasOneOffAccess = true;
    }

    if (type === "sub") {
      access.hasSubscription = true;
    }

    localStorage.setItem("slicky_access", JSON.stringify(access));

    const timer = setTimeout(() => {
      window.location.href = "/";
    }, 1500);

    return () => clearTimeout(timer);
  }, [type]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#050505",
        color: "#fff",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <div>
        <h1 style={{ marginBottom: "12px" }}>Payment successful</h1>
        <p>Taking you back for your next message...</p>
      </div>
    </main>
  );
}