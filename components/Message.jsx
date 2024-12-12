import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Button } from "@mui/material";

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Use name to determine which field to update
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        "http://painpal.onrender.com/api/v1/other/feedback",
        formData
      );
      setSubmitStatus("success");
      setFormData({ name: "", email: "", message: "" });
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
            <label htmlFor={"name"}>Name:</label>
            <input
              type="text"
              id={"name"}
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              autoComplete="name"
            />

            <label htmlFor="emails">Email:</label>
            <input
              type="email"
              id={"emails"}
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />

            <label htmlFor="message-feedback">Message:</label>
            <textarea
              id={"message-feedback"}
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
            />

            <Button variant="contained" type="submit">
              {loading ? "loading...." : "Submit"}
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
