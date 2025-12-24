import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { FaEnvelope, FaPhone, FaLinkedin, FaGithub } from "react-icons/fa";
import { BiMap } from "react-icons/bi";

import { Contact as ContactType } from "../types";

interface ContactProps {
  contact: ContactType;
}

const Contact = ({ contact }: ContactProps) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20 },
    visible: {
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const contactLinks = [
    {
      icon: <FaEnvelope size={24} />,
      href: `mailto:${contact.email}`,
      label: "Email",
      value: contact.email,
    },
    {
      icon: <FaPhone size={24} />,
      href: `tel:${contact.phone}`,
      label: "Phone",
      value: contact.phone,
    },
    {
      icon: <FaLinkedin size={24} />,
      href: contact.LinkedIn,
      label: "LinkedIn",
      value: "Connect on LinkedIn",
      external: true,
    },
    {
      icon: <FaGithub size={24} />,
      href: "https://github.com/shylesh128",
      label: "GitHub",
      value: "View GitHub",
      external: true,
    },
  ];

  return (
    <section className="contact-section" id="contact">
      <motion.div
        ref={ref}
        className="contact-content"
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <motion.h2 variants={itemVariants}>Get In Touch</motion.h2>

        <motion.p
          variants={itemVariants}
          style={{
            fontSize: "1rem",
            color: "var(--text-secondary)",
            marginBottom: "2rem",
            maxWidth: "500px",
            margin: "0 auto 2rem",
          }}
        >
          Feel free to reach out for collaborations, opportunities, or just to
          say hello!
        </motion.p>

        {/* Location */}
        <motion.div
          variants={itemVariants}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid var(--border)",
            borderRadius: 50,
            fontSize: "0.9rem",
            color: "var(--text-secondary)",
            marginBottom: "2rem",
          }}
        >
          <BiMap size={16} />
          {contact.location}
        </motion.div>

        {/* Contact links */}
        <motion.div
          className="contact-icons"
          variants={containerVariants}
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          {contactLinks.map((link) => (
            <motion.a
              key={link.label}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              variants={itemVariants}
              whileHover={{
                y: -8,
                scale: 1.1,
                transition: { type: "spring", stiffness: 300 },
              }}
              whileTap={{ scale: 0.9 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
                padding: "1.25rem",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                color: "var(--text-secondary)",
                textDecoration: "none",
                minWidth: 100,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-interests)";
                e.currentTarget.style.boxShadow =
                  "0 0 20px var(--color-interests-dim)";
                e.currentTarget.style.color = "var(--color-interests)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              {link.icon}
              <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                {link.label}
              </span>
            </motion.a>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Contact;
