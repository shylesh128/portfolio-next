export interface Contact {
  email: string;
  phone: string;
  location: string;
  LinkedIn: string;
}

export interface Skill {
  skill: string;
  rating: number;
}

export interface Experience {
  title: string;
  company: string;
  logo: string;
  dates: string;
  description: string;
  works: string[];
}

export interface Project {
  title: string;
  description: string;
  link: string;
  preview: string;
  altText?: string;
}

export interface Education {
  degree: string;
  percentage: string;
  dates: string;
  institution: string;
}

export interface Certificate {
  platform: string;
  logo: string;
  title: string;
  issuedDate: string;
  skills?: string[];
  link: string;
  image?: string;
  credentialId?: string;
  "image-link"?: string;
}

export interface PortfolioData {
  version: string;
  name: string;
  title: string;
  description: string;
  image: string;
  contact: Contact;
  skills: Skill[];
  experiences: Experience[];
  projects: Project[];
  education: Education[];
  interests: string[];
  certificates: Certificate[];
}
