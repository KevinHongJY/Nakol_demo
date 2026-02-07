"use client";

import { FormEvent, useState } from "react";

type SubmitState = {
  type: "idle" | "success" | "error";
  message: string;
};

export default function Home() {
  const [state, setState] = useState<SubmitState>({
    type: "idle",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();

    if (!name || !email) {
      setState({ type: "error", message: "Please enter both name and email." });
      return;
    }

    setSubmitting(true);
    setState({ type: "idle", message: "" });

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email })
      });

      let payload: { error?: string } = {};
      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        payload = await response.json();
      }

      if (!response.ok) {
        setState({
          type: "error",
          message: payload?.error ?? "Could not save your details. Try again."
        });
        return;
      }

      setState({ type: "success", message: "Saved. We will contact you soon." });
      event.currentTarget.reset();
    } catch {
      setState({ type: "error", message: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Creative Studio</p>
        <h1>Design. Build. Launch.</h1>
        <p className="subtitle">
          A high-impact landing page ready for your brand, deployed on Vercel, with user capture
          persisted to Supabase.
        </p>
      </section>

      <section className="grid">
        <article className="card">
          <h2>Fast Build</h2>
          <p>Next.js architecture with clean sections and fluid responsive behavior.</p>
        </article>
        <article className="card">
          <h2>Reliable Data</h2>
          <p>Server-side API route stores leads safely with Supabase credentials.</p>
        </article>
        <article className="card">
          <h2>Production Ready</h2>
          <p>Deploy directly to Vercel and attach your custom domain in minutes.</p>
        </article>
      </section>

      <section className="signup">
        <h2>Join Waitlist</h2>
        <form onSubmit={handleSubmit} className="form">
          <input type="text" name="name" placeholder="Name" autoComplete="name" required />
          <input type="email" name="email" placeholder="Email" autoComplete="email" required />
          <button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Get Early Access"}
          </button>
        </form>
        {state.message ? (
          <p className={state.type === "error" ? "status error" : "status success"}>{state.message}</p>
        ) : null}
      </section>
    </main>
  );
}
