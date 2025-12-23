import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import axios from 'axios';
import { BiSend, BiCheck, BiX } from 'react-icons/bi';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSubmitStatus(null);

    try {
      await axios.post(
        'https://painpal.onrender.com/api/v1/other/feedback',
        formData
      );
      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 100, damping: 12 },
    },
  };

  const inputStyle = (fieldName: string): React.CSSProperties => ({
    width: '100%',
    padding: '1rem 1.25rem',
    fontFamily: 'var(--font-body)',
    fontSize: '0.95rem',
    color: 'var(--text-primary)',
    background: 'var(--bg-primary)',
    border: `1px solid ${focusedField === fieldName ? 'var(--border-active)' : 'var(--border)'}`,
    borderRadius: 12,
    outline: 'none',
    transition: 'all 0.2s ease',
    boxShadow: focusedField === fieldName ? '0 0 0 3px var(--accent-glow)' : 'none',
  });

  return (
    <section className="message-section" id="message">
      <motion.div
        ref={ref}
        className="message-content"
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        variants={containerVariants}
      >
        <motion.h2
          variants={itemVariants}
          style={{ textAlign: 'center', marginBottom: '0.5rem' }}
        >
          Send a Message
        </motion.h2>

        <motion.p
          variants={itemVariants}
          style={{
            textAlign: 'center',
            color: 'var(--text-secondary)',
            marginBottom: '2rem',
          }}
        >
          Have a question or want to work together?
        </motion.p>

        <motion.div
          className="message-container"
          variants={itemVariants}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 24,
            padding: '2.5rem',
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            {/* Name field */}
            <motion.div variants={itemVariants}>
              <label
                htmlFor="name"
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  marginBottom: '0.5rem',
                }}
              >
                Name
              </label>
              <motion.input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                required
                autoComplete="name"
                placeholder="Your name"
                style={inputStyle('name')}
                whileFocus={{ scale: 1.01 }}
              />
            </motion.div>

            {/* Email field */}
            <motion.div variants={itemVariants}>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  marginBottom: '0.5rem',
                }}
              >
                Email
              </label>
              <motion.input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                required
                autoComplete="email"
                placeholder="your@email.com"
                style={inputStyle('email')}
                whileFocus={{ scale: 1.01 }}
              />
            </motion.div>

            {/* Message field */}
            <motion.div variants={itemVariants}>
              <label
                htmlFor="message"
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  marginBottom: '0.5rem',
                }}
              >
                Message
              </label>
              <motion.textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                onFocus={() => setFocusedField('message')}
                onBlur={() => setFocusedField(null)}
                required
                placeholder="Your message..."
                rows={4}
                style={{
                  ...inputStyle('message'),
                  resize: 'vertical',
                  minHeight: 120,
                }}
                whileFocus={{ scale: 1.01 }}
              />
            </motion.div>

            {/* Submit button */}
            <motion.button
              type="submit"
              className="btn"
              disabled={loading}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '1rem 2rem',
                marginTop: '0.5rem',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  ⏳
                </motion.span>
              ) : (
                <>
                  Send Message <BiSend size={18} />
                </>
              )}
            </motion.button>
          </form>

          {/* Status messages */}
          <AnimatePresence>
            {submitStatus && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '1.5rem',
                  padding: '1rem',
                  borderRadius: 12,
                  background:
                    submitStatus === 'success'
                      ? 'rgba(74, 222, 128, 0.1)'
                      : 'rgba(248, 113, 113, 0.1)',
                  color: submitStatus === 'success' ? '#4ade80' : '#f87171',
                }}
              >
                {submitStatus === 'success' ? (
                  <>
                    <BiCheck size={20} />
                    Message sent successfully!
                  </>
                ) : (
                  <>
                    <BiX size={20} />
                    Failed to send. Please try again.
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default ContactForm;
