import mongoose, { Document, Model, Schema } from "mongoose";

export interface IContact {
  name: string;
  email: string;
  subject?: string;
  message: string;
  createdAt: Date;
}

export interface IContactDocument extends IContact, Document {}

const ContactSchema = new Schema<IContactDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    subject: {
      type: String,
      trim: true,
      maxlength: [200, "Subject cannot exceed 200 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [5000, "Message cannot exceed 5000 characters"],
    },
  },
  {
    timestamps: true,
  }
);

const Contact: Model<IContactDocument> =
  mongoose.models.Contact ||
  mongoose.model<IContactDocument>("Contact", ContactSchema);

export default Contact;
