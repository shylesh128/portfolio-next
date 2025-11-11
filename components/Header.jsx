import { motion } from "framer-motion";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const headerVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0, transition: { duration: 1 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.3 } },
};

const avatarVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: { 
    scale: 1, 
    rotate: 0, 
    transition: { 
      type: "spring",
      stiffness: 260,
      damping: 20,
      duration: 1 
    } 
  },
};

const floatingAnimation = {
  y: [0, -20, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

const Header = ({ data }) => {

  return (
    <header className="hero-section">
      {/* Floating geometric shapes */}
      <div className="floating-shapes">
        <motion.div 
          className="shape shape-1"
          animate={{ 
            y: [0, -30, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
        <motion.div 
          className="shape shape-2"
          animate={{ 
            y: [0, 30, 0],
            rotate: [360, 180, 0]
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
        <motion.div 
          className="shape shape-3"
          animate={{ 
            y: [0, -20, 0],
            x: [0, 20, 0]
          }}
          transition={{ 
            duration: 18, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
      </div>

      <motion.div
        className="header-content"
        initial="hidden"
        animate="visible"
        variants={headerVariants}
      >
        <Box
          sx={{
            textAlign: "center",
            padding: { xs: 2, md: 4 },
            display: "flex",
            flexDirection: { xs: "row", md: "column" },
            alignItems: "center",
            width: { xs: "100%", md: "50%" },
            justifyContent: "center",
            gap: "20px",
          }}
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={avatarVariants}
            whileHover={{ scale: 1.05 }}
            className="avatar-container"
          >
            <Avatar
              src={data.image}
              alt="Profile"
              className="profile-avatar"
              sx={{
                width: { xs: 100, md: 150 },
                height: { xs: 100, md: 150 },
              }}
            />
          </motion.div>
          <div>
            <Typography variant="h4" className="gradient-text animated-title">
              {data.name}
            </Typography>
            <Typography variant="h6" className="subtitle-text">
              {data.title}
            </Typography>
          </div>
        </Box>
        <Box
          sx={{
            textAlign: "center",
            padding: { xs: 2, md: 4 },
            gap: 2,
          }}
        >
          <motion.div
            className="about-me-content"
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
          >
            <p>{data.description}</p>
          </motion.div>
        </Box>
      </motion.div>
      
      {/* Scroll indicator */}
      <motion.div 
        className="scroll-indicator"
        animate={floatingAnimation}
      >
        <div className="scroll-arrow">↓</div>
      </motion.div>
    </header>
  );
};

export default Header;
