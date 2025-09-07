'use client'

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaRegHeart, FaShieldAlt } from 'react-icons/fa';
import { FaArrowTrendUp } from 'react-icons/fa6';
import { FiShield } from "react-icons/fi";
import { LuUsers } from "react-icons/lu";

const features = [
  {
    icon: <FaRegHeart className="text-3xl" />,
    title: 'Enhanced Food Security',
    description: 'Direct access to essential food items without upfront payments',
  },
  {
    icon: <FaArrowTrendUp className="text-3xl" />,
    title: 'Local Economic Growth',
    description: 'Stimulates agricultural sector and local businesses',
  },
  {
    icon: <FiShield className="text-3xl" />,
    title: 'Interest-Fee Repayments',
    description: 'Convenient salary deductions with no interest charges',
  },
  {
    icon: <LuUsers className="text-3xl" />,
    title: 'Worker Welfare',
    description: 'Improves civil servant morale and productivity',
  },
];

const Features = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

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
      y: 50,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as "spring",
        damping: 12,
        stiffness: 100
      }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring" as const,
        stiffness: 260,
        damping: 20,
        delay: 0.2
      }
    }
  };

  return (
    <section className="relative py-16 md:py-24 px-4 md:px-8 font-header bg-gradient-to-br from-green-50 via-white to-emerald-50 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-10% left-5% w-32 h-32 rounded-full bg-green-400"></div>
        <div className="absolute top-70% left-90% w-24 h-24 rounded-full bg-emerald-300"></div>
        <div className="absolute top-30% left-80% w-40 h-40 rounded-full bg-green-200"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-center pt-4 mb-6 text-gray-900"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Transformative Benefits for Enugu State
        </motion.h2>
        
        <motion.p 
          className="text-lg text-center text-gray-600 max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Empowering civil servants with financial flexibility while strengthening local economy
        </motion.p>

        <motion.div 
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              className="flex flex-col group"
              variants={itemVariants}
              whileHover={{ y: -10 }}
            >
              <div className="flex flex-col h-full bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100 group-hover:border-green-300">
                {/* Icon container with gradient background */}
                <motion.div 
                  className="flex items-center justify-center w-16 h-16 rounded-2xl mb-6 bg-gradient-to-br from-green-100 to-emerald-100 group-hover:from-green-200 group-hover:to-emerald-200 transition-all duration-300"
                  variants={iconVariants}
                  whileHover={{ 
                    scale: 1.1,
                    rotate: 5,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                >
                  <div className="text-emerald-700">
                    {feature.icon}
                  </div>
                </motion.div>
                
                <h3 className="text-xl font-bold font-header text-gray-900 mb-4 group-hover:text-emerald-800 transition-colors duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed font-medium text-base mt-auto">
                  {feature.description}
                </p>
                
                {/* Decorative line that expands on hover */}
                <div className="w-12 h-1 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full mt-6 transition-all duration-300 group-hover:w-16"></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default Features;