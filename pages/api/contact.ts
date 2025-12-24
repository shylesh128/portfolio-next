import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../lib/mongodb';
import Contact from '../../models/Contact';
import { sendContactNotification } from '../../lib/email';

interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

interface SuccessResponse {
  success: true;
  message: string;
}

interface ErrorResponse {
  success: false;
  error: string;
}

type ApiResponse = SuccessResponse | ErrorResponse;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed`,
    });
  }

  try {
    const { name, email, subject, message } = req.body as ContactFormData;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and message are required fields',
      });
    }

    // Email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address',
      });
    }

    // Connect to MongoDB
    await connectDB();

    // Save to database
    const contactSubmission = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject?.trim() || undefined,
      message: message.trim(),
    });

    // Send email notification
    try {
      await sendContactNotification({
        name: contactSubmission.name,
        email: contactSubmission.email,
        subject: contactSubmission.subject,
        message: contactSubmission.message,
      });
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Continue even if email fails - the contact is already saved
    }

    return res.status(201).json({
      success: true,
      message: 'Thank you for your message! I will get back to you soon.',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({
      success: false,
      error: 'Something went wrong. Please try again later.',
    });
  }
}

