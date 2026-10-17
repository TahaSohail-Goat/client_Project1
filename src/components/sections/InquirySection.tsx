import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { site } from "../../content/site";
import { Arrow } from "../Arrow";
import { CinematicHeading } from "../type/CinematicHeading";

type Inquiry = { name: string; email: string; discipline: string; location: string; message: string };
type Status = "idle" | "sending" | "received" | "error" | "email";
const briefText = (inquiry: Inquiry) => [
  "eco28 / Project inquiry", "", `Name: ${inquiry.name}`, `Email: ${inquiry.email}`,
  `Interested in: ${inquiry.discipline}`, ...(inquiry.location ? [`Project location: ${inquiry.location}`] : []),
  "", inquiry.message,
].join("\n");

export default function InquirySection() {
  const [draft, setDraft] = useState<Inquiry | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const controller = useRef<AbortController | null>(null);
  const review = useRef<HTMLDivElement>(null);
  const result = useRef<HTMLDivElement>(null);
  const configured = !!(site.inquiry.endpoint || site.inquiry.email);
  useEffect(() => () => { controller.current?.abort();controller.current = null; }, []);
  useEffect(() => {
    if (draft && !site.inquiry.endpoint) review.current?.focus();
    else if (status === "received" || status === "error" || status === "email") result.current?.focus();
  }, [draft, configured, status]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;
    const form = event.currentTarget;
    for (const key of ["name", "message"]) {
      const field = form.elements.namedItem(key) as HTMLInputElement | HTMLTextAreaElement;
      field.setCustomValidity(field.value.trim() ? "" : "Please complete this field.");
    }
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const inquiry = Object.fromEntries(
      ["name", "email", "discipline", "location", "message"].map(key => [key, String(data.get(key) ?? "").trim()]),
    ) as Inquiry;
    setDraft(inquiry);setCopyStatus("idle");
    if (!configured) { setStatus("idle");return; }
    if (!site.inquiry.endpoint) {
      setStatus("email");return;
    }
    controller.current?.abort();
    const request = new AbortController();controller.current = request;
    const timeout = window.setTimeout(() => request.abort(), 15000);
    setStatus("sending");
    try {
      const response = await fetch(site.inquiry.endpoint, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...inquiry, consent: true }), signal: request.signal,
      });
      const responseData = await response.json();
      if (!response.ok || responseData?.received !== true) throw new Error("Delivery not confirmed");
      if (controller.current === request && !request.signal.aborted) setStatus("received");
    } catch {
      if (controller.current === request) setStatus("error");
    } finally { window.clearTimeout(timeout); }
  };
  const copyBrief = async () => {
    if (!draft) return;
    try { await navigator.clipboard.writeText(briefText(draft));setCopyStatus("copied"); }
    catch { setCopyStatus("error"); }
  };
  const downloadBrief = () => {
    if (!draft) return;
    const url = URL.createObjectURL(new Blob([briefText(draft)], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");link.href = url;link.download = "eco28-project-inquiry.txt";link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <section id="contact" className="contact-section section-pad" aria-labelledby="contact-title">
      <div className="contact-intro">
        <p className="eyebrow">Contact / A new conversation</p>
        <CinematicHeading id="contact-title" lines={[
          { text: "Tell us about" }, { text: "your next space.", italic: true },
        ]} />
        <p className="contact-intro-copy">A place to live. A space to work. Something entirely your own. Tell us what you have in mind.</p>
      </div>
      <div className="contact-layout">
        <aside className="contact-context" aria-label="About your project">
          <figure className="contact-photo">
            <img src="/media/interior-reading-nook.webp"
              srcSet="/media/interior-reading-nook-480.webp 480w, /media/interior-reading-nook-768.webp 768w, /media/interior-reading-nook.webp 1280w"
              sizes="(max-width: 767px) 100vw, 40vw" alt="A quiet interior with two lounge chairs, warm timber and filtered daylight" width="1280" height="639" loading="lazy" />
            <figcaption><span>A considered way of living.</span><span>eco28</span></figcaption>
          </figure>
          <div className="contact-context-copy">
            <h3>From the first idea<br />to the finest detail.</h3>
            <p>Architecture and interiors, considered together. Share your ideas, your priorities, and the possibilities you see.</p>
          </div>
          <dl className="contact-details">
            <div><dt>Our disciplines</dt><dd>Architecture &amp; Interior Design</dd></div>
            {site.inquiry.email && <div><dt>Write to us</dt><dd><a href={`mailto:${site.inquiry.email}`}>{site.inquiry.email}</a></dd></div>}
            {site.contact.phone && <div><dt>Call the studio</dt><dd><a href={`tel:${site.contact.phone.replace(/[^+\d]/g, "")}`}>{site.contact.phone}</a></dd></div>}
            {site.contact.whatsapp && <div><dt>Message us</dt><dd><a href={`https://wa.me/${site.contact.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">WhatsApp <Arrow diagonal /></a></dd></div>}
            {site.contact.location && <div><dt>Studio</dt><dd>{site.contact.location}</dd></div>}
          </dl>
          <Link className="line-link" to="/#work">Explore our work <Arrow diagonal /></Link>
        </aside>
        <div className="contact-form-wrap">
          <div className="contact-form-heading"><span className="eyebrow">Your project brief</span><span>01 / A few details</span></div>
          <form onSubmit={submit} className="inquiry-form" aria-label="Project inquiry" aria-busy={status === "sending"} onInput={event => {
            const field = event.target;
            if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) field.setCustomValidity("");
            if (status !== "sending") { setStatus("idle");setDraft(null);setCopyStatus("idle"); }
          }}>
            <p className="form-required-note">Fields marked <span aria-hidden="true">*</span> are required.</p>
            <fieldset className="inquiry-fields" disabled={status === "sending"}>
              <legend className="sr-only">Your contact and project details</legend>
              <div className="form-pair">
                <label>Your name <span className="field-required" aria-hidden="true">*</span><input name="name" autoComplete="name" required maxLength={120} placeholder="Full name" /></label>
                <label>Email address <span className="field-required" aria-hidden="true">*</span><input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" /></label>
              </div>
              <div className="form-pair">
                <label>I’m interested in <span className="field-required" aria-hidden="true">*</span><select name="discipline" defaultValue="" required>
                  <option value="" disabled>Select a discipline</option><option>Architecture</option><option>Interior Design</option><option value="Architecture & Interior Design">Both disciplines</option>
                </select></label>
                <label>Project location <span className="field-optional">Optional</span><input name="location" autoComplete="address-level2" maxLength={180} placeholder="City or area" /></label>
              </div>
              <label>About your space <span className="field-required" aria-hidden="true">*</span><textarea name="message" required maxLength={3000} rows={5} placeholder="Tell us about the space, its scale, your priorities and any timeline you have in mind." /></label>
              {configured && <label className="consent"><input type="checkbox" name="consent" required /><span>{site.inquiry.privacy}</span></label>}
            </fieldset>
            <div className="form-submit">
              <p className="form-delivery-note">{configured
                ? site.inquiry.endpoint ? "We’ll use your details to respond to this inquiry." : "Review your brief, then send it from your email app."
                : "Prepare a brief to copy or download. This form does not send messages yet."}</p>
              <button className="inquiry-button" type="submit" disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : site.inquiry.endpoint ? "Send inquiry" : "Review inquiry"}<Arrow diagonal />
              </button>
            </div>
          </form>
          <div ref={result} role="status" className={`inquiry-result ${status}`} aria-live="polite" tabIndex={-1}>
            {status === "sending" && <p>Sending your inquiry…</p>}
            {status === "received" && <><h3>Thank you for sharing your plans.</h3><p>Your inquiry has been received by eco28. We look forward to learning more about your project.</p></>}
            {status === "error" && <><h3>We couldn’t confirm delivery.</h3><p>Your details are still in the form. Please try again{site.inquiry.email ? <> or <a className="text-link" href={`mailto:${site.inquiry.email}`}>email the studio</a></> : ""}.</p></>}
          </div>
          {draft && !site.inquiry.endpoint && <div ref={review} className="inquiry-draft" tabIndex={-1} aria-labelledby="draft-heading">
            <p className="eyebrow">Your project brief / Not sent</p>
            <h3 id="draft-heading">Ready when you are.</h3>
            <dl><div><dt>Name</dt><dd>{draft.name}</dd></div><div><dt>Email</dt><dd>{draft.email}</dd></div><div><dt>Project</dt><dd>{draft.discipline}</dd></div>{draft.location && <div><dt>Location</dt><dd>{draft.location}</dd></div>}</dl>
            <p className="draft-message">{draft.message}</p>
            {site.inquiry.email && <a className="draft-email" href={`mailto:${site.inquiry.email}?subject=${encodeURIComponent("Project inquiry — " + draft.name)}&body=${encodeURIComponent(briefText(draft))}`}>Open email draft <Arrow diagonal /></a>}
            <div className="draft-actions"><button type="button" onClick={copyBrief}>Copy brief <Arrow /></button><button type="button" onClick={downloadBrief}>Download brief <Arrow diagonal /></button></div>
            {site.inquiry.email && <p className="draft-recipient">Addressed to {site.inquiry.email}. Send it from your email app to complete your inquiry.</p>}
            <p className="draft-copy-status" role="status">{copyStatus === "copied" ? "Brief copied to your clipboard." : copyStatus === "error" ? "Copy is unavailable. You can download your brief instead." : site.inquiry.email ? "No email app? Copy or download your brief to send it another way." : "Your brief stays on this page until you copy or download it."}</p>
          </div>}
        </div>
      </div>
    </section>
  );
}
