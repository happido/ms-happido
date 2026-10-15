import nodemailer from 'nodemailer';

// Configure Nodemailer transporter
// Works with Gmail SMTP (Free) or any standard SMTP service
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '', // App password for Gmail
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailOptions) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[Email Simulation] To: ${to} | Subject: ${subject}`);
    console.log(`[Email Simulation] Note: Set EMAIL_USER and EMAIL_PASS in backend/.env to send real emails.`);
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Happido" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[Email Sent] Message ID: ${info.messageId} to ${to}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`[Email Error] Failed to send email to ${to}:`, error);
    return { success: false, error: error.message };
  }
};

export const sendWelcomeEmail = async (email: string, name: string, role: string) => {
  const roleName = role === 'restaurant' ? 'Restaurant Partner' : role === 'rider' ? 'Delivery Partner' : 'Customer';
  
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 16px; border: 1px solid #f0f0f0;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #FF5200; font-size: 28px; margin: 0; font-weight: 800; letter-spacing: -0.5px;">Happido</h1>
        <p style="color: #888888; font-size: 14px; margin-top: 4px;">Welcome to the Happido family!</p>
      </div>

      <div style="background: #FDFBF9; border: 1px solid #F5ECE5; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <h2 style="color: #1A1A1A; font-size: 20px; margin-top: 0;">Hi ${name},</h2>
        <p style="color: #4A4A4A; font-size: 15px; line-height: 1.6;">
          Your registration as a <strong>${roleName}</strong> has been successfully verified and registered!
        </p>
      </div>

      <p style="color: #666666; font-size: 14px; line-height: 1.5;">
        You can now log in to your account and start using your Happido dashboard. If you have any questions or need assistance, our support team is always here to help.
      </p>

      <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #eeeeee; text-align: center;">
        <p style="color: #aaaaaa; font-size: 12px; margin: 0;">© 2026 Happido Technologies. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Welcome to Happido, ${name}! 🎉`,
    html,
  });
};
