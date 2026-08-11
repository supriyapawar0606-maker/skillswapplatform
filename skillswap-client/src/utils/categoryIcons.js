// Maps real Skill.category values (from the backend enum) to the icon keys
// that <SkillIcon /> understands, so pages can render real category data
// through the existing UI without changing SkillIcon itself.
export const categoryIconMap = {
  Programming: "code",
  Design: "pen",
  Language: "globe",
  Music: "music",
  Marketing: "megaphone",
  Business: "briefcase",
  Photography: "camera",
  Cooking: "person",
  Fitness: "person",
  Other: "code",
};

export function iconForCategory(name) {
  return categoryIconMap[name] || "code";
}
