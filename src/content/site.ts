// All editorial copy is draft copy for approval. No project associations are implied.
export const site = {
  name: "eco28",
  brandPending: false,
  disciplines: "Architecture & Interior Design",
  hero: ["Design, made", "tangible."],
  statement: ["Space. Light.", "A way of living."],
  intro:
    "An exploration of architecture and interiors. From the scale of a facade to the quiet detail of a room.",
  approach:
    "A considered relationship between the outside and the inside. Between the places we inhabit and the way we feel within them.",
  studio:
    "Architecture and interior design, seen together. This portfolio brings architectural perspectives, interior spaces and physical model studies into view.",
  inquiry: {
    // Set a confirmed studio email OR a same-origin/approved HTTPS JSON POST endpoint.
    email: "tahasohail85@gmail.com",
    endpoint: import.meta.env.VITE_INQUIRY_ENDPOINT?.trim() || "",
    privacy:
      "I agree to be contacted by eco28 about this project inquiry.",
  },
  // Add only confirmed, approved studio details; empty entries are not displayed.
  contact: { phone: "", whatsapp: "", location: "" },
};
