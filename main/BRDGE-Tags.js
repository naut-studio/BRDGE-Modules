// =============================================================================
// SOURCE OF TRUTH for tags (groups + full vocabulary).
// The website fetches this file at runtime. Two copies must mirror it:
//   - use-tag-constants.ts  (local fallback if the fetch fails)
//   - the Notion "Tags" dropdown in the BRDGE Modules database (data-entry gate)
//
// AFTER EDITING THIS FILE — in Claude Code (BRDGE-Modules project), say:
//   "I updated BRDGE-Tags.js — sync the fallback and the Notion dropdown."
// It rewrites use-tag-constants.ts to match, updates the Notion Tags options,
// and shows you what changed. Removals/renames are flagged, not silently deleted.
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
