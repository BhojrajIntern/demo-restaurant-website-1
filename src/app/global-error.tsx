"use client";
import { useEffect } from "react";

/** Last-resort error page (replaces the whole document, so it carries its own minimal styles). */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <html lang="en-IN">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#140f0c", color: "#f5ecdf", fontFamily: "Georgia, serif", textAlign: "center", padding: 24 }}>
        <title>Something went wrong — Ember &amp; Saffron</title>
        <div>
          <h1 style={{ fontWeight: 400, fontSize: 40, margin: "0 0 12px" }}>Something went wrong</h1>
          <p style={{ fontFamily: "system-ui, sans-serif", color: "#c4b5a3", margin: "0 0 24px" }}>
            Please try again, or call us on +91 98765 43210.
          </p>
          <button onClick={() => retry()} style={{ background: "#e9a23b", color: "#140f0c", border: 0, borderRadius: 999, padding: "14px 26px", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
