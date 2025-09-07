'use client'

import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";
import { IoArrowForwardSharp } from "react-icons/io5";
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';

export default function Hero() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 100
      }
    }
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        delay: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-emerald-950 font-header relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <motion.div 
          className="absolute top-20 left-10 w-72 h-72 rounded-full bg-green-200"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-15 w-64 h-64 rounded-full bg-emerald-200"
          animate={{ 
            scale: [1.1, 1, 1.1],
            opacity: [0.3, 0.2, 0.3]
          }}
          transition={{ 
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-10 bg-grid-emerald-300/[0.03] bg-[length:40px_40px]"></div>

      <div className="container relative z-10 mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-24">
        <motion.div 
          className="text-center mb-8"
          variants={badgeVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="inline-flex items-center justify-center bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-sm font-medium py-2 px-6 rounded-full shadow-sm border border-green-200/50 mb-6">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Strategic Initiative for Enugu State
          </div>
        </motion.div>

        <motion.div
          ref={ref}
          className="md:max-w-4xl max-w-full mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <motion.h1 
            className="text-3xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4 leading-tight"
            variants={itemVariants}
          >
            Food Loan Scheme for{" "} <br />
            <motion.span 
              className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400"
              variants={itemVariants}
            >
              Enugu State Workers
            </motion.span>
          </motion.h1>

          <motion.p 
            className="text-md md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-4xl mx-auto mb-10 md:mb-12"
            variants={itemVariants}
          >
            A revolutionary state-funded initiative designed to enhance food
            security for civil servants while stimulating local agricultural
            growth through interest-free credit facilities.
          </motion.p>

          <motion.div 
            className="flex flex-col md:flex-row gap-4 md:items-center"
            variants={itemVariants}
          >
            <Button
              asChild
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-base px-8 py-6 rounded-xl shadow-lg hover:shadow-green-500/20 transition-all duration-300 transform hover:-translate-y-1"
            >
              <Link href="/executive-summary" className="flex items-center gap-2">
                View Executive Summary 
                <IoArrowForwardSharp className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            
            <Button
              asChild
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-base px-8 py-6 rounded-xl shadow-sm transition-all duration-300 transform hover:-translate-y-1"
            >
              <Link href="/implementation">
                Implementation Plan
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats preview - only show on client side */}
        {isMounted && (
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto mt-16 md:mt-24"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.7 }}
          >
            {[
              { value: "0%", label: "Interest" },
              { value: "24/7", label: "Access" },
              { value: "100%", label: "Secure" },
              { value: "Fast", label: "Approval" }
            ].map((stat, index) => (
              <div key={index} className="text-center p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/20">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Decorative SVG elements with fixed positions */}
        <div className="absolute bottom-10 left-5 opacity-10">
          <svg width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>

        <div className="absolute top-20 right-10 opacity-10">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
      </div>
    </div>
  );
}