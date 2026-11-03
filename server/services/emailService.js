/**
 * FR1 & FR11 - Email Verification & Alert Service
 *
 * Provides email delivery for password reset tokens, account verification,
 * swap requests, status updates, and review notifications.
 * Automatically logs clear, formatted transaction logs to the server console.
 */

const sentEmailsLog = [];

async function sendPasswordResetEmail({ toEmail, name, resetToken, resetUrl }) {
  const subject = "SkillSwap — Password Reset Request";
  const message = `Hello ${name},\n\nYou requested a password reset for your SkillSwap account.\nYour reset verification code is: ${resetToken}\nOr use this direct link: ${resetUrl}\n\nIf you did not request this, please ignore this email.\nThis token will expire in 1 hour.`;

  console.log("\n======================================================");
  console.log(`[EMAIL SERVICE] To: ${toEmail} | Subject: ${subject}`);
  console.log(`[EMAIL SERVICE] Code: ${resetToken}`);
  console.log(`[EMAIL SERVICE] Direct Link: ${resetUrl}`);
  console.log("======================================================\n");

  sentEmailsLog.unshift({
    to: toEmail,
    subject,
    type: "password_reset",
    timestamp: new Date(),
    code: resetToken,
  });

  return { success: true, simulated: true, resetToken };
}

async function sendSwapAlertEmail({
  toEmail,
  recipientName,
  requesterName,
  offeredSkill,
  requestedSkill,
}) {
  const subject = `SkillSwap — New Swap Request from ${requesterName}!`;
  const message = `Hi ${recipientName},\n\n${requesterName} wants to trade ${offeredSkill} for your ${requestedSkill} skills!\nLog in to SkillSwap to view and accept the swap request.`;

  console.log(`[EMAIL SERVICE] Alert sent to ${toEmail}: ${subject}`);

  sentEmailsLog.unshift({
    to: toEmail,
    subject,
    type: "swap_alert",
    timestamp: new Date(),
  });

  return { success: true, simulated: true };
}

async function sendReviewAlertEmail({
  toEmail,
  recipientName,
  reviewerName,
  rating,
}) {
  const subject = `SkillSwap — New ${rating}-Star Review from ${reviewerName}!`;
  console.log(`[EMAIL SERVICE] Alert sent to ${toEmail}: ${subject}`);

  sentEmailsLog.unshift({
    to: toEmail,
    subject,
    type: "review_alert",
    timestamp: new Date(),
  });

  return { success: true, simulated: true };
}

function getSentEmails() {
  return sentEmailsLog.slice(0, 50);
}

module.exports = {
  sendPasswordResetEmail,
  sendSwapAlertEmail,
  sendReviewAlertEmail,
  getSentEmails,
};
