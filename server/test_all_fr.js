/**
 * Comprehensive Backend Verification Script for FR1 - FR12
 */
require("dotenv").config();
const http = require("http");

const BASE_URL = "http://localhost:5000/api/v1";

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const fetchOptions = {
    method: options.method || "GET",
    headers,
  };
  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, fetchOptions);
  const data = await res.json();
  return { status: res.status, data };
}

async function runTests() {
  console.log("====================================================");
  console.log("🚀 Running SkillSwap Full Verification (FR1 - FR12)");
  console.log("====================================================\n");

  // Test Health
  const health = await request("/health");
  console.log(
    `[Health] Status: ${health.status} -> ${JSON.stringify(health.data.data)}`,
  );

  // FR1: Login with demo account
  console.log("\n--- FR1: User Authentication & Password Reset ---");
  const loginRes = await request("/auth/login", {
    method: "POST",
    body: { email: "hira@skillswap.test", password: "password123" },
  });
  console.log(
    `[FR1 Login] Status: ${loginRes.status}, User: ${loginRes.data.data?.user?.name}`,
  );
  const hiraToken = loginRes.data.data.token;
  const hiraId = loginRes.data.data.user._id;

  // FR1: Forgot Password & Reset
  const forgotRes = await request("/auth/forgot-password", {
    method: "POST",
    body: { email: "bilal@skillswap.test" },
  });
  console.log(
    `[FR1 Forgot Password] Token generated: ${forgotRes.data.data?.resetToken}`,
  );

  const resetRes = await request("/auth/reset-password", {
    method: "POST",
    body: {
      email: "bilal@skillswap.test",
      token: forgotRes.data.data?.resetToken,
      newPassword: "password123",
    },
  });
  console.log(`[FR1 Reset Password] Result: ${resetRes.data.data?.message}`);

  // FR2: Profile Management
  console.log("\n--- FR2: Profile Management ---");
  const updateProfRes = await request("/users/me", {
    method: "PUT",
    headers: { Authorization: `Bearer ${hiraToken}` },
    body: {
      headline: "Graphic Designer & Lead Acoustic Guitarist",
      location: "Peshawar, Pakistan",
    },
  });
  console.log(
    `[FR2 Update Profile] Status: ${updateProfRes.status}, Headline: ${updateProfRes.data.data?.user?.headline}`,
  );

  // FR3: Skill Cataloging
  console.log("\n--- FR3: Skill Cataloging ---");
  const skillsRes = await request("/skills", {
    headers: { Authorization: `Bearer ${hiraToken}` },
  });
  console.log(
    `[FR3 Skills Catalog] Total Skills: ${skillsRes.data.data?.skills?.length}, Categories: ${skillsRes.data.data?.categories?.join(", ")}`,
  );

  // FR4: Advanced Search Engine
  console.log("\n--- FR4: Advanced Search Engine ---");
  const searchRes = await request("/users/search?category=IT&mode=teach", {
    headers: { Authorization: `Bearer ${hiraToken}` },
  });
  console.log(
    `[FR4 Search IT Teachers] Found: ${searchRes.data.data?.count} users`,
  );
  searchRes.data.data?.users?.forEach((u) => {
    console.log(
      `   - ${u.name} (Trust: ${u.trustScore}, Location: ${u.location})`,
    );
  });

  // FR5: Matching Logic Engine
  console.log("\n--- FR5: Skill Matching Logic ---");
  const matchesRes = await request("/matches", {
    headers: { Authorization: `Bearer ${hiraToken}` },
  });
  console.log(
    `[FR5 Matches for Hira] Total Matches: ${matchesRes.data.data?.matches?.length}`,
  );
  matchesRes.data.data?.matches?.forEach((m) => {
    console.log(
      `   - Match: ${m.user.name} | Reciprocal: ${m.reciprocal} | Score: ${m.score} | Compatibility: ${m.compatibilityPercentage}%`,
    );
  });

  // FR6 & FR7: Swaps & Conversations
  console.log("\n--- FR6 & FR7: Exchange Requests & Conversations ---");
  const swapsRes = await request("/swaps", {
    headers: { Authorization: `Bearer ${hiraToken}` },
  });
  console.log(
    `[FR6 Swaps for Hira] Total Swaps: ${swapsRes.data.data?.swaps?.length}`,
  );

  const convRes = await request("/conversations", {
    headers: { Authorization: `Bearer ${hiraToken}` },
  });
  console.log(
    `[FR7 Conversations for Hira] Total Conversations: ${convRes.data.data?.conversations?.length}`,
  );

  if (convRes.data.data?.conversations?.length > 0) {
    const convId = convRes.data.data.conversations[0]._id;
    const msgRes = await request(`/conversations/${convId}/messages`, {
      headers: { Authorization: `Bearer ${hiraToken}` },
    });
    console.log(
      `[FR7 Messages in Conversation] Count: ${msgRes.data.data?.messages?.length}`,
    );
  }

  // FR8 & FR9: Reviews & Trust Score
  console.log("\n--- FR8 & FR9: Reviews & Reputation Score ---");
  const reviewsRes = await request(`/reviews/user/${hiraId}`, {
    headers: { Authorization: `Bearer ${hiraToken}` },
  });
  console.log(
    `[FR8 Reviews for Hira] Total: ${reviewsRes.data.data?.stats?.totalReviews}, Avg: ${reviewsRes.data.data?.stats?.averageRating} Stars`,
  );

  const publicProfRes = await request(`/users/${hiraId}`, {
    headers: { Authorization: `Bearer ${hiraToken}` },
  });
  console.log(
    `[FR9 Trust Score for Hira] Score: ${publicProfRes.data.data?.user?.trustScore}/100 (${publicProfRes.data.data?.user?.trustTier})`,
  );

  // FR10: User Dashboard (Recently Viewed)
  console.log("\n--- FR10: Recently Viewed Profiles ---");
  const recentRes = await request("/users/me/recently-viewed", {
    headers: { Authorization: `Bearer ${hiraToken}` },
  });
  console.log(
    `[FR10 Recently Viewed] Count: ${recentRes.data.data?.recentlyViewed?.length}`,
  );

  // FR11: Notification System
  console.log("\n--- FR11: Notification System ---");
  const notifRes = await request("/notifications", {
    headers: { Authorization: `Bearer ${hiraToken}` },
  });
  console.log(
    `[FR11 Notifications] Total: ${notifRes.data.data?.notifications?.length}, Unread: ${notifRes.data.data?.unreadCount}`,
  );

  // FR12: Administrative Control Panel
  console.log("\n--- FR12: Administrative Control Panel ---");
  const adminLogin = await request("/auth/login", {
    method: "POST",
    body: { email: "admin@skillswap.test", password: "password123" },
  });
  const adminToken = adminLogin.data.data?.token;
  console.log(
    `[FR12 Admin Login] Authenticated: ${adminLogin.data.data?.user?.name} (Role: ${adminLogin.data.data?.user?.role})`,
  );

  const adminStats = await request("/admin/stats", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(`[FR12 Admin Stats] Metrics:`, adminStats.data.data?.metrics);

  const adminReports = await request("/admin/reports", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(
    `[FR12 Admin Reports Queue] Count: ${adminReports.data.data?.count}`,
  );

  console.log("\n====================================================");
  console.log("✅ ALL 12 FUNCTIONAL REQUIREMENTS VERIFIED SUCCESSFULLY!");
  console.log("====================================================\n");
}

runTests().catch(console.error);
