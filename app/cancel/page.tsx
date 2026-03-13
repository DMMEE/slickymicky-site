export default function CancelPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#1e2232",
        padding: "24px",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "560px",
          background: "#ffffff",
          borderRadius: "28px",
          padding: "40px 28px",
          textAlign: "center",
          boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
        }}
      >
        <p style={{ margin: 0, fontWeight: 700, letterSpacing: "0.14em" }}>DMME</p>
        <h1 style={{ marginTop: "14px", marginBottom: "10px" }}>Payment cancelled</h1>
        <p style={{ margin: 0, color: "#5f6574", lineHeight: 1.6 }}>
          No problem. Your message is still waiting.
        </p>
        <a
          href="/"
          style={{
            display: "inline-block",
            marginTop: "20px",
            padding: "14px 20px",
            borderRadius: "14px",
            border: "1px solid #d8dee7",
            color: "#111",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          Return home
        </a>
      </div>
    </main>
  );
}