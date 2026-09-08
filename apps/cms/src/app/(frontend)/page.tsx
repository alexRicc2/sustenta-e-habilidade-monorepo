import Link from "next/link";

export default function CmsHome() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        fontFamily: "sans-serif",
        background: "#f6faf3",
        color: "#15261c",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 480, textAlign: "center" }}>
        <p style={{ letterSpacing: "0.2em", fontWeight: 800, color: "#6f8238" }}>CMS</p>
        <h1 style={{ fontSize: 36, margin: "12px 0" }}>Sustenta &amp; Habilidade</h1>
        <p>
          O site público roda no Next.js em <code>localhost:3000</code>. Este app é o Payload: admin e API
          das inscrições.
        </p>
        <p style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "center" }}>
          <Link href="/admin">Painel admin</Link>
          <a href="http://localhost:3000">Abrir o site</a>
        </p>
      </div>
    </main>
  );
}
