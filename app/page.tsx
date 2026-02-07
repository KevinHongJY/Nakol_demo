"use client";

import Image from "next/image";
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
    const fullName = String(formData.get("fullName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();

    if (!fullName || !email || !phone) {
      setState({ type: "error", message: "Please complete all fields." });
      return;
    }

    setSubmitting(true);
    setState({ type: "idle", message: "" });

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, email, phone })
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
        <div className="brand-head">
          <Image src="/nakol-mark.svg" alt="Nakol icon" width={58} height={58} priority />
        </div>
        <p className="eyebrow">Nakol</p>
        <p className="coming">Coming Soon</p>
        <h1>Find food that fits you</h1>
        <p className="subtitle">
          Discover restaurants and dishes that align with your dietary needs. Halal, kosher,
          allergen-free-eat safely, eat confidently.
        </p>
      </section>

      <section className="grid">
        <article className="card">
          <h2>Dietary Safety</h2>
        </article>
        <article className="card">
          <h2>Allergen Alerts</h2>
        </article>
        <article className="card">
          <h2>Restaurant Tools</h2>
        </article>
      </section>

      <section className="story">
        <h2>Everyone deserves to eat with confidence</h2>
        <p>
          Whether it&apos;s religious requirements, allergies, or personal preferences, finding
          safe food shouldn&apos;t be stressful. Nakol connects you with restaurants that understand
          your needs-and helps restaurants communicate theirs effortlessly.
        </p>
      </section>

      <section className="steps">
        <h2>How it works</h2>
        <p className="steps-subtitle">Simple for diners. Simple for restaurants.</p>
        <div className="step-grid">
          <article className="step-card">
            <h3>Set Your Preferences</h3>
            <p>
              Tell us about your dietary requirements-halal, kosher, vegan, nut-free, gluten-free,
              and more.
            </p>
          </article>
          <article className="step-card">
            <h3>Discover Restaurants</h3>
            <p>
              Browse curated options that match your needs, with clear labels and verified
              information.
            </p>
          </article>
          <article className="step-card">
            <h3>Dine Confidently</h3>
            <p>
              Enjoy your meal knowing it aligns with your beliefs, health requirements, or
              preferences.
            </p>
          </article>
        </div>
      </section>

      <section className="signup">
        <h2>Be the first to know</h2>
        <p className="signup-subtitle">
          Join our beta waitlist and help shape the future of inclusive dining.
        </p>
        <form onSubmit={handleSubmit} className="form">
          <label>
            <span>Full Name</span>
            <input type="text" name="fullName" placeholder="Your name" autoComplete="name" required />
          </label>
          <label>
            <span>Email Address</span>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>
          <label>
            <span>Phone Number</span>
            <input type="tel" name="phone" placeholder="+1 (555) 000-0000" autoComplete="tel" required />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? "Joining..." : "Join the Waitlist"}
          </button>
        </form>
        {state.message ? (
          <p className={state.type === "error" ? "status error" : "status success"}>{state.message}</p>
        ) : null}
        <p className="brand-footer">
          <Image src="/nakol-mark.svg" alt="Nakol icon" width={26} height={26} />
          <span>Nakol</span>
        </p>
      </section>
    </main>
  );
}
