import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  FaHtml5,
  FaCss3,
  FaReact,
  FaNodeJs,
  FaPython,
  FaAws,
  FaDocker,
  FaGitAlt,
  FaLinux,
} from "react-icons/fa";
import { FiDatabase } from "react-icons/fi";
import { 
  SiNextdotjs, 
  SiExpress, 
  SiMongodb, 
  SiOpenai, 
  SiTypescript,
  SiFlask,
  SiJest,
  SiRedis,
  SiGraphql,
  SiJsonwebtokens,
} from "react-icons/si";
import { RiJavascriptFill } from "react-icons/ri";
import { PiBird } from "react-icons/pi";
import { TbApi, TbWebhook } from "react-icons/tb";
import { MdOutlineIntegrationInstructions } from "react-icons/md";

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const iconVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Card throwing animation from outside viewport - poker dealer style
const getCardVariants = (index) => {
  // Calculate angle and position for dramatic entry from off-screen
  const totalCards = 25; // approximate total
  const startAngle = -90; // Start from left side
  const endAngle = 90; // End at right side
  const angle = startAngle + (endAngle - startAngle) * (index / totalCards);
  
  // Cards fly in from far outside the viewport
  const distance = 1500; // Much further out
  const startX = Math.cos(angle * Math.PI / 180) * distance;
  const startY = Math.sin(angle * Math.PI / 180) * distance - 500; // Higher start
  
  return {
    hidden: {
      opacity: 0,
      scale: 0.2,
      rotateY: 360, // Multiple spins
      rotateZ: angle * 3,
      x: startX,
      y: startY,
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotateY: 180, // Start face-down
      rotateZ: (Math.random() - 0.5) * 20, // Random slight rotation
      x: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 20,
        duration: 1,
        delay: index * 0.06, // Faster succession
      },
    },
    hover: {
      scale: 1.1,
      rotateZ: Math.random() > 0.5 ? 5 : -5,
      y: -20,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 10,
      },
    },
  };
};

const SkillsSection = ({ skills }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const autoRevealTriggered = useRef(false);
  
  // Initialize with only a few cards revealed (20-25%)
  const [flippedCards, setFlippedCards] = useState(() => {
    const initialFlipped = {};
    const numToReveal = Math.ceil(skills.length * 0.2); // ~20% initially
    const revealedIndices = new Set();
    
    // Randomly select cards to reveal initially
    while (revealedIndices.size < numToReveal) {
      const randomIndex = Math.floor(Math.random() * skills.length);
      revealedIndices.add(randomIndex);
    }
    
    revealedIndices.forEach(index => {
      initialFlipped[index] = true;
    });
    
    return initialFlipped;
  });

  // Progressive auto-reveal after delay when section is in view
  useEffect(() => {
    if (isInView && !autoRevealTriggered.current) {
      autoRevealTriggered.current = true;
      
      // After 2-3 seconds, reveal more cards automatically
      const timer = setTimeout(() => {
        setFlippedCards(prev => {
          const newFlipped = { ...prev };
          const currentlyFlipped = Object.keys(prev).filter(k => prev[k]).length;
          const totalToReveal = Math.ceil(skills.length * 0.5); // Reveal up to 50% total
          const needToReveal = totalToReveal - currentlyFlipped;
          
          if (needToReveal > 0) {
            const unflippedIndices = [];
            skills.forEach((_, index) => {
              if (!prev[index]) {
                unflippedIndices.push(index);
              }
            });
            
            // Randomly select additional cards to flip
            const shuffled = unflippedIndices.sort(() => Math.random() - 0.5);
            const toFlip = shuffled.slice(0, needToReveal);
            
            toFlip.forEach(index => {
              newFlipped[index] = true;
            });
          }
          
          return newFlipped;
        });
      }, 2500); // 2.5 seconds delay
      
      return () => clearTimeout(timer);
    }
  }, [isInView, skills.length]);

  const toggleCard = (index) => {
    setFlippedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const skillIcons = {
    HTML: FaHtml5,
    CSS: FaCss3,
    JavaScript: RiJavascriptFill,
    "NEXT JS": SiNextdotjs,
    "NODE JS": FaNodeJs,
    SQL: FiDatabase,
    "REACT JS": FaReact,
    "EXPRESS JS": SiExpress,
    PYTHON: FaPython,
    "MONGO DB": SiMongodb,
    "OpenAI Customizations": SiOpenai,
    LangChain: PiBird,
    "React Native": FaReact,
    "AWS (S3)": FaAws,
    TypeScript: SiTypescript,
    Flask: SiFlask,
    Jest: SiJest,
    Zustand: MdOutlineIntegrationInstructions,
    Redis: SiRedis,
    Docker: FaDocker,
    "AWS EC2": FaAws,
    "CI/CD": MdOutlineIntegrationInstructions,
    "OAuth & JWT": SiJsonwebtokens,
    GraphQL: SiGraphql,
    WebSockets: TbWebhook,
    "RESTful APIs": TbApi,
    Git: FaGitAlt,
    Linux: FaLinux,
  };

  return (
    <section ref={ref}>
      <motion.div
        className="skills-content"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <h2>Skills</h2>
        <ul className="skill-list">
          <AnimatePresence>
            {skills.map((skill, index) => {
              const IconComponent = skillIcons[skill.skill] || TbApi;
              const cardVariants = getCardVariants(index);
              
              const isFlipped = flippedCards[index];
              
              return (
                <motion.li
                  key={index}
                  className="skill-card"
                  initial="hidden"
                  animate={isInView ? "visible" : "hidden"}
                  exit="hidden"
                  variants={cardVariants}
                  onClick={() => toggleCard(index)}
                  style={{
                    transformStyle: "preserve-3d",
                    cursor: "pointer",
                  }}
                >
                  <motion.div
                    className="skill-card-inner"
                    animate={{ rotateY: isFlipped ? 0 : 180 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
                    style={{
                      transformStyle: "preserve-3d",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    {/* Card Back (shown initially) */}
                    <div className="skill-card-back">
                      <div className="card-back-pattern">
                        <div className="card-back-icon">♠</div>
                        <div className="card-back-text">SKILL</div>
                        <div className="card-back-icon">♠</div>
                      </div>
                    </div>

                    {/* Card Front (shown when flipped) */}
                    <div className="skill-card-front">
                      {/* Top rating indicator */}
                      <div className="skill-rating-top">
                        <span className="rating-value">{skill.rating}</span>
                      </div>

                      {/* Center icon */}
                      <div className="skill-icon-center">
                        {IconComponent && <IconComponent size={64} />}
                      </div>

                      {/* Skill name */}
                      <div className="skill-name">
                        <p>{skill.skill}</p>
                      </div>

                      {/* Bottom rating indicator */}
                      <div className="skill-rating-bottom">
                        <span className="rating-value">{skill.rating}</span>
                      </div>
                    </div>
                  </motion.div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </motion.div>
    </section>
  );
};

export default SkillsSection;
