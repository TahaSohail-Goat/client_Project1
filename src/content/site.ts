export const site = {
  name: "eco28",
  disciplines: "Architecture & Interior Design",
  hero: ["Design, made", "tangible."],
  statement: ["Space. Light.", "A way of living."],
  intro:
    "Architecture and interiors, from the first impression to the smallest detail.",
  approach:
    "Spaces shaped around light, proportion and the way we live.",
  studio:
    "We bring architecture and interiors together, with care for how a space looks, feels and works.",
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
