import { motion } from "framer-motion";
import { BiCalendar, BiCheck } from "react-icons/bi";

const ExperienceCard = ({ experience }) => {
  return (
    <div className="experience-item">
      <div className="experience-header">
        <div style={{ display: "flex", alignItems: "center" }}>
          <h3>{experience.title}</h3>
        </div>
        <div className="experience-dates">
          <BiCalendar />
          <span>{experience.dates}</span>
        </div>
      </div>
      <p className="experience-company">{experience.company}</p>
      <p className="experience-description">{experience.description}</p>
      <ul className="experience-works">
        {experience.works.map((work, index) => (
          <li key={index}>
            <BiCheck style={{ marginRight: "8px" }} />
            {work}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExperienceCard;
