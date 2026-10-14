import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { site } from "../content/site";
import { Arrow } from "../components/Arrow";
type Inquiry = {
  name: string;
  email: string;
  discipline: string;
  message: string;
};
export default function ContactPage() {
  const [draft, setDraft] = useState<Inquiry | null>(null);
  const [status, setStatus] = useState<
    "idle" | "sending" | "received" | "error" | "email"
  >("idle");
  const controller = useRef<AbortController | null>(null);
  const review = useRef<HTMLDivElement>(null);
  const configured = !!(site.inquiry.endpoint || site.inquiry.email);
  useEffect(
    () => () => {
      controller.current?.abort();
    },
    [],
  );
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;
    const data = new FormData(event.currentTarget);
    const inquiry = Object.fromEntries(
      ["name", "email", "discipline", "message"].map((key) => [
        key,
        String(data.get(key) ?? "").trim(),
      ]),
    ) as Inquiry;
    setDraft(inquiry);
    if (!configured) {
      setStatus("idle");
      requestAnimationFrame(() => review.current?.focus());
      return;
    }
    if (!site.inquiry.endpoint) {
      const body = `Name: ${inquiry.name}\nEmail: ${inquiry.email}\nDiscipline: ${inquiry.discipline}\n\n${inquiry.message}`;
      window.location.href = `mailto:${encodeURIComponent(site.inquiry.email)}?subject=${encodeURIComponent("Project inquiry — " + inquiry.name)}&body=${encodeURIComponent(body)}`;
      setStatus("email");
      return;
    }
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    const timeout = window.setTimeout(() => request.abort(), 15000);
    setStatus("sending");
    try {
      const response = await fetch(site.inquiry.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...inquiry, consent: true }),
        signal: request.signal,
      });
      const result = await response.json();
      if (!response.ok || result.received !== true)
        throw new Error("Delivery not confirmed");
      setStatus("received");
    } catch {
      if (controller.current === request) setStatus("error");
    } finally {
      window.clearTimeout(timeout);
    }
  };
  return (
    <>
      <section className="page-heading section-pad contact-heading" id="contact">
        <p className="eyebrow">Contact / Begin a conversation</p>
        <h1>
          What do you
          <br />
          <em>have in mind?</em>
        </h1>
        <p>Tell us a little about the space you’re imagining.</p>
      </section>
      <section
        className="contact-content section-pad"
        aria-label="Project inquiry"
      >
        <aside className="contact-aside">
          <p className="eyebrow">Discuss a project</p>
          <h2>
            A place
            <br />
            to <em>begin.</em>
          </h2>
          {configured ? (
            <p>
              Share your inquiry using the form.
              {site.inquiry.email && (
                <>
                  {" "}
                  You can also write to{" "}
                  <a
                    className="text-link"
                    href={`mailto:${site.inquiry.email}`}
                  >
                    {site.inquiry.email}
                  </a>
                  .
                </>
              )}
            </p>
          ) : (
            <div className="contact-status">
              <span className="status-dot" />
              <strong>Inquiry preview</strong>
              <p>
                Delivery isn’t connected yet. You can prepare and review an
                inquiry here; nothing will be sent.
              </p>
            </div>
          )}
          <Link className="line-link" to="/#work">
            Explore the work <Arrow diagonal />
          </Link>
        </aside>
        <div className="contact-form-wrap">
          <form onSubmit={submit} className="inquiry-form">
            <div className="form-pair">
              <label>
                Your name
                <input
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={120}
                  placeholder="Full name"
                />
              </label>
              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  placeholder="you@example.com"
                />
              </label>
            </div>
            <label>
              I’m interested in
              <select name="discipline" defaultValue="" required>
                <option value="" disabled>
                  Select a discipline
                </option>
                <option>Architecture</option>
                <option>Interior Design</option>
                <option>Architecture & Interior Design</option>
              </select>
            </label>
            <label>
              About your space
              <textarea
                name="message"
                required
                maxLength={3000}
                rows={5}
                placeholder="Your ideas, your priorities, where to begin…"
              />
            </label>
            {configured && (
              <label className="consent">
                <input type="checkbox" name="consent" required />
                <span>{site.inquiry.privacy}</span>
              </label>
            )}
            <div className="form-submit">
              <span>
                {configured
                  ? "Your details stay within this inquiry."
                  : "Preview only · No data is submitted or stored."}
              </span>
              <button
                className="inquiry-button"
                type="submit"
                disabled={status === "sending"}
              >
                {status === "sending"
                  ? "Sending…"
                  : !configured
                    ? "Preview inquiry"
                    : site.inquiry.endpoint
                      ? "Send inquiry"
                      : "Prepare email"}
                <Arrow diagonal />
              </button>
            </div>
          </form>
          <div
            role="status"
            className={`inquiry-result ${status}`}
            aria-live="polite"
          >
            {status === "received" && <p>Your inquiry has been received.</p>}
            {status === "error" && (
              <p>
                We couldn’t confirm delivery. Please try again
                {site.inquiry.email ? " or use the studio email" : ""}.
              </p>
            )}
            {status === "email" && (
              <p>
                Your email draft is ready in your email app. Send it there to
                complete your inquiry.
              </p>
            )}
          </div>
          {draft && !configured && (
            <div ref={review} className="inquiry-draft" tabIndex={-1}>
              <p className="eyebrow">Inquiry preview · Not sent</p>
              <h3>{draft.name}</h3>
              <p>
                {draft.email} · {draft.discipline}
              </p>
              <p className="draft-message">{draft.message}</p>
              <small>
                This preview stays in this page’s memory and disappears when you
                leave.
              </small>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
