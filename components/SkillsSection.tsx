import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
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

import { Skill } from "../types";
import { IconType } from "react-icons";

interface SkillsSectionProps {
  skills: Skill[];
}

type CategoryKey = "frontend" | "backend" | "devops" | "aiml" | "tools";

interface Category {
  id: CategoryKey;
  label: string;
  color: string;
  skills: string[];
}

// Color mappings that reference CSS variables
const categoryColors: Record<CategoryKey, { color: string; cssVar: string }> = {
  frontend: { color: "#61DAFB", cssVar: "var(--color-skills)" },
  backend: { color: "#68A063", cssVar: "var(--color-experience)" },
  devops: { color: "#FF9900", cssVar: "var(--color-projects)" },
  aiml: { color: "#10A37F", cssVar: "var(--color-certificates)" },
  tools: { color: "#E535AB", cssVar: "var(--color-interests)" },
};

const categories: Category[] = [
  {
    id: "frontend",
    label: "Frontend",
    color: categoryColors.frontend.color,
    skills: [
      "HTML",
      "CSS",
      "JavaScript",
      "TypeScript",
      "REACT JS",
      "NEXT JS",
      "React Native",
    ],
  },
  {
    id: "backend",
    label: "Backend",
    color: categoryColors.backend.color,
    skills: [
      "NODE JS",
      "EXPRESS JS",
      "PYTHON",
      "Flask",
      "SQL",
      "MONGO DB",
      "GraphQL",
      "RESTful APIs",
      "WebSockets",
    ],
  },
  {
    id: "devops",
    label: "DevOps & Cloud",
    color: categoryColors.devops.color,
    skills: ["AWS (S3)", "AWS EC2", "Docker", "CI/CD", "Linux", "Git"],
  },
  {
    id: "aiml",
    label: "AI & ML",
    color: categoryColors.aiml.color,
    skills: ["OpenAI Customizations", "LangChain"],
  },
  {
    id: "tools",
    label: "Tools & Auth",
    color: categoryColors.tools.color,
    skills: ["Jest", "Zustand", "Redis", "OAuth & JWT"],
  },
];

const skillIcons: { [key: string]: IconType } = {
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

interface RadarChartProps {
  skills: Array<{ skill: string; rating: number }>;
  color: string;
  hoveredSkill: string | null;
  inView: boolean;
}

const RadarChart: React.FC<RadarChartProps> = ({
  skills,
  color,
  hoveredSkill,
  inView,
}) => {
  const size = 300;
  const center = size / 2;
  const maxRadius = size / 2 - 40;
  const levels = 5;

  const angleStep = (2 * Math.PI) / skills.length;
  const startAngle = -Math.PI / 2;

  const getPoint = (index: number, value: number) => {
    const angle = startAngle + index * angleStep;
    const radius = (value / 10) * maxRadius;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  const getLabelPoint = (index: number) => {
    const angle = startAngle + index * angleStep;
    const radius = maxRadius + 25;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  const polygonPoints = skills
    .map((skill, i) => {
      const point = getPoint(i, skill.rating);
      return `${point.x},${point.y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="radar-chart"
      style={{ width: "100%", maxWidth: 340, height: "auto" }}
    >
      {/* Background circles */}
      {Array.from({ length: levels }, (_, i) => {
        const radius = ((i + 1) / levels) * maxRadius;
        return (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={1}
          />
        );
      })}

      {/* Axis lines */}
      {skills.map((_, i) => {
        const point = getPoint(i, 10);
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={point.x}
            y2={point.y}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={1}
          />
        );
      })}

      {/* Data polygon */}
      <motion.polygon
        points={polygonPoints}
        fill={`${color}20`}
        stroke={color}
        strokeWidth={2}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
          opacity: inView ? 1 : 0,
          scale: inView ? 1 : 0.5,
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ transformOrigin: "center" }}
      />

      {/* Data points */}
      {skills.map((skill, i) => {
        const point = getPoint(i, skill.rating);
        const isHovered = hoveredSkill === skill.skill;
        return (
          <motion.circle
            key={skill.skill}
            cx={point.x}
            cy={point.y}
            r={5}
            fill={isHovered ? "#fff" : color}
            stroke={isHovered ? color : "transparent"}
            strokeWidth={2}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: inView ? 1 : 0,
              scale: isHovered ? 1.6 : 1,
            }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            style={{ transformOrigin: `${point.x}px ${point.y}px` }}
          />
        );
      })}

      {/* Labels */}
      {skills.map((skill, i) => {
        const labelPoint = getLabelPoint(i);
        const isHovered = hoveredSkill === skill.skill;
        return (
          <motion.text
            key={`label-${skill.skill}`}
            x={labelPoint.x}
            y={labelPoint.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={isHovered ? "#fff" : "rgba(255, 255, 255, 0.6)"}
            fontSize={10}
            fontWeight={isHovered ? 600 : 400}
            initial={{ opacity: 0 }}
            animate={{ opacity: inView ? 1 : 0 }}
            transition={{ delay: 0.3 + i * 0.02 }}
          >
            {skill.rating}
          </motion.text>
        );
      })}
    </svg>
  );
};

const SkillsSection = ({ skills }: SkillsSectionProps) => {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("frontend");
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const skillsMap = useMemo(() => {
    return skills.reduce((acc, skill) => {
      acc[skill.skill] = skill.rating;
      return acc;
    }, {} as Record<string, number>);
  }, [skills]);

  const currentCategory = categories.find((c) => c.id === activeCategory)!;

  const categorySkills = useMemo(() => {
    return currentCategory.skills
      .filter((skillName) => skillsMap[skillName] !== undefined)
      .map((skillName) => ({
        skill: skillName,
        rating: skillsMap[skillName],
      }));
  }, [currentCategory, skillsMap]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <section className="skills-section" id="skills">
      <motion.div
        ref={ref}
        className="skills-content"
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <motion.h2 variants={itemVariants}>Skills & Technologies</motion.h2>

        {/* Category Pills */}
        <motion.div className="skills-category-pills" variants={itemVariants}>
          {categories.map((category) => (
            <motion.button
              key={category.id}
              className={`category-pill ${
                activeCategory === category.id ? "active" : ""
              }`}
              onClick={() => setActiveCategory(category.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                borderColor:
                  activeCategory === category.id
                    ? category.color
                    : "var(--border)",
                background:
                  activeCategory === category.id
                    ? `${category.color}15`
                    : "transparent",
              }}
            >
              <span
                className="pill-dot"
                style={{ background: category.color }}
              />
              {category.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Main Content Area */}
        <motion.div className="skills-main-area" variants={itemVariants}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              className="skills-chart-container"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Radar Chart */}
              <div className="radar-chart-wrapper">
                <RadarChart
                  skills={categorySkills}
                  color={currentCategory.color}
                  hoveredSkill={hoveredSkill}
                  inView={inView}
                />
              </div>

              {/* Skill Legend */}
              <div className="skills-legend">
                <h3 style={{ color: currentCategory.color }}>
                  {currentCategory.label}
                </h3>
                <ul className="legend-list">
                  {categorySkills.map((skill, index) => {
                    const IconComponent = skillIcons[skill.skill] || TbApi;
                    const isHovered = hoveredSkill === skill.skill;

                    return (
                      <motion.li
                        key={skill.skill}
                        className={`legend-item ${isHovered ? "hovered" : ""}`}
                        onMouseEnter={() => setHoveredSkill(skill.skill)}
                        onMouseLeave={() => setHoveredSkill(null)}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        style={{
                          borderColor: isHovered
                            ? currentCategory.color
                            : "transparent",
                        }}
                      >
                        <div
                          className="legend-icon"
                          style={{ color: currentCategory.color }}
                        >
                          <IconComponent size={20} />
                        </div>
                        <div className="legend-info">
                          <span className="legend-name">{skill.skill}</span>
                          <div className="legend-bar-container">
                            <motion.div
                              className="legend-bar"
                              initial={{ width: 0 }}
                              animate={{
                                width: inView ? `${skill.rating * 10}%` : 0,
                              }}
                              transition={{
                                delay: index * 0.05 + 0.3,
                                duration: 0.6,
                              }}
                              style={{ background: currentCategory.color }}
                            />
                          </div>
                        </div>
                        <span className="legend-rating">{skill.rating}/10</span>
                      </motion.li>
                    );
                  })}
                </ul>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default SkillsSection;
