import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { BsBullseye } from "react-icons/bs";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { FiDollarSign } from "react-icons/fi";
import { FaArrowTrendUp } from "react-icons/fa6";

const ExecutiveSummary = () => {
  return (
    <div className="pl-10 my-4">
      <h2 className="text-3xl">Strategic Food Loan Scheme Overview</h2>
      <p className="my-4">
        A comprehensive framework for enhancing worker welfare and stimulating
        local economic growth
      </p>

      <Card className="w-full md:w-[90%]">
        <CardHeader className="">
          <div className="flex space-x-3">
            <BsBullseye className="inline text-2xl text-green-700 " />
            <CardTitle className="inline text-2xl font-normal">
              {" "}
              Strategic Overview
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p>
            This report outlines a strategic proposal for implementing a{" "}
            <span className="font-bold">"Food Loan Scheme"</span> directly
            financed by the Enugu State Government and tailored for its workers.
            The initiative aims to significantly enhance the food security and
            financial well-being of civil servants while simultaneously
            stimulating local economic growth, particularly within the
            agricultural sector.
          </p>{" "}
          <br />
          <p>
            The core mechanism involves enabling workers to acquire essential
            food items immediately, with convenient,
            <span className="font-bold">interest-free repayments</span> deducted
            directly from their monthly salaries by the Accountant General of
            Enugu State.
          </p>{" "}
          <br />
          <p>
            The scheme's strategic objectives are twofold: first, to improve the
            quality of life for civil servants by providing accessible and
            affordable food; and second, to foster robust economic activity by
            channeling consumer spending towards local agricultural producers
            and food businesses.
          </p>
        </CardContent>
      </Card>

      <Card className="w-full md:w-[90%] my-8">
        <CardHeader className="">
          <div className="flex space-x-3">
            <IoMdCheckmarkCircleOutline className="inline text-2xl text-blue-700 " />
            <CardTitle className="inline text-2xl font-normal">
              Strategic Objectives
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className=" bg-white rounded-2xl">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <div className="flex items-start p-4 bg-green-50 rounded-lg">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center mr-4">
                  {/* <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg> */}
                  1
                </div>
                <div>
                  <p className="text-gray-600 text-sm mt-1">
                    Provide accessible and affordable food items to Enugu State
                    workers
                  </p>
                </div>
              </div>

              <div className="flex items-start p-4 bg-green-50 rounded-lg">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center mr-4">
                  2
                </div>
                <div>
                  <p className="text-gray-600 text-sm mt-1">
                    Leverage the state's payroll system for efficient and secure
                    repayment
                  </p>
                </div>
              </div>

              <div className="flex items-start p-4 bg-green-50 rounded-lg">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center mr-4">
                  3
                </div>
                <div>
                  <p className="text-gray-600 text-sm mt-1">
                    Stimulate local economic activity by encouraging purchase of
                    locally produced food
                  </p>
                </div>
              </div>

              <div className="flex items-start p-4 bg-green-50 rounded-lg">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center mr-4">
                  4
                </div>
                <div>
                  <p className="text-gray-600 text-sm mt-1">
                    Enhance overall welfare and productivity of the state civil
                    service
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex space-x-4 md:w-[100%]">
        <Card className="w-full md:w-[45%] h-[200px] my-8">
        <CardHeader className="">
          <div className="flex space-x-3">
            <FiDollarSign className="inline text-2xl text-blue-700 " />
            <CardTitle className="inline text-xl font-normal">
             Direct State Financing
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className=" bg-white rounded-2xl">
            <p className="text-[15px]">The Enugu State Government will directly fund the scheme, ensuring full alignment with state welfare and economic development objectives. The state bears direct credit risk, mitigated by the salary deduction mechanism.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full md:w-[45%] h-[200px] my-8">
        <CardHeader className="">
          <div className="flex space-x-3">
            <FaArrowTrendUp className="inline text-2xl text-blue-700 " />
            <CardTitle className="inline text-xl font-normal">
             Local Economic Impact
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className=" bg-white rounded-2xl">
            <p className="text-[15px]">By prioritizing locally produced food items through the Enugu State Marketing Company, the scheme creates a virtuous cycle of consumption and production, directly supporting the agricultural value chain.</p>
          </div>
        </CardContent>
      </Card>
      </div>

       <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Implementation Framework
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Key components of the operational model
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Payroll Integration Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Payroll Integration</h3>
              <p className="text-gray-600">
                Seamless integration with existing GIFMIS payroll system for automated deductions
              </p>
            </div>
          </div>

          {/* Legal Compliance Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Legal Compliance</h3>
              <p className="text-gray-600">
                Strict adherence to Nigerian Labour Act's 1/3rd salary deduction limit
              </p>
            </div>
          </div>

          {/* Local Sourcing Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Local Sourcing</h3>
              <p className="text-gray-600">
                Emphasis on locally produced agricultural goods to boost state economy
              </p>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl font-semibold mb-4">Streamlined Implementation Process</h2>
          <p className="max-w-3xl mx-auto">
            Our framework ensures efficient operation with minimal disruption to existing systems while maximizing benefits to both civil servants and the local economy.
          </p>
        </div>
      </div>
    </section>
    </div>
  );
};
export default ExecutiveSummary;
