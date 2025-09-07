'use client'

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useRef, useEffect, useState } from 'react';
import { stats } from '@/constants';

const Stats = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [scrollerWidth, setScrollerWidth] = useState(0);

  useEffect(() => {
    if (scrollerRef.current) {
      // Calculate the width of the scrolling content
      const width = scrollerRef.current.scrollWidth / 2; // We're using half since we duplicated content
      setScrollerWidth(width);
    }
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      x: 100,
      scale: 0.8 
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 100
      }
    }
  };

  const valueVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        delay: 0.5
      }
    }
  };

  return (
    <section className="relative py-8 md:py-12 px-4 w-full bg-gradient-to-r from-green-50 to-indigo-50 overflow-hidden">
      {/* Animated background elements */}
      <motion.div 
        className="absolute top-0 left-0 w-full h-full opacity-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 1.5 }}
      >
        <div className="absolute top-10% left-10% w-20 h-20 rounded-full bg-green-400"></div>
        <div className="absolute top-60% left-80% w-16 h-16 rounded-full bg-emerald-400"></div>
        <div className="absolute top-30% left-65% w-24 h-24 rounded-full bg-green-400"></div>
      </motion.div>

      <motion.div
        ref={ref}
        className="flex flex-wrap justify-center items-stretch gap-6 md:gap-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.id}
            className="flex-1 min-w-[160px] max-w-[240px] bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center border border-opacity-20 border-emerald-300 transform hover:scale-105 transition-all duration-300"
            variants={itemVariants}
            whileHover={{ 
              y: -5,
              boxShadow: "0 10px 25px -5px rgba(99, 241, 241, 0.2)"
            }}
          >
            <motion.h4 
              className="font-bold text-3xl md:text-4xl text-emerald-700 mb-2"
              variants={valueVariants}
            >
              {stat.value}
            </motion.h4>
            <motion.p 
              className="text-sm md:text-base font-semibold text-cyan-900 uppercase tracking-wider text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {stat.title}
            </motion.p>
            
            {/* Decorative element */}
            <motion.div 
              className="w-8 h-1 bg-gradient-to-r from-green-400 to-cyan-500 rounded-full mt-3"
              initial={{ width: 0 }}
              animate={{ width: 32 }}
              transition={{ delay: 1 }}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Continuous horizontal scrolling text for extra visual interest */}
      <motion.div 
        className="mt-12 py-4 bg-green-900 bg-opacity-5 rounded-lg overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <motion.div
          ref={scrollerRef}
          className="flex whitespace-nowrap"
          animate={{ x: [0, -scrollerWidth] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 20,
              ease: "linear"
            }
          }}
        >
          {/* Duplicate content for seamless looping */}
          {[...Array(4)].map((_, i) => (
            <span key={i} className="text-green-700 text-sm font-semibold mx-8">
              ✦ Trusted by thousands ✦ Award-winning service ✦ Industry leader ✦
            </span>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Stats;