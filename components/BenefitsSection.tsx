'use client'

import { Wallet, Truck, CalendarCheck, ShieldCheck, PiggyBank, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';

const BenefitsSection = () => {
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
        staggerChildren: 0.15,
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

  const textVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        // Use type: "spring" only if Framer Motion supports string "spring" for your version, otherwise remove 'type'
        type: "spring" as const,
        stiffness: 100,
        delay: 0.2
      }
    }
  };

  const benefits = [
    {
      icon: <Wallet className="text-emerald-600" size={24} />,
      title: "Salary-linked purchases with automatic deductions",
      color: "emerald"
    },
    {
      icon: <Truck className="text-amber-600" size={24} />,
      title: "Reliable doorstep delivery of quality foodstuffs",
      color: "amber"
    },
    {
      icon: <CalendarCheck className="text-emerald-600" size={24} />,
      title: "Order anytime - pay automatically on payday",
      color: "emerald"
    },
    {
      icon: <ShieldCheck className="text-amber-600" size={24} />,
      title: "Government-approved secure transactions",
      color: "amber"
    },
    {
      icon: <PiggyBank className="text-emerald-600" size={24} />,
      title: "Budget-friendly alternative to loans",
      color: "emerald"
    },
    {
      icon: <Zap className="text-amber-600" size={24} />,
      title: "Quick approval process - no credit checks",
      color: "amber"
    }
  ];

  // Predefined positions for floating particles
  const particlePositions = [
    { top: "10%", left: "20%" },
    { top: "20%", left: "80%" },
    { top: "30%", left: "40%" },
    { top: "40%", left: "60%" },
    { top: "50%", left: "10%" },
    { top: "60%", left: "90%" },
    { top: "70%", left: "30%" },
    { top: "80%", left: "70%" },
    { top: "90%", left: "50%" },
    { top: "15%", left: "15%" },
    { top: "25%", left: "85%" },
    { top: "35%", left: "35%" },
    { top: "45%", left: "65%" },
    { top: "55%", left: "5%" },
    { top: "65%", left: "95%" },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-900 to-emerald-950 rounded-2xl text-white py-16 md:py-24 px-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute right-10 top-1/3 w-80 h-80 bg-emerald-600 blur-[100px] rounded-full opacity-20"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute left-20 top-1/3 w-80 h-80 bg-green-600 blur-[100px] rounded-full opacity-20"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.2, 0.3]
          }}
          transition={{ 
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-grid-white/[0.05] bg-[length:40px_40px]"></div>
      </div>

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 relative z-10">
        {/* Left Text */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.h2 
            className="text-3xl md:text-4xl font-bold md:leading-[50px] leading-[40px] mb-6"
            variants={textVariants}
          >
            Smart shopping for <span className="text-emerald-300">government workers</span> made simple
          </motion.h2>
          
          <motion.p 
            className="text-lg text-gray-300 mb-8 leading-relaxed"
            variants={textVariants}
          >
            Get the essentials you need now and pay seamlessly through automatic salary deductions.
            No interest, no hidden fees. Just convenient access to quality food supplies.
          </motion.p>
          
          <motion.div variants={textVariants}>
            <Link 
              href="/employee-login" 
              className="group inline-flex items-center bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-full font-semibold shadow-lg transition-all duration-300 hover:shadow-emerald-500/20 hover:scale-105"
            >
              Start Shopping Today
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-2 gap-6 mt-12"
            variants={containerVariants}
          >
            <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm">
              <div className="text-2xl font-bold text-emerald-300">0%</div>
              <div className="text-sm text-gray-400">Interest Rate</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm">
              <div className="text-2xl font-bold text-emerald-300">24/7</div>
              <div className="text-sm text-gray-400">Order Access</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Benefit Boxes */}
        <motion.div 
          ref={ref}
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {benefits.map((benefit, index) => (
            <motion.div 
              key={index}
              className="flex items-center gap-4 bg-white/5 p-5 rounded-xl backdrop-blur-sm shadow-md hover:bg-white/10 transition-all duration-300 group cursor-pointer border border-white/5 hover:border-emerald-500/20"
              variants={itemVariants}
              whileHover={{ 
                y: -5,
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
            >
              <motion.div 
                className={`p-3 rounded-xl bg-gradient-to-br ${
                  benefit.color === 'emerald' 
                    ? 'from-emerald-500/20 to-emerald-600/20' 
                    : 'from-amber-500/20 to-amber-600/20'
                } group-hover:scale-110 transition-transform duration-300`}
                whileHover={{ rotate: 5 }}
              >
                {benefit.icon}
              </motion.div>
              
              <span className="font-medium text-gray-100 group-hover:text-white transition-colors">
                {benefit.title}
              </span>
              
              {/* Animated arrow on hover */}
              <motion.div 
                className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                initial={{ x: -10 }}
                whileHover={{ x: 0 }}
              >
                <ArrowRight size={16} className="text-emerald-400" />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Floating particles - only render on client side */}
      {isMounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particlePositions.map((pos, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-emerald-400 rounded-full"
              style={{
                top: pos.top,
                left: pos.left,
              }}
              animate={{
                y: [0, -15, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + (i % 3),
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default BenefitsSection;