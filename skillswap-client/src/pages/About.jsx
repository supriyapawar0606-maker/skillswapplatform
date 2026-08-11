import { FiUsers, FiTarget, FiHeart } from "react-icons/fi";

const values = [
  { icon: FiUsers, title: "Community First", desc: "Everything we build starts with the people who teach and learn on SkillSwap." },
  { icon: FiTarget, title: "Mutual Growth", desc: "Skill swaps mean everyone walks away having taught and learned something." },
  { icon: FiHeart, title: "Trust & Safety", desc: "Reviews, verified profiles, and reporting tools keep the community safe." },
];

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl font-bold mb-4 text-center">About SkillSwap</h1>
      <p className="text-gray-500 text-center max-w-xl mx-auto mb-14">
        SkillSwap connects people who want to teach what they know with people who want to learn it —
        no money required, just a fair exchange of time and knowledge.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {values.map((v) => (
          <div key={v.title} className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
              <v.icon size={22} />
            </div>
            <h3 className="font-semibold mb-2">{v.title}</h3>
            <p className="text-sm text-gray-500">{v.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
