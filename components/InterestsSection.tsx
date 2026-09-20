import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { BiPalette, BiPencil, BiImage, BiLinkExternal } from "react-icons/bi";
import { FaInstagram, FaHeart } from "react-icons/fa";
import { InstagramConfig } from "../types";
import { useAnalytics } from "@/components/analytics/AnalyticsProvider";

interface InterestsSectionProps {
  interests: string[];
  instagram?: InstagramConfig;
}

const interestIcons: { [key: string]: React.ReactNode } = {
  "Graphic Designing": <BiPalette size={20} />,
  "Charcoal Sketching": <BiPencil size={20} />,
  "Glass Painting": <BiImage size={20} />,
};

const defaultInstagram: InstagramConfig = {
  handle: "shyylines",
  name: "Shyy Lines",
  url: "https://www.instagram.com/shyylines/",
  bio: "Where code meets canvas — sketches, glass paintings, and creative lines.",
  posts: [
    {
      id: "charcoal-1",
      title: "Charcoal Sketching",
      category: "Charcoal & Graphite",
      tag: "#charcoalsketch",
      caption:
        "Deep contrast, shadows, and expressive pencil shading explorations.",
      image: "/hobbies/charcoal-sketch.svg",
    },
    {
      id: "glass-1",
      title: "Glass Painting",
      category: "Glass & Acrylics",
      tag: "#glasspainting",
      caption:
        "Luminous colors and transparent light refractions on glass surfaces.",
      image: "/hobbies/glass-painting.svg",
    },
    {
      id: "line-art-1",
      title: "Continuous Line Art",
      category: "Ink & Contours",
      tag: "#shyylines",
      caption:
        "Minimalist continuous single-line silhouettes and freehand flows.",
      image: "/hobbies/line-art.svg",
    },
    {
      id: "graphic-1",
      title: "Graphic Designing",
      category: "Digital Art",
      tag: "#graphicdesign",
      caption:
        "Modern vector aesthetics, layouts, and bold visual storytelling.",
      image: "/hobbies/graphic-design.svg",
    },
  ],
};

const InterestsSection = ({
  interests,
  instagram = defaultInstagram,
}: InterestsSectionProps) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.15,
  });

  const { track } = useAnalytics();

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 14,
      },
    },
  };

  const igData = instagram || defaultInstagram;

  return (
    <section id="interests" style={{ padding: "var(--section-padding) 0" }}>
      <motion.div
        ref={ref}
        className="interests-content"
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <motion.h2 variants={itemVariants}>
          Interests & Creative Hobbies
        </motion.h2>

        {/* Category Pills */}
        <motion.ul
          variants={containerVariants}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.85rem",
            listStyle: "none",
            padding: 0,
            marginTop: "1.25rem",
            marginBottom: "2rem",
          }}
        >
          {interests.map((interest, index) => (
            <motion.li
              key={index}
              variants={itemVariants}
              className="interest-item"
              whileHover={{
                y: -3,
                scale: 1.03,
                transition: { type: "spring", stiffness: 300 },
              }}
              whileTap={{ scale: 0.96 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1.35rem",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 50,
                cursor: "default",
                transition: "all 0.2s ease",
              }}
            >
              <span style={{ color: "var(--color-interests)" }}>
                {interestIcons[interest] || <BiPalette size={20} />}
              </span>
              <span
                style={{
                  fontSize: "0.9rem",
                  color: "var(--text-secondary)",
                  fontWeight: 500,
                }}
              >
                {interest}
              </span>
            </motion.li>
          ))}
        </motion.ul>

        {/* Instagram Showcase & Artwork Previews */}
        <div className="instagram-showcase-container">
          {/* Profile Header Banner */}
          <motion.div variants={itemVariants} className="instagram-banner-card">
            <div className="instagram-profile-info">
              <div className="instagram-avatar-ring">
                <div className="instagram-avatar-inner">
                  <FaInstagram size={30} />
                </div>
              </div>
              <div className="instagram-meta">
                <h3>
                  <span>{igData.name}</span>
                  <span className="instagram-handle-badge">
                    @{igData.handle}
                  </span>
                </h3>
                <p>{igData.bio}</p>
              </div>
            </div>

            <motion.a
              href={igData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="instagram-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => track("navigation", { target: igData.url })}
            >
              <FaInstagram size={18} />
              <span>Explore @{igData.handle}</span>
              <BiLinkExternal size={16} />
            </motion.a>
          </motion.div>

          {/* Artwork Preview Grid */}
          <motion.div
            variants={containerVariants}
            className="instagram-gallery-grid"
          >
            {igData.posts.map((post, idx) => (
              <motion.a
                key={post.id || idx}
                variants={itemVariants}
                href={igData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="instagram-post-card"
                whileHover={{ y: -6 }}
                onClick={() =>
                  track("navigation", { target: `${igData.url}#${post.id}` })
                }
                title={`View ${post.title} on Instagram (@${igData.handle})`}
              >
                {/* Visual artwork preview */}
                <img
                  src={post.image}
                  alt={post.title}
                  className="instagram-post-img"
                  loading="lazy"
                />

                {/* Hover overlay */}
                <div className="instagram-card-overlay">
                  <div className="instagram-card-top">
                    <span className="instagram-category-tag">{post.tag}</span>
                    <span
                      style={{
                        color: "#fb7185",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                      }}
                    >
                      <FaHeart size={14} />
                    </span>
                  </div>

                  <div className="instagram-card-bottom">
                    <h4>{post.title}</h4>
                    <p>{post.caption}</p>
                    <div className="instagram-action-row">
                      <span>View on Instagram</span>
                      <BiLinkExternal size={14} />
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default InterestsSection;
