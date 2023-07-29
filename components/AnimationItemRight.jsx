import React, { useEffect } from "react";
import { useAnimation, motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const squareVariants = {
  visible: { opacity: 1, x: 0, transition: { duration: 1, delay: 0.5 } }, // Added delay here
  hidden: { opacity: 0, x: "100%" },
};

export function AnimationItemRight(props) {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [controls, inView]);

  return (
    <motion.div
      className="item-container"
      ref={ref}
      animate={controls}
      initial="hidden"
      variants={squareVariants}
    >
      {props.children}
    </motion.div>
  );
}
