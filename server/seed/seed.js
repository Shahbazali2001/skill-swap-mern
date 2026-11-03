/**
 * Full Database Seed Script for SkillSwap (FR1 - FR12)
 *
 * Populates:
 * 1. Categorized Skill Catalog (FR3)
 * 2. Admin account + Demo User accounts with bio, location, skills (FR1, FR2, FR12)
 * 3. Pending, Accepted, and Completed Swap Requests (FR6)
 * 4. Real-time Chat Conversation with initial messages (FR7)
 * 5. Ratings and Community Reviews with attribute tags (FR8)
 * 6. Calculated Trust Scores & Tiers (FR9)
 * 7. In-App Notifications (FR11)
 * 8. User Moderation Report (FR12)
 */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Skill = require("../models/Skill");
const SwapRequest = require("../models/SwapRequest");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Review = require("../models/Review");
const Notification = require("../models/Notification");
const Report = require("../models/Report");
const { calculateTrustScore } = require("../services/trustScoreService");

const SKILLS = [
  {
    name: "Python Programming",
    category: "IT",
    description: "Core Python, scripting, data analysis, and backend APIs",
  },
  {
    name: "Web Development",
    category: "IT",
    description: "Fullstack React, HTML, CSS, JavaScript, and Node.js",
  },
  {
    name: "Excel & Data Analysis",
    category: "IT",
    description: "Advanced formulas, pivot tables, and dashboards",
  },
  {
    name: "Video Editing",
    category: "IT",
    description: "Premiere Pro, DaVinci Resolve, transitions and color grading",
  },
  {
    name: "Graphic Design",
    category: "Arts",
    description: "Logo design, Adobe Photoshop, Illustrator, and typography",
  },
  {
    name: "Photography",
    category: "Arts",
    description: "Portrait, landscape, framing, lighting and RAW editing",
  },
  {
    name: "Urdu Calligraphy",
    category: "Arts",
    description: "Traditional Nastaliq and modern Arabic calligraphy",
  },
  {
    name: "Guitar",
    category: "Music",
    description: "Acoustic and electric guitar chords, rhythm, and fingerstyle",
  },
  {
    name: "Piano & Keyboard",
    category: "Music",
    description: "Sight reading, scales, chords, and classical/pop pieces",
  },
  {
    name: "Cooking - Pakistani Cuisine",
    category: "Cooking",
    description: "Biryani, Karahi, Nihari, spices, and traditional breads",
  },
  {
    name: "Baking & Pastries",
    category: "Cooking",
    description: "Artisan bread, cakes, cookies, and dessert decoration",
  },
  {
    name: "English Speaking & IELTS",
    category: "Languages",
    description:
      "Fluency, conversational practice, pronunciation, and IELTS prep",
  },
  {
    name: "Spanish for Beginners",
    category: "Languages",
    description: "Everyday vocabulary, grammar, and pronunciation",
  },
  {
    name: "Digital Marketing & SEO",
    category: "Business",
    description: "Search optimization, social media ads, and copy",
  },
  {
    name: "Public Speaking & Presentation",
    category: "Business",
    description: "Storytelling, slide design, and confident speech delivery",
  },
  {
    name: "Chess Strategy",
    category: "Sports",
    description: "Openings, tactical puzzles, endgames, and positional play",
  },
];

async function run() {
  await connectDB();

  console.log("[Seed] Clearing all existing collections...");
  await Promise.all([
    User.deleteMany({}),
    Skill.deleteMany({}),
    SwapRequest.deleteMany({}),
    Conversation.deleteMany({}),
    Message.deleteMany({}),
    Review.deleteMany({}),
    Notification.deleteMany({}),
    Report.deleteMany({}),
  ]);

  console.log("[Seed] Inserting categorized skill catalog...");
  const skillDocs = await Skill.insertMany(SKILLS);
  const byName = Object.fromEntries(skillDocs.map((s) => [s.name, s]));

  const passwordHash = await bcrypt.hash("password123", 10);

  console.log("[Seed] Creating Admin and Demo User accounts...");

  // 1. Admin User (FR12)
  const admin = await User.create({
    name: "Admin Supervisor",
    email: "admin@skillswap.test",
    passwordHash,
    role: "admin",
    headline: "SkillSwap Platform Administrator",
    bio: "Platform moderator managing users, skill catalog, and community safety.",
    location: "Islamabad, Pakistan",
    trustScore: 98,
    trustTier: "Master Swapper",
    isVerified: true,
  });

  // 2. Hira Aslam (Guitar + Graphic Design)
  const hira = await User.create({
    name: "Hira Aslam",
    email: "hira@skillswap.test",
    passwordHash,
    role: "user",
    headline: "Graphic Designer & Acoustic Guitarist",
    bio: "Graphic designer with 5+ years experience and passionate guitarist. Always excited for a genuine skill trade!",
    location: "Peshawar, Pakistan",
    profileImageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    skillsToTeach: [
      { skill: byName["Guitar"]._id, level: "Advanced" },
      { skill: byName["Graphic Design"]._id, level: "Expert" },
    ],
    skillsToLearn: [
      { skill: byName["Python Programming"]._id },
      { skill: byName["Photography"]._id },
    ],
    isVerified: true,
  });

  // 3. Ali Khan (Python + Web Dev)
  const ali = await User.create({
    name: "Ali Khan",
    email: "ali@skillswap.test",
    passwordHash,
    role: "user",
    headline: "Senior Fullstack Software Engineer",
    bio: "Software engineer building web apps and Python backend services. Excited to learn musical instruments!",
    location: "Islamabad, Pakistan",
    profileImageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    skillsToTeach: [
      { skill: byName["Python Programming"]._id, level: "Expert" },
      { skill: byName["Web Development"]._id, level: "Advanced" },
    ],
    skillsToLearn: [
      { skill: byName["Guitar"]._id },
      { skill: byName["Video Editing"]._id },
    ],
    isVerified: true,
  });

  // 4. Sarah Noor (Photography + Video Editing)
  const sarah = await User.create({
    name: "Sarah Noor",
    email: "sarah@skillswap.test",
    passwordHash,
    role: "user",
    headline: "Visual Storyteller & Filmmaker",
    bio: "Freelance photographer and video editor. Love teaching hands-on visual arts in exchange for digital skills.",
    location: "Lahore, Pakistan",
    profileImageUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    skillsToTeach: [
      { skill: byName["Photography"]._id, level: "Expert" },
      { skill: byName["Video Editing"]._id, level: "Advanced" },
    ],
    skillsToLearn: [
      { skill: byName["Graphic Design"]._id },
      { skill: byName["Excel & Data Analysis"]._id },
    ],
    isVerified: true,
  });

  // 5. Bilal Ahmed (Urdu Calligraphy)
  const bilal = await User.create({
    name: "Bilal Ahmed",
    email: "bilal@skillswap.test",
    passwordHash,
    role: "user",
    headline: "Traditional Calligrapher & Artist",
    bio: "Calligraphy artist practicing traditional Khat-e-Nastaliq. Looking to expand into web design.",
    location: "Karachi, Pakistan",
    profileImageUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    skillsToTeach: [{ skill: byName["Urdu Calligraphy"]._id, level: "Expert" }],
    skillsToLearn: [
      { skill: byName["Web Development"]._id },
      { skill: byName["English Speaking & IELTS"]._id },
    ],
    isVerified: true,
  });

  // 6. Tariq Mahmood (Pakistani Cuisine & Chess)
  const tariq = await User.create({
    name: "Chef Tariq Mahmood",
    email: "tariq@skillswap.test",
    passwordHash,
    role: "user",
    headline: "Culinary Instructor & Chess Enthusiast",
    bio: "Professional chef specialized in authentic regional Pakistani dishes. Wanting to learn digital marketing.",
    location: "Lahore, Pakistan",
    profileImageUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    skillsToTeach: [
      { skill: byName["Cooking - Pakistani Cuisine"]._id, level: "Expert" },
      { skill: byName["Chess Strategy"]._id, level: "Advanced" },
    ],
    skillsToLearn: [
      { skill: byName["Digital Marketing & SEO"]._id },
      { skill: byName["Python Programming"]._id },
    ],
    isVerified: true,
  });

  // 7. Ayesha Siddiqui (English, Marketing)
  const ayesha = await User.create({
    name: "Ayesha Siddiqui",
    email: "ayesha@skillswap.test",
    passwordHash,
    role: "user",
    headline: "IELTS Trainer & Marketing Consultant",
    bio: "Certified IELTS coach and digital marketing strategist. Eager to learn baking and culinary arts.",
    location: "Islamabad, Pakistan",
    profileImageUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    skillsToTeach: [
      { skill: byName["English Speaking & IELTS"]._id, level: "Expert" },
      { skill: byName["Digital Marketing & SEO"]._id, level: "Advanced" },
    ],
    skillsToLearn: [
      { skill: byName["Cooking - Pakistani Cuisine"]._id },
      { skill: byName["Baking & Pastries"]._id },
    ],
    isVerified: true,
  });

  console.log(
    "[Seed] Creating swap requests across all states (Pending, Accepted, Completed)...",
  );

  // 1. Pending Swap: Hira -> Ali (offers Guitar, wants Python)
  await SwapRequest.create({
    requester: hira._id,
    receiver: ali._id,
    offeredSkill: byName["Guitar"]._id,
    requestedSkill: byName["Python Programming"]._id,
    status: "pending",
    message:
      "Hi Ali! I saw you want to learn acoustic guitar. I would love to trade for Python fundamentals.",
    scheduleNotes: "Available on Saturday afternoons via Zoom/Google Meet.",
  });

  // 2. Accepted Active Swap: Ali <-> Hira (offers Python, wants Graphic Design) with live chat
  const acceptedSwap = await SwapRequest.create({
    requester: ali._id,
    receiver: hira._id,
    offeredSkill: byName["Python Programming"]._id,
    requestedSkill: byName["Graphic Design"]._id,
    status: "accepted",
    message: "Excited to trade programming for some logo design techniques!",
    scheduleNotes: "Sunday 4 PM GMT+5 weekly sessions.",
  });

  const conversation1 = await Conversation.create({
    participants: [ali._id, hira._id],
    swapRequest: acceptedSwap._id,
  });

  await Message.create([
    {
      conversation: conversation1._id,
      sender: ali._id,
      content: "Hi Hira! Excited to get started on design basics.",
      readBy: [ali._id, hira._id],
    },
    {
      conversation: conversation1._id,
      sender: hira._id,
      content:
        "Hi Ali! Yes, let’s do it - are you free this weekend for our first module?",
      readBy: [ali._id, hira._id],
    },
    {
      conversation: conversation1._id,
      sender: ali._id,
      content:
        "Sunday at 4 PM works great for me! I have set up our curriculum repository.",
      readBy: [ali._id],
    },
  ]);

  // 3. Completed Swap: Sarah <-> Hira (Sarah taught Photography, Hira taught Graphic Design)
  const completedSwap1 = await SwapRequest.create({
    requester: sarah._id,
    receiver: hira._id,
    offeredSkill: byName["Photography"]._id,
    requestedSkill: byName["Graphic Design"]._id,
    status: "completed",
    message:
      "Would love to swap photography lighting tips for Adobe Illustrator lessons!",
    completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    completedBy: sarah._id,
  });

  const conversation2 = await Conversation.create({
    participants: [sarah._id, hira._id],
    swapRequest: completedSwap1._id,
  });

  await Message.create([
    {
      conversation: conversation2._id,
      sender: sarah._id,
      content:
        "Thanks so much for the Illustrator session, Hira! It was incredibly clear.",
      readBy: [sarah._id, hira._id],
    },
    {
      conversation: conversation2._id,
      sender: hira._id,
      content:
        "Thank you Sarah! Your photography lighting breakdown was game-changing for my studio shots.",
      readBy: [sarah._id, hira._id],
    },
  ]);

  // 4. Completed Swap: Tariq <-> Ayesha (Tariq taught Cooking, Ayesha taught Digital Marketing)
  const completedSwap2 = await SwapRequest.create({
    requester: tariq._id,
    receiver: ayesha._id,
    offeredSkill: byName["Cooking - Pakistani Cuisine"]._id,
    requestedSkill: byName["Digital Marketing & SEO"]._id,
    status: "completed",
    message:
      "Let us exchange authentic recipes for social media marketing strategies!",
    completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    completedBy: tariq._id,
  });

  console.log("[Seed] Creating Community Reviews and Ratings (FR8)...");

  // Sarah reviews Hira (5 stars)
  await Review.create({
    swapRequest: completedSwap1._id,
    reviewer: sarah._id,
    reviewee: hira._id,
    rating: 5,
    feedback:
      "Hira is an extraordinary teacher! She explained vector paths and typography rules with such patience. Highly recommended swap partner!",
    tags: ["Patient Teacher", "Knowledgeable", "Structured Lessons"],
    skillTaught: byName["Graphic Design"]._id,
  });

  // Hira reviews Sarah (5 stars)
  await Review.create({
    swapRequest: completedSwap1._id,
    reviewer: hira._id,
    reviewee: sarah._id,
    rating: 5,
    feedback:
      "Sarah gave me practical studio lighting and framing techniques that immediately upgraded my photography. Fantastic experience!",
    tags: ["Punctual", "Knowledgeable", "Fun Experience"],
    skillTaught: byName["Photography"]._id,
  });

  // Tariq reviews Ayesha (5 stars)
  await Review.create({
    swapRequest: completedSwap2._id,
    reviewer: tariq._id,
    reviewee: ayesha._id,
    rating: 5,
    feedback:
      "Ayesha revamped our entire social media strategy in just 3 sessions. Outstanding knowledge and very friendly approach.",
    tags: ["Great Communicator", "Well Prepared", "Knowledgeable"],
    skillTaught: byName["Digital Marketing & SEO"]._id,
  });

  // Ayesha reviews Tariq (5 stars)
  await Review.create({
    swapRequest: completedSwap2._id,
    reviewer: ayesha._id,
    reviewee: tariq._id,
    rating: 5,
    feedback:
      "Chef Tariq made making authentic Biryani and Nihari seem effortless. Best cooking lessons ever!",
    tags: ["Patient Teacher", "Structured Lessons", "Fun Experience"],
    skillTaught: byName["Cooking - Pakistani Cuisine"]._id,
  });

  console.log("[Seed] Calculating dynamic Trust Scores & Tiers (FR9)...");
  await Promise.all([
    calculateTrustScore(hira._id),
    calculateTrustScore(ali._id),
    calculateTrustScore(sarah._id),
    calculateTrustScore(bilal._id),
    calculateTrustScore(tariq._id),
    calculateTrustScore(ayesha._id),
    calculateTrustScore(admin._id),
  ]);

  console.log("[Seed] Creating In-App Notifications (FR11)...");
  await Notification.create([
    {
      recipient: ali._id,
      sender: hira._id,
      type: "swap_request",
      title: "New Swap Request from Hira",
      message:
        "Hira Aslam sent you a swap request: Guitar for Python Programming",
      link: "/swaps",
      read: false,
    },
    {
      recipient: hira._id,
      sender: sarah._id,
      type: "review_received",
      title: "New 5-Star Review! ⭐",
      message: "Sarah Noor left you a 5-star review for Graphic Design",
      link: `/profile/${hira._id}`,
      read: true,
    },
    {
      recipient: hira._id,
      sender: ali._id,
      type: "new_message",
      title: "New Message from Ali",
      message:
        "Sunday at 4 PM works great for me! I have set up our curriculum repository.",
      link: "/swaps",
      read: false,
    },
  ]);

  console.log(
    "[Seed] Creating Moderation Report for Admin Panel demo (FR12)...",
  );
  await Report.create({
    reporter: ali._id,
    reportedUser: bilal._id,
    reason: "Did Not Show Up",
    details:
      "User rescheduled twice without prior notice during our agreed session time.",
    status: "pending",
  });

  console.log(
    "\n===============================================================",
  );
  console.log(
    "🎉 SkillSwap Database Seeded Successfully (FR1 - FR12 Complete)!",
  );
  console.log(
    "===============================================================",
  );
  console.log("Default Password for all accounts: password123\n");
  console.log("👑 Admin Account (FR12):");
  console.log(
    "   - admin@skillswap.test   (Admin Supervisor - Access to /admin)\n",
  );
  console.log("👥 User Accounts:");
  console.log(
    "   - hira@skillswap.test    (Hira Aslam - Has pending req & completed swap)",
  );
  console.log(
    "   - ali@skillswap.test     (Ali Khan - Has active chat with Hira)",
  );
  console.log("   - sarah@skillswap.test   (Sarah Noor - Photography & Video)");
  console.log("   - bilal@skillswap.test   (Bilal Ahmed - Urdu Calligraphy)");
  console.log(
    "   - tariq@skillswap.test   (Chef Tariq - Pakistani Cuisine & Chess)",
  );
  console.log(
    "   - ayesha@skillswap.test  (Ayesha Siddiqui - English & Marketing)",
  );
  console.log(
    "===============================================================\n",
  );

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("[Seed] Error:", err);
  process.exit(1);
});
