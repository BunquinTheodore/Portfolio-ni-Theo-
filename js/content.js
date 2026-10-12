// All copy and data for the site. Replace the placeholder values with your own; nothing else needs to change.
export const CONTENT = {
  person: {
    lines: ["THEODORE", "VON", "JOSHUA"],
    first: "Theodore",
    last: "Von Joshua",
    title: "Full Stack AI Engineer",
    tagline: "I build AI tools, RAG systems, and web and mobile apps.",
  },
  words: ["BUILD", "SHIP", "ITERATE", "REPEAT"],
  location: { city: "Your City", country: "Your Country", lat: 51.5, lon: -0.12, tz: "Europe/London", tzLabel: "GMT+0" },
  education: {
    degree: "Bachelor of Science in Computer Science",
    short: "BS Computer Science",
    school: "Your University",
    place: "Your City, Your Country",
    years: "2021 — 2025",
  },
  work: [
    { company: "Company One", role: "AI Engineer", since: "2026", url: "https://example.com", domain: "company-one.com" },
    { company: "Startup Two", role: "Co-Founder, CTO", since: "2026", url: "https://example.com", domain: "startup-two.com" },
    { company: "Studio Three", role: "Co-Founder, COO", since: "2025", url: "https://example.com", domain: "studio-three.com" },
    { company: "Client Four", role: "Full Stack Developer", since: "2023", url: "https://example.com", domain: "client-four.com" },
  ],
  // one entry per gun part; `primary` lists the item indexes drawn as the strongest skills
  skills: {
    suppressor: { part: "Suppressor", group: "AI & ML", items: ["Prompt Engineering", "RAG Systems", "LLM Fine-Tuning", "Whisper (STT)", "Semantic Kernel", "LoRA", "Hugging Face", "Vector DBs"], primary: [0, 1, 2] },
    barrel: { part: "Barrel", group: "Backend", items: ["Node.js", "Vercel", "PostgreSQL", "Prisma", "REST API", "Firebase", "Docker"], primary: [0, 2] },
    slide: { part: "Slide", group: "Frameworks", items: ["Next.js", "React", "Tailwind", "GSAP", "Shadcn", "Three.js", "R3F / Drei", "WPF"], primary: [0, 1, 5] },
    frame: { part: "Frame", group: "Languages", items: ["Python", "C#", "Kotlin", "Java", "TypeScript", "JavaScript", "C++", "C", "Rust", "Bash"], primary: [0, 4] },
    sights: { part: "Sights", group: "Tools", items: ["Git", "Android Studio", "IntelliJ", ".NET", "JADX", "LSPosed"], primary: [0] },
    grip: { part: "Grip", group: "Creative", items: ["Photoshop", "After Effects", "Premiere Pro", "Blender"], primary: [0, 3] },
  },
  projects: [
    { name: "Project One", category: "AI · C#", field: "ink", url: "https://example.com" },
    { name: "Project Two", category: "AI · Rust", field: "red", url: "https://example.com" },
    { name: "Project Three", category: "AI · LLM", field: "bone", url: "https://example.com" },
    { name: "Project Four", category: "AI · RAG", field: "ink", url: "https://example.com" },
    { name: "Project Five", category: "Mobile · Kotlin", field: "red", url: "https://example.com" },
    { name: "Project Six", category: "Automation · Java", field: "bone", url: "https://example.com" },
    { name: "Project Seven", category: "Mobile · Kotlin", field: "ink", url: "https://example.com" },
    { name: "Project Eight", category: "Web · Next.js", field: "red", url: "https://example.com" },
  ],
  // two showcase frames (scenes 21 and 22)
  showcases: [
    {
      field: "bone", title: ["Project", "Five"], accent: "Five", ghost: "5",
      pitch: "A one-line pitch for this mobile project", strikes: ["Noise", "Friction", "Telemetry"],
      stack: "Kotlin · Compose · Firebase", badge: { big: "WIN", small: "Featured" },
      links: [["Source code", "https://example.com"], ["View post", "https://example.com"]],
    },
    {
      field: "ink", title: ["Project", "Seven"], accent: "Seven", ghost: "7",
      pitch: "A one-line pitch · replaces the manual process", features: ["Scan", "Sync", "Offline"],
      stack: "Kotlin · Firebase · RFID · Android", badge: { big: "2nd", small: "Competition 2025" },
      links: [["View post", "https://example.com"]],
    },
  ],
  certs: [
    { title: "CS50 AI with Python", issuer: "Harvard", url: "https://example.com" },
    { title: "Gen AI Fundamentals", issuer: "Databricks", url: "https://example.com" },
    { title: "Agents Course", issuer: "Hugging Face", url: "https://example.com" },
    { title: "AI Agents Fundamentals", issuer: "Hugging Face", url: "https://example.com" },
  ],
  contact: {
    headline: "LET'S TALK",
    links: [
      { label: "Email", value: "hello@example.com", url: "mailto:hello@example.com" },
      { label: "LinkedIn", value: "your-handle", url: "https://linkedin.com/in/your-handle" },
      { label: "GitHub", value: "your-handle", url: "https://github.com/your-handle" },
      { label: "Facebook", value: "Your Name", url: "https://facebook.com/your-handle" },
      { label: "Resume", value: "PDF · 2026", url: "resume/resume.pdf" },
    ],
  },
};
