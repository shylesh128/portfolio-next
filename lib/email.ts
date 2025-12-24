import nodemailer from 'nodemailer';

interface ContactEmailData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendContactNotification(data: ContactEmailData): Promise<void> {
  const { name, email, subject, message } = data;

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: process.env.CONTACT_EMAIL,
    replyTo: email,
    subject: `Portfolio Contact: ${subject || 'New Message'} - from ${name}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; border: 1px solid #2d2d44;">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 32px 32px 24px; border-bottom: 1px solid #2d2d44;">
                      <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff; text-align: center;">
                        ✨ New Contact Message
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 32px;">
                      <!-- Sender Info -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                        <tr>
                          <td style="padding: 16px; background-color: rgba(255, 255, 255, 0.05); border-radius: 12px; border: 1px solid #2d2d44;">
                            <p style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #888;">From</p>
                            <p style="margin: 0 0 4px; font-size: 18px; font-weight: 600; color: #ffffff;">${name}</p>
                            <a href="mailto:${email}" style="font-size: 14px; color: #6366f1; text-decoration: none;">${email}</a>
                          </td>
                        </tr>
                      </table>
                      
                      ${subject ? `
                      <!-- Subject -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                        <tr>
                          <td>
                            <p style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #888;">Subject</p>
                            <p style="margin: 0; font-size: 16px; color: #e0e0e0;">${subject}</p>
                          </td>
                        </tr>
                      </table>
                      ` : ''}
                      
                      <!-- Message -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td>
                            <p style="margin: 0 0 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #888;">Message</p>
                            <div style="padding: 20px; background-color: rgba(0, 0, 0, 0.3); border-radius: 12px; border-left: 4px solid #6366f1;">
                              <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #e0e0e0; white-space: pre-wrap;">${message}</p>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 32px; border-top: 1px solid #2d2d44; text-align: center;">
                      <a href="mailto:${email}" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">
                        Reply to ${name}
                      </a>
                      <p style="margin: 16px 0 0; font-size: 12px; color: #666;">
                        Sent from your portfolio contact form
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `
New Contact Message from Portfolio

From: ${name}
Email: ${email}
${subject ? `Subject: ${subject}` : ''}

Message:
${message}

---
Reply directly to this email to respond to ${name}.
    `.trim(),
  };

  await transporter.sendMail(mailOptions);
}

