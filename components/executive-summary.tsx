'use client'

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

import { BsBullseye } from "react-icons/bs";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { FiDollarSign } from "react-icons/fi";
import {  FaHandshake, FaLeaf } from "react-icons/fa";
import { FaArrowTrendUp } from "react-icons/fa6";
import { FaShield } from "react-icons/fa6";

const ExecutiveSummary = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Strategic Food Loan Scheme Overview
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            A comprehensive framework for enhancing worker welfare and stimulating
            local economic growth
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="space-y-8"
        >
          {/* Strategic Overview Card */}
          <motion.div variants={itemVariants}>
            <Card className="w-full bg-white/80 backdrop-blur-sm border border-green-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-full bg-green-100">
                    <BsBullseye className="text-2xl text-green-700" />
                  </div>
                  <CardTitle className="text-2xl font-semibold text-gray-900">
                    Strategic Overview
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-gray-700">
                  <p>
                    This report outlines a strategic proposal for implementing a{" "}
                    <span className="font-bold text-green-700">"Food Loan Scheme"</span> directly
                    financed by the Enugu State Government and tailored for its workers.
                  </p>
                  <p>
                    The core mechanism involves enabling workers to acquire essential
                    food items immediately, with convenient,
                    <span className="font-bold text-green-700"> interest-free repayments</span> deducted
                    directly from their monthly salaries by the Accountant General of
                    Enugu State.
                  </p>
                  <p>
                    The scheme's strategic objectives are twofold: first, to improve the
                    quality of life for civil servants by providing accessible and
                    affordable food; and second, to foster robust economic activity by
                    channeling consumer spending towards local agricultural producers
                    and food businesses.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Strategic Objectives Card */}
          <motion.div variants={itemVariants}>
            <Card className="w-full bg-white/80 backdrop-blur-sm border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-full bg-blue-100">
                    <IoMdCheckmarkCircleOutline className="text-2xl text-blue-700" />
                  </div>
                  <CardTitle className="text-2xl font-semibold text-gray-900">
                    Strategic Objectives
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Provide accessible and affordable food items to Enugu State workers",
                    "Leverage the state's payroll system for efficient and secure repayment",
                    "Stimulate local economic activity by encouraging purchase of locally produced food",
                    "Enhance overall welfare and productivity of the state civil service"
                  ].map((objective, index) => (
                    <motion.div 
                      key={index}
                      className="flex items-start p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100 hover:border-green-300 transition-colors duration-300"
                      whileHover={{ y: -5 }}
                    >
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center mr-4 font-semibold">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 text-sm md:text-base">
                        {objective}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Two Column Cards */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Direct State Financing Card */}
            <Card className="bg-white/80 backdrop-blur-sm border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-full bg-blue-100">
                    <FiDollarSign className="text-2xl text-blue-700" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Direct State Financing
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  The Enugu State Government will directly fund the scheme, ensuring full alignment with state welfare and economic development objectives. The state bears direct credit risk, mitigated by the salary deduction mechanism.
                </p>
              </CardContent>
            </Card>

            {/* Local Economic Impact Card */}
            <Card className="bg-white/80 backdrop-blur-sm border border-green-100 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-full bg-green-100">
                    <FaArrowTrendUp className="text-2xl text-green-700" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Local Economic Impact
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  By prioritizing locally produced food items through the Enugu State Marketing Company, the scheme creates a virtuous cycle of consumption and production, directly supporting the agricultural value chain.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Implementation Framework Section */}
          <motion.section 
            variants={itemVariants}
            className="py-12 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl px-6 mt-12"
          >
            <div className="max-w-6xl mx-auto">
              {/* Header Section */}
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Implementation Framework
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Key components of the operational model
                </p>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    icon: <FaShield className="w-6 h-6 text-blue-600" />,
                    title: "Payroll Integration",
                    description: "Seamless integration with existing GIFMIS payroll system for automated deductions",
                    color: "blue"
                  },
                  {
                    icon: <FaHandshake className="w-6 h-6 text-green-600" />,
                    title: "Legal Compliance",
                    description: "Strict adherence to Nigerian Labour Act's 1/3rd salary deduction limit",
                    color: "green"
                  },
                  {
                    icon: <FaLeaf className="w-6 h-6 text-amber-600" />,
                    title: "Local Sourcing",
                    description: "Emphasis on locally produced agricultural goods to boost state economy",
                    color: "amber"
                  }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100"
                    whileHover={{ y: -5 }}
                  >
                    <div className="p-6">
                      <div className={`w-12 h-12 rounded-full bg-${item.color}-100 flex items-center justify-center mb-4`}>
                        {item.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                      <p className="text-gray-600">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Additional Information */}
              <motion.div 
                className="mt-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-8 text-center text-white shadow-lg"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-2xl font-semibold mb-4">Streamlined Implementation Process</h2>
                <p className="max-w-3xl mx-auto text-lg">
                  Our framework ensures efficient operation with minimal disruption to existing systems while maximizing benefits to both civil servants and the local economy.
                </p>
              </motion.div>
            </div>
          </motion.section>
        </motion.div>
      </div>
    </div>
  );
};

export default ExecutiveSummary;