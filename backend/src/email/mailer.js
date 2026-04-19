import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

export async function sendVerificationEmail(email, userId) {
  const verificationLink = `${process.env.APP_URL || 'https://farmsync.app'}/verify/${userId}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: '🌱 Welcome to FarmSync - Verify Your Email',
    html: `
      <h2>Welcome to FarmSync!</h2>
      <p>Thank you for joining our farming community. Please verify your email to get started.</p>
      <a href="${verificationLink}" style="padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
        Verify Email
      </a>
      <p>Or copy this link: ${verificationLink}</p>
    `
  });
}

export async function sendPasswordResetEmail(email, userId) {
  const resetLink = `${process.env.APP_URL || 'https://farmsync.app'}/reset/${userId}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Reset Your FarmSync Password',
    html: `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}" style="padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
        Reset Password
      </a>
      <p>This link expires in 24 hours.</p>
    `
  });
}

export async function sendCropReminder(email, firstName, cropName, action) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: `🌾 FarmSync Reminder: ${action} for ${cropName}`,
    html: `
      <h2>Time for action, ${firstName}!</h2>
      <p>Your ${cropName} is ready for: <strong>${action}</strong></p>
      <p>Check your FarmSync app for more details.</p>
    `
  });
}

export async function sendCommunityNotification(email, firstName, notification) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: `👥 FarmSync Community Update`,
    html: `
      <h2>Community Update</h2>
      <p>${notification}</p>
      <p>Open your FarmSync app to see more!</p>
    `
  });
}
