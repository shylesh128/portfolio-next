import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Button } from "@mui/material";

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const ContactForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case "name":
        setName(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "message":
        setMessage(value);
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("https://painhub.onrender.com/api/feedback", {
        name,
        email,
        message,
      });
      setSubmitStatus("success");
      setName("");
      setEmail("");
      setMessage("");
      setLoading(false);
    } catch (error) {
      setSubmitStatus("error");
      setLoading(false);
    }
  };

  return (
    <section className="message-section">
      <motion.div
        className="message-content"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <div className="message-container">
          <form onSubmit={handleSubmit}>
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={handleChange}
              required
              autoComplete="name"
            />

            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              required
              autoComplete="email"
            />

            <label htmlFor="message-feedback">Message:</label>
            <textarea
              id="message-feedback"
              name="message"
              value={message}
              onChange={handleChange}
              required
            />

            <Button variant="contained" type="submit">
              {loading ? "Loading...." : "Submit"}
            </Button>
          </form>

          {submitStatus === "success" && (
            <p className="success-message">Message sent successfully!</p>
          )}
          {submitStatus === "error" && (
            <p className="error-message">
              Message delivery failed. Please try again later.
            </p>
          )}
        </div>
      </motion.div>
    </section>
  );
};

export default ContactForm;
