export const categories = [
  { id: 1, name: "Development", count: 1245, icon: "code" },
  { id: 2, name: "Design", count: 856, icon: "pen" },
  { id: 3, name: "Business", count: 643, icon: "briefcase" },
  { id: 4, name: "Lifestyle", count: 512, icon: "person" },
  { id: 5, name: "Music", count: 425, icon: "music" },
  { id: 6, name: "Language", count: 386, icon: "globe" },
];

export const trendingSkills = [
  { id: 1, name: "Web Development", learners: 1234, icon: "code" },
  { id: 2, name: "UI/UX Design", learners: 876, icon: "pen" },
  { id: 3, name: "Digital Marketing", learners: 642, icon: "megaphone" },
  { id: 4, name: "Photography", learners: 532, icon: "camera" },
  { id: 5, name: "Video Editing", learners: 421, icon: "video" },
];

export const skills = [
  {
    id: 1,
    name: "Web Development",
    teacher: "Rahul Sharma",
    rating: 4.9,
    reviews: 120,
    learners: 230,
    tag: "Popular",
    icon: "code",
  },
  {
    id: 2,
    name: "UI/UX Design",
    teacher: "Priya Singh",
    rating: 4.8,
    reviews: 98,
    learners: 180,
    icon: "pen",
  },
  {
    id: 3,
    name: "Photography",
    teacher: "Arjun Mehta",
    rating: 4.7,
    reviews: 75,
    learners: 150,
    icon: "camera",
  },
  {
    id: 4,
    name: "Digital Marketing",
    teacher: "Neha Patel",
    rating: 4.9,
    reviews: 110,
    learners: 210,
    icon: "megaphone",
  },
];

export const suggestedUsers = [
  { id: 1, name: "Neha Patel", skill: "Python Programming" },
  { id: 2, name: "Karan Shah", skill: "Graphic Design" },
];

export const swapRequests = [
  {
    id: 1,
    name: "Rahul Sharma",
    wantsToLearn: "Node.js",
    youTeach: "React.js",
    status: "Pending",
  },
  {
    id: 2,
    name: "Priya Singh",
    wantsToLearn: "Figma",
    youTeach: "UI/UX Design",
    status: "Pending",
  },
  {
    id: 3,
    name: "Arjun Mehta",
    wantsToLearn: "SEO",
    youTeach: "Digital Marketing",
    status: "Accepted",
  },
];

export const currentUser = {
  name: "Ankit Verma",
  role: "Web Developer & Mentor",
  location: "Pune, Maharashtra, India",
  joined: "May 2024",
  skills: 8,
  followers: 125,
  following: 98,
  rating: 4.9,
  mySkills: [
    { name: "Node.js", level: "Advanced" },
    { name: "React.js", level: "Advanced" },
    { name: "MongoDB", level: "Intermediate" },
    { name: "Express.js", level: "Intermediate" },
  ],
};

export const chatMessages = [
  { id: 1, from: "them", text: "Hi Ankit! I'd like to learn Node.js from you.", time: "10:30 AM" },
  { id: 2, from: "me", text: "Sure! I'd love to teach you Node.js.", time: "10:31 AM" },
  { id: 3, from: "them", text: "What do you want to learn from me?", time: "10:32 AM" },
  { id: 4, from: "me", text: "React.js would be great!", time: "10:33 AM" },
  { id: 5, from: "them", text: "Perfect! Let's start our skill swap journey.", time: "10:34 AM" },
];

export const chatThreads = [
  { id: 1, name: "Rahul Sharma", lastMessage: "Perfect! Let's start our skill swap journey.", time: "10:34 AM", online: true, unread: 0 },
  { id: 2, name: "Priya Singh", lastMessage: "Sounds good, see you then!", time: "9:12 AM", online: false, unread: 2 },
  { id: 3, name: "Arjun Mehta", lastMessage: "Thanks for accepting my request.", time: "Yesterday", online: true, unread: 0 },
];
