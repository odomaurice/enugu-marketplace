import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";
import { IoArrowForwardSharp } from "react-icons/io5";

export default function Hero() {
  return (
    <div className="min-h-screen dark:bg-black bg-green-50 font-header">
      {/* Text Section */}
      <div className="pt-4 px-6 mb-2 text-center mx-auto">
        <div className="my-3 text-[13px] max-w-[300px] mx-auto bg-green-100 text-green-800 py-1 rounded-full  text-center mb-4">
          Strategic Initiative for Enugu State
        </div>
        <h1
          className="text-2xl md:text-[55px] md:w-[700.859px] w-full md:h-[
132px] text-center font-bold mx-auto  leading-tight"
        >
          Food Loan Scheme for
        </h1>
        <h2
          className="text-2xl md:text-[55px] md:w-[700.859px] w-full md:h-[
132px] text-center font-bold mx-auto mb-6 text-green-700 leading-tight"
        >
          Enugu State Workers
        </h2>
        <p className="text-[18px] md:w-[800.688px] w-full md:h-[27px] leading-[35px] text-gray-600  text-center mx-auto md:mb-8">
          A revolutionary state-funded initiative designed to enhance food
          security for civil servants while stimulating local agricultural
          growth through interest-free credit facilities.
        </p>
        <div className="space-x-4">
          <Button
            asChild
            className="bg-green-700 rounded-md shadow-sm  hover:bg-green-600 text-white text-[14px] px-8 py-[1.5rem] md:w-[300.102px] h-[
38.3906px] md:mt-6  w-full"
          >
            <Link href="/executive-summary">
              View Executive Summary <IoArrowForwardSharp />
            </Link>
          </Button>
          <Button
            asChild
            className="bg-white rounded-md shadow-sm  hover:bg-gray-100 text-black text-[14px] px-8 py-[1.7rem] border  md:w-[300.102px] h-[
38.3906px] md:mt-20 my-6 w-full"
          >
            <Link href="/implementation">Implementation Plan</Link>
          </Button>
        </div>
      </div>

      {/* Image Grid Section 
      <div className="container px-4 mt-24 mx-auto relative">
        <div className="grid grid-cols-3 gap-4 h-[500px] md:h-[600px]">
         
          <div className="relative h-full">
            <div className="absolute -top-12 -left-8 md:block hidden w-[300px] h-[300px] md:w-[250px] md:h-[300px] z-10">
              <Image
                src="/hero-7.jpg"
                alt="Food image 1"
                fill
                priority
                className="object-cover rounded-lg shadow-lg "
                quality={90}
              />
            </div>
          </div>   */}

      {/* Center Image (Largest)
          <div className="md:relative w-full h-full">
            <div className="md:absolute md:-top-4 md:left-[46%] md:transform md:-translate-x-1/2 w-[100%] h-[300px] md:w-[700px] md:h-[400px] z-20">
              <Image
                src="/hero-1.jpg"
                alt="Food image 2"
                fill
                className="object-cover rounded-lg shadow-xl "
                quality={90}
                priority
              />
            </div>
          </div> */}

      {/* Right Image (Medium)
          <div className="relative h-full">
            <div className="absolute -top-16 md:block hidden -right-8 w-[220px] h-[320px] md:w-[280px] md:h-[380px] z-10">
              <Image
                src="/hero-9.jpg"
                alt="Food image 3"
                fill
                priority
                className="object-cover rounded-lg shadow-lg "
                quality={90}
              />
            </div>
          </div>
        </div> */}
    </div>
  );
}
