// =============================================================================
// BRDGE - TAG GROUPS
// =============================================================================
// Source of truth for all available tags and their filter groups.
// Adding a tag here makes it available in module JS files and in the filters.
// Group title = filter dropdown label in the UI.
// =============================================================================

export const tagGroups = [
  {
    title: "Timing",
    tags: ["Pre-Event", "Live", "Post-Event"]
  },
  {
    title: "Format",
    tags: ["Large", "Small", "Mobile", "Wearable"]
  },
  {
    title: "Mood",
    tags: ["Collaborative", "Competitive", "High Energy", "Calm", "Icebreaker", "Wow Factor", "Viral", "Memorable", "Immersive", "Wellness"]
  },
  {
    title: "Mechanics",
    tags: ["Gamified", "Single Player", "Multiplayer", "Reflex", "Timed", "Chance", "Voting", "Trivia", "Real-Time", "Generative"]
  },
  {
    title: "Technology",
    tags: ["Projection", "Touchscreen", "AI-Powered", "AR / XR", "Computer Vision", "Body Tracking", "NFC / RFID / QR Code", "Phygital"]
  },
  {
    title: "Content & Output",
    tags: ["User-Generated", "Video", "Print", "Storytelling", "Personalized"]
  },
  {
    title: "Accessibility",
    tags: ["Family Friendly", "Low Barrier", "Multi-Language", "Journey"]
  },
  {
    title: "Venue",
    tags: ["Museum", "Exhibition", "Conference", "Trade Show", "Retail", "Corporate Event", "Festival", "Pop-Up"]
  },
  {
    title: "Goal",
    tags: ["Brand Activation", "Sponsorship", "Lead Generation", "Loyalty", "Reward", "Data Collection", "Leaderboard", "Educational"]
  }
];
