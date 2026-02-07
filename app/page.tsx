"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

type SubmitState = {
  type: "idle" | "success" | "error";
  message: string;
};

async function safeReadJson(response: Response): Promise<{ error?: string }> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return {};
  try {
    return (await response.json()) as { error?: string };
  } catch {
    return {};
  }
}

export default function Home() {
  const [state, setState] = useState<SubmitState>({
    type: "idle",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
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

      const payload = await safeReadJson(response);

      if (!response.ok) {
        const fallbackByStatus: Record<number, string> = {
          400: "Please check your input fields.",
          409: "This email is already registered.",
          500: "Server error. Please try again in a moment."
        };
        setState({
          type: "error",
          message: payload?.error ?? fallbackByStatus[response.status] ?? "Could not save your details. Try again."
        });
        return;
      }

      setState({ type: "success", message: "Saved. We will contact you soon." });
      if (typeof form?.reset === "function") {
        try {
          form.reset();
        } catch {
          // Ignore reset failures; submit already succeeded.
        }
      }
    } catch {
      setState({ type: "error", message: "Request failed. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page">
      <div className="ambient ambient-a" aria-hidden />
      <div className="ambient ambient-b" aria-hidden />

      <header className="topbar">
        <div className="brand-lockup">
          <Image src="/nakol-mark.svg" alt="Nakol icon" width={34} height={34} priority />
          <span>Nakol</span>
        </div>
        <span className="top-badge">Coming Soon</span>
      </header>

      <section className="hero panel">
        <div className="hero-copy">
          <p className="eyebrow">Nakol</p>
          <p className="coming">Coming Soon</p>
          <h1>Find food that fits you</h1>
          <p className="subtitle">
            Discover restaurants and dishes that align with your dietary needs. Halal, kosher,
            allergen-free - eat safely, eat confidently.
          </p>
          <div className="hero-actions">
            <a href="#waitlist" className="cta-primary">
              Join Beta Waitlist
            </a>
            <a href="#how-it-works" className="cta-ghost">
              How it works
            </a>
          </div>
        </div>

        <aside className="hero-side">
          <p className="side-title">Built for inclusive dining</p>
          <ul className="feature-list">
            <li>Dietary Safety</li>
            <li>Allergen Alerts</li>
            <li>Restaurant Tools</li>
          </ul>
          <p className="side-note">
            Everyone deserves to eat with confidence. We help diners discover safer options and
            help restaurants communicate clearly.
          </p>
        </aside>
      </section>

      <section className="story panel">
        <h2>Everyone deserves to eat with confidence</h2>
        <p>
          Whether it&apos;s religious requirements, allergies, or personal preferences, finding
          safe food shouldn&apos;t be stressful. Nakol connects you with restaurants that understand
          your needs - and helps restaurants communicate theirs effortlessly.
        </p>
      </section>

      <section className="steps panel" id="how-it-works">
        <h2>How it works</h2>
        <p className="steps-subtitle">Simple for diners. Simple for restaurants.</p>
        <div className="step-grid">
          <article className="step-card">
            <span className="step-number">01</span>
            <h3>Set Your Preferences</h3>
            <p>
              Tell us about your dietary requirements - halal, kosher, vegan, nut-free, gluten-free,
              and more.
            </p>
          </article>
          <article className="step-card">
            <span className="step-number">02</span>
            <h3>Discover Restaurants</h3>
            <p>
              Browse curated options that match your needs, with clear labels and verified
              information.
            </p>
          </article>
          <article className="step-card">
            <span className="step-number">03</span>
            <h3>Dine Confidently</h3>
            <p>
              Enjoy your meal knowing it aligns with your beliefs, health requirements, or
              preferences.
            </p>
          </article>
        </div>
      </section>

      <section className="signup panel" id="waitlist">
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
      </section>

      <footer className="brand-footer">
        <Image src="/nakol-mark.svg" alt="Nakol icon" width={22} height={22} />
        <span>Nakol</span>
      </footer>
    </main>
  );
}
