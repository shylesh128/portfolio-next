// components/Contact.js
import { motion } from "framer-motion";
import { FaEnvelope, FaPhone, FaLinkedin } from "react-icons/fa";

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const Contact = ({ contact }) => {
  return (
    <section className="contact-section" data-testid="contact-section">
      <motion.div
        className="contact-content"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <h2>Contact Me</h2>
        <div className="contact-icons">
          <a
            href={`mailto:${contact.email}`}
            role="link"
            data-testid="email-link"
          >
            <FaEnvelope className="contact-icon" />
          </a>
          <a href={`tel:${contact.phone}`} role="link" data-testid="phone-link">
            <FaPhone className="contact-icon" />
          </a>
          <a
            href={contact.LinkedIn}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="linkedin-link"
          >
            <FaLinkedin className="contact-icon" />
          </a>
        </div>
      </motion.div>
    </section>
  );
};

export default Contact;
