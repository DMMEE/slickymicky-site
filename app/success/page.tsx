"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const type = searchParams.get("type");

    if (type === "sub") {
      window.localStorage.setItem("dmme_just_subscribed", "true");
    } else {
      window.localStorage.setItem("dmme_just_paid", "true");
    }

    const timer = setTimeout(() => {
      router.push("/");
    }, 1200);

    return () => clearTimeout(timer);
  }, [router, searchParams]);

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
        <p style={{ margin: 0, fontWeight: 700, letterSpacing: "0.14em" }}>DMME</p>
        <h1 style={{ marginTop: "14px", marginBottom: "10px" }}>Payment successful</h1>
        <p style={{ margin: 0, color: "#5f6574", lineHeight: 1.6 }}>
          Unlocking your next message...
        </p>
      </div>
    </main>
  );
}