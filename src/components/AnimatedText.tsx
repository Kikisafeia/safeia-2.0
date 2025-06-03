import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedTextProps {
  text: string | string[];
  className?: string;
  delay?: number;
}

export default function AnimatedText({ text, className = '', delay = 0 }: AnimatedTextProps) {
  const lines = Array.isArray(text) ? text : [text];
  
  const container = {
    hidden: { opacity: 0 },
    visible: () => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: delay * 0.1 },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {lines.map((line, lineIndex) => (
        <div key={lineIndex} className="mb-2">
          {line.split(' ').map((word, index) => (
            <motion.span
              variants={child}
              key={index}
              className="inline-block mx-1"
            >
              {word}
            </motion.span>
          ))}
        </div>
      ))}
    </motion.div>
  );
}