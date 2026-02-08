"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

type SubmitState = {
  type: "idle" | "success" | "error";
  message: string;
};

type DishItem = {
  name: string;
  place: string;
  distance: string;
  lines: string[];
  proof: string;
  tone?: "normal" | "warning";
};

const exploreItems: DishItem[] = [
  {
    name: "Grilled Salmon Bowl",
    place: "Sakura Kitchen",
    distance: "0.6 mi",
    lines: ["Halal: confirmed", "Dairy: none", "Soy: unknown", "Gluten-free: friendly"],
    proof: "Proof: restaurant confirmation - updated 2d ago"
  },
  {
    name: "Chickpea Shawarma Plate",
    place: "Mosaic Deli",
    distance: "1.2 mi",
    lines: ["Vegan: confirmed", "Sesame: friendly", "Peanuts: none", "Tree nuts: unknown"],
    proof: "Proof: menu + staff note - updated today"
  },
  {
    name: "Pesto Pasta",
    place: "Osteria Blu",
    distance: "2.1 mi",
    lines: ["Contains: dairy", "Allergy risk: high", "Egg: yes", "Wheat: yes"],
    proof: "Proof: restaurant confirmation - updated 1w ago",
    tone: "warning"
  },
  {
    name: "Soba + Tempura",
    place: "Kumo Noodles",
    distance: "0.9 mi",
    lines: ["Gluten-free: unknown", "Wheat: unknown", "Soy: unknown", "Fish: none"],
    proof: "Proof: not provided - ask restaurant"
  }
];

const featureCards = [
  {
    title: "3-state tags",
    body: "Every label is confirmed, friendly, or unknown - never assumed."
  },
  {
    title: "Dish-first feed",
    body: "Stop guessing from restaurant-level labels. Scroll dishes and see badges right away."
  },
  {
    title: "Proof and freshness",
    body: "Tap any badge to see source details and when information was last updated."
  },
  {
    title: "Allergen coverage",
    body: "Track Big-9 allergens plus custom constraints in one profile."
  },
  {
    title: "Ask and resolve",
    body: "When something is unknown, message restaurants or community to resolve it."
  }
];

const faqItems = [
  {
    q: "Do you guess if a dish is safe?",
    a: "No. If we do not have proof, the badge stays unknown. Nakol does not infer safety from reviews."
  },
  {
    q: "How do restaurants verify?",
    a: "Restaurants can confirm dish-level flags, attach notes, and publish updates with timestamps."
  },
  {
    q: "Is this for allergies only?",
    a: "No. Nakol supports religious and lifestyle constraints too, including halal, kosher, vegan, and gluten-free."
  },
  {
    q: "When will it launch?",
    a: "We are rolling out city by city. Join the waitlist and we will notify you when your city is ready."
  }
];

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
          // Ignore reset failure when submit already succeeded.
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
      <header className="topbar">
        <div className="brand-lockup">
          <Image src="/nakol-mark.svg" alt="Nakol icon" width={30} height={30} priority />
          <span>Nakol</span>
        </div>

        <nav className="topnav">
          <a href="#hero">Find food that fits you</a>
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#restaurants">For restaurants</a>
          <a href="#faq">FAQ</a>
        </nav>

        <a className="top-cta" href="#waitlist">
          Join waitlist <span aria-hidden>&rarr;</span>
        </a>
      </header>

      <section className="hero panel" id="hero">
        <div className="hero-main">
          <p className="kicker">Dish-first discovery for dietary needs</p>
          <h1>Find food that fits you.</h1>
          <p className="subtitle">
            Scroll a personalized feed of dishes that match your constraints - halal, kosher,
            vegan, gluten-free, and allergies. Anything unverified stays unknown. We do not guess.
          </p>

          <div className="hero-actions">
            <a href="#waitlist" className="cta-primary">
              Get early access
            </a>
            <a href="#how-it-works" className="cta-ghost">
              See how it works
            </a>
          </div>

          <ul className="micro-list">
            <li>3-state tags (confirmed / friendly / unknown)</li>
            <li>Big-9 allergens + custom</li>
            <li>Restaurant confirmations</li>
          </ul>
        </div>

        <aside className="explore panel-soft" aria-label="Explore demo dishes">
          <div className="explore-head">
            <h2>Explore</h2>
            <span>Verified mode</span>
          </div>

          <div className="dish-feed">
            {exploreItems.map((item) => (
              <article key={item.name} className={`dish-card ${item.tone === "warning" ? "is-warning" : ""}`}>
                <h3>{item.name}</h3>
                <p className="dish-meta">
                  {item.place} | {item.distance}
                </p>
                <ul>
                  {item.lines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <p className="dish-proof">{item.proof}</p>
              </article>
            ))}
          </div>

          <p className="explore-note">Tap a badge to see proof</p>
          <p className="explore-city">NYC demo data</p>
        </aside>
      </section>

      <section className="constraints panel-soft">
        <h2>Built for real constraints</h2>
        <p>Halal | Kosher | Vegan | Vegetarian | Gluten-free | Big-9 Allergens</p>
        <p>No guessing | Dish-level pages | Versioned menus | Proof tiers</p>
      </section>

      <section className="features panel" id="features">
        <h2>Features that build trust</h2>
        <p className="section-copy">
          Most apps infer dietary safety from reviews. Nakol makes the status explicit and shows
          what is actually verified.
        </p>

        <div className="feature-grid">
          {featureCards.map((feature) => (
            <article key={feature.title} className="feature-card">
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="steps panel" id="how-it-works">
        <h2>How it works</h2>
        <p className="section-copy">A simple loop that improves accuracy over time.</p>

        <div className="workflow">
          <article className="step-row">
            <span className="step-number">Step 1</span>
            <div>
              <h3>Set your constraints</h3>
              <p>
                Pick halal, kosher, vegan, or allergy preferences once. Your profile is reused
                everywhere.
              </p>
            </div>
          </article>

          <article className="step-row">
            <span className="step-number">Step 2</span>
            <div>
              <h3>Scroll dishes</h3>
              <p>A feed ranks dishes by fit and shows clear badges with confidence states.</p>
            </div>
          </article>

          <article className="step-row">
            <span className="step-number">Step 3</span>
            <div>
              <h3>Verify and share</h3>
              <p>Restaurants confirm labels. Users share updates, and proof stays attached.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="restaurants panel" id="restaurants">
        <h2>For restaurants</h2>
        <p className="section-copy">
          Turn any menu into dish pages, then confirm allergens and dietary flags without extra
          staff load.
        </p>

        <div className="restaurant-grid">
          <article className="restaurant-card">
            <h3>Menu to structured dishes</h3>
            <p>Upload a PDF, link, or photo. Nakol converts it into editable dish cards.</p>
            <ul>
              <li>Versioned updates when menus change</li>
              <li>Dish-level badges shown to diners</li>
              <li>Unknown when not provided (no risky inference)</li>
            </ul>
          </article>

          <article className="restaurant-card highlight">
            <h3>Answer fewer repetitive questions</h3>
            <p>When you confirm once, diners see it immediately.</p>
            <p className="example">
              Example: &ldquo;Does this contain sesame?&rdquo; then badge shown on the dish.
            </p>
          </article>
        </div>
      </section>

      <section className="signup panel" id="waitlist">
        <h2>Want this in your city?</h2>
        <p className="section-copy">
          Join the waitlist and tell us your dietary needs. We will invite you when we launch.
        </p>

        <form onSubmit={handleSubmit} className="form">
          <label>
            <span>Full Name</span>
            <input type="text" name="fullName" placeholder="Your name" autoComplete="name" required />
          </label>
          <label>
            <span>Email Address</span>
            <input type="email" name="email" placeholder="you@example.com" autoComplete="email" required />
          </label>
          <label>
            <span>Phone Number</span>
            <input type="tel" name="phone" placeholder="+1 (555) 000-0000" autoComplete="tel" required />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? "Joining..." : "Join waitlist"}
          </button>
        </form>

        <div className="waitlist-links">
          <a href="#waitlist">Join waitlist</a>
          <a href="#faq">Read FAQ</a>
        </div>

        {state.message ? (
          <p className={state.type === "error" ? "status error" : "status success"}>{state.message}</p>
        ) : null}
      </section>

      <section className="faq panel" id="faq">
        <h2>FAQ</h2>
        <p className="section-copy">Quick answers.</p>

        <div className="faq-list">
          {faqItems.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="footer">
        <div className="brand-lockup">
          <Image src="/nakol-mark.svg" alt="Nakol icon" width={24} height={24} />
          <span>Nakol</span>
        </div>
        <p>Copyright 2026 | All rights reserved</p>
        <p>Made with &lt;3 for safer eating.</p>
      </footer>
    </main>
  );
}
