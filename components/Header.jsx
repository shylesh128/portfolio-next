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
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const Header = ({ data }) => {
  return (
    <header>
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
          <Avatar
            src={data.image}
            alt="Profile"
            sx={{
              width: { xs: 100, md: 150 },
              height: { xs: 100, md: 150 },
              border: "4px solid #fff",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
            }}
          />
          <div>
            <Typography variant="h4">{data.name}</Typography>
            <Typography variant="h6" sx={{ color: "#888" }}>
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
    </header>
  );
};

export default Header;
