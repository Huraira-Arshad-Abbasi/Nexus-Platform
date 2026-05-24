import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
})

export const sendOTPEmail = async (toEmail, otp, userName) => {
  const mailOptions = {
    from: `"Nexus Platform" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your Nexus OTP Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Nexus Platform</h2>
        <p>Hi <strong>${userName}</strong>,</p>
        <p>Your one-time password (OTP) is:</p>
        <div style="background: #F3F4F6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4F46E5;">
            ${otp}
          </span>
        </div>
        <p style="color: #6B7280; font-size: 14px;">
          This OTP expires in <strong>10 minutes</strong>.
          If you didn't request this, ignore this email.
        </p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}

export default transporter