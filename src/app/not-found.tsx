import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
      <div>
        <span className="eyebrow center">Error 404</span>
        <h1 className="h-lg" style={{ margin: "18px 0 14px" }}>This plate is <span className="italic">empty</span></h1>
        <p className="lead" style={{ margin: "0 auto 28px" }}>The page you&apos;re looking for has been cleared from the table.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link className="btn" href="/">Back to home</Link>
          <Link className="btn btn-ghost" href="/menu">See the menu</Link>
        </div>
      </div>
    </main>
  );
}
