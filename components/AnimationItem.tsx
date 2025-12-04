// components/AnimationItem.js

import React, { useEffect } from "react";
import { useAnimation, motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const squareVariants = {
  visible: { opacity: 1, transition: { duration: 1 } },
  hidden: { opacity: 0 },
};

interface AnimationItemProps {
  children: React.ReactNode;
}

export function AnimationItem(props: AnimationItemProps) {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true, // This will trigger the animation only once when it comes into view
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
