'use client'

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaMapMarkerAlt, FaBuilding, FaAward, FaLightbulb } from 'react-icons/fa';

const LeadershipProfile = () => {
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

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        delay: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white"></div>
        <div className="absolute top-1/4 right-0 w-64 h-64 rounded-full bg-white"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 rounded-full bg-white"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Strategic Leadership</h1>
          <div className="w-32 h-1 bg-gradient-to-r from-emerald-300 to-teal-300 mx-auto rounded-full"></div>
          <p className="text-emerald-100 mt-6 max-w-2xl mx-auto text-lg">
            Visionary leadership driving innovation and sustainable development in Enugu State
          </p>
        </motion.div>

        {/* Profile Content */}
        <motion.div 
          ref={ref}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <div className="md:flex">
            {/* Image Section */}
            <motion.div 
              className="md:w-2/5 flex items-center justify-center p-8 md:p-12 bg-gradient-to-br from-emerald-600 to-teal-700 relative"
              variants={imageVariants}
            >
              <div className="absolute top-6 right-6 opacity-20">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15L7 20L12 15ZM12 15L17 10L12 15ZM12 15L7 10L12 15ZM12 15L17 20L12 15Z" stroke="white" strokeWidth="2"/>
                </svg>
              </div>
              
              <div className="text-center relative z-10">
                <div className="w-56 h-56 md:w-64 md:h-64 mx-auto rounded-2xl overflow-hidden relative mb-6 shadow-2xl border-4 border-white/20">
                  <Image 
                    src="/gov1.jpg" 
                    alt="Peter Mbah" 
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 inline-block">
                  <p className="text-sm text-white font-medium">Leadership Portrait</p>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-emerald-400/30"></div>
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-teal-400/40"></div>
              </div>
            </motion.div>
            
            {/* Content Section */}
            <div className="p-8 md:p-12 md:w-3/5">
              <div className="flex flex-col h-full justify-center">
                <motion.h2 
                  className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                  variants={itemVariants}
                >
                  Peter Mbah
                </motion.h2>
                
                <motion.div 
                  className="mb-8"
                  variants={itemVariants}
                >
                  <div className="flex items-center mb-3">
                    <div className="w-2 h-8 bg-emerald-500 rounded-full mr-3"></div>
                    <p className="text-xl text-emerald-700 font-semibold">
                      Executive Governor of Enugu State
                    </p>
                  </div>
                  
                  {/* <div className="flex items-center">
                    <div className="w-2 h-8 bg-teal-500 rounded-full mr-3"></div>
                    <p className="text-xl text-teal-700 font-semibold">
                      MD/CEO, Enugu State Marketing Company
                    </p>
                  </div> */}
                </motion.div>
                
                <motion.div 
                  className="mb-8 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border-l-4 border-emerald-500"
                  variants={itemVariants}
                >
                  <div className="flex items-start">
                    <FaLightbulb className="text-2xl text-emerald-600 mr-3 mt-1" />
                    <p className="text-gray-700 leading-relaxed text-lg italic">
                      "Leading the strategic development of innovative solutions that enhance worker welfare 
                      while driving sustainable economic growth in Enugu State's agricultural sector."
                    </p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex flex-wrap gap-4 mb-8"
                  variants={itemVariants}
                >
                  <div className="flex items-center px-4 py-2 bg-emerald-100 rounded-full">
                    <FaMapMarkerAlt className="text-emerald-600 mr-2" />
                    <span className="text-emerald-800 font-medium">Enugu, Nigeria</span>
                  </div>
                  
                  <div className="flex items-center px-4 py-2 bg-teal-100 rounded-full">
                    <FaBuilding className="text-teal-600 mr-2" />
                    <span className="text-teal-800 font-medium">Government</span>
                  </div>
                  
                  <div className="flex items-center px-4 py-2 bg-green-100 rounded-full">
                    <FaAward className="text-green-600 mr-2" />
                    <span className="text-green-800 font-medium">Leadership</span>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-100"
                  variants={itemVariants}
                >
                  <div className="text-center p-4 bg-gray-50 rounded-lg hover:bg-emerald-50 transition-colors duration-300">
                    <h4 className="font-bold text-emerald-700 mb-2">Vision</h4>
                    <p className="text-sm text-gray-600">Sustainable economic growth through innovation</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg hover:bg-teal-50 transition-colors duration-300">
                    <h4 className="font-bold text-teal-700 mb-2">Mission</h4>
                    <p className="text-sm text-gray-600">Empowering workers and strengthening local economy</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LeadershipProfile;